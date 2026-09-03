"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";

interface DataPoint {
  date: string;
  healthScore: number;
  ptt: number;
}

interface HealthScoreVsPTTChartProps {
  data: DataPoint[];
  correlationScore?: number;
}

// Custom tooltip component styled to match the Pulsewatch design
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-paper-white border border-paper-border rounded-xl shadow-lg p-3.5 font-sans">
      <p className="font-bold text-dark-slate text-xs mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-[11px]">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-mono font-bold text-dark-slate">
            {entry.value}
            {entry.name === "Health Score" ? "%" : " ms"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function HealthScoreVsPTTChart({
  data,
  correlationScore = -0.72,
}: HealthScoreVsPTTChartProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Correlation badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-bold">
          Multi-axis Correlation Chart
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-sans">Pearson r:</span>
          <span className="font-mono text-xs font-bold text-coral bg-coral/10 px-2 py-0.5 rounded border border-coral/15">
            {correlationScore.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 font-sans">
            (Strong Negative Correlation)
          </span>
        </div>
      </div>

      {/* Recharts ResponsiveContainer */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="healthScoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5E8152" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#5E8152" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="pttGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E0654A" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#E0654A" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E3D8"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "#94A3B8", fontFamily: "monospace" }}
            axisLine={{ stroke: "#E5E3D8" }}
            tickLine={false}
          />

          {/* Left Y-axis: Health Score (%) */}
          <YAxis
            yAxisId="score"
            orientation="left"
            domain={[60, 100]}
            tick={{ fontSize: 9, fill: "#5E8152", fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />

          {/* Right Y-axis: PTT (ms) */}
          <YAxis
            yAxisId="ptt"
            orientation="right"
            domain={[220, 260]}
            tick={{ fontSize: 9, fill: "#E0654A", fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{
              fontSize: "10px",
              fontFamily: "sans-serif",
              paddingTop: "12px",
            }}
          />

          {/* Health Score area + line */}
          <Area
            yAxisId="score"
            type="monotone"
            dataKey="healthScore"
            name="Health Score"
            stroke="#5E8152"
            strokeWidth={2.5}
            fill="url(#healthScoreGrad)"
            dot={{ r: 3, fill: "#5E8152", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#5E8152" }}
          />

          {/* PTT area + line */}
          <Area
            yAxisId="ptt"
            type="monotone"
            dataKey="ptt"
            name="PTT (ms)"
            stroke="#E0654A"
            strokeWidth={2.5}
            fill="url(#pttGrad)"
            dot={{ r: 3, fill: "#E0654A", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#E0654A" }}
            strokeDasharray="5 3"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
