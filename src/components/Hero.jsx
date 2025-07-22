import { motion } from "motion/react";
import { Cover } from "./Cover";
import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { CodeBlock } from "./Codeblock";
import { MultiStepLoader } from "./MultiStepLoader";
// hooks/useProductStream.ts

import Masonry from "react-masonry-css";

import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "../components/GlowingEffect";


const GridItem = ({ productCount, area, icon, title, description, retailers }) => {
  
  const getBGCOLOR = () => {
    const len = productCount || 0;
    console.log(len)
    if (len < 1) return "bg-white/60"; // Short descriptions
    if (len < 2) return "bg-yellow-100/60"
    if (len < 3) return "bg-cyan-100/60";   // Medium descriptions
    return "bg-teal-100/60";                  // Long descriptions
  };


  return (
    <li className={`list-none ${area} `}>
<div className={`relative h-full rounded-2xl shadow-md ${getBGCOLOR()} border p-2 md:rounded-3xl md:p-3`}>
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 ">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
           
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] ">
                {title}
              </h3>
              <h2 className="font-sans text-sm/[1.125rem] text-black/80 md:text-base/[1.375rem]  [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
              <div className="font-sans flex flex-row text-sm/[1.125rem] text-black md:text-base/[1.375rem]  [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {retailers}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

const breakpointColumnsObj = {
  default: 3,
  1024: 2,
  640: 1,
};

export function useProductStream() {
  const callStreamAPI = async (input, callbacks = {}) => {
    const { onStatus, onFinal, onTrendReport, onError, onComplete } = callbacks;

    onStatus?.("Sending request to API");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/generate-products-and-compare",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        },
      );

      const data = await response.json();

      if (data.errors?.length) {
        onError?.(data.errors.join(", "));
      }

      data.statuses?.forEach((msg) => {
        onStatus?.(msg);
      });

      if (data.final) {
        onFinal?.(data.final);
      }

      if (data.trend_report) {
        onTrendReport?.(data.trend_report);
      }

      onComplete?.();
    } catch (err) {
      onError?.("API request failed: " + err.message);
      onComplete?.();
    }
  };

  return { callStreamAPI };
}

export function HeroSectionOne() {
  const { callStreamAPI } = useProductStream();
  // const [clicked, setClicked] = useState(false);
  const [clickedNext, setClickedNext] = useState(false);

  const [clicked, setClicked] = useState(false);

const productCode = `{
  "Health and Wellness": [
    "Oura Ring Gen 3",
    "Theragun Elite",
    "Smart Posture Corrector",
    "Alo Moves Membership",
    "Blue Light Blocking Glasses"
  ],
  "Beauty and Skincare": [
    "Foreo Luna Mini 3",
    "LED Facial Mask",
    "Glossier Balm Dotcom",
    "Drunk Elephant Vitamin C Serum",
    "Dyson Airwrap"
  ],
  "Fitness and Sports Gear": [
    "Peloton Bike+",
    "Lululemon Chargefeel Workout Shoes",
    "Smart Jump Rope by Tangram",
    "Bowflex Adjustable Dumbbells",
    "Garmin Forerunner 965"
  ],
  "Smart Home Devices": [
    "Google Nest Hub Max",
    "Amazon Echo Show 10",
    "TP-Link Smart Plug",
    "Ring Video Doorbell Pro 2",
    "Nanoleaf Lines Light Panels"
  ],
  "Consumer Tech and Gadgets": [
    "Apple Vision Pro",
    "Nothing Phone (2)",
    "Meta Quest 3",
    "Anker GaN Prime Charger",
    "Steam Deck OLED"
  ],
  "Home and Living": [
    "Ikea SYMFONISK Frame Speaker",
    "Philips Wake-Up Light",
    "Dyson V15 Detect Vacuum",
    "Weighted Blanket by Bearaby",
    "Smart Aroma Diffuser"
  ],
  "Fashion and Accessories": [
    "Casetify Custom Phone Case",
    "Uniqlo Smart Pants",
    "Nike Tech Fleece",
    "Allbirds Tree Runners",
    "Levi’s Denim Trucker Jacket"
  ],
  "Gaming and Entertainment": [
    "PlayStation 5",
    "Xbox Series X",
    "Razer Kishi V2",
    "Backbone One Mobile Controller",
    "LG C3 OLED TV"
  ],
  "Sustainable and Eco-Friendly Products": [
    "Reusable Mesh Produce Bags",
    "Bamboo Cutlery Travel Set",
    "Plant-Based Trash Bags",
    "Compostable Phone Case",
    "Solar-Powered Garden Lights"
  ]
}`;




  const loadingStates = [
    {
      text: "Searching context",
    },
    {
      text: "Looking for trends",
    },
    {
      text: "Trends found",
    },
    {
      text: "Getting retailers",
    },
    {
      text: "Generating report",
    },
    {
      text: "All done !",
    },
  ];
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);

  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      {/* Overlay appears when clicked */}
      {clicked && !clickedNext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="h-[95vh] w-[95vw] rounded-xl shadow-xl transition-all duration-500 flex flex-col items-center justify-center gap-6 p-6 overflow-auto">
            {/* BEFORE clicking Next: Code block + button */}
            {!clickedNext && (
              <>
               <h2 className="text-2xl text-black/80 font-semibold text-center mb-4">
                    Inventory
                  </h2>
                <div className="w-full max-w-4xl h-[75vh] overflow-auto">
                  <CodeBlock
                    code={productCode}
                    language="json"
                    highlightLines={[2, 9, 16, 23, 30, 37, 44, 51]}
                  />
                 
                </div>

                <Cover className="px-4 w-40">
                  <button
                    onClick={async () => {
                      setClickedNext(true);
                      setLoading(true);

                      const parsedCode = JSON.parse(productCode);
                      const categories = Object.keys(parsedCode);
                      const original_products =
                        Object.values(parsedCode).flat();

                      try {
                        const response = await fetch(
                          "http://127.0.0.1:8000/generate-products-and-compare",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              categories,
                              original_products,
                            }),
                          },
                        );

                        const data = await response.json();
                        console.log("✅ Response from backend:", data);
                        setResponseData(data);
                      } catch (err) {
                        console.error("❌ Error fetching data:", err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="text-xl text-[#c0ecfe]"
                  >
                    Next
                  </button>
                </Cover>
              </>
            )}
          </div>
        </div>
      )}

      {/* AFTER clicking Next: Right-side UI */}
      {clicked && clickedNext && (
        <div className="fixed inset-0 z-50 min-h-screen w-screen overflow-y-auto px-0 py-8">
  <div className="w-full flex flex-col items-start justify-start gap-6">
     {loading && (
              <MultiStepLoader
                loadingStates={loadingStates}
                loading={loading}
                duration={10000}
              />
            )}
            {!loading && responseData && (
            
              <div className="space-y-6 w-full">
                <div className="grid text-black bg-gradient-to-b from-white via-blue-50 to-blue-100 shadow-2xl center justify-items-center rounded-3xl grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="   w-fit p-4 rounded-md">
                    <h4 className="font-semibold text-sm mb-1">
                      Trend Alignment
                    </h4>
                    <div className="text-2xl text-blue-600 font-bold">
                      {responseData.trend_report.trend_alignment_score.toFixed(
                        2,
                      )}
                      %
                    </div>
                  </div>
                  <div className=" p-4  w-fit  rounded-md">
                    <h4 className="font-semibold text-sm mb-1">
                      Catalog Coverage
                    </h4>
                    <div className="text-2xl text-green-600 font-bold">
                      {responseData.trend_report.catalog_coverage_score.toFixed(
                        2,
                      )}
                      %
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col lg:flex-row gap-6">
                  {/* Masonry Column */}
                  <div className="w-full lg:w-1/2">
                    <Masonry
                      breakpointCols={breakpointColumnsObj}
                      className="my-masonry-grid"
                      columnClassName="my-masonry-grid_column"
                    >
                      {Object.entries(responseData.final).map(
                        ([category, { products, retailers }]) => (
                          <div key={category}>
                            <GridItem   productCount={products.length} 
                              icon={<Box className="h-4 w-4 text-white" />}
                              title={category}
                              description={
                                <ul className="list-inside text-sm mb-2 text-black">
                                  {products.length > 0 ? (
                                    products.map((p) => <li key={p}>{p}</li>)
                                  ) : (
                                    <li className="italic">No products</li>
                                  )}
                                </ul>
                              }
                              retailers={
                                <div className="flex flex-wrap gap-2">
                                  {retailers.map(({ title, url }, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={url}
                                    >
                                      <img
                                        src={`https://www.google.com/s2/favicons?sz=32&domain=${title}`}
                                        alt={`favicon for ${title}`}
                                        className="w-6 h-6 rounded-sm hover:scale-110 transition-transform duration-150"
                                      />
                                    </a>
                                  ))}
                                </div>
                              }
                            />
                          </div>
                        ),
                      )}
                    </Masonry>
                  </div>

                  {/* Report Summary Column - Vertically centered */}
                  <div className="w-full lg:w-1/2 flex">
  <div className="p-6 text-black h-fit shadow-lg bg-white/80 rounded-xl space-y-6 w-full">
    
    {/* Header */}
    <div>
      <h3 className="text-2xl font-semibold mb-2 text-black">Report Summary</h3>
      <p className="text-sm leading-relaxed text-left text-slate-900">
        {responseData.trend_report.summary}
      </p>
    </div>

    {/* Matched + Missing Products */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Matched */}
      <div className="border border-green-400/40 bg-green-500/10 text-green-900 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2 text-green-950 text-left">
          Matched Products
        </h4>
        <ul className="list-inside text-sm space-y-1 text-left">
          {responseData.trend_report.matched_products.map(([a, b], i) => (
            <li key={i}>
              <span className="font-medium text-green-900">{a}</span> ≈ {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Missing */}
      <div className="border border-red-400/40 bg-red-500/10 text-red-900 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2 text-red-900 text-left">
          Missing Trendy Products
        </h4>
        <ul className="list-inside text-sm space-y-1 text-left">
          {responseData.trend_report.missing_trendy_products.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </div>

    {/* Recommendations */}
    <div className="border border-blue-400/40 bg-blue-500/10 text-blue-800 rounded-lg p-4">
      <h4 className="font-semibold text-sm mb-2 text-blue-900 text-left">
        Recommendations
      </h4>
      <ul className="list-inside text-sm space-y-1 text-left">
        {responseData.trend_report.recommendations.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ul>
    </div>
  </div>
</div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!clicked && (
        <div className="px-4 py-10 md:py-20">
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-black/50 md:text-4xl lg:text-7xl ">
            {"Discover Product Gaps & Trends with AI"
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                  className="mr-2 inline-block"
                >
                  {word}
                </motion.span>
              ))}
          </h1>
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 0.8,
            }}
            className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-teal-900/80 "
          >
            Our AI scans your existing store inventory and compares it to
            current market trends to uncover product gaps and rising
            opportunities.
          </motion.p>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 1,
            }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Cover>
              <button
                className="w-60 transform  px-6 py-2 font-medium text-[#c0ecfe] transition-all duration-300"
                onClick={() => setClicked(true)}
              >
                Get Insights Now
              </button>
            </Cover>
          </motion.div>
        </div>
      )}
    </div>
  );
}
