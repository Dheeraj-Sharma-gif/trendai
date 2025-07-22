# TrendAI - Product Trend Analysis API
<img width="1126" height="655" alt="image" src="https://github.com/user-attachments/assets/7c907de1-1b85-4bfb-8eec-61065f4072c6" />

TrendAI is a FastAPI-based backend service that analyzes trending product data extracted from live articles. It classifies products into relevant categories and optionally compares them against a store's catalog. The long-term vision is to identify top trend groups (such as Gen Z, Millennials) across different geographical regions to inform targeted inventory decisions.

## Features

- Extracts real-time trending products via Google Search (Serper API)
- Performs named entity recognition on scraped articles
- Uses Gemini (Google GenAI) for category classification and trend comparison
- Provides retailer links for each product
- Supports catalog comparison with trend alignment scoring
- Designed for future demographic and regional clustering

## Approach

1. **Input**
   - User provides a list of target categories and optionally a list of existing store products.

2. **Trending Product Discovery**
   - The system performs a Google Search for trending products using the Serper API.
   - Scrapes content and extracts product/brand entities using NLP.

3. **Classification**
   - The Gemini model is used to classify the extracted entities under the provided categories.

4. **Retailer Discovery**
   - For each valid product, a retailer or marketplace link is fetched.

5. **Trend Comparison**
   - If original store products are provided, the system compares the trending products to them and returns:
     - Trend Alignment Score
     - Catalog Coverage Score
     - Suggested products to add

6. **Geographical and Demographic Extension (planned)**
   - In future, trends will be mapped to regions and demographic groups such as Gen Z or Millennials.

## Example Output

- In California, Gen Z shows increasing interest in smart fitness bands and AI-enhanced wellness products.
- In New York, Millennials are trending toward home automation and minimalist home decor products.

## Future Scope

- Introduce age-based user group identification from behavioral and contextual metadata.
- Cluster trends by locality and demographic group for precise targeting.
- Predict upcoming trends using time-series forecasting models (e.g., Prophet, ARIMA).
- Improve retailer matching using structured product search APIs.

## Future Implications

- Helps retailers optimize regional inventory and reduce excess stock.
- Enables targeted marketing by identifying group-based trend clusters.
- Improves catalog relevance through predictive additions based on ongoing trend shifts.
- Can be extended into dashboards for business intelligence and regional analytics.
