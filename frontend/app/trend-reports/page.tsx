"use client";
import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ClinicalReportModal from "@/components/ClinicalReportModal";
import { Calendar, Download, Info, ArrowUpRight, ArrowDownRight, TrendingUp, ExternalLink, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const chartData = [
  { date:"Apr 23", health:78, ptt:280 },
  { date:"Apr 27", health:80, ptt:270 },
  { date:"May 1", health:79, ptt:265 },
  { date:"May 5", health:82, ptt:258 },
  { date:"May 9", health:76, ptt:275 },
  { date:"May 13", health:82, ptt:248 },
  { date:"May 17", health:84, ptt:240 },
  { date:"May 21", health:83, ptt:245 },
];

const tabs = ["Health Score & PTT","Heart Health","Stress & Recovery","Vitals","Sleep","Activity"];
const timeRanges = ["7D","1M","3M","6M","1Y","Custom"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-paper-border bg-white p-3 shadow-lg text-[11px]">
        <p className="font-semibold text-slate-500 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{color: p.color}} className="font-semibold">{p.name}: {p.value}{p.name === "Health Score" ? "%" : " ms"}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeRange, setActiveRange] = useState("1M");
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
          {/* Header */}
          <header className="mb-5 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">Trend Reports</h1>
              <p className="mt-1 text-[13px] text-slate-500">Track and analyze your health metrics over time.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-paper-border bg-white px-3.5 py-2 text-[12px] text-slate-600 shadow-2xs">
                <Calendar className="h-4 w-4 text-slate-400" /><span>Apr 23 – May 23, 2025</span>
              </button>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-deep-sage px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#2C3E2B] transition-colors shadow-2xs"
              >
                <Download className="h-4 w-4" />Generate Clinical Report
              </button>
            </div>
          </header>

          {/* Tabs */}
          <div className="mb-5 flex items-center justify-between border-b border-paper-border">
            <div className="flex gap-0">
              {tabs.map((tab, i) => (
                <button key={tab} onClick={()=>setActiveTab(i)} className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-[1px] ${activeTab===i?"border-deep-sage text-deep-sage":"border-transparent text-slate-500 hover:text-ink"}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range + Compare */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[12px] text-slate-500 mr-2">Time Range</span>
              {timeRanges.map(r => (
                <button key={r} onClick={()=>setActiveRange(r)} className={`rounded px-2.5 py-1 text-[12px] font-semibold transition-colors ${activeRange===r?"bg-deep-sage text-white":"text-slate-500 hover:text-ink hover:bg-gray-100"}`}>{r}</button>
              ))}
              <button className="ml-1 p-1.5 rounded hover:bg-gray-100 text-slate-400"><Calendar className="h-4 w-4" /></button>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-paper-border bg-white px-3 py-1.5 text-[12px] text-slate-600 hover:bg-gray-50">
              <TrendingUp className="h-4 w-4" />Compare Metrics
            </button>
          </div>

          {/* Main Chart Card */}
          <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-ink">Health Score vs Pulse Transit Time (PTT)</h2>
                  <Info className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-center gap-4 text-[12px]">
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-[#5E8152]"></span>Health Score (%)</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-[#E0654A]"></span>Pulse Transit Time (ms)</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[11px] text-slate-500 mb-0.5">Average Health Score</p>
                  <p className="text-[28px] font-bold text-ink leading-none">78%</p>
                  <p className="text-[11px] text-sage mt-1 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />6% vs previous 30 days</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500 mb-0.5">Average PTT</p>
                  <p className="text-[28px] font-bold text-ink leading-none">254<span className="text-[14px] font-normal ml-0.5">ms</span></p>
                  <p className="text-[11px] text-coral mt-1 flex items-center gap-0.5"><ArrowDownRight className="h-3 w-3" />4.3% vs previous 30 days</p>
                </div>
                <div className="rounded-xl border border-paper-border bg-[#FAFAF8] px-4 py-3 text-right">
                  <p className="text-[11px] text-slate-500 mb-0.5 flex items-center gap-1">Correlation (Pearson r) <Info className="h-3 w-3" /></p>
                  <p className="text-[24px] font-bold text-coral leading-none">-0.72</p>
                  <p className="text-[11px] text-slate-500 mt-1">Strong Negative</p>
                </div>
              </div>
            </div>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{top:8,right:24,left:0,bottom:0}}>
                  <CartesianGrid stroke="#E5E3D8" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" domain={[60,100]} ticks={[0,20,40,60,80,100]} tick={{fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false} width={32} />
                  <YAxis yAxisId="right" orientation="right" domain={[0,400]} ticks={[0,80,160,240,320,400]} tick={{fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="health" name="Health Score" stroke="#5E8152" strokeWidth={2} dot={{r:4,fill:"#5E8152",stroke:"#fff",strokeWidth:2}} activeDot={{r:5}} />
                  <Line yAxisId="right" type="monotone" dataKey="ptt" name="PTT" stroke="#E0654A" strokeWidth={2} dot={{r:4,fill:"#E0654A",stroke:"#fff",strokeWidth:2}} activeDot={{r:5}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights Row */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2 rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
              <h3 className="text-[13px] font-semibold text-ink mb-2">Insights</h3>
              <p className="text-[12px] leading-relaxed text-slate-500">Your health score shows an improving trend while PTT is decreasing, which is a positive indicator of cardiovascular efficiency and vascular health.</p>
              <button className="mt-3 text-[12px] font-semibold text-sage hover:underline">View Detailed Analysis →</button>
            </div>
            {[
              { label:"Best Health Score", val:"89%", sub:"May 11, 2025", icon:"❤️", color:"text-coral" },
              { label:"Lowest PTT", val:"228ms", sub:"May 16, 2025", icon:"⚡", color:"text-coral" },
              { label:"Health Score Trend", val:"Improving", sub:"▲ 12% in 30 days", icon:"📈", color:"text-sage" },
              { label:"PTT Trend", val:"Improving", sub:"▼ 16 ms in 30 days", icon:"📉", color:"text-coral" },
            ].map(item=>(
              <div key={item.label} className="rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F6F0] text-lg">{item.icon}</div>
                <p className="text-[11px] text-slate-500">{item.label}</p>
                <p className={`text-[22px] font-bold leading-tight ${item.color}`}>{item.val}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Understanding metrics */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-paper-border bg-white px-5 py-3.5 shadow-2xs">
            <div className="flex items-start gap-3">
              <span className="text-[18px] mt-0.5">📍</span>
              <div>
                <p className="text-[12px] text-slate-600">Health Score is a composite metric derived from multiple physiological parameters.</p>
                <p className="text-[12px] text-slate-600">Pulse Transit Time (PTT) is the time taken by the blood pulse to travel between two arterial sites.</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] font-semibold text-sage whitespace-nowrap hover:underline">
              Learn more about metrics →<ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </main>
      <ClinicalReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} defaultReportType="period" />
    </div>
  );
}
