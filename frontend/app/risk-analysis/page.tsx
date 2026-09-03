"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ClinicalReportModal from "@/components/ClinicalReportModal";
import { Calendar, Download, ShieldCheck, Heart, Droplets, Wind, Brain, TrendingUp, TrendingDown, Info, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const heartData = [{d:"Jan",v:22},{d:"Feb",v:34},{d:"Mar",v:26},{d:"Apr",v:62},{d:"May",v:28}];
const bpData = [{d:"Jan",v:24},{d:"Feb",v:42},{d:"Mar",v:30},{d:"Apr",v:58},{d:"May",v:35}];
const oxyData = [{d:"Jan",v:8},{d:"Feb",v:18},{d:"Mar",v:10},{d:"Apr",v:6},{d:"May",v:16}];
const stressData = [{d:"Jan",v:32},{d:"Feb",v:22},{d:"Mar",v:48},{d:"Apr",v:30},{d:"May",v:42}];

const RiskGauge = ({ value, color, label }: { value: number; color: string; label: string }) => {
  const r = 42; const c = 2 * Math.PI * r;
  const fill = c * (value / 100) * 0.75;
  return (
    <div className="flex flex-col items-center">
      <svg width={100} height={60} viewBox="0 0 100 60">
        <circle cx={50} cy={55} r={r} fill="none" stroke="#F0EFE8" strokeWidth={10} strokeDasharray={`${c*0.75} ${c}`} strokeLinecap="round" transform="rotate(135 50 55)" />
        <circle cx={50} cy={55} r={r} fill="none" stroke={color} strokeWidth={10} strokeDasharray={`${fill} ${c}`} strokeLinecap="round" transform="rotate(135 50 55)" />
        <text x={50} y={44} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#1e293b">{value}%</text>
      </svg>
      <p className="text-[11px] text-slate-500 -mt-1">{label}</p>
    </div>
  );
};

const risks = [
  { title:"Heart Disease Risk", value:28, status:"Moderate", tone:"moderate", icon:<Heart className="h-4 w-4" fill="currentColor" />, iconBg:"bg-[#FBE9E4] text-coral", data:heartData, color:"#E0654A", gid:"h1", factors:["Elevated resting HR (74 BPM)","Mild PTT delay patterns","Family history indicator"] },
  { title:"Hypertension Risk", value:35, status:"Moderate", tone:"moderate", icon:<Droplets className="h-4 w-4" />, iconBg:"bg-[#FBE9E4] text-coral", data:bpData, color:"#E0654A", gid:"h2", factors:["Systolic BP borderline elevated","Sedentary periods detected","Salt intake above baseline"] },
  { title:"Physiological Deterioration", value:16, status:"Low", tone:"low", icon:<Wind className="h-4 w-4" />, iconBg:"bg-[#E8EFE4] text-sage", data:oxyData, color:"#6E8F5C", gid:"h3", factors:["SpO₂ stable at 97–98%","Respiratory rate normal","No deterioration signals"] },
  { title:"Stress & Mental Load", value:42, status:"Moderate", tone:"moderate", icon:<Brain className="h-4 w-4" />, iconBg:"bg-[#EEEAF6] text-[#8B7BB5]", data:stressData, color:"#8B7BB5", gid:"h4", factors:["HRV below baseline 3 days","GSR spikes post-meal","Sleep quality slightly reduced"] },
];

export default function RiskAnalysisPage() {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">Risk Analysis</h1>
              <p className="mt-1 text-[13px] text-slate-500">Review the latest screening signals and understand what changed.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-paper-border bg-white px-3.5 py-2 text-[12px] text-slate-600 shadow-2xs">
                <Calendar className="h-4 w-4 text-slate-400" />Apr 23 – May 23, 2025
              </button>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-deep-sage px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#2C3E2B] transition-colors"
              >
                <Download className="h-4 w-4" />Export Clinical Report
              </button>
            </div>
          </header>

          {/* Overall Risk Gauge */}
          <div className="mb-5 rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-5 w-5 text-sage" />
                  <h2 className="text-[15px] font-semibold text-ink">Overall Risk Profile</h2>
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="text-[12px] text-slate-500 max-w-md">Based on your latest vitals, sensor readings, and historical patterns, your composite risk is assessed below.</p>
              </div>
              <div className="flex items-center gap-8">
                {[{l:"Cardiovascular",v:32},{l:"Metabolic",v:18},{l:"Neurological",v:25}].map(g=>(
                  <RiskGauge key={g.l} value={g.v} color={g.v>30?"#E0654A":"#6E8F5C"} label={g.l} />
                ))}
                <div className="rounded-xl bg-[#E8EFE4] px-6 py-4 text-center">
                  <p className="text-[11px] text-slate-500 mb-1">Composite Score</p>
                  <p className="text-[36px] font-bold text-deep-sage leading-none">72</p>
                  <p className="text-[11px] font-semibold text-sage mt-1">Good ✓</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Cards Grid */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {risks.map(risk=>(
              <div key={risk.title} className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${risk.iconBg}`}>{risk.icon}</div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-ink">{risk.title}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${risk.tone==="moderate"?"bg-[#FBE9E4] text-coral":"bg-[#E8EFE4] text-sage"}`}>{risk.status}</span>
                    </div>
                  </div>
                  <p className="text-[28px] font-bold text-ink leading-none">{risk.value}%</p>
                </div>
                <div className="h-[90px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={risk.data} margin={{top:4,right:4,left:-20,bottom:0}}>
                      <defs>
                        <linearGradient id={risk.gid} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={risk.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={risk.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#F0EFE8" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="d" tick={{fontSize:10,fill:"#94A3B8"}} axisLine={false} tickLine={false} />
                      <YAxis domain={[0,80]} tick={{fontSize:10,fill:"#94A3B8"}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{fontSize:11,borderRadius:8,border:"1px solid #E5E3D8"}} />
                      <Area type="monotone" dataKey="v" stroke={risk.color} strokeWidth={2} fill={`url(#${risk.gid})`} dot={{r:3,fill:risk.color,stroke:"#fff",strokeWidth:1.5}} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 border-t border-paper-border pt-3">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">Contributing Factors</p>
                  <div className="space-y-1.5">
                    {risk.factors.map(f=>(
                      <div key={f} className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${risk.tone==="moderate"?"bg-coral":"bg-sage"}`}></span>{f}
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-sage hover:underline">
                    View Detailed Analysis <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Trend Summary */}
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label:"Improving", count:2, icon:<TrendingDown className="h-5 w-5 text-sage" />, bg:"bg-[#E8EFE4]", text:"text-sage" },
              { label:"Stable", count:1, icon:<TrendingUp className="h-5 w-5 text-slate-500" />, bg:"bg-[#F7F6F0]", text:"text-slate-500" },
              { label:"Worsening", count:1, icon:<TrendingUp className="h-5 w-5 text-coral" />, bg:"bg-[#FBE9E4]", text:"text-coral" },
              { label:"Next Review", count:"May 26", icon:<Calendar className="h-5 w-5 text-deep-sage" />, bg:"bg-[#EEF4EC]", text:"text-deep-sage" },
            ].map(s=>(
              <div key={s.label} className={`flex items-center gap-3 rounded-xl border border-paper-border bg-white p-4 shadow-2xs`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${s.bg}`}>{s.icon}</div>
                <div>
                  <p className="text-[11px] text-slate-500">{s.label}</p>
                  <p className={`text-[22px] font-bold leading-none ${s.text}`}>{s.count}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      <ClinicalReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} defaultReportType="overall" />
    </div>
  );
}
