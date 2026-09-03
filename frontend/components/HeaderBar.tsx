"use client";

import React from "react";

interface HeaderBarProps {
  title?: string;
  dateRange?: string;
  onExport?: () => void;
}

export default function HeaderBar({
  title = "Overview Dashboard",
  dateRange = "May 23, 2025",
  onExport,
}: HeaderBarProps) {
  return (
    <header className="w-full h-20 bg-paper-white border-b border-paper-border px-8 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] shrink-0 z-30">
      
      {/* Title */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-dark-slate tracking-tight">
          {title}
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        
        {/* Date Display Card */}
        <div className="flex items-center gap-2 bg-warm-sage px-4 py-2 rounded-xl border border-paper-border text-slate-600 shadow-sm">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-mono text-xs font-bold text-dark-slate">
            {dateRange}
          </span>
        </div>

        {/* Export Report Action */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-sage-green hover:bg-sage-green-light active:bg-sage-green text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-[0_4px_12px_rgba(94,129,82,0.15)] active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-4 h-4 text-white fill-none stroke-current stroke-2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export Report</span>
        </button>

      </div>
    </header>
  );
}
