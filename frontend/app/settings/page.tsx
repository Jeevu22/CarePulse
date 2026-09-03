"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { RefreshCw, Wifi, Cloud, Cpu, Heart, Droplets, Activity, Thermometer, Zap, Settings, RotateCcw, ChevronRight, Download } from "lucide-react";

const sensors = [
  { name:"MAX30102", type:"PPG Sensor", status:"Operational", signalQuality:98, calibrated:"Apr 20, 2025", icon:<Heart className="h-5 w-5 text-coral" /> },
  { name:"AD8232", type:"ECG Sensor", status:"Operational", signalQuality:96, calibrated:"Apr 18, 2025", icon:<Activity className="h-5 w-5 text-sage" /> },
  { name:"MLX90614", type:"Temperature Sensor", status:"Operational", signalQuality:97, calibrated:"Apr 19, 2025", icon:<Thermometer className="h-5 w-5 text-orange-400" /> },
  { name:"GSR Sensor", type:"Skin Conductance", status:"Operational", signalQuality:94, calibrated:"Apr 19, 2025", icon:<Zap className="h-5 w-5 text-yellow-500" /> },
];

const thresholds = [
  { param:"Heart Rate (BPM)", icon:<Heart className="h-4 w-4 text-coral" fill="currentColor" />, high:">100", low:"<50", highColor:"text-coral", lowColor:"text-blue-500" },
  { param:"SpO₂ (%)", icon:<Droplets className="h-4 w-4 text-blue-400" />, high:"—", low:"<92", highColor:"", lowColor:"text-coral" },
  { param:"PTT Delay (ms)", icon:<Activity className="h-4 w-4 text-sage" />, high:">300", low:"—", highColor:"text-coral", lowColor:"" },
  { param:"Temperature (°C)", icon:<Thermometer className="h-4 w-4 text-orange-400" />, high:">38.0", low:"<35.0", highColor:"text-coral", lowColor:"text-coral" },
  { param:"GSR (µS)", icon:<Zap className="h-4 w-4 text-yellow-500" />, high:">5.0", low:"—", highColor:"text-coral", lowColor:"" },
];

export default function SettingsPage() {
  const [uptime] = useState("2h 45m 32s");
  const [signalStrength] = useState(-48);

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">Settings & Device Management</h1>
              <p className="mt-1 text-[13px] text-slate-500">Manage your device, data sync, alerts, and account preferences.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-paper-border bg-white px-3.5 py-2 text-[12px] text-slate-600 shadow-2xs">Apr 23 – May 23, 2025</button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-[#C9D9C3] bg-[#E8EFE4] px-4 py-2 text-[12px] font-semibold text-deep-sage hover:bg-[#DCE9D7]">
                <RefreshCw className="h-4 w-4" />Refresh Status
              </button>
            </div>
          </header>

          {/* Device Overview + Connectivity */}
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Device Overview */}
            <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-ink">Device Overview</h2>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-sage"><span className="h-2 w-2 rounded-full bg-sage inline-block"></span>Online</span>
              </div>
              <div className="flex gap-4">
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-paper-border bg-[#F7F6F0] p-2">
                  <Cpu className="h-12 w-12 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-ink">ESP32 DevKit</p>
                  <p className="text-[12px] text-slate-500">Primary Health Device</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ID: PW-ESP32-01A7B</p>
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-[#E3F0E4] px-2.5 py-0.5 text-[10px] font-semibold text-sage">Connected</span>
                </div>
                <div className="text-right text-[12px] space-y-1">
                  <div><span className="text-slate-500">Uptime</span><p className="font-semibold text-ink">{uptime}</p></div>
                  <div><span className="text-slate-500">Last Sync</span><p className="font-semibold text-sage flex items-center gap-1 justify-end"><RefreshCw className="h-3 w-3" />Just now</p></div>
                  <div><span className="text-slate-500">Firmware</span><p className="font-semibold text-ink">v1.4.7 <span className="text-sage text-[10px]">Updated</span></p></div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-paper-border py-2 text-[12px] font-medium text-slate-600 hover:bg-gray-50">
                  <RotateCcw className="h-3.5 w-3.5" />Restart Device
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-paper-border py-2 text-[12px] font-medium text-slate-600 hover:bg-gray-50">
                  <Settings className="h-3.5 w-3.5" />Factory Reset
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-paper-border py-2 text-[12px] font-medium text-slate-600 hover:bg-gray-50">
                  View Device Logs<ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Connectivity */}
            <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
              <h2 className="mb-4 text-[14px] font-semibold text-ink">Connectivity Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5"><Wifi className="h-3.5 w-3.5" />Wi-Fi Connection</p>
                  <p className="text-[14px] font-bold text-ink">Home_Network_5G</p>
                  <span className="inline-flex items-center rounded-full bg-[#E3F0E4] px-2.5 py-0.5 text-[10px] font-semibold text-sage mt-1.5">Connected</span>
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-500 mb-1">Signal Strength <span className="text-ink font-semibold">{signalStrength} dBm</span></p>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-sage" style={{width:"70%"}}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-paper-border p-3">
                    <div className="flex items-center gap-2"><Cloud className="h-4 w-4 text-orange-400" /><span className="text-[12px] text-slate-600">Firebase Cloud</span></div>
                    <span className="text-[11px] font-semibold text-sage">Connected</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-0.5">Sync Latency</p>
                    <p className="text-[24px] font-bold text-ink">42 <span className="text-[13px] font-normal">ms</span></p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-sage inline-block"></span>
                    Realtime Database — Data sync successful
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Status + Device Firmware */}
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Sensor Status */}
            <div className="lg:col-span-2 rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-[14px] font-semibold text-ink">Sensor Status & Calibration</h2>
                <span className="text-slate-400 cursor-help">ⓘ</span>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {sensors.map(s=>(
                  <div key={s.name} className="rounded-xl border border-paper-border p-4">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F6F0]">{s.icon}</div>
                    <p className="text-[13px] font-bold text-ink">{s.name}</p>
                    <p className="text-[11px] text-slate-500">{s.type}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-sage inline-block"></span>
                      <span className="text-[11px] font-semibold text-sage">{s.status}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                      <div><p className="font-semibold text-ink">{s.signalQuality}%</p><p>Signal Quality</p></div>
                      <div><p className="font-semibold text-ink">{s.calibrated}</p><p>Calibrated</p></div>
                    </div>
                    <button className="mt-3 w-full rounded-lg border border-paper-border py-1.5 text-[11px] font-medium text-slate-600 hover:bg-gray-50">Calibrate</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-[#C9D9C3] bg-[#F2F7EF] px-4 py-2.5">
                <div className="flex items-center gap-2 text-[12px] text-slate-600">
                  <span className="text-sage">✓</span>All sensors are functioning within normal parameters. Last full calibration: Apr 21, 2025 at 08:15 PM
                </div>
                <button className="flex items-center gap-1.5 rounded-lg border border-paper-border bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-gray-50 whitespace-nowrap">
                  <RefreshCw className="h-3.5 w-3.5" />Calibrate All
                </button>
              </div>
            </div>

            {/* Device & Firmware */}
            <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
              <h2 className="mb-4 text-[14px] font-semibold text-ink">Device & Firmware</h2>
              <div className="space-y-2.5 text-[12px]">
                {[
                  { label:"Device Model", val:"ESP32 DevKit V1" },
                  { label:"Firmware Version", val:"v1.4.7", badge:"Up to date", badgeClass:"bg-[#E3F0E4] text-sage" },
                  { label:"Build Date", val:"Apr 15, 2025 10:32 AM" },
                  { label:"Hardware Revision", val:"Rev 1.2" },
                  { label:"Bootloader Version", val:"v2.0.3" },
                  { label:"Flash Size", val:"4MB" },
                  { label:"Free Heap", val:"120 KB" },
                  { label:"MAC Address", val:"DC:4F:22:8A:7B:01" },
                ].map(item=>(
                  <div key={item.label} className="flex items-center justify-between border-b border-paper-border pb-2 last:border-0">
                    <span className="text-slate-500">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{item.val}</span>
                      {item.badge && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.badgeClass}`}>{item.badge}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-paper-border py-2 text-[12px] font-semibold text-slate-600 hover:bg-gray-50">
                <Download className="h-3.5 w-3.5" />Check for Updates
              </button>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-ink">Alert Thresholds <span className="text-[12px] font-normal text-slate-500">(Active Profile)</span></h2>
              <button className="flex items-center gap-2 rounded-lg border border-paper-border bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 hover:bg-gray-50">
                <Settings className="h-3.5 w-3.5" />Manage Thresholds
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {thresholds.map(t=>(
                <div key={t.param} className="rounded-xl border border-paper-border p-3.5">
                  <div className="mb-2 flex items-center gap-1.5">{t.icon}<span className="text-[11px] font-semibold text-slate-600">{t.param}</span></div>
                  {t.high && <p className="text-[12px] font-semibold"><span className="text-slate-500">High </span><span className={t.highColor}>{t.high}</span></p>}
                  {t.low && <p className="text-[12px] font-semibold"><span className="text-slate-500">Low </span><span className={t.lowColor}>{t.low}</span></p>}
                </div>
              ))}
            </div>
          </div>
        </main>
    </div>
  );
}
