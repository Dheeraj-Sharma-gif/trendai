"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { IconCheck, IconCopy } from "@tabler/icons-react";

// Custom JSON syntax theme
const customJsonTheme = {
  'code[class*="language-"]': {
    background: "transparent",
    color: "#0f172a",
    fontFamily: "Fira Code, monospace",
    fontSize: "0.875rem",
    textAlign: "left"
  },
  'pre[class*="language-"]': {
    background: "transparent",
    color: "#0f172a",
    fontFamily: "Fira Code, monospace",
    fontSize: "0.875rem",
    textAlign: "left"
  },
  string: { color: "#7f9314" }, // yellow-cyan (you can change this to #a0f0e0 for more cyan)
  number: { color: "#2563eb" }, // blue-600
  boolean: { color: "#9333ea" }, // purple-600
  null: { color: "#64748b" }, // zinc-400
  key: { color: "#3b82f6", fontWeight: "600" },
  punctuation: { color: "#94a3b8" },
};


export const CodeBlock = ({
  language = "json",
  filename,
  code,
  highlightLines = [],
  tabs = [],
}) => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const tabsExist = tabs.length > 0;

  const copyToClipboard = async () => {
    const textToCopy = tabsExist ? tabs[activeTab].code : code;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeCode = tabsExist ? tabs[activeTab].code : code;
  const activeLanguage = tabsExist ? tabs[activeTab].language || language : language;
  const activeHighlightLines = tabsExist
    ? tabs[activeTab].highlightLines || []
    : highlightLines;

  return (
    <div className="relative w-full rounded-3xl bg-white/80 backdrop-blur-md border border-white/20 p-4 font-mono text-sm text-slate-900 text-left">
      <div className="flex flex-col gap-2 text-left">
        {tabsExist && (
          <div className="flex overflow-x-auto text-left">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-3 !py-2 text-xs transition-colors font-sans text-left ${
                  activeTab === index
                    ? "text-blue-600 font-semibold"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
        {!tabsExist && filename && (
          <div className="flex justify-between py-2 text-left">
            <div className="text-xs text-zinc-400">{filename}</div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors font-sans"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </button>
          </div>
        )}
      </div>

      <SyntaxHighlighter
        language={activeLanguage}
        style={customJsonTheme}
        customStyle={{
          margin: 0,
          padding: 0,
          background: "transparent",
          textAlign: "left",
        }}
        wrapLines
        showLineNumbers
        lineProps={(lineNumber) => ({
          style: {
            backgroundColor: activeHighlightLines.includes(lineNumber)
              ? "rgba(103, 232, 249, 0.15)"
              : "transparent",
            display: "block",
            width: "100%",
            textAlign: "left",
          },
        })}
        PreTag="div"
      >
        {String(activeCode)}
      </SyntaxHighlighter>
    </div>
  );
};
