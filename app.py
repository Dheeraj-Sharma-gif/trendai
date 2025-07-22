# filename: app.py

from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional 
import os, json, re, random
import requests
import spacy
from newspaper import Article
import google.generativeai as genai  # ✅ Correct Gemini import
from dotenv import load_dotenv
from urllib.parse import urlparse
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from fastapi import APIRouter
from fastapi.responses import JSONResponse

# --- Load .env ---
load_dotenv()
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

if not SERPER_API_KEY or not GEMINI_API_KEY:
    raise ValueError("Missing SERPER_API_KEY or GOOGLE_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
client = genai.GenerativeModel("gemini-1.5-flash")  # or "gemini-1.5-pro"

nlp = spacy.load("en_core_web_sm")
NUM_ARTICLES = 10

GENERIC_PHRASES = {
    "video games", "sports & outdoors", "cell phone", "kitchen & dining",
    "foundations", "strollers & cribs", "health & household"
}


class GenerateAndCompareInput(BaseModel):
    categories: List[str]
    original_products: Optional[List[str]] = None  # Optional for comparison


# --- FastAPI App ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


def safe_post_request(url, headers, payload):
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print(f"[!] Request to {url} failed: {e}")
        return None


# --- Core Logic Functions ---

def google_search_top_links(query, num_results):
    payload = {"q": query, "num": num_results}
    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }
    data = safe_post_request("https://google.serper.dev/search", headers, payload)
    if not data or "organic" not in data:
        return []
    return [r["link"] for r in data["organic"][:num_results] if "link" in r]


def extract_article_text(url):
    try:
        
        article = Article(url)
        article.download()
        article.parse()
        return article.text
    except Exception as e:
        print(f"[!] Failed to extract article from {url}: {e}")
        return ""

def extract_entities(text):
    doc = nlp(text)
    entities = set()
    doc = nlp(text)
    allowed_labels = {"PRODUCT", "ORG"}
    blacklist = {"percent", "off", "sale", "discount", "free", "limited"}

    for chunk in doc.noun_chunks:
        txt = chunk.text.strip()
        if len(txt.split()) > 1 and txt.lower() not in GENERIC_PHRASES:
            if not any(bad in txt.lower() for bad in blacklist):
                entities.add(txt)

    return list(entities)



def limit_entities_by_words(entities, max_words=300):
    limited = []
    count = 0
    for entity in entities:
        wc = len(entity.split())
        if count + wc > max_words:
            break
        limited.append(entity)
        count += wc
    return limited

def build_classification_prompt(entities, categories):
    example_output = {
        "Health and Wellness": ["Fitbit Charge 6", "Theragun Mini"],
        "Gaming and Entertainment": ["PS5", "Meta Quest 3"]
    }

    prompt = """
You are a product classification assistant.

Your task is to filter and group **real, specific product names or brand names** extracted from online articles into appropriate categories.

Ignore anything that is:
- A generic product category (e.g., "Video Games", "Hair")
- A vague or functional description (e.g., "USB Cable", "Skincare Product")
- A service, concept, or business type (e.g., "Investment Advisory", "Legal Services")
- Any term that isn’t a real, identifiable product or brand

✅ DO include:
- Brand names (e.g., "Optimum Nutrition", "COSRX", "Stanley")
- Product lines or SKUs (e.g., "iPhone 15 Pro", "Dyson Airwrap", "YogiTea")

---

Return ONLY a valid JSON object with category names as keys and a list of clean product names as values.

Example Output:
{
""" + json.dumps(example_output, indent=2) + """
}

---

Group the following product-like entities under these categories:
""" + "\n".join(f"- {cat}" for cat in categories)

    prompt += "\n\nEntities:\n"
    random.shuffle(entities)
    for e in entities:
        clean_entity = e.replace('\n', ' ').strip()
        prompt += f"- {clean_entity}\n"


    prompt += "\nRespond ONLY with valid JSON. Do not explain your reasoning or include commentary."

    return prompt



def call_gemini_api(prompt: str):
    try:
        response = client.generate_content(prompt)
        content = response.text.strip()

        match = re.search(r"```json\s*(\{.*?\})\s*```", content, re.DOTALL)
        if match:
            content = match.group(1)
        else:
            match = re.search(r"\{(?:.|\n)*?\}", content)
            if not match:
                print("[!] No JSON found in Gemini response.")
                return {}
            content = match.group()

        return json.loads(content)

    except Exception as e:
        print(f"[!] Gemini API call failed: {e}")
        return {}



def search_retailers_for_products(category, products, max_retailers=5):
    query = " OR ".join([f'"{p}"' for p in products[:3]])
    payload = {"q": query, "num": max_retailers}
    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }

    data = safe_post_request("https://google.serper.dev/search", headers, payload)
    if not data:
        return []

    links = []
    for item in data.get("organic", []):
        try:
            link = item.get("link")
            if link:
                domain = urlparse(link).netloc.replace("www.", "")
                links.append({"title": domain, "url": link})
            if len(links) >= max_retailers:
                break
        except Exception as e:
            print(f"[!] Retailer parsing error: {e}")
    return links


def build_trend_report_prompt(original: List[str], trendy: List[str]) -> str:
    prompt = f"""
You are a retail product trend analyst.

Compare two lists of product names:

1. Store Products (currently held by a store):
{json.dumps(original, indent=2)}

2. Trending Products (popular in the market):
{json.dumps(trendy, indent=2)}

Your task:

1. **Normalize and semantically match product names** (e.g. "PS5" ≈ "PlayStation 5", "banana" ≈ "bananas", etc.)
2. Identify the number of matched products.
3. Calculate and return two scores:

---

**A. Trend Alignment Score**  
Formula:  
(matched products / (original + trendy - matched)) × 100  
→ This measures how well the store’s inventory aligns with market trends.

**B. Catalog Coverage Score**  
Formula:  
(original / (original + trendy - matched)) × 100  
→ This measures what proportion of the total product space the store’s catalog covers.

---

Return a valid JSON object with:

- **trend_alignment_score** (float from 0 to 100)
- **catalog_coverage_score** (float from 0 to 100)
- **reason**: explain how both scores were computed (mention formulas, matched count, and interpretation)
- **matched_products**: list of matched pairs like `[store_product, trendy_product]`
- **missing_trendy_products**: list of trendy products not found in store
- **recommendations**: list of top 5–10 trendy products the store should consider adding
- **summary**: a 1–2 sentence insight summary

Only respond with valid, clean JSON. Do not include any text outside the JSON.
"""
    return prompt


def call_gemini(prompt: str) -> Dict[str, Any]:
    response = client.generate_content(prompt)
    print(response)

    content = response.text.strip()
    
    # Extract JSON between ```json ... ``` if present
    if content.startswith("```json"):
        match = re.search(r"```json\s*(\{.*?\})\s*```", content, re.DOTALL)
        if match:
            content = match.group(1)
        else:
            print("[!] JSON code block not found properly.")
            return {}
    
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"[!] JSON Decode Error: {e}")
        return {}

@app.post("/generate-products-and-compare")
async def generate_products_and_compare(input: GenerateAndCompareInput):
    results = {
        "statuses": [],
        "final": None,
        "trend_report": None,
        "errors": []
    }

    try:
        results["statuses"].append("Starting product discovery")

        links = google_search_top_links("Top trending products july 2025 ", NUM_ARTICLES)
        if not links:
            results["errors"].append("No links retrieved from Serper API")
            return results

        results["statuses"].append(f"Found {len(links)} article links")

        all_text = ""
        for i, link in enumerate(links):
            results["statuses"].append(f"Scraping article {i+1} of {len(links)}: {link}")
            article = extract_article_text(link)
            all_text += article + "\n"

        if not all_text.strip():
            results["errors"].append("No usable content found in scraped articles")
            return results

        entities = extract_entities(all_text)
        if not entities:
            results["errors"].append("No valid product-related entities extracted")
            return results

        results["statuses"].append(f"Extracted {len(entities)} named entities")

        limited = limit_entities_by_words(entities)
        results["statuses"].append(f"Entities trimmed to {len(limited)} items")

        prompt = build_classification_prompt(limited, input.categories)
        results["statuses"].append("Sending classification prompt to Gemini")

        print("Prompt sent to Gemini:\n", prompt)
        categorized = call_gemini_api(prompt)

        if not categorized:
            results["errors"].append("Gemini returned empty or invalid output for classification")
            return results

        results["statuses"].append("Received categorized product data")

        final_result = {}
        for category, products in categorized.items():
            if not isinstance(products, list):
                continue
            retailers = search_retailers_for_products(category, products)
            final_result[category] = {
                "products": products,
                "retailers": retailers or [{"title": "No retailers found", "url": ""}]
            }

        results["final"] = final_result

        if input.original_products:
            results["statuses"].append("Starting trend alignment analysis")

            all_trendy_products = []
            for product_list in categorized.values():
                if isinstance(product_list, list):
                    all_trendy_products.extend(product_list)

            prompt = build_trend_report_prompt(input.original_products, all_trendy_products)
            report = call_gemini(prompt)

            if report:
                results["trend_report"] = report
                results["statuses"].append("Trend report successfully generated")
            else:
                results["errors"].append("Trend alignment report could not be generated")

        return results

    except Exception as e:
        print(f"[!] Fatal Error: {e}")
        results["errors"].append(f"Unexpected error: {str(e)}")
        return results


