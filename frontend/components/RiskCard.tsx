"use client";

import React from "react";

interface RiskCardProps {
  title: string;
  value: number;
  description: string;
  sparklineData: number[];
  accentColor?: "sage" | "coral" | "slate";
}

export default function RiskCard({
  title,
  value,
  description,
  sparklineData,
  accentColor = "sage",
}: RiskCardProps) {
  // Color configuration matching design specifications
  const accentClasses = {
    sage: {
      text: "text-sage-green",
      bg: "bg-sage-green/10",
      border: "border-sage-green/20",
      sparkline: "#5E8152",
    },
    coral: {
      text: "text-coral",
      bg: "bg-coral/10",
      border: "border-coral/20",
      sparkline: "#E0654A",
    },
    slate: {
      text: "text-dark-slate",
      bg: "bg-dark-slate/10",
      border: "border-dark-slate/20",
      sparkline: "#1E293B",
    },
  }[accentColor];

  // Helper to generate SVG path for sparkline
  const generateSparklinePath = (data: number[], width: number, height: number) => {
    if (data.length === 0) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;
    
    return data
      .map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        // SVG coordinates start at top left, so we invert the Y axis
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const sparkPath = generateSparklinePath(sparklineData, 100, 36);

  return (
    <div className="bg-paper-white rounded-2xl border border-paper-border p-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-all duration-300 flex flex-col justify-between min-h-[170px] relative group overflow-hidden">
      
      {/* Background radial accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-60 ${
        accentColor === "sage" ? "bg-sage-green/20" : accentColor === "coral" ? "bg-coral/20" : "bg-dark-slate/20"
      }`} />

      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h4 className="font-serif text-sm font-bold text-dark-slate leading-snug group-hover:text-dark-slate-alt transition-colors">
            {title}
          </h4>
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold font-sans uppercase tracking-wider border ${accentClasses.bg} ${accentClasses.text} ${accentClasses.border}`}>
            {value > 30 ? "Elevated" : "Optimal"}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-sans leading-tight">
          {description}
        </p>
      </div>

      {/* Stats & Sparkline Micro-chart */}
      <div className="flex items-end justify-between mt-4">
        
        {/* Core Value */}
        <div className="flex items-baseline">
          <span className="font-mono text-3xl font-bold tracking-tight text-dark-slate">
            {value}
          </span>
          <span className="font-sans text-xs font-semibold text-slate-400 ml-0.5">
            %
          </span>
        </div>

        {/* Sparkline Graphic */}
        <div className="w-24 h-9 shrink-0 flex items-center justify-end">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 36">
            {/* Soft gradient fill under sparkline */}
            {sparkPath && (
              <>
                <path
                  d={`${sparkPath} L 100 36 L 0 36 Z`}
                  fill={`url(#grad-${title.replace(/\s+/g, "")})`}
                  className="opacity-15"
                />
                <path
                  d={sparkPath}
                  fill="none"
                  stroke={accentClasses.sparkline}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="100"
                  cy={36 - ((sparklineData[sparklineData.length - 1] - Math.min(...sparklineData)) / (Math.max(...sparklineData) - Math.min(...sparklineData) || 1)) * 32 - 2}
                  r="3"
                  fill={accentClasses.sparkline}
                  className="animate-pulse"
                />
              </>
            )}

            {/* Gradient definition */}
            <defs>
              <linearGradient id={`grad-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentClasses.sparkline} />
                <stop offset="100%" stopColor={accentClasses.sparkline} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </div>

    </div>
  );
}
