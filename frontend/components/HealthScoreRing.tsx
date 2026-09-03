"use client";

import React from "react";

interface HealthScoreRingProps {
  score?: number;
  label?: string;
}

export default function HealthScoreRing({
  score = 82,
  label = "Good",
}: HealthScoreRingProps) {
  // SVG Radial constants
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-full max-w-[340px] mx-auto aspect-square flex items-center justify-center bg-paper-white rounded-2xl border border-paper-border p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
      
      {/* Network of Node Connecting Lines (Decorative) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-paper-border" strokeWidth="1" strokeDasharray="3 3">
        {/* Connecting line to North-West Risk Card */}
        <line x1="50" y1="50" x2="90" y2="90" />
        {/* Connecting line to North-East Risk Card */}
        <line x1="290" y1="50" x2="250" y2="90" />
        {/* Connecting line to South-West Risk Card */}
        <line x1="50" y1="290" x2="90" y2="250" />
        {/* Connecting line to South-East Risk Card */}
        <line x1="290" y1="290" x2="250" y2="250" />
      </svg>

      {/* Floating Node Badges around the Ring */}
      {/* North-West Node (Cardio) */}
      <div className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-paper-white border border-paper-border flex items-center justify-center shadow-sm text-coral z-10">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>

      {/* North-East Node (BP) */}
      <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-paper-white border border-paper-border flex items-center justify-center shadow-sm text-sage-green z-10">
        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {/* South-West Node (Stress) */}
      <div className="absolute bottom-4 left-4 w-9 h-9 rounded-xl bg-paper-white border border-paper-border flex items-center justify-center shadow-sm text-dark-slate z-10">
        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>

      {/* South-East Node (Physiological) */}
      <div className="absolute bottom-4 right-4 w-9 h-9 rounded-xl bg-paper-white border border-paper-border flex items-center justify-center shadow-sm text-slate-400 z-10">
        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      </div>

      {/* Radial Progress Dial */}
      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        
        {/* Radial SVG */}
        <svg className="absolute transform -rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F2F0E6"
            strokeWidth={strokeWidth}
          />
          {/* Active progress track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#5E8152"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>

        {/* Center Inner Ring Details */}
        <div className="z-10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-sans">
            Pulse Score
          </span>
          <div className="flex items-baseline justify-center">
            <span className="font-mono text-4xl font-extrabold text-dark-slate">
              {score}
            </span>
            <span className="font-sans text-lg font-bold text-slate-400 ml-0.5">%</span>
          </div>
          <span className="font-serif text-sm font-bold text-sage-green mt-0.5">
            {label}
          </span>
        </div>

      </div>

    </div>
  );
}
