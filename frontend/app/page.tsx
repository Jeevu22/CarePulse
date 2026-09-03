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
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useDeviceProfile } from "@/components/DeviceProfileContext";
import ClinicalReportModal from "@/components/ClinicalReportModal";

type ChartPoint = { month: string; val: number };

const heartData: ChartPoint[] = [
  { month: "Jan", val: 22 },
  { month: "Feb", val: 34 },
  { month: "Mar", val: 26 },
  { month: "Apr", val: 62 },
  { month: "May", val: 28 },
];

const physioData: ChartPoint[] = [
  { month: "Jan", val: 28 },
  { month: "Feb", val: 18 },
  { month: "Mar", val: 36 },
  { month: "Apr", val: 20 },
  { month: "May", val: 18 },
];

const hyperData: ChartPoint[] = [
  { month: "Jan", val: 24 },
  { month: "Feb", val: 42 },
  { month: "Mar", val: 30 },
  { month: "Apr", val: 58 },
  { month: "May", val: 35 },
];

const stressData: ChartPoint[] = [
  { month: "Jan", val: 32 },
  { month: "Feb", val: 22 },
  { month: "Mar", val: 48 },
  { month: "Apr", val: 30 },
  { month: "May", val: 42 },
];

const lifestyleMicro: ChartPoint[] = [
  { month: "a", val: 40 },
  { month: "b", val: 55 },
  { month: "c", val: 48 },
  { month: "d", val: 70 },
  { month: "e", val: 76 },
];

const activityMicro: ChartPoint[] = [
  { month: "a", val: 50 },
  { month: "b", val: 38 },
  { month: "c", val: 62 },
  { month: "d", val: 45 },
  { month: "e", val: 68 },
];

const sleepMicro: ChartPoint[] = [
  { month: "a", val: 45 },
  { month: "b", val: 60 },
  { month: "c", val: 52 },
  { month: "d", val: 68 },
  { month: "e", val: 72 },
];

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
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
  tone: "moderate" | "low" | "good";
}) {
  const styles = {
    moderate: "bg-[#FBE9E4] text-[#C85A42]",
    low: "bg-[#E8EFE4] text-[#5E8152]",
    good: "bg-[#E8EFE4] text-[#5E8152]",
  } as const;

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${styles[tone]}`}
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
}: {
  title: string;
  value: string;
  status: "Moderate" | "Low";
  tone: "moderate" | "low";
  icon: ReactNode;
  iconWrap: string;
  data: ChartPoint[];
  color: string;
  gradientId: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-paper-border bg-white p-5 shadow-2xs">
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${iconWrap}`}
        >
          {icon}
        </div>
        <StatusPill label={status} tone={tone} />
      </div>
      <h3 className="font-serif text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-1 font-mono text-[28px] font-bold leading-none tracking-tight text-ink">
        {value}
      </p>
      <div className="mt-2 h-[118px] w-full">
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

function CompositeHealthScore({ value }: { value: number }) {
  const size = 236;
  const cx = 118;
  const cy = 118;
  const r = 84;
  const stroke = 12;
  const circumference = 2 * Math.PI * r;
  const gap = 48 / 360;
  const track = circumference * (1 - gap);
  const progress = track * (value / 100);

  return (
    <article className="relative flex h-full flex-col items-center rounded-2xl border border-paper-border bg-white px-6 py-6 shadow-2xs">
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
            stroke="#6E8F5C"
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
          <span className="mt-2 rounded-full bg-[#E8EFE4] px-2.5 py-0.5 text-[10px] font-semibold text-sage">
            Good ✓
          </span>
        </div>
      </div>

      <p className="mt-1 max-w-[220px] text-center text-[11px] leading-relaxed text-slate-500">
        Your overall health risk is low. Keep maintaining a healthy lifestyle!
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
  tone: "moderate" | "good";
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

function HeaderBar({ onExport, onCapture }: { onExport: () => void; onCapture: () => void }) {
  const { telemetry, toggleStreaming } = useDeviceProfile();
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink flex items-center gap-2.5">
          Dashboard Overview
          <button
            onClick={toggleStreaming}
            title="Click to toggle live telemetry stream"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EFE4] px-2.5 py-1 text-[11px] font-semibold text-sage hover:bg-[#dce9d7] transition-colors"
          >
            <span className={`h-2 w-2 rounded-full ${telemetry.isStreaming ? "bg-emerald-500 animate-ping" : "bg-gray-400"}`}></span>
            {telemetry.isStreaming ? "LIVE DEVICE STREAMING" : "STREAM PAUSED"}
          </button>
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Real-time health risk insights & predictive analysis • ESP32 DevKit V1
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-paper-border bg-white px-3.5 py-2 text-[12px] text-slate-600 shadow-2xs">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>May 23, 2025 • 10:30 AM</span>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-full bg-deep-sage px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#2C3E2B]"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
        <button
          type="button"
          onClick={onCapture}
          className="inline-flex items-center gap-2 rounded-full border border-[#C9D9C3] bg-[#E8EFE4] px-4 py-2.5 text-[12px] font-semibold text-sage transition-colors hover:bg-[#DCE9D7]"
        >
          Record vitals
        </button>
      </div>
    </header>
  );
}

type Vitals = {
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  respiratoryRate: number;
};

const initialVitals: Vitals = {
  heartRate: 74,
  systolic: 122,
  diastolic: 78,
  spo2: 98,
  temperature: 36.6,
  respiratoryRate: 16,
};

function getRisk(vitals: Vitals) {
  const hypertension = Math.min(95, Math.max(4, Math.round((vitals.systolic - 100) * 0.7)));
  const heart = Math.min(90, Math.max(5, Math.round(Math.abs(vitals.heartRate - 72) * 1.5)));
  const oxygen = Math.min(90, Math.max(2, (100 - vitals.spo2) * 8));
  const stress = Math.min(85, Math.max(8, Math.round(Math.abs(vitals.heartRate - 65) * 0.8)));
  return { heart, hypertension, oxygen, stress, score: Math.max(35, 100 - Math.round((heart + hypertension + oxygen + stress) / 4)) };
}

function ScreeningModal({
  open,
  onClose,
  onSave,
  current,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (vitals: Vitals) => void;
  current: Vitals;
}) {
  const [values, setValues] = useState<Vitals>(current);
  const [step, setStep] = useState<"form" | "saved">("form");
  useEffect(() => {
    if (open) {
      setValues(current);
      setStep("form");
    }
  }, [open, current]);
  if (!open) return null;
  const update = (key: keyof Vitals, value: string) =>
    setValues((previous) => ({ ...previous, [key]: key === "temperature" ? Number(value) : Number.parseInt(value, 10) }));
  const fields: { key: keyof Vitals; label: string; unit: string; min: number; max: number; step?: string }[] = [
    { key: "heartRate", label: "Heart rate", unit: "BPM", min: 35, max: 220 },
    { key: "systolic", label: "Systolic blood pressure", unit: "mmHg", min: 70, max: 250 },
    { key: "diastolic", label: "Diastolic blood pressure", unit: "mmHg", min: 40, max: 150 },
    { key: "spo2", label: "Oxygen saturation", unit: "%", min: 70, max: 100 },
    { key: "temperature", label: "Body temperature", unit: "°C", min: 30, max: 43, step: "0.1" },
    { key: "respiratoryRate", label: "Respiratory rate", unit: "breaths/min", min: 5, max: 60 },
  ];
  const invalid = values.systolic <= values.diastolic;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="screening-title">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-paper-border bg-canvas p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sage">Patient screening</p>
            <h2 id="screening-title" className="font-serif text-2xl font-bold text-ink">Record vital parameters</h2>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-slate-500">Enter readings from a validated home device or clinician. PulseWatch provides risk screening only and is not a diagnosis.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close screening" className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        {step === "saved" ? (
          <div className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="h-14 w-14 text-sage" />
            <h3 className="mt-4 font-serif text-xl font-bold text-ink">Screening saved</h3>
            <p className="mt-2 text-sm text-slate-500">Your dashboard and report have been updated with this reading.</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-full bg-deep-sage px-5 py-2.5 text-xs font-semibold text-white">Return to dashboard</button>
          </div>
        ) : (
          <form className="mt-7" onSubmit={(event) => { event.preventDefault(); if (!invalid) { onSave(values); setStep("saved"); } }}>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className="rounded-2xl border border-paper-border bg-white p-4">
                  <span className="block text-xs font-semibold text-slate-600">{field.label}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <input required type="number" min={field.min} max={field.max} step={field.step ?? "1"} value={values[field.key]} onChange={(event) => update(field.key, event.target.value)} className="w-full bg-transparent font-mono text-xl font-bold text-ink outline-none" />
                    <span className="shrink-0 text-[10px] font-bold uppercase text-slate-400">{field.unit}</span>
                  </span>
                </label>
              ))}
            </div>
            {invalid && <p className="mt-4 text-xs font-semibold text-coral" role="alert">Systolic pressure must be higher than diastolic pressure.</p>}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="rounded-full border border-paper-border px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-white">Cancel</button>
              <button type="submit" disabled={invalid} className="rounded-full bg-deep-sage px-5 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Save screening</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function OverviewDashboard() {
  const { profile, telemetry, addReading } = useDeviceProfile();
  const [screeningOpen, setScreeningOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const vitals: Vitals = useMemo(() => ({
    heartRate: telemetry.pulseRate,
    systolic: telemetry.systolic,
    diastolic: telemetry.diastolic,
    spo2: telemetry.spo2,
    temperature: telemetry.temperature,
    respiratoryRate: 16,
  }), [telemetry]);

  const risk = useMemo(() => getRisk(vitals), [vitals]);
  const recordedAt = useMemo(() => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date()), []);
  
  const recommendation = risk.score >= 75
    ? "Your current screening is within the expected range. Continue regular activity, hydration, and routine monitoring."
    : "Some readings are outside the expected range. Rest, repeat the measurement with a validated device, and discuss persistent changes with a clinician.";

  const saveScreening = (next: Vitals) => {
    addReading({
      timestamp: new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
      pulseRate: next.heartRate,
      spo2: next.spo2,
      pttDelay: telemetry.pttDelay,
      temp: next.temperature,
      gsr: telemetry.gsr,
      quality: "Excellent",
      notes: "Manual Device Recording",
    });
  };

  const exportReport = () => {
    const report = [
      "PULSEWATCH CLINICAL SCREENING REPORT",
      `Patient: ${profile.name} | Patient ID: ${profile.patientId}`,
      `Recorded: ${recordedAt}`,
      "",
      "VITAL PARAMETERS",
      `Heart rate: ${vitals.heartRate} BPM`,
      `Blood pressure: ${vitals.systolic}/${vitals.diastolic} mmHg`,
      `Oxygen saturation: ${vitals.spo2}%`,
      `Temperature: ${vitals.temperature.toFixed(1)} °C`,
      `Respiratory rate: ${vitals.respiratoryRate} breaths/min`,
      "",
      `Composite screening score: ${risk.score}/100`,
      `Clinical summary: ${recommendation}`,
      "",
      "DISCLAIMER: This report is a screening aid and does not diagnose, treat, or replace professional medical advice.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([report], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `pulsewatch-screening-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
          <HeaderBar onExport={() => setReportOpen(true)} onCapture={() => setScreeningOpen(true)} />

          <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6">
              <RiskCard
                title="Heart Disease Risk"
                value={`${risk.heart}%`}
                status="Moderate"
                tone="moderate"
                icon={<Heart className="h-4 w-4" fill="currentColor" />}
                iconWrap="bg-[#FBE9E4] text-coral"
                data={heartData}
                color="#E0654A"
                gradientId="heartGrad"
              />
              <RiskCard
                title="Physiological Deterioration"
                value={`${risk.oxygen}%`}
                status="Low"
                tone="low"
                icon={<Wind className="h-4 w-4" />}
                iconWrap="bg-[#E8EFE4] text-sage"
                data={physioData}
                color="#6E8F5C"
                gradientId="physioGrad"
              />
            </div>

            <CompositeHealthScore value={risk.score} />

            <div className="flex flex-col gap-6">
              <RiskCard
                title="Hypertension Risk"
                value={`${risk.hypertension}%`}
                status="Moderate"
                tone="moderate"
                icon={<Droplets className="h-4 w-4" />}
                iconWrap="bg-[#FBE9E4] text-coral"
                data={hyperData}
                color="#E0654A"
                gradientId="hyperGrad"
              />
              <RiskCard
                title="Stress Level"
                value={`${risk.stress}%`}
                status="Moderate"
                tone="moderate"
                icon={<Brain className="h-4 w-4" />}
                iconWrap="bg-[#EEEAF6] text-[#8B7BB5]"
                data={stressData}
                color="#E0654A"
                gradientId="stressGrad"
              />
            </div>
          </section>

          <section className="mt-6 flex flex-col gap-6 rounded-2xl border border-paper-border bg-white p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-xl items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8EFE4] text-sage">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-[15px] font-semibold text-ink">
                  AI Health Recommendation
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  {recommendation}
                </p>
                <button type="button" onClick={() => setScreeningOpen(true)} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-sage hover:underline">Update screening →</button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:min-w-[480px]">
              <MicroScoreCard
                label="Lifestyle Score"
                value="76"
                status="Good"
                tone="good"
                data={lifestyleMicro}
                color="#6E8F5C"
                gradientId="lifeGrad"
              />
              <MicroScoreCard
                label="Activity Score"
                value="68"
                status="Moderate"
                tone="moderate"
                data={activityMicro}
                color="#E0654A"
                gradientId="actGrad"
              />
              <MicroScoreCard
                label="Sleep Score"
                value="72"
                status="Good"
                tone="good"
                data={sleepMicro}
                color="#6E8F5C"
                gradientId="sleepGrad"
              />
            </div>
          </section>

          <section className="mt-20 rounded-2xl border border-paper-border bg-gradient-to-r from-[#E8EFE4] to-[#F0F7EB] p-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-bold uppercase tracking-widest text-sage">Welcome Back</p>
              <h3 className="font-serif text-2xl font-bold text-ink">
                {profile.name}, let's check your health
              </h3>
              <p className="text-[13px] text-slate-500">
                Your latest vitals show you're in good condition. Keep up the healthy routine!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScreeningOpen(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-deep-sage px-6 py-3 text-[13px] font-semibold text-white transition-all hover:bg-[#2C3E2B] active:scale-95 shadow-md"
            >
              <span>Switch Checkup</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </section>

          <section className="mt-6 grid gap-4 rounded-2xl border border-paper-border bg-[#F7F6F0] p-5 sm:grid-cols-3">
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest reading</p><p className="mt-1 font-mono text-sm font-bold text-ink">{recordedAt}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood pressure</p><p className="mt-1 font-mono text-sm font-bold text-ink">{vitals.systolic}/{vitals.diastolic} <span className="text-xs font-normal text-slate-400">mmHg</span></p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Screening score</p><p className="mt-1 font-mono text-sm font-bold text-sage">{risk.score}/100</p></div>
          </section>
        </main>
      <ScreeningModal open={screeningOpen} onClose={() => setScreeningOpen(false)} onSave={saveScreening} current={vitals} />
      <ClinicalReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
