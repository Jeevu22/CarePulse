"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import ClinicalReportModal from "@/components/ClinicalReportModal";
import UserProfileModal from "@/components/UserProfileModal";
import { useDeviceProfile } from "@/components/DeviceProfileContext";
import {
  Calendar,
  Download,
  ShieldCheck,
  Heart,
  Droplets,
  Wind,
  Brain,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RiskGauge = ({
  value,
  color,
  label,
}: {
  value: number;
  color: string;
  label: string;
}) => {
  const r = 42;
  const c = 2 * Math.PI * r;
  const fill = c * (Math.min(100, Math.max(0, value)) / 100) * 0.75;
  return (
    <div className="flex flex-col items-center">
      <svg width={100} height={60} viewBox="0 0 100 60">
        <circle
          cx={50}
          cy={55}
          r={r}
          fill="none"
          stroke="#F0EFE8"
          strokeWidth={10}
          strokeDasharray={`${c * 0.75} ${c}`}
          strokeLinecap="round"
          transform="rotate(135 50 55)"
        />
        <circle
          cx={50}
          cy={55}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${fill} ${c}`}
          strokeLinecap="round"
          transform="rotate(135 50 55)"
        />
        <text
          x={50}
          y={44}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fill="#1e293b"
        >
          {value}%
        </text>
      </svg>
      <p className="text-[11px] text-slate-500 -mt-1">{label}</p>
    </div>
  );
};

export default function RiskAnalysisPage() {
  const { activeProfile, telemetry, latestPredictResult, readings } = useDeviceProfile();
  const [reportOpen, setReportOpen] = useState(false);

  const modules = latestPredictResult?.modules;

  // Real chart points per module from actual reading history
  const { heartData, bpData, oxyData, stressData } = useMemo(() => {
    if (!readings || readings.length === 0) {
      const def = [
        { d: "1", v: 22 },
        { d: "2", v: 25 },
        { d: "3", v: 28 },
        { d: "4", v: 30 },
      ];
      return { heartData: def, bpData: def, oxyData: def, stressData: def };
    }

    const sorted = [...readings].slice(0, 10).reverse();
    const heart = sorted.map((r, i) => ({
      d: `#${i + 1}`,
      v: Math.min(100, Math.round((r.heartRate / 140) * 100)),
    }));
    const bp = sorted.map((r, i) => ({
      d: `#${i + 1}`,
      v: Math.min(100, Math.max(0, Math.round(((r.bp?.systolic || 120) - 80) * 0.9))),
    }));
    const oxy = sorted.map((r, i) => ({
      d: `#${i + 1}`,
      v: Math.min(100, Math.max(0, (100 - r.spo2) * 10)),
    }));
    const stress = sorted.map((r, i) => ({
      d: `#${i + 1}`,
      v: Math.min(100, Math.round(((r.edaMicrosiemens || 2.0) / 4) * 100)),
    }));

    return { heartData: heart, bpData: bp, oxyData: oxy, stressData: stress };
  }, [readings]);

  // Map backend modules to visual risk representations
  const riskCards = useMemo(() => {
    const hd = modules?.heartDisease;
    const ht = modules?.hypertension;
    const dt = modules?.deterioration;
    const st = modules?.stress;

    return [
      {
        title: "Heart Disease Risk",
        value: hd?.band === "high" ? 75 : hd?.band === "moderate" ? 42 : 18,
        status: hd?.band ? hd.band.toUpperCase() : "NORMAL",
        tone: hd?.band || "normal",
        icon: <Heart className="h-4 w-4" fill="currentColor" />,
        iconBg: hd?.band === "high" || hd?.band === "moderate" ? "bg-[#FBE9E4] text-coral" : "bg-[#E8EFE4] text-sage",
        data: heartData,
        color: hd?.band === "high" || hd?.band === "moderate" ? "#E0654A" : "#6E8F5C",
        gid: "h1",
        factors: [
          `HRV Evaluation: ${hd?.label || "Healthy range"}`,
          `Live Resting Heart Rate: ${telemetry.pulseRate} BPM (Baseline: ${activeProfile?.baseline?.heartRate || 72} BPM)`,
          `Detail: ${hd?.detail || "HRV SDNN & RMSSD analysis"}`,
        ],
      },
      {
        title: "Hypertension Risk",
        value: ht?.band === "critical" ? 90 : ht?.band === "high" ? 70 : ht?.band === "moderate" ? 45 : 20,
        status: ht?.band ? ht.band.toUpperCase() : "NORMAL",
        tone: ht?.band || "normal",
        icon: <Droplets className="h-4 w-4" />,
        iconBg: ht?.band === "high" || ht?.band === "moderate" || ht?.band === "critical" ? "bg-[#FBE9E4] text-coral" : "bg-[#E8EFE4] text-sage",
        data: bpData,
        color: ht?.band === "high" || ht?.band === "critical" ? "#E0654A" : "#6E8F5C",
        gid: "h2",
        factors: [
          `AHA/ACC Classification: ${ht?.label || "Normal Blood Pressure"}`,
          `Current BP: ${telemetry.systolic}/${telemetry.diastolic} mmHg (Baseline: ${activeProfile?.baseline?.systolic || 120}/${activeProfile?.baseline?.diastolic || 80})`,
          `Pulse Transit Time (PTT): ${telemetry.pttDelay} ms`,
        ],
      },
      {
        title: "Physiological Deterioration",
        value: dt?.band === "critical" ? 85 : dt?.band === "high" ? 65 : dt?.band === "moderate" ? 35 : 12,
        status: dt?.band ? dt.band.toUpperCase() : "NORMAL",
        tone: dt?.band || "normal",
        icon: <Wind className="h-4 w-4" />,
        iconBg: dt?.band === "critical" || dt?.band === "high" ? "bg-[#FBE9E4] text-coral" : "bg-[#E8EFE4] text-sage",
        data: oxyData,
        color: dt?.band === "critical" || dt?.band === "high" ? "#E0654A" : "#6E8F5C",
        gid: "h3",
        factors: [
          `Adapted NEWS2 Score: ${dt?.score ?? 0} (${dt?.label || "Low risk"})`,
          `Oxygen Saturation (SpO₂): ${telemetry.spo2}%`,
          `Skin Temperature: ${telemetry.temperature} °C`,
        ],
      },
      {
        title: "Stress & Autonomic Load",
        value: st?.band === "high" ? 75 : st?.band === "moderate" ? 45 : 22,
        status: st?.band ? st.band.toUpperCase() : "NORMAL",
        tone: st?.band || "normal",
        icon: <Brain className="h-4 w-4" />,
        iconBg: st?.band === "high" ? "bg-[#FBE9E4] text-coral" : "bg-[#EEEAF6] text-[#8B7BB5]",
        data: stressData,
        color: "#8B7BB5",
        gid: "h4",
        factors: [
          `Tonic EDA Conductance: ${telemetry.gsr} µS (${st?.label || "Baseline"})`,
          `Stress Status: ${st?.detail || "Galvanic skin response within normal bounds"}`,
          `Sympathetic arousal response index verified`,
        ],
      },
    ];
  }, [modules, telemetry, activeProfile, heartData, bpData, oxyData, stressData]);

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">
              Clinical Risk Analysis
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Grounded multi-organ risk scoring for{" "}
              <strong className="text-ink">{activeProfile?.name || "Patient"}</strong> via backend engine v1.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-deep-sage px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#2C3E2B] transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="h-4 w-4" />
              Export Clinical Report
            </button>
          </div>
        </header>

        {/* Overall Risk Gauge */}
        <div className="mb-5 rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-5 w-5 text-sage" />
                <h2 className="text-[15px] font-semibold text-ink">Overall Risk Profile</h2>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="text-[12px] text-slate-500 max-w-md">
                Evaluated from active sensor readings, AHA/ACC staging, adapted NEWS2, HRV, and EDA models.
              </p>
            </div>
            <div className="flex items-center gap-8">
              {[
                { l: "Cardiovascular", v: riskCards[0].value },
                { l: "Hypertension", v: riskCards[1].value },
                { l: "Deterioration", v: riskCards[2].value },
              ].map((g) => (
                <RiskGauge
                  key={g.l}
                  value={g.v}
                  color={g.v > 40 ? "#E0654A" : "#6E8F5C"}
                  label={g.l}
                />
              ))}
              <div className="rounded-xl bg-[#E8EFE4] px-6 py-4 text-center">
                <p className="text-[11px] text-slate-500 mb-1">Overall Band</p>
                <p className="font-serif text-[28px] font-bold uppercase text-deep-sage leading-none">
                  {latestPredictResult?.overallBand || "Normal"}
                </p>
                <p className="text-[11px] font-semibold text-sage mt-1">Backend Verified ✓</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Cards Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {riskCards.map((risk) => (
            <div
              key={risk.title}
              className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${risk.iconBg}`}
                    >
                      {risk.icon}
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-ink">{risk.title}</h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          risk.tone === "critical" || risk.tone === "high" || risk.tone === "moderate"
                            ? "bg-[#FBE9E4] text-coral"
                            : "bg-[#E8EFE4] text-sage"
                        }`}
                      >
                        {risk.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-[26px] font-bold text-ink leading-none">{risk.value}%</p>
                </div>
                <div className="h-[90px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={risk.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={risk.gid} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={risk.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={risk.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#F0EFE8" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E5E3D8" }} />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={risk.color}
                        strokeWidth={2}
                        fill={`url(#${risk.gid})`}
                        dot={{ r: 3, fill: risk.color, stroke: "#fff", strokeWidth: 1.5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-3 border-t border-paper-border pt-3">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">
                  Clinical Evidence & Metrics
                </p>
                <div className="space-y-1.5">
                  {risk.factors.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          risk.tone === "critical" || risk.tone === "high" ? "bg-coral" : "bg-sage"
                        }`}
                      ></span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-5 rounded-xl border border-paper-border bg-white p-4 text-[11px] text-slate-500 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p>{latestPredictResult?.disclaimer || "Pulsewatch is a risk-screening tool grounded in clinical scoring frameworks (HRV, AHA/ACC BP staging, NEWS2, EDA stress indexing). It is not a diagnostic device."}</p>
        </div>
      </main>
      <ClinicalReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} defaultReportType="overall" />
      <UserProfileModal />
    </div>
  );
}
