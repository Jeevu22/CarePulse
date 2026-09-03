"use client";
import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { Calendar, Download, ChevronDown, ChevronRight, Heart, TrendingUp, Droplets, Activity, RefreshCw, Battery, Flame, Info, HelpCircle, ExternalLink } from "lucide-react";

type AlertType = "High" | "Trend" | "System";
type AlertItem = { id:number; icon: string; iconBg:string; title:string; description:string; metric:string; metricLabel:string; badge:AlertType; badgeColor:string; source:string; date:string; time:string; };

const alerts: AlertItem[] = [
  { id:1, icon:"heart", iconBg:"bg-[#FBE9E4]", title:"High Heart Rate Detected", description:"Your resting heart rate was 112 bpm, which is above your normal range.", metric:"112 bpm", metricLabel:"", badge:"High", badgeColor:"bg-[#FFEBEE] text-[#C62828]", source:"Heart Rate", date:"May 23, 2025", time:"10:25 AM" },
  { id:2, icon:"trend", iconBg:"bg-[#FFF3E0]", title:"Elevated Blood Pressure Trend", description:"Your average systolic BP has been above baseline for the past 5 days.", metric:"5 days", metricLabel:"Trend", badge:"Trend", badgeColor:"bg-[#FFF3E0] text-[#E65100]", source:"Blood Pressure", date:"May 23, 2025", time:"08:15 AM" },
  { id:3, icon:"flame", iconBg:"bg-[#FBE9E4]", title:"High Stress Level Detected", description:"Your stress level is significantly higher than usual.", metric:"85/100", metricLabel:"", badge:"High", badgeColor:"bg-[#FFEBEE] text-[#C62828]", source:"Stress", date:"May 22, 2025", time:"07:40 PM" },
  { id:4, icon:"activity", iconBg:"bg-[#FFF3E0]", title:"Reduced HRV Trend", description:"Your HRV has been below your baseline for the past 7 days.", metric:"7 days", metricLabel:"Trend", badge:"Trend", badgeColor:"bg-[#FFF3E0] text-[#E65100]", source:"HRV (SDNN)", date:"May 22, 2025", time:"06:30 AM" },
  { id:5, icon:"sync", iconBg:"bg-[#E8F5E9]", title:"Data Sync Successful", description:"Your device data was synced successfully.", metric:"✓", metricLabel:"", badge:"System", badgeColor:"bg-[#E3F0E4] text-[#5E8152]", source:"System", date:"May 22, 2025", time:"06:15 AM" },
  { id:6, icon:"activity", iconBg:"bg-[#FFF3E0]", title:"Inactivity Alert", description:"You have been inactive for more than 6 hours.", metric:"6.2 hrs", metricLabel:"Inactive", badge:"Trend", badgeColor:"bg-[#FFF3E0] text-[#E65100]", source:"Activity", date:"May 21, 2025", time:"03:10 PM" },
  { id:7, icon:"battery", iconBg:"bg-[#E3F0E4]", title:"Device Battery Fully Charged", description:"Your PULSEWATCH device battery is fully charged.", metric:"100%", metricLabel:"", badge:"System", badgeColor:"bg-[#E3F0E4] text-[#5E8152]", source:"System", date:"May 21, 2025", time:"09:00 AM" },
];

function AlertIcon({ type, bg }: { type:string; bg:string }) {
  const cls = "h-5 w-5";
  const icon = type==="heart"?<Heart className={`${cls} text-coral`} fill="currentColor" />
    :type==="trend"?<TrendingUp className={`${cls} text-orange-500`} />
    :type==="flame"?<Flame className={`${cls} text-coral`} />
    :type==="activity"?<Activity className={`${cls} text-orange-500`} />
    :type==="sync"?<RefreshCw className={`${cls} text-sage`} />
    :type==="battery"?<Battery className={`${cls} text-sage`} />
    :<Droplets className={`${cls} text-blue-400`} />;
  return <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg}`}>{icon}</div>;
}

import { useDeviceProfile } from "@/components/DeviceProfileContext";

export default function AlertsPage() {
  const { alerts } = useDeviceProfile();
  const [sortBy, setSortBy] = useState("Latest");
  const [filterType, setFilterType] = useState("All Types");
  const [filterTime, setFilterTime] = useState("Last 30 Days");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  const summary = useMemo(() => {
    const high = alerts.filter(a => a.badge === "High").length;
    const trend = alerts.filter(a => a.badge === "Trend").length;
    const system = alerts.filter(a => a.badge === "System").length;
    return { high, trend, system, informational: 0, total: alerts.length };
  }, [alerts]);

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">Alerts</h1>
              <p className="mt-1 text-[13px] text-slate-500">Stay informed about important changes in your health.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-paper-border bg-white px-3.5 py-2 text-[12px] text-slate-600 shadow-2xs">
                <Calendar className="h-4 w-4 text-slate-400" /><span>Apr 23 – May 23, 2025</span>
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-deep-sage px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#2C3E2B]">
                <Download className="h-4 w-4" />Export Alerts
              </button>
            </div>
          </header>

          <div className="flex gap-6">
            {/* Alert list */}
            <div className="flex-1 min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-ink">All Alerts ({summary.total})</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-slate-500">Sort by:</span>
                  <button className="flex items-center gap-1 text-[12px] font-semibold text-ink">
                    {sortBy}<ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map(alert=>(
                  <div key={alert.id} className="flex items-center gap-4 rounded-xl border border-paper-border bg-white p-4 shadow-2xs transition-all hover:shadow-md cursor-pointer">
                    <AlertIcon type={alert.icon} bg={alert.iconBg} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold mr-2 ${alert.badgeColor}`}>{alert.badge}</span>
                          <span className="text-[13px] font-semibold text-ink">{alert.title}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[18px] font-bold text-coral leading-none">{alert.metric}</p>
                          {alert.metricLabel && <p className="text-[11px] text-slate-500">{alert.metricLabel}</p>}
                        </div>
                      </div>
                      <p className="text-[12px] text-slate-500">{alert.description}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          {alert.icon==="heart"?<Heart className="h-3 w-3" />:<Activity className="h-3 w-3" />}
                          {alert.source}
                        </span>
                        <span>•</span><span>{alert.date}</span><span>•</span><span>{alert.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar panel */}
            <div className="w-64 shrink-0 space-y-4">
              {/* Alert Summary */}
              <div className="rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
                <div className="mb-3 flex items-center gap-1.5">
                  <h3 className="text-[13px] font-semibold text-ink">Alert Summary</h3>
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </div>
                {[
                  { label:"High Priority", val:summary.high, icon:<Flame className="h-3.5 w-3.5 text-coral" />, cls:"text-coral" },
                  { label:"Trend Alerts", val:summary.trend, icon:<TrendingUp className="h-3.5 w-3.5 text-orange-500" />, cls:"text-orange-500" },
                  { label:"System Alerts", val:summary.system, icon:<RefreshCw className="h-3.5 w-3.5 text-sage" />, cls:"text-sage" },
                  { label:"Informational", val:summary.informational, icon:<Info className="h-3.5 w-3.5 text-slate-400" />, cls:"text-slate-400" },
                ].map(item=>(
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-paper-border last:border-0">
                    <div className="flex items-center gap-2">{item.icon}<span className="text-[12px] text-slate-600">{item.label}</span></div>
                    <span className={`text-[13px] font-bold ${item.cls}`}>{item.val}</span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-ink">Total Alerts</span>
                  <span className="text-[13px] font-bold text-ink">{summary.total}</span>
                </div>
              </div>

              {/* Filters */}
              <div className="rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-ink">Filters</h3>
                  <button className="text-[11px] font-semibold text-coral hover:underline">Clear All</button>
                </div>
                {[
                  { label:"Alert Type", val:filterType, set:setFilterType, opts:["All Types","High Priority","Trend","System","Informational"] },
                  { label:"Time Range", val:filterTime, set:setFilterTime, opts:["Last 30 Days","Last 7 Days","Last 3 Months"] },
                  { label:"Status", val:filterStatus, set:setFilterStatus, opts:["All Statuses","Unread","Read","Dismissed"] },
                ].map(f=>(
                  <div key={f.label} className="mb-3">
                    <p className="mb-1.5 text-[11px] font-semibold text-slate-500">{f.label}</p>
                    <div className="relative">
                      <select value={f.val} onChange={e=>f.set(e.target.value)} className="w-full appearance-none rounded-lg border border-paper-border bg-[#FAFAF7] px-3 py-2 text-[12px] text-slate-600 outline-none">
                        {f.opts.map(o=><option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
                <button className="w-full rounded-lg bg-[#F0F0EC] py-2 text-[12px] font-semibold text-slate-600 hover:bg-gray-200 transition-colors">Apply Filters</button>
              </div>

              {/* Need Help */}
              <div className="rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8EFE4]">
                    <HelpCircle className="h-4.5 w-4.5 text-sage" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">Need Help?</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">If you are experiencing any health concerns, please consult your healthcare provider.</p>
                    <button className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-sage hover:underline">
                      Contact Support →<ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
