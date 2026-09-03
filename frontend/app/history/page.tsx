"use client";
import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { Calendar, Download, Search, RotateCcw, ChevronDown, ChevronLeft, ChevronRight, Heart, Droplets, Activity, Thermometer, Zap, ShieldCheck, MoreHorizontal, ArrowUpDown } from "lucide-react";

type DataQuality = "Excellent" | "Good" | "Fair" | "Poor";
type AnomalyField = "pulse" | "spo2" | "ptt" | "temp" | "gsr";
type HistoryRow = { id: number; timestamp: string; pulseRate: number; spo2: number; pttDelay: number; temp: number; gsr: number; quality: DataQuality; notes: string; anomaly?: AnomalyField; };

const allRows: HistoryRow[] = [
  { id:1, timestamp:"May 23, 2025 10:30 AM", pulseRate:72, spo2:97, pttDelay:248, temp:36.6, gsr:2.14, quality:"Excellent", notes:"Morning Routine" },
  { id:2, timestamp:"May 23, 2025 09:30 AM", pulseRate:78, spo2:96, pttDelay:251, temp:36.7, gsr:2.32, quality:"Good", notes:"Post Breakfast" },
  { id:3, timestamp:"May 23, 2025 08:30 AM", pulseRate:85, spo2:95, pttDelay:265, temp:36.8, gsr:2.45, quality:"Fair", notes:"Light Activity", anomaly:"pulse" },
  { id:4, timestamp:"May 23, 2025 07:30 AM", pulseRate:68, spo2:97, pttDelay:240, temp:36.5, gsr:1.98, quality:"Excellent", notes:"Resting" },
  { id:5, timestamp:"May 22, 2025 10:30 PM", pulseRate:75, spo2:96, pttDelay:250, temp:36.6, gsr:2.10, quality:"Good", notes:"Before Sleep" },
  { id:6, timestamp:"May 22, 2025 09:30 PM", pulseRate:72, spo2:97, pttDelay:246, temp:36.5, gsr:2.05, quality:"Good", notes:"Evening Check" },
  { id:7, timestamp:"May 22, 2025 08:30 PM", pulseRate:88, spo2:94, pttDelay:270, temp:36.9, gsr:2.60, quality:"Poor", notes:"Post Workout", anomaly:"pulse" },
  { id:8, timestamp:"May 22, 2025 07:30 PM", pulseRate:79, spo2:97, pttDelay:255, temp:36.7, gsr:2.30, quality:"Good", notes:"Walk" },
  { id:9, timestamp:"May 22, 2025 06:30 PM", pulseRate:70, spo2:97, pttDelay:245, temp:36.6, gsr:2.08, quality:"Excellent", notes:"Relaxed" },
  { id:10, timestamp:"May 22, 2025 05:30 PM", pulseRate:74, spo2:96, pttDelay:249, temp:36.6, gsr:2.12, quality:"Good", notes:"Evening Routine" },
  { id:11, timestamp:"May 22, 2025 02:30 PM", pulseRate:80, spo2:96, pttDelay:252, temp:36.7, gsr:2.20, quality:"Good", notes:"Afternoon Reading" },
  { id:12, timestamp:"May 22, 2025 12:00 PM", pulseRate:76, spo2:97, pttDelay:244, temp:36.5, gsr:2.15, quality:"Excellent", notes:"Lunch Break" },
];

const qColor: Record<DataQuality,string> = { Excellent:"bg-[#E8F5E9] text-[#2E7D32]", Good:"bg-[#E3F0E4] text-[#5E8152]", Fair:"bg-[#FFF3E0] text-[#E65100]", Poor:"bg-[#FFEBEE] text-[#C62828]" };

import { useDeviceProfile } from "@/components/DeviceProfileContext";
import ClinicalReportModal from "@/components/ClinicalReportModal";

export default function HistoryPage() {
  const { history: allRows } = useDeviceProfile();
  const [reportOpen, setReportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("All Time");
  const [parameter, setParameter] = useState("All Parameters");
  const [quality, setQuality] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const TOTAL = 120;

  const filtered = useMemo(() => allRows.filter(r => {
    if (search && !r.notes.toLowerCase().includes(search.toLowerCase()) && !r.timestamp.toLowerCase().includes(search.toLowerCase())) return false;
    if (quality !== "All" && r.quality !== quality) return false;
    return true;
  }), [search, quality]);

  const showing = Math.min(pageSize, filtered.length);
  const totalPages = Math.ceil(TOTAL / pageSize);

  const exportCSV = () => {
    const h = ["Timestamp","Pulse Rate (BPM)","SpO2 (%)","PTT Delay (ms)","Temp (°C)","GSR (µS)","Data Quality","Notes"];
    const rows = filtered.map(r => [r.timestamp, r.pulseRate, r.spo2, r.pttDelay, r.temp, r.gsr, r.quality, r.notes]);
    const csv = [h, ...rows].map(r => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    const a = document.createElement("a"); a.href=url; a.download="history.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">Data History</h1>
              <p className="mt-1 text-[13px] text-slate-500">View and analyze your historical health readings.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-deep-sage px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-[#2C3E2B] transition-colors shadow-2xs"
              >
                <Download className="h-4 w-4" />Generate Clinical Report
              </button>
              <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-lg border border-paper-border bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-gray-50 shadow-2xs">
                <Download className="h-4 w-4 text-slate-500" />Export CSV
              </button>
            </div>
          </header>

          <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-paper-border bg-white p-4 shadow-2xs lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-1">
              <p className="mb-1.5 text-[11px] font-semibold text-slate-500">Search Readings</p>
              <div className="flex items-center gap-2 rounded-lg border border-paper-border bg-[#FAFAF7] px-3 py-2">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search by keyword..." className="flex-1 bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400" />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold text-slate-500">Date Range</p>
              <button className="flex w-full items-center gap-1.5 rounded-lg border border-paper-border bg-[#FAFAF7] px-3 py-2 text-[12px] text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">Apr 23 – May 23, 2025</span><ChevronDown className="ml-auto h-3 w-3 text-slate-400" />
              </button>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold text-slate-500">Time Range</p>
              <div className="relative">
                <select value={timeRange} onChange={e=>setTimeRange(e.target.value)} className="w-full appearance-none rounded-lg border border-paper-border bg-[#FAFAF7] px-3 py-2 text-[12px] text-slate-600 outline-none">
                  {["All Time","Morning","Afternoon","Evening","Night"].map(t=><option key={t}>{t}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold text-slate-500">Parameter</p>
              <div className="relative">
                <select value={parameter} onChange={e=>setParameter(e.target.value)} className="w-full appearance-none rounded-lg border border-paper-border bg-[#FAFAF7] px-3 py-2 text-[12px] text-slate-600 outline-none">
                  {["All Parameters","Pulse Rate","SpO2","PTT Delay","Temperature","GSR"].map(p=><option key={p}>{p}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold text-slate-500">Data Quality</p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select value={quality} onChange={e=>{setQuality(e.target.value);setPage(1);}} className="w-full appearance-none rounded-lg border border-paper-border bg-[#FAFAF7] px-3 py-2 text-[12px] text-slate-600 outline-none">
                    {["All","Excellent","Good","Fair","Poor"].map(q=><option key={q}>{q}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
                <button onClick={()=>{setSearch("");setTimeRange("All Time");setParameter("All Parameters");setQuality("All");setPage(1);}} className="flex items-center gap-1 rounded-lg border border-paper-border bg-white px-2.5 py-2 text-[11px] font-medium text-slate-500 hover:bg-gray-50 whitespace-nowrap">
                  <RotateCcw className="h-3.5 w-3.5" />Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-paper-border bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-[12px]">
                <thead>
                  <tr className="border-b border-paper-border bg-[#FAFAF8]">
                    <th className="px-4 py-3 text-left"><button className="flex items-center gap-1 font-semibold text-slate-500">Timestamp<ArrowUpDown className="h-3 w-3" /></button></th>
                    <th className="px-4 py-3 text-left"><div className="flex items-center gap-1.5 font-semibold text-slate-500"><Heart className="h-3.5 w-3.5 text-coral" fill="currentColor" />Pulse Rate (BPM)</div></th>
                    <th className="px-4 py-3 text-left"><div className="flex items-center gap-1.5 font-semibold text-slate-500"><Droplets className="h-3.5 w-3.5 text-blue-400" />SpO₂ (%)</div></th>
                    <th className="px-4 py-3 text-left"><div className="flex items-center gap-1.5 font-semibold text-slate-500"><Activity className="h-3.5 w-3.5 text-sage" />PTT Delay (ms)</div></th>
                    <th className="px-4 py-3 text-left"><div className="flex items-center gap-1.5 font-semibold text-slate-500"><Thermometer className="h-3.5 w-3.5 text-orange-400" />Temp (°C)</div></th>
                    <th className="px-4 py-3 text-left"><div className="flex items-center gap-1.5 font-semibold text-slate-500"><Zap className="h-3.5 w-3.5 text-yellow-500" />GSR (µS)</div></th>
                    <th className="px-4 py-3 text-left"><div className="flex items-center gap-1.5 font-semibold text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-slate-400" />Data Quality</div></th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">Notes</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0,showing).map(row=>(
                    <tr key={row.id} className="border-b border-paper-border transition-colors hover:bg-[#FAFAF8]">
                      <td className="px-4 py-3 text-slate-600">{row.timestamp}</td>
                      <td className={`px-4 py-3 font-medium ${row.anomaly==="pulse"?"text-coral font-semibold":"text-slate-700"}`}>{row.pulseRate}</td>
                      <td className={`px-4 py-3 font-medium ${row.anomaly==="spo2"?"text-coral font-semibold":"text-slate-700"}`}>{row.spo2}</td>
                      <td className={`px-4 py-3 font-medium ${row.anomaly==="ptt"?"text-coral font-semibold":"text-slate-700"}`}>{row.pttDelay}</td>
                      <td className={`px-4 py-3 font-medium ${row.anomaly==="temp"?"text-coral font-semibold":"text-slate-700"}`}>{row.temp}</td>
                      <td className={`px-4 py-3 font-medium ${row.anomaly==="gsr"?"text-coral font-semibold":"text-slate-700"}`}>{row.gsr.toFixed(2)}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${qColor[row.quality]}`}>{row.quality}</span></td>
                      <td className="px-4 py-3 text-slate-500">{row.notes}</td>
                      <td className="px-4 py-3"><button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-paper-border px-4 py-3">
              <p className="text-[12px] text-slate-500">Showing 1 to {showing} of {TOTAL} readings</p>
              <div className="flex items-center gap-1.5">
                <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1} className="flex h-7 w-7 items-center justify-center rounded border border-paper-border bg-white text-slate-500 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft className="h-3.5 w-3.5" /></button>
                {[1,2,3].map(p=>(
                  <button key={p} onClick={()=>setPage(p)} className={`flex h-7 w-7 items-center justify-center rounded border text-[12px] font-medium ${page===p?"border-deep-sage bg-deep-sage text-white":"border-paper-border bg-white text-slate-600 hover:bg-gray-50"}`}>{p}</button>
                ))}
                <span className="text-[12px] text-slate-400 px-1">...</span>
                <button onClick={()=>setPage(12)} className={`flex h-7 w-7 items-center justify-center rounded border text-[12px] font-medium ${page===12?"border-deep-sage bg-deep-sage text-white":"border-paper-border bg-white text-slate-600 hover:bg-gray-50"}`}>12</button>
                <button onClick={()=>setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} className="flex h-7 w-7 items-center justify-center rounded border border-paper-border bg-white text-slate-500 disabled:opacity-40 hover:bg-gray-50"><ChevronRight className="h-3.5 w-3.5" /></button>
                <div className="ml-3 relative">
                  <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}} className="appearance-none rounded border border-paper-border bg-white px-3 py-1.5 pr-7 text-[12px] text-slate-600 outline-none">
                    {[10,20,50].map(s=><option key={s} value={s}>{s} / page</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-paper-border bg-white px-4 py-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sage" />
            <p className="text-[11px] text-slate-500">All timestamps are shown in your local time zone (IST). Data quality is determined by signal consistency and sensor reliability.</p>
          </div>
        </main>
      <ClinicalReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} defaultReportType="period" />
    </div>
  );
}
