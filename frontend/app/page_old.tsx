"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import LiveReadingModal from "@/components/LiveReadingModal";

type Accent = "coral" | "orange" | "sage";
type IconName = "heart" | "activity" | "wind" | "sparkles" | "calendar" | "download" | "arrow" | "chevron" | "lightbulb" | "shield" | "timer";

function IconGlyph({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, string> = {
    heart: "M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4ZM3 12h4l1.5-3 3 6 2-4 1.5 2H21",
    activity: "M3 12h3l2-7 4 14 2.5-9 2 4H21",
    wind: "M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8",
    sparkles: "m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Zm7 12 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z",
    calendar: "M5 4h14a2 2 0 0 1 2 2v13H3V6a2 2 0 0 1 2-2Zm3-2v4m8-4v4M3 9h18",
    download: "M12 3v12m0 0 4-4m-4 4-4-4M4 19v2h16v-2",
    arrow: "M4 12h15m-6-6 6 6-6 6",
    chevron: "m7 9 5 5 5-5",
    lightbulb: "M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z",
    shield: "M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Zm-3 9 2 2 4-4",
    timer: "M12 8v4l3 2m-3-9V3m-7 9a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

const metrics = [
  {
    title: "Heart Disease Risk",
    value: "28%",
    status: "Moderate",
    accent: "coral" as Accent,
    icon: "heart" as IconName,
    data: "M2 28 C18 30 24 32 38 27 S59 22 68 25 S83 35 98 24",
  },
  {
    title: "Hypertension Risk",
    value: "35%",
    status: "Moderate",
    accent: "coral" as Accent,
    icon: "activity" as IconName,
    data: "M2 25 C18 25 25 31 38 27 S56 18 68 23 S82 29 98 25",
  },
  {
    title: "Physiological Deterioration",
    value: "18%",
    status: "Low",
    accent: "sage" as Accent,
    icon: "wind" as IconName,
    data: "M2 24 C18 27 24 28 38 24 S58 20 68 25 S84 26 98 22",
  },
  {
    title: "Stress Level",
    value: "42%",
    status: "Moderate",
    accent: "coral" as Accent,
    icon: "sparkles" as IconName,
    data: "M2 26 C18 29 25 31 38 26 S53 12 65 19 S83 28 98 24",
  },
];

const accentStyles = {
  coral: {
    icon: "bg-[#fff0eb] text-[#ef6848]",
    value: "text-[#e96545]",
    line: "#e96545",
    badge: "bg-[#fff0eb] text-[#dc6246]",
  },
  orange: {
    icon: "bg-[#fff2e5] text-[#ee8a35]",
    value: "text-[#ee7c2e]",
    line: "#ee7c2e",
    badge: "bg-[#fff2e5] text-[#df7b2d]",
  },
  sage: {
    icon: "bg-[#edf4e8] text-[#5d8a5b]",
    value: "text-[#5d8a5b]",
    line: "#61955b",
    badge: "bg-[#edf4e8] text-[#5d8152]",
  },
};

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
  const styles = accentStyles[metric.accent];
  return (
    <article className="rounded-2xl border border-[#e7e5de] bg-white p-5 shadow-[0_4px_18px_rgba(55,65,50,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(55,65,50,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
            <IconGlyph name={metric.icon} size={19} />
          </span>
          <h3 className="font-serif text-[15px] font-semibold leading-tight text-[#23323a]">{metric.title}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles.badge}`}>{metric.status}</span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <span className={`font-mono text-3xl font-bold tracking-tight ${styles.value}`}>{metric.value}</span>
        <svg className="h-11 w-[128px]" viewBox="0 0 100 40" preserveAspectRatio="none" aria-label={`${metric.title} trend`}>
          <path d={`${metric.data} L98 40 L2 40 Z`} fill={styles.line} opacity=".08" />
          <path d={metric.data} fill="none" stroke={styles.line} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="98" cy="24" r="2.2" fill={styles.line} />
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[9px] text-[#8b928f]">
        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
      </div>
    </article>
  );
}

function ScoreRing() {
  return (
    <div className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-[#dedfd8]" />
      <div className="absolute inset-[14px] rounded-full border border-dashed border-[#bfd0b8]" />
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="126" fill="none" stroke="#e8e8e2" strokeWidth="11" />
        <circle cx="150" cy="150" r="126" fill="none" stroke="#62925d" strokeWidth="11" strokeLinecap="round" strokeDasharray="792" strokeDashoffset="142" />
      </svg>
      <div className="text-center">
        <p className="font-serif text-sm font-semibold text-[#344047]">Composite Health Score</p>
        <div className="mt-7 flex items-baseline justify-center">
          <span className="font-serif text-[78px] leading-none text-[#1f2d34]">82</span>
          <span className="font-serif text-3xl text-[#1f2d34]">%</span>
        </div>
        <span className="mt-3 inline-flex rounded-full bg-[#edf4e8] px-4 py-1 text-xs font-semibold text-[#4f794b]">Good <span className="ml-1">✓</span></span>
        <p className="mt-3 max-w-[155px] text-[10px] leading-relaxed text-[#727b78]">Your overall health risk is low.<br />Keep maintaining a healthy lifestyle!</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fbfaf7] text-[#26343a]">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e5de] bg-[#fbfaf7] px-6 py-5 lg:px-10">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1f3038]">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-[#7a817f]">Real-time health risk insights &amp; predictive analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-[#deded6] bg-white px-4 py-2.5 text-xs font-medium text-[#45504f]">
              <span className="text-[#7f8985]"><IconGlyph name="calendar" size={15} /></span> May 23, 2025 <span className="text-[#a0a5a0]">·</span> 10:30 AM
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-[#31543b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#26472f]">
              <IconGlyph name="download" size={15} /> Export Report
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1320px] space-y-5 p-5 lg:p-8">
          <button onClick={() => setIsModalOpen(true)} className="flex w-full items-center justify-between rounded-2xl border border-[#dce8d6] bg-[#edf4e8] px-5 py-4 text-left transition hover:bg-[#e8f1e3]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5c8a59]"><IconGlyph name="lightbulb" size={19} /></span>
              <div>
                <p className="font-serif text-base font-semibold text-[#31543b]">Good morning, Arjun</p>
                <p className="mt-0.5 text-xs text-[#718071]">Your latest readings are stable. Complete your daily screening to keep your health profile calibrated.</p>
              </div>
            </div>
            <span className="hidden items-center gap-1 text-xs font-semibold text-[#4e794d] sm:flex">Capture vitals <IconGlyph name="arrow" size={14} /></span>
          </button>

          <section className="grid gap-5 xl:grid-cols-[1fr_1.15fr_1fr]">
            <div className="order-2 grid gap-5 xl:order-1">
              <MetricCard metric={metrics[0]} />
              <MetricCard metric={metrics[2]} />
            </div>
            <div className="order-1 flex items-center justify-center rounded-2xl border border-[#e7e5de] bg-white py-5 shadow-[0_4px_18px_rgba(55,65,50,0.035)] xl:order-2">
              <ScoreRing />
            </div>
            <div className="order-3 grid gap-5">
              <MetricCard metric={metrics[1]} />
              <MetricCard metric={metrics[3]} />
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl border border-[#e7e5de] bg-white p-5 shadow-[0_4px_18px_rgba(55,65,50,0.035)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-[#26363b]">Health Trends</h2>
                  <p className="mt-1 text-xs text-[#8a918e]">Risk indicators over the last five months</p>
                </div>
                <button className="flex items-center gap-1 rounded-lg border border-[#e5e5df] px-3 py-2 text-[11px] text-[#5f6966]">Last 5 months <IconGlyph name="chevron" size={13} /></button>
              </div>
              <div className="mt-5 h-[180px]">
                <svg className="h-full w-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                  {[30, 70, 110, 150].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#ecece7" strokeWidth="1" />)}
                  <path d="M0 118 C65 110 70 120 130 95 S200 100 250 75 S315 106 370 72 S430 70 490 53 S555 74 600 45" fill="none" stroke="#e96545" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 133 C65 128 70 139 130 119 S200 130 250 105 S315 121 370 100 S430 109 490 85 S555 104 600 76" fill="none" stroke="#61955b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-[#8b928f]"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span></div>
              <div className="mt-4 flex gap-5 text-[11px] text-[#67706c]"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#e96545]" />Risk score</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#61955b]" />Health score</span></div>
            </div>
            <div className="rounded-2xl border border-[#dce8d6] bg-[#f1f6ed] p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5d8a5b]"><IconGlyph name="shield" size={20} /></span>
                <div>
                  <h2 className="font-serif text-lg font-semibold text-[#31543b]">AI Health Recommendation</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#687568]">Based on your health data, we recommend focusing on stress management and maintaining a heart-healthy diet.</p>
                  <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#4e794d]">View detailed plan <IconGlyph name="arrow" size={14} /></button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[["Lifestyle", "76", "Good"], ["Activity", "68", "Moderate"], ["Sleep", "72", "Good"]].map(([label, score, state]) => (
                  <div key={label} className="rounded-xl border border-[#dae6d5] bg-white/70 p-3">
                    <p className="text-[10px] text-[#79847d]">{label}</p>
                    <p className="mt-1 font-mono text-xl font-bold text-[#4f794b]">{score}<span className="text-[10px] font-normal text-[#90998f]"> /100</span></p>
                    <p className="text-[10px] text-[#668161]">{state}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between rounded-xl border border-[#e5e5df] bg-white px-4 py-3 text-[11px] text-[#7c8581]">
            <span className="flex items-center gap-2"><IconGlyph name="timer" size={14} /> Last synced today at 10:30 AM</span>
            <span className="hidden sm:inline">Health insights are informational and not a substitute for professional medical advice.</span>
          </div>
        </main>
      </div>
      <LiveReadingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
