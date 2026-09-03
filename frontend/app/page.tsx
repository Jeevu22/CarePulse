"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Heart,
  Wind,
  Droplets,
  Brain,
  Stethoscope,
  Calendar,
  Download,
  Info,
  X,
  CheckCircle2,
  FileText,
  Activity,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useDeviceProfile } from "@/components/DeviceProfileContext";
import ClinicalReportModal from "@/components/ClinicalReportModal";
import UserProfileModal from "@/components/UserProfileModal";
import { PredictInput } from "@/lib/types";

type ChartPoint = { month: string; val: number };

function Sparkline({
  data,
  color,
  gradientId,
  showAxes = true,
}: {
  data: ChartPoint[];
  color: string;
  gradientId: string;
  showAxes?: boolean;
}) {
  const chartData = data && data.length >= 2 ? data : [
    { month: "1", val: 50 },
    { month: "2", val: 50 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.38} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxes && (
          <>
            <CartesianGrid
              stroke="#E5E3D8"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#A8A29E", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
              dy={4}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tick={{ fontSize: 9, fill: "#A8A29E", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
          </>
        )}
        <Area
          type="monotone"
          dataKey="val"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          dot={{ r: 3, fill: color, stroke: "#fff", strokeWidth: 1.5 }}
          activeDot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "critical" | "high" | "moderate" | "elevated" | "low" | "good" | "normal";
}) {
  const styles = {
    critical: "bg-red-100 text-red-700 font-bold",
    high: "bg-[#FFEBEE] text-[#C62828] font-semibold",
    moderate: "bg-[#FFF3E0] text-[#E65100] font-semibold",
    elevated: "bg-[#FBE9E4] text-[#C85A42] font-semibold",
    low: "bg-[#E8EFE4] text-[#5E8152] font-semibold",
    good: "bg-[#E8EFE4] text-[#5E8152] font-semibold",
    normal: "bg-[#E8EFE4] text-[#5E8152] font-semibold",
  } as const;

  const styleClass = styles[tone] || styles.normal;

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide ${styleClass}`}
    >
      {label}
    </span>
  );
}

function RiskCard({
  title,
  value,
  status,
  tone,
  icon,
  iconWrap,
  data,
  color,
  gradientId,
  detail,
}: {
  title: string;
  value: string;
  status: string;
  tone: "critical" | "high" | "moderate" | "elevated" | "low" | "good" | "normal";
  icon: ReactNode;
  iconWrap: string;
  data: ChartPoint[];
  color: string;
  gradientId: string;
  detail?: string;
}) {
  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-paper-border bg-white p-5 shadow-2xs">
      <div>
        <div className="mb-3 flex items-start justify-between">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${iconWrap}`}
          >
            {icon}
          </div>
          <StatusPill label={status} tone={tone} />
        </div>
        <h3 className="font-serif text-[15px] font-semibold text-ink">{title}</h3>
        <p className="mt-1 font-mono text-[26px] font-bold leading-none tracking-tight text-ink">
          {value}
        </p>
        {detail && (
          <p className="mt-1 text-[11px] text-slate-500 line-clamp-1" title={detail}>
            {detail}
          </p>
        )}
      </div>
      <div className="mt-2 h-[100px] w-full">
        <Sparkline data={data} color={color} gradientId={gradientId} />
      </div>
    </article>
  );
}

function DialNode({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute z-10 flex h-8 w-8 items-center justify-center rounded-full border border-paper-border bg-white shadow-2xs ${className}`}
    >
      {children}
    </div>
  );
}

function CompositeHealthScore({
  value,
  overallBand,
  disclaimer,
}: {
  value: number;
  overallBand: string;
  disclaimer?: string;
}) {
  const size = 236;
  const cx = 118;
  const cy = 118;
  const r = 84;
  const stroke = 12;
  const circumference = 2 * Math.PI * r;
  const gap = 48 / 360;
  const track = circumference * (1 - gap);
  const progress = track * (Math.min(100, Math.max(0, value)) / 100);

  const ringColor = value >= 80 ? "#6E8F5C" : value >= 60 ? "#E0654A" : "#C62828";
  const badgeColor =
    value >= 80
      ? "bg-[#E8EFE4] text-sage"
      : value >= 60
      ? "bg-[#FFF3E0] text-[#E65100]"
      : "bg-[#FFEBEE] text-[#C62828]";
  const badgeLabel = value >= 80 ? "Optimal ✓" : value >= 60 ? "Moderate Attention" : "High Risk";

  return (
    <article className="relative flex h-full flex-col items-center justify-between rounded-2xl border border-paper-border bg-white px-6 py-6 shadow-2xs">
      <header className="mb-2 flex items-center gap-1.5">
        <h2 className="font-serif text-[16px] font-semibold text-ink">
          Composite Health Score
        </h2>
        <Info className="h-3.5 w-3.5 text-slate-400" />
      </header>

      <div className="relative mx-auto mt-2 h-[236px] w-[236px]">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size} ${size}`}
        >
          <line
            x1={cx}
            y1={cy}
            x2={42}
            y2={52}
            stroke="#D8D5CC"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          <line
            x1={cx}
            y1={cy}
            x2={194}
            y2={52}
            stroke="#D8D5CC"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          <line
            x1={cx}
            y1={cy}
            x2={42}
            y2={184}
            stroke="#D8D5CC"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          <line
            x1={cx}
            y1={cy}
            x2={194}
            y2={184}
            stroke="#D8D5CC"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
        </svg>

        <DialNode className="left-1 top-4 text-coral">
          <Heart className="h-3.5 w-3.5" fill="currentColor" />
        </DialNode>
        <DialNode className="right-1 top-4 text-coral">
          <Droplets className="h-3.5 w-3.5" />
        </DialNode>
        <DialNode className="bottom-8 left-1 text-sage">
          <Wind className="h-3.5 w-3.5" />
        </DialNode>
        <DialNode className="bottom-8 right-1 text-[#8B7BB5]">
          <Brain className="h-3.5 w-3.5" />
        </DialNode>

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#EDEBE3"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${track} ${circumference}`}
            transform={`rotate(132 ${cx} ${cy})`}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            transform={`rotate(132 ${cx} ${cy})`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-[42px] font-bold leading-none tracking-tight text-ink">
            {value}%
          </p>
          <span className={`mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
            {badgeLabel}
          </span>
        </div>
      </div>

      <p className="mt-2 max-w-[240px] text-center text-[11px] leading-relaxed text-slate-500">
        Backend clinical scoring engine status: <strong className="uppercase text-ink">{overallBand}</strong>.
      </p>
    </article>
  );
}

function MicroScoreCard({
  label,
  value,
  status,
  tone,
  data,
  color,
  gradientId,
}: {
  label: string;
  value: string;
  status: string;
  tone: "critical" | "high" | "moderate" | "elevated" | "low" | "good" | "normal";
  data: ChartPoint[];
  color: string;
  gradientId: string;
}) {
  return (
    <div className="min-w-[128px] flex-1 rounded-xl border border-paper-border bg-[#FAF9F5] px-4 py-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-ink">
        {value}
        <span className="text-xs font-normal text-slate-400">/100</span>
      </p>
      <StatusPill label={status} tone={tone} />
      <div className="mt-2 h-10 w-full">
        <Sparkline
          data={data}
          color={color}
          gradientId={gradientId}
          showAxes={false}
        />
      </div>
    </div>
  );
}

function HeaderBar({
  onExport,
  onCapture,
}: {
  onExport: () => void;
  onCapture: () => void;
}) {
  const { telemetry, toggleStreaming, activeProfile } = useDeviceProfile();
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date());

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink flex items-center gap-2.5">
          Dashboard Overview
          <button
            onClick={toggleStreaming}
            title="Click to toggle live telemetry scoring stream"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EFE4] px-2.5 py-1 text-[11px] font-semibold text-sage hover:bg-[#dce9d7] transition-colors cursor-pointer"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                telemetry.isStreaming ? "bg-emerald-500 animate-ping" : "bg-gray-400"
              }`}
            ></span>
            {telemetry.isStreaming ? "LIVE SCORING STREAMING" : "STREAM PAUSED"}
          </button>
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Real-time health risk screening • Monitored Profile:{" "}
          <strong className="text-ink">{activeProfile?.name || "Active Patient"}</strong> ({activeProfile?.relation || "Self"})
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-paper-border bg-white px-3.5 py-2 text-[12px] text-slate-600 shadow-2xs">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{todayFormatted}</span>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-full bg-deep-sage px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#2C3E2B] shadow-2xs cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Clinical Report
        </button>
        <button
          type="button"
          onClick={onCapture}
          className="inline-flex items-center gap-2 rounded-full border border-[#C9D9C3] bg-[#E8EFE4] px-4 py-2.5 text-[12px] font-semibold text-sage transition-colors hover:bg-[#DCE9D7] shadow-2xs cursor-pointer"
        >
          <Activity className="h-4 w-4" />
          Record Vitals
        </button>
      </div>
    </header>
  );
}

type VitalsInput = {
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  respiratoryRate: number;
};

function ScreeningModal({
  open,
  onClose,
  onSave,
  current,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (vitals: VitalsInput) => Promise<void>;
  current: VitalsInput;
}) {
  const [values, setValues] = useState<VitalsInput>(current);
  const [step, setStep] = useState<"form" | "saving" | "saved">("form");

  useEffect(() => {
    if (open) {
      setValues(current);
      setStep("form");
    }
  }, [open, current]);

  if (!open) return null;

  const update = (key: keyof VitalsInput, value: string) =>
    setValues((prev) => ({
      ...prev,
      [key]: key === "temperature" ? Number(value) : Number.parseInt(value, 10) || 0,
    }));

  const fields: {
    key: keyof VitalsInput;
    label: string;
    unit: string;
    min: number;
    max: number;
    step?: string;
  }[] = [
    { key: "heartRate", label: "Heart Rate", unit: "BPM", min: 35, max: 220 },
    { key: "systolic", label: "Systolic Blood Pressure", unit: "mmHg", min: 70, max: 250 },
    { key: "diastolic", label: "Diastolic Blood Pressure", unit: "mmHg", min: 40, max: 150 },
    { key: "spo2", label: "Oxygen Saturation (SpO₂)", unit: "%", min: 70, max: 100 },
    { key: "temperature", label: "Body Temperature", unit: "°C", min: 30, max: 43, step: "0.1" },
    { key: "respiratoryRate", label: "Respiratory Rate", unit: "breaths/min", min: 5, max: 60 },
  ];

  const invalid = values.systolic <= values.diastolic;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    setStep("saving");
    await onSave(values);
    setStep("saved");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-paper-border bg-[#FAF9F5] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sage">
              Clinical Risk Screening Ingestion
            </p>
            <h2 className="font-serif text-2xl font-bold text-ink">Record Vital Parameters</h2>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-slate-500">
              Readings are submitted directly to the clinically grounded backend scoring engine (`POST /api/predict`).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-ink cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "saved" ? (
          <div className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="h-14 w-14 text-sage" />
            <h3 className="mt-4 font-serif text-xl font-bold text-ink">Screening Evaluated & Stored</h3>
            <p className="mt-2 text-sm text-slate-500">
              Backend scoring engine has analyzed and logged this reading.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-deep-sage px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
            >
              Return to dashboard
            </button>
          </div>
        ) : (
          <form className="mt-7" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className="rounded-2xl border border-paper-border bg-white p-4">
                  <span className="block text-xs font-semibold text-slate-600">{field.label}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <input
                      required
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step ?? "1"}
                      value={values[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                      className="w-full bg-transparent font-mono text-xl font-bold text-ink outline-none"
                    />
                    <span className="shrink-0 text-[10px] font-bold uppercase text-slate-400">
                      {field.unit}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {invalid && (
              <p className="mt-4 text-xs font-semibold text-coral" role="alert">
                Systolic pressure must be higher than diastolic pressure.
              </p>
            )}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-paper-border px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={invalid || step === "saving"}
                className="rounded-full bg-deep-sage px-5 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {step === "saving" ? "Scoring via Backend..." : "Submit to Scoring Engine"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function OverviewDashboard() {
  const {
    activeProfile,
    telemetry,
    latestPredictResult,
    readings,
    recordReading,
  } = useDeviceProfile();

  const [screeningOpen, setScreeningOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Derive historical sparkline points from real stored readings
  const { heartSparkline, physioSparkline, hyperSparkline, stressSparkline } = useMemo(() => {
    if (!readings || readings.length === 0) {
      const def = [
        { month: "1", val: 50 },
        { month: "2", val: 52 },
        { month: "3", val: 48 },
        { month: "4", val: 55 },
        { month: "5", val: 50 },
      ];
      return { heartSparkline: def, physioSparkline: def, hyperSparkline: def, stressSparkline: def };
    }

    // Sort chronologically ascending for the chart
    const sorted = [...readings].slice(0, 10).reverse();
    const heart = sorted.map((r, i) => ({
      month: `#${i + 1}`,
      val: Math.min(100, Math.round((r.heartRate / 140) * 100)),
    }));
    const physio = sorted.map((r, i) => ({
      month: `#${i + 1}`,
      val: Math.min(100, Math.max(0, (100 - r.spo2) * 10)),
    }));
    const hyper = sorted.map((r, i) => ({
      month: `#${i + 1}`,
      val: Math.min(100, Math.max(0, Math.round(((r.bp?.systolic || 120) - 80) * 0.9))),
    }));
    const stress = sorted.map((r, i) => ({
      month: `#${i + 1}`,
      val: Math.min(100, Math.round(((r.edaMicrosiemens || 2.0) / 4) * 100)),
    }));

    return {
      heartSparkline: heart,
      physioSparkline: physio,
      hyperSparkline: hyper,
      stressSparkline: stress,
    };
  }, [readings]);

  // Extract module results directly from backend scoring engine
  const modules = latestPredictResult?.modules;
  const overallBand = latestPredictResult?.overallBand || "normal";

  // Compute composite score (out of 100) from backend engine results
  const compositeScore = useMemo(() => {
    if (!modules) return 85;
    let scoreTotal = 100;
    let penalty = 0;

    // Heart disease penalty
    if (modules.heartDisease.band === "high") penalty += 25;
    else if (modules.heartDisease.band === "moderate") penalty += 12;

    // Hypertension penalty
    if (modules.hypertension.band === "critical") penalty += 35;
    else if (modules.hypertension.band === "high") penalty += 25;
    else if (modules.hypertension.band === "moderate") penalty += 15;
    else if (modules.hypertension.band === "elevated") penalty += 5;

    // Deterioration penalty
    if (modules.deterioration.band === "critical") penalty += 40;
    else if (modules.deterioration.band === "high") penalty += 25;
    else if (modules.deterioration.band === "moderate") penalty += 10;

    // Stress penalty
    if (modules.stress.band === "high") penalty += 15;
    else if (modules.stress.band === "moderate") penalty += 8;

    return Math.max(25, Math.min(98, scoreTotal - penalty));
  }, [modules]);

  const currentVitals: VitalsInput = useMemo(
    () => ({
      heartRate: telemetry.pulseRate,
      systolic: telemetry.systolic,
      diastolic: telemetry.diastolic,
      spo2: telemetry.spo2,
      temperature: telemetry.temperature,
      respiratoryRate: 16,
    }),
    [telemetry]
  );

  const recordedAt = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    [telemetry.lastSync]
  );

  const recommendation =
    compositeScore >= 75
      ? "Current clinical screening parameters are within the expected physiological range. Continue regular activity and standard routine monitoring."
      : "Clinical scoring engine flagged parameters outside target baseline. Repeat measurement and consult healthcare provider if persistent.";

  const saveScreening = async (next: VitalsInput) => {
    await recordReading({
      heart_rate: next.heartRate,
      spo2: next.spo2,
      systolic: next.systolic,
      diastolic: next.diastolic,
      temperature: next.temperature,
      respiratory_rate: next.respiratoryRate,
      consciousness: "alert",
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
        <HeaderBar
          onExport={() => setReportOpen(true)}
          onCapture={() => setScreeningOpen(true)}
        />

        {/* 3-Column Risk & Health Score Section */}
        <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6">
            <RiskCard
              title="Heart Disease Risk"
              value={
                modules?.heartDisease?.available
                  ? `${modules.heartDisease.band?.toUpperCase()}`
                  : "Normal"
              }
              status={modules?.heartDisease?.band ? modules.heartDisease.band : "normal"}
              tone={modules?.heartDisease?.band || "normal"}
              icon={<Heart className="h-4 w-4" fill="currentColor" />}
              iconWrap="bg-[#FBE9E4] text-coral"
              data={heartSparkline}
              color="#E0654A"
              gradientId="heartGrad"
              detail={modules?.heartDisease?.label || "HRV & Autonomic Tone Assessment"}
            />
            <RiskCard
              title="Physiological Deterioration"
              value={
                modules?.deterioration?.available
                  ? `Score: ${modules.deterioration.score ?? 0}`
                  : "Low Risk"
              }
              status={modules?.deterioration?.band || "normal"}
              tone={modules?.deterioration?.band || "normal"}
              icon={<Wind className="h-4 w-4" />}
              iconWrap="bg-[#E8EFE4] text-sage"
              data={physioSparkline}
              color="#6E8F5C"
              gradientId="physioGrad"
              detail={modules?.deterioration?.label || "Adapted NEWS2 Early Warning Score"}
            />
          </div>

          <CompositeHealthScore
            value={compositeScore}
            overallBand={overallBand}
            disclaimer={latestPredictResult?.disclaimer}
          />

          <div className="flex flex-col gap-6">
            <RiskCard
              title="Hypertension Risk"
              value={
                modules?.hypertension?.available
                  ? `${telemetry.systolic}/${telemetry.diastolic}`
                  : "120/80"
              }
              status={modules?.hypertension?.band || "normal"}
              tone={modules?.hypertension?.band || "normal"}
              icon={<Droplets className="h-4 w-4" />}
              iconWrap="bg-[#FBE9E4] text-coral"
              data={hyperSparkline}
              color="#E0654A"
              gradientId="hyperGrad"
              detail={modules?.hypertension?.label || "AHA/ACC 2017 BP Staging"}
            />
            <RiskCard
              title="Stress Level"
              value={
                modules?.stress?.available
                  ? `${telemetry.gsr} µS`
                  : "2.1 µS"
              }
              status={modules?.stress?.band || "normal"}
              tone={modules?.stress?.band || "normal"}
              icon={<Brain className="h-4 w-4" />}
              iconWrap="bg-[#EEEAF6] text-[#8B7BB5]"
              data={stressSparkline}
              color="#8B7BB5"
              gradientId="stressGrad"
              detail={modules?.stress?.label || "Tonic Electrodermal Activity (EDA)"}
            />
          </div>
        </section>

        {/* AI Health Recommendation & Micro Scores */}
        <section className="mt-6 flex flex-col gap-6 rounded-2xl border border-paper-border bg-white p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-xl items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8EFE4] text-sage">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-[15px] font-semibold text-ink">
                Clinical Risk Evaluation & AI Summary
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                {recommendation}
              </p>
              <button
                type="button"
                onClick={() => setScreeningOpen(true)}
                className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-sage hover:underline cursor-pointer"
              >
                Record manual vitals →
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:min-w-[480px]">
            <MicroScoreCard
              label="Autonomic Tone"
              value={modules?.heartDisease?.score ? `${modules.heartDisease.score}` : "58"}
              status={modules?.heartDisease?.band || "good"}
              tone={modules?.heartDisease?.band || "good"}
              data={heartSparkline}
              color="#6E8F5C"
              gradientId="lifeGrad"
            />
            <MicroScoreCard
              label="Vascular Health"
              value={telemetry.pttDelay ? `${telemetry.pttDelay}` : "250"}
              status="Normal PTT"
              tone="good"
              data={hyperSparkline}
              color="#6E8F5C"
              gradientId="actGrad"
            />
            <MicroScoreCard
              label="Oxygenation"
              value={`${telemetry.spo2}`}
              status={telemetry.spo2 >= 95 ? "Normal" : "Low"}
              tone={telemetry.spo2 >= 95 ? "good" : "moderate"}
              data={physioSparkline}
              color="#6E8F5C"
              gradientId="sleepGrad"
            />
          </div>
        </section>

        {/* Live Vitals Telemetry Banner */}
        <section className="mt-6 grid gap-4 rounded-2xl border border-paper-border bg-[#F7F6F0] p-5 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Monitored Patient
            </p>
            <p className="mt-1 font-serif text-sm font-bold text-ink">
              {activeProfile?.name} ({activeProfile?.relation})
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Blood Pressure
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-ink">
              {telemetry.systolic}/{telemetry.diastolic}{" "}
              <span className="text-xs font-normal text-slate-400">mmHg</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Heart Rate & SpO₂
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-ink">
              {telemetry.pulseRate} BPM / {telemetry.spo2}%
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Scoring Engine Status
            </p>
            <p className="mt-1 font-mono text-sm font-bold uppercase text-sage">
              {overallBand}
            </p>
          </div>
        </section>
      </main>

      <ScreeningModal
        open={screeningOpen}
        onClose={() => setScreeningOpen(false)}
        onSave={saveScreening}
        current={currentVitals}
      />
      <ClinicalReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
      <UserProfileModal />
    </div>
  );
}
