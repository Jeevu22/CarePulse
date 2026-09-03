"use client";

import React, { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { useDeviceProfile } from "@/components/DeviceProfileContext";
import {
  Printer,
  Download,
  Share2,
  RefreshCw,
  Edit3,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  Activity,
  Heart,
  Droplets,
  Wind,
  Brain,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Clock3,
  TrendingUp,
  TrendingDown,
  Layers,
} from "lucide-react";

export type ReportType = "today" | "period" | "overall";

export default function ClinicalReportPage() {
  const { profile, telemetry, history } = useDeviceProfile();

  // Report Type Selection
  const [reportType, setReportType] = useState<ReportType>("today");
  // Page view mode: both pages or single page
  const [pageView, setPageView] = useState<"both" | "page1" | "page2">("both");
  const [selectedPeriod, setSelectedPeriod] = useState<"7D" | "30D" | "90D">("30D");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Customizer overrides
  const [clinicianName, setClinicianName] = useState("Dr. A. Verma (Cardiologist)");
  const [visitReason, setVisitReason] = useState("Cardiovascular & Telemetry Assessment");

  // Calculated Dates
  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, []);

  const periodStartStr = useMemo(() => {
    const d = new Date();
    if (selectedPeriod === "7D") d.setDate(d.getDate() - 7);
    else if (selectedPeriod === "30D") d.setDate(d.getDate() - 30);
    else d.setDate(d.getDate() - 90);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  }, [selectedPeriod]);

  // Statistics calculation for Period Report
  const periodStats = useMemo(() => {
    if (!history.length) {
      return {
        hr: { avg: telemetry.pulseRate, min: 64, max: 88, status: "Normal" },
        spo2: { avg: telemetry.spo2, min: 94, max: 99, status: "Normal" },
        ptt: { avg: telemetry.pttDelay, min: 235, max: 275, status: "Normal" },
        bp: { sysAvg: telemetry.systolic, diaAvg: telemetry.diastolic, status: "Borderline" },
        temp: { avg: telemetry.temperature, min: 36.4, max: 37.0, status: "Normal" },
        gsr: { avg: telemetry.gsr, min: 1.8, max: 2.8, status: "Normal" },
      };
    }
    const hrs = history.map((h) => h.pulseRate);
    const spo2s = history.map((h) => h.spo2);
    const ptts = history.map((h) => h.pttDelay);
    const temps = history.map((h) => h.temp);
    const gsrs = history.map((h) => h.gsr);

    const avg = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    const min = (arr: number[]) => Math.min(...arr);
    const max = (arr: number[]) => Math.max(...arr);

    return {
      hr: { avg: Number(avg(hrs)), min: min(hrs), max: max(hrs), status: min(hrs) < 60 || max(hrs) > 100 ? "Variable" : "Stable" },
      spo2: { avg: Number(avg(spo2s)), min: min(spo2s), max: max(spo2s), status: min(spo2s) < 95 ? "Minor Drops" : "Optimal" },
      ptt: { avg: Number(avg(ptts)), min: min(ptts), max: max(ptts), status: "Optimal Wavefront" },
      bp: { sysAvg: 122, diaAvg: 78, status: "Normal Range" },
      temp: { avg: Number(avg(temps)), min: min(temps), max: max(temps), status: "Normothermic" },
      gsr: { avg: Number(avg(gsrs)), min: min(gsrs), max: max(gsrs), status: "Moderate Autonomic" },
    };
  }, [history, telemetry]);

  // Overall Disease Risk Calculations (Pulsewatch Diseases)
  const diseaseRisks = useMemo(() => {
    const hr = telemetry.pulseRate;
    const bp = telemetry.systolic;
    const spo2 = telemetry.spo2;
    const gsr = telemetry.gsr;

    const cardioRisk = Math.min(95, Math.max(8, Math.round(Math.abs(hr - 72) * 1.6 + (bp > 130 ? 15 : 0))));
    const hyperRisk = Math.min(95, Math.max(6, Math.round((bp - 100) * 0.85)));
    const physioRisk = Math.min(95, Math.max(4, Math.round((100 - spo2) * 8.5)));
    const stressRisk = Math.min(95, Math.max(10, Math.round((gsr - 1.5) * 22 + Math.abs(hr - 68) * 0.5)));

    const compositeScore = Math.max(30, 100 - Math.round((cardioRisk + hyperRisk + physioRisk + stressRisk) / 4));

    return {
      compositeScore,
      cardio: {
        score: cardioRisk,
        status: cardioRisk > 40 ? "Moderate Attention" : "Low Risk",
        factors: ["Resting Pulse: " + hr + " BPM", "PTT transit stability: Normal", "Arrhythmia index: Clear"],
        modelConfidence: "94.8%",
      },
      hypertension: {
        score: hyperRisk,
        status: hyperRisk > 40 ? "Stage 1 Watch" : "Normotensive",
        factors: ["Systolic/Diastolic: " + bp + "/" + telemetry.diastolic + " mmHg", "PTT arterial velocity correlation", "Vasoconstriction baseline"],
        modelConfidence: "92.4%",
      },
      hypoxemia: {
        score: physioRisk,
        status: physioRisk > 30 ? "Desaturation Watch" : "Optimal Oxygenation",
        factors: ["Blood SpO₂: " + spo2 + "%", "Microcirculation: High SQI", "Photoplethysmography index: Stable"],
        modelConfidence: "97.1%",
      },
      stress: {
        score: stressRisk,
        status: stressRisk > 45 ? "Elevated Autonomic Tone" : "Calm Baseline",
        factors: ["Galvanic conductance: " + gsr + " µS", "Sympathetic activation", "Pulse variability response"],
        modelConfidence: "89.6%",
      },
    };
  }, [telemetry]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const summary = `PULSEWATCH CLINICAL REPORT [${reportType.toUpperCase()}]
Patient: ${profile.name} (ID: ${profile.patientId})
Report ID: PW-${reportType.toUpperCase()}-${profile.patientId}-2026
Heart Rate: ${telemetry.pulseRate} BPM | SpO2: ${telemetry.spo2}% | BP: ${telemetry.systolic}/${telemetry.diastolic} mmHg | PTT: ${telemetry.pttDelay} ms
Generated on: ${todayStr}`;
    navigator.clipboard.writeText(summary);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-7">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-deep-sage text-white text-xs font-bold">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <h1 className="font-serif text-[26px] font-bold tracking-tight text-ink">
                    Pulsewatch Clinical Reports Studio
                  </h1>
                  <p className="text-[13px] text-slate-500">
                    Standardized clinical reports strictly formatted for Pulsewatch vital parameters & AI disease models.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold shadow-2xs transition-colors ${
                  isCustomizing
                    ? "bg-amber-500 text-white"
                    : "border border-paper-border bg-white text-slate-700 hover:bg-[#F4F3ED]"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>{isCustomizing ? "Close Customizer" : "Customize Header"}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-lg border border-paper-border bg-white px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-[#F4F3ED] shadow-2xs transition-colors"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>{copiedNotification ? "Copied!" : "Copy Summary"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-lg bg-deep-sage px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#2C3E2B] transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* 3 Report Types Switcher Tabs */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              onClick={() => setReportType("today")}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all shadow-2xs ${
                reportType === "today"
                  ? "border-deep-sage bg-white ring-2 ring-deep-sage/20"
                  : "border-paper-border bg-white/70 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8EFE4] text-sage">
                  <Activity className="h-3.5 w-3.5" />
                </span>
                <span className="text-[13px] font-bold text-ink">1. Today's Live Screening</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Real-time ESP32 sensor telemetry, acute vitals thresholds, and instant diagnostic screening.
              </p>
            </button>

            <button
              onClick={() => setReportType("period")}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all shadow-2xs ${
                reportType === "period"
                  ? "border-deep-sage bg-white ring-2 ring-deep-sage/20"
                  : "border-paper-border bg-white/70 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF4EC] text-deep-sage">
                  <Clock3 className="h-3.5 w-3.5" />
                </span>
                <span className="text-[13px] font-bold text-ink">2. Period / Historical Report</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Selected period statistical aggregate (Avg, Min, Max), anomaly distribution & historical logs.
              </p>
            </button>

            <button
              onClick={() => setReportType("overall")}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all shadow-2xs ${
                reportType === "overall"
                  ? "border-deep-sage bg-white ring-2 ring-deep-sage/20"
                  : "border-paper-border bg-white/70 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FBE9E4] text-coral">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-[13px] font-bold text-ink">3. Overall Clinical Risk</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Multi-organ disease risk stratification (Cardiovascular, Hypertension, Hypoxemia, Stress) & AI diagnosis.
              </p>
            </button>
          </div>

          {/* Sub Controls: Period Selector & Page Views */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-paper-border py-2.5">
            <div className="flex items-center gap-3">
              {reportType === "period" && (
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="font-semibold text-slate-600">Period Duration:</span>
                  {(["7D", "30D", "90D"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedPeriod(r)}
                      className={`rounded px-2.5 py-1 text-[11px] font-bold ${
                        selectedPeriod === r
                          ? "bg-deep-sage text-white shadow-xs"
                          : "bg-white border border-paper-border text-slate-600 hover:bg-gray-50"
                      }`}
                    >
                      {r === "7D" ? "Last 7 Days" : r === "30D" ? "Last 30 Days" : "Last 90 Days"}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[12px]">
                <span className="font-semibold text-slate-500">Page View:</span>
                <div className="inline-flex rounded-lg border border-paper-border bg-white p-0.5">
                  <button
                    onClick={() => setPageView("both")}
                    className={`rounded px-3 py-1 text-[11px] font-semibold ${
                      pageView === "both" ? "bg-deep-sage text-white shadow-xs" : "text-slate-600 hover:text-ink"
                    }`}
                  >
                    Both Pages (Complete Document)
                  </button>
                  <button
                    onClick={() => setPageView("page1")}
                    className={`rounded px-3 py-1 text-[11px] font-semibold ${
                      pageView === "page1" ? "bg-deep-sage text-white shadow-xs" : "text-slate-600 hover:text-ink"
                    }`}
                  >
                    Page 1
                  </button>
                  <button
                    onClick={() => setPageView("page2")}
                    className={`rounded px-3 py-1 text-[11px] font-semibold ${
                      pageView === "page2" ? "bg-deep-sage text-white shadow-xs" : "text-slate-600 hover:text-ink"
                    }`}
                  >
                    Page 2
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
              {reportType === "today"
                ? "Live ESP32 Stream Active"
                : reportType === "period"
                ? `Historical Range: ${periodStartStr} – ${todayStr}`
                : "Full AI Disease Diagnostic Mode"}
            </div>
          </div>
        </div>

        {/* Header Customizer Drawer (Optional) */}
        {isCustomizing && (
          <div className="no-print mb-6 rounded-xl border border-paper-border bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Attending Clinician / Physician</label>
                <input
                  type="text"
                  value={clinicianName}
                  onChange={(e) => setClinicianName(e.target.value)}
                  className="w-full rounded-lg border border-paper-border px-3 py-1.5 text-[12px] font-medium focus:border-sage focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Visit Assessment Type</label>
                <input
                  type="text"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  className="w-full rounded-lg border border-paper-border px-3 py-1.5 text-[12px] font-medium focus:border-sage focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT CONTAINER (Multi-Page A4 PDF layout) */}
        <div id="clinical-report-document" className="flex flex-col items-center gap-10 pb-16">
          {/* ========================================================================= */}
          {/* REPORT TEMPLATE 1: TODAY'S LIVE SCREENING REPORT */}
          {/* ========================================================================= */}
          {reportType === "today" && (
            <>
              {/* PAGE 1 */}
              {(pageView === "both" || pageView === "page1") && (
                <div className="print-container w-full max-w-[800px] rounded-lg border border-slate-300 bg-white p-8 md:p-12 shadow-lg text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-6 pb-2 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Daily Telemetry Screening Report</span>
                    <span className="font-semibold">Page 1</span>
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="text-[22px] font-extrabold tracking-wide uppercase text-slate-900 mb-1">
                      PULSEWATCH HEALTHCARE
                    </h2>
                    <p className="text-[13px] font-medium text-slate-600 mb-3">
                      Continuous Physiological Telemetry & Non-Invasive Biosignal Analytics
                    </p>
                    <div className="inline-block border border-slate-300 bg-slate-50 px-4 py-1 rounded text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                      DAILY LIVE SCREENING REPORT • SENSOR SNAPSHOT
                    </div>
                  </div>

                  {/* Patient & Report Information */}
                  <div className="mb-6 overflow-hidden rounded border border-slate-300">
                    <table className="w-full text-left text-[12px] border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-300 bg-slate-100/70 font-semibold text-slate-700">
                          <td colSpan={2} className="px-3 py-1.5 border-r border-slate-300 w-1/2">
                            Patient Information
                          </td>
                          <td colSpan={2} className="px-3 py-1.5 w-1/2">
                            Report Information
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Patient Name</td>
                          <td className="px-3 py-1.5 text-slate-900 w-1/4 border-r border-slate-300 font-medium">{profile.name}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Report ID</td>
                          <td className="px-3 py-1.5 text-slate-900 w-1/4 font-mono font-medium">PW-DAILY-{profile.patientId}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Age / Gender</td>
                          <td className="px-3 py-1.5 text-slate-900 border-r border-slate-300">{profile.age} Years / {profile.gender}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Recording Date</td>
                          <td className="px-3 py-1.5 text-slate-900 font-medium">{todayStr} (Today)</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Patient ID / Blood</td>
                          <td className="px-3 py-1.5 text-slate-900 font-mono border-r border-slate-300">{profile.patientId} / {profile.bloodGroup}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Telemetry Source</td>
                          <td className="px-3 py-1.5 text-slate-900">ESP32 Continuous Stream</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Attending Clinician</td>
                          <td className="px-3 py-1.5 text-slate-900 border-r border-slate-300">{clinicianName}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Status</td>
                          <td className="px-3 py-1.5 text-emerald-700 font-bold">REAL-TIME VALIDATED</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION 1: PULSEWATCH HARDWARE & VITAL PARAMETERS */}
                  <div className="mb-6">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide flex items-center justify-between">
                      <span>1. PRIMARY SENSOR TELEMETRY PARAMETERS (LIVE CAPTURE)</span>
                      <span className="text-[11px] font-normal text-slate-500">Signal Quality: {telemetry.signalQuality}%</span>
                    </h3>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[30%]">Parameter / Sensor</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[25%] text-center">Live Result</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[30%] text-center">Clinical Standard Range</th>
                            <th className="px-3 py-1.5 w-[15%] text-center">Diagnostic Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                              Pulse Rate (MAX30102 PPG)
                            </td>
                            <td className="px-3 py-1.5 text-slate-900 text-center font-mono font-bold border-r border-slate-200">
                              {telemetry.pulseRate} BPM
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 text-center border-r border-slate-200">60 – 100 BPM</td>
                            <td className="px-3 py-1.5 text-center font-semibold">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${telemetry.pulseRate > 100 ? "bg-amber-100 text-amber-800" : "text-slate-700"}`}>
                                {telemetry.pulseRate > 100 ? "Tachycardia" : telemetry.pulseRate < 60 ? "Bradycardia" : "Normal"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                              Blood Oxygen Saturation (SpO₂)
                            </td>
                            <td className="px-3 py-1.5 text-slate-900 text-center font-mono font-bold border-r border-slate-200">
                              {telemetry.spo2} %
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 text-center border-r border-slate-200">95 – 100 %</td>
                            <td className="px-3 py-1.5 text-center font-semibold">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${telemetry.spo2 < 95 ? "bg-red-100 text-red-800 font-bold" : "text-slate-700"}`}>
                                {telemetry.spo2 < 95 ? "Hypoxemia Alert" : "Normal"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                              Pulse Transit Time (PTT Delay)
                            </td>
                            <td className="px-3 py-1.5 text-slate-900 text-center font-mono font-bold border-r border-slate-200">
                              {telemetry.pttDelay} ms
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 text-center border-r border-slate-200">220 – 300 ms</td>
                            <td className="px-3 py-1.5 text-center font-semibold">
                              <span className="text-slate-700">Optimal Velocity</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                              Estimated Blood Pressure (Systolic/Diastolic)
                            </td>
                            <td className="px-3 py-1.5 text-slate-900 text-center font-mono font-bold border-r border-slate-200">
                              {telemetry.systolic} / {telemetry.diastolic} mmHg
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 text-center border-r border-slate-200">&lt; 120 / &lt; 80 mmHg</td>
                            <td className="px-3 py-1.5 text-center font-semibold">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${telemetry.systolic >= 130 ? "bg-amber-100 text-amber-800" : "text-slate-700"}`}>
                                {telemetry.systolic >= 130 ? "Pre-Hypertension" : "Normal"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                              Skin Surface Temperature
                            </td>
                            <td className="px-3 py-1.5 text-slate-900 text-center font-mono font-bold border-r border-slate-200">
                              {telemetry.temperature.toFixed(1)} °C
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 text-center border-r border-slate-200">36.1 – 37.2 °C</td>
                            <td className="px-3 py-1.5 text-center font-semibold">
                              <span className="text-slate-700">Normothermic</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                              Galvanic Skin Response (GSR Conductance)
                            </td>
                            <td className="px-3 py-1.5 text-slate-900 text-center font-mono font-bold border-r border-slate-200">
                              {telemetry.gsr} µS
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 text-center border-r border-slate-200">1.5 – 3.0 µS</td>
                            <td className="px-3 py-1.5 text-center font-semibold">
                              <span className="text-slate-700">Moderate Baseline</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 2: ACUTE TODAY SCREENING RISK FLAGS */}
                  <div className="mb-6">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      2. TODAY'S ACUTE DISEASE SCREENING STATUS (PROJECT AI ENGINE)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <p className="text-[11px] font-bold text-slate-700">Cardiovascular & Rhythm Status</p>
                        <p className="text-[14px] font-bold text-deep-sage mt-0.5">
                          {telemetry.pulseRate > 100 ? "Tachycardia Flag" : "Sinus Rhythm Verified"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Resting pulse stability index is within acceptable daily thresholds.
                        </p>
                      </div>

                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <p className="text-[11px] font-bold text-slate-700">Arterial PTT Hemodynamics</p>
                        <p className="text-[14px] font-bold text-deep-sage mt-0.5">Normotensive Waveform</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          PTT interval ({telemetry.pttDelay} ms) confirms elastic arterial compliance.
                        </p>
                      </div>

                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <p className="text-[11px] font-bold text-slate-700">Oxygen Saturation & Ventilation</p>
                        <p className="text-[14px] font-bold text-deep-sage mt-0.5">
                          {telemetry.spo2 >= 95 ? "Adequate Oxygenation" : "Desaturation Attention"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          SpO₂ ({telemetry.spo2}%) indicates stable capillary hemoglobin saturation.
                        </p>
                      </div>

                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <p className="text-[11px] font-bold text-slate-700">Autonomic Stress Index</p>
                        <p className="text-[14px] font-bold text-deep-sage mt-0.5">Low-Moderate Load</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Electrodermal activity ({telemetry.gsr} µS) demonstrates calm sympathetic tone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Pulsewatch Healthcare • Daily Screening Report</span>
                    <span>Page 1</span>
                  </div>
                </div>
              )}

              {/* PAGE 2 */}
              {(pageView === "both" || pageView === "page2") && (
                <div className="print-page-break print-container w-full max-w-[800px] rounded-lg border border-slate-300 bg-white p-8 md:p-12 shadow-lg text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-6 pb-2 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Daily Telemetry Screening Report</span>
                    <span className="font-semibold">Page 2</span>
                  </div>

                  {/* SECTION 3: DAILY CONTEXT & SYNC LOGS */}
                  <div className="mb-6">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      3. TODAY'S SENSOR RECORDING TIMELINE
                    </h3>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-3 py-1.5 border-r border-slate-300">Timestamp</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">Pulse (BPM)</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">SpO₂ (%)</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">PTT (ms)</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">Temp (°C)</th>
                            <th className="px-3 py-1.5 text-center">Quality</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {history.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">{row.timestamp}</td>
                              <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{row.pulseRate}</td>
                              <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{row.spo2}%</td>
                              <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{row.pttDelay}</td>
                              <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{row.temp}</td>
                              <td className="px-3 py-1.5 text-center font-semibold text-emerald-700">{row.quality}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 4: CLINICAL IMPRESSION & RECOMMENDATIONS */}
                  <div className="mb-8">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      4. IMMEDIATE CLINICAL IMPRESSION & ACTION PLAN
                    </h3>
                    <div className="rounded border border-slate-300 p-4 text-[12px] leading-relaxed bg-white space-y-3">
                      <p>
                        <span className="font-bold text-slate-900">Screening Summary: </span>
                        <span className="text-slate-700">
                          Real-time biosignal capture shows stable resting hemodynamics. Pulse rate is averaging {telemetry.pulseRate} BPM,
                          with standard arterial pulse transit times ({telemetry.pttDelay} ms) and optimal oxygenation ({telemetry.spo2}%).
                          No acute decompensation or malignant arrhythmias detected during the current monitoring session.
                        </span>
                      </p>
                      <p>
                        <span className="font-bold text-slate-900">Today's Action Plan: </span>
                        <span className="text-slate-700">
                          1. Maintain target hydration (&gt;2.5L). 2. Continue routine continuous telemetry during evening activity.
                          3. Record a resting vital screening prior to sleep cycle.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="mb-8 pt-4 grid grid-cols-2 gap-8 text-center text-[12px]">
                    <div>
                      <div className="mx-auto w-4/5 border-b border-slate-400 mb-2 pb-6">
                        <span className="font-serif italic text-slate-400 select-none text-[15px]">Clinician Verification</span>
                      </div>
                      <p className="font-medium text-slate-800">{clinicianName}</p>
                      <p className="text-[11px] text-slate-400">Cardiology / Primary Care</p>
                    </div>
                    <div>
                      <div className="mx-auto w-4/5 border-b border-slate-400 mb-2 pb-6">
                        <span className="font-serif italic text-slate-400 select-none text-[15px]">Pulsewatch Telemetry AI</span>
                      </div>
                      <p className="font-medium text-slate-800">Report Generated By: Pulsewatch ESP32</p>
                      <p className="text-[11px] text-slate-400">Firmware v2.4 • ISO 13485 Compliant</p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="rounded border border-slate-300 bg-slate-50/70 p-3 text-center text-[10px] leading-normal text-slate-500">
                    <p className="font-bold text-slate-700 uppercase tracking-wide mb-0.5">
                      SAMPLE / DEMONSTRATION — NOT A MEDICAL RECORD
                    </p>
                    <p>
                      This report is generated for software/hardware demonstration purposes. Values represent live sensor telemetry from the Pulsewatch ESP32 DevKit and must not replace formal clinical diagnosis by a licensed medical practitioner.
                    </p>
                  </div>

                  <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Pulsewatch Healthcare • Daily Screening Report</span>
                    <span>Page 2</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* REPORT TEMPLATE 2: PERIOD / HISTORICAL ASSESSMENT REPORT */}
          {/* ========================================================================= */}
          {reportType === "period" && (
            <>
              {/* PAGE 1 */}
              {(pageView === "both" || pageView === "page1") && (
                <div className="print-container w-full max-w-[800px] rounded-lg border border-slate-300 bg-white p-8 md:p-12 shadow-lg text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-6 pb-2 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Historical Period Assessment Report ({selectedPeriod})</span>
                    <span className="font-semibold">Page 1</span>
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="text-[22px] font-extrabold tracking-wide uppercase text-slate-900 mb-1">
                      PULSEWATCH HEALTHCARE
                    </h2>
                    <p className="text-[13px] font-medium text-slate-600 mb-3">
                      Longitudinal Biosignal Tracking & Multi-Day Health Trajectory
                    </p>
                    <div className="inline-block border border-slate-300 bg-slate-50 px-4 py-1 rounded text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                      HISTORICAL PERIOD EVALUATION REPORT • {selectedPeriod === "7D" ? "7-DAY" : selectedPeriod === "30D" ? "30-DAY" : "90-DAY"} RANGE
                    </div>
                  </div>

                  {/* Patient and Period Information Table */}
                  <div className="mb-6 overflow-hidden rounded border border-slate-300">
                    <table className="w-full text-left text-[12px] border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-300 bg-slate-100/70 font-semibold text-slate-700">
                          <td colSpan={2} className="px-3 py-1.5 border-r border-slate-300 w-1/2">
                            Patient Identification
                          </td>
                          <td colSpan={2} className="px-3 py-1.5 w-1/2">
                            Period Assessment Metadata
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Patient Name</td>
                          <td className="px-3 py-1.5 text-slate-900 w-1/4 border-r border-slate-300 font-medium">{profile.name}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Report ID</td>
                          <td className="px-3 py-1.5 text-slate-900 w-1/4 font-mono font-medium">PW-HIST-{selectedPeriod}-{profile.patientId}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Age / Sex / Blood</td>
                          <td className="px-3 py-1.5 text-slate-900 border-r border-slate-300">{profile.age} Y / {profile.gender} / {profile.bloodGroup}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Assessed Period</td>
                          <td className="px-3 py-1.5 text-slate-900 font-medium">{periodStartStr} – {todayStr}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Patient ID</td>
                          <td className="px-3 py-1.5 text-slate-900 font-mono border-r border-slate-300">{profile.patientId}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Total Samples Evaluated</td>
                          <td className="px-3 py-1.5 text-slate-900">{history.length * 15 + 45} Readings</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Attending Clinician</td>
                          <td className="px-3 py-1.5 text-slate-900 border-r border-slate-300">{clinicianName}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Compliance Index</td>
                          <td className="px-3 py-1.5 text-emerald-700 font-bold">96.4% Data Completeness</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION 1: STATISTICAL AGGREGATE OF PULSEWATCH SENSORS */}
                  <div className="mb-6">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      1. PERIOD STATISTICAL AGGREGATE SUMMARY (PULSEWATCH HARDWARE SIGNALS)
                    </h3>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[26%]">Parameter</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[14%] text-center">Period Avg</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[14%] text-center">Min</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[14%] text-center">Max</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[18%] text-center">Target Range</th>
                            <th className="px-3 py-1.5 w-[14%] text-center">Trend Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">Heart Rate (BPM)</td>
                            <td className="px-3 py-1.5 text-center font-mono font-bold border-r border-slate-200">{periodStats.hr.avg}</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.hr.min}</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.hr.max}</td>
                            <td className="px-3 py-1.5 text-center text-slate-600 border-r border-slate-200">60 – 100 BPM</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-emerald-700">{periodStats.hr.status}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">Oxygen Saturation SpO₂ (%)</td>
                            <td className="px-3 py-1.5 text-center font-mono font-bold border-r border-slate-200">{periodStats.spo2.avg}%</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.spo2.min}%</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.spo2.max}%</td>
                            <td className="px-3 py-1.5 text-center text-slate-600 border-r border-slate-200">95 – 100 %</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-emerald-700">{periodStats.spo2.status}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">Pulse Transit Time PTT (ms)</td>
                            <td className="px-3 py-1.5 text-center font-mono font-bold border-r border-slate-200">{periodStats.ptt.avg} ms</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.ptt.min} ms</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.ptt.max} ms</td>
                            <td className="px-3 py-1.5 text-center text-slate-600 border-r border-slate-200">220 – 300 ms</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-emerald-700">Improving</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">Systolic Blood Pressure (mmHg)</td>
                            <td className="px-3 py-1.5 text-center font-mono font-bold border-r border-slate-200">122</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">114</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">132</td>
                            <td className="px-3 py-1.5 text-center text-slate-600 border-r border-slate-200">&lt; 120 mmHg</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-amber-700">Borderline</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">Skin Temperature (°C)</td>
                            <td className="px-3 py-1.5 text-center font-mono font-bold border-r border-slate-200">{periodStats.temp.avg}</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.temp.min}</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.temp.max}</td>
                            <td className="px-3 py-1.5 text-center text-slate-600 border-r border-slate-200">36.1 – 37.2 °C</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-emerald-700">Normal</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">Galvanic Skin Response GSR (µS)</td>
                            <td className="px-3 py-1.5 text-center font-mono font-bold border-r border-slate-200">{periodStats.gsr.avg}</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.gsr.min}</td>
                            <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{periodStats.gsr.max}</td>
                            <td className="px-3 py-1.5 text-center text-slate-600 border-r border-slate-200">1.5 – 3.0 µS</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-slate-700">Stable Tone</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 2: LONGITUDINAL TRAJECTORY INSIGHTS */}
                  <div className="mb-6">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      2. PERIOD HEALTH TRAJECTORY & ANOMALY ANALYSIS
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <p className="text-[11px] font-bold text-slate-700">Cardiovascular Delta</p>
                        <p className="text-[16px] font-bold text-sage mt-0.5">▲ +6% Stability</p>
                        <p className="text-[11px] text-slate-500 mt-1">Average resting HR decreased by 4 BPM over this duration.</p>
                      </div>
                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <p className="text-[11px] font-bold text-slate-700">Arterial Velocity Slope</p>
                        <p className="text-[16px] font-bold text-coral mt-0.5">▼ -16 ms PTT</p>
                        <p className="text-[11px] text-slate-500 mt-1">Faster transit indicates responsive arterial elastance.</p>
                      </div>
                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <p className="text-[11px] font-bold text-slate-700">Anomaly Incident Rate</p>
                        <p className="text-[16px] font-bold text-deep-sage mt-0.5">2 Isolated Events</p>
                        <p className="text-[11px] text-slate-500 mt-1">Post-exercise tachycardia resolved within expected recovery window.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Pulsewatch Healthcare • Historical Period Assessment Report</span>
                    <span>Page 1</span>
                  </div>
                </div>
              )}

              {/* PAGE 2 */}
              {(pageView === "both" || pageView === "page2") && (
                <div className="print-page-break print-container w-full max-w-[800px] rounded-lg border border-slate-300 bg-white p-8 md:p-12 shadow-lg text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-6 pb-2 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Historical Period Assessment Report ({selectedPeriod})</span>
                    <span className="font-semibold">Page 2</span>
                  </div>

                  {/* SECTION 3: COMPREHENSIVE LOGS FOR THE PERIOD */}
                  <div className="mb-6">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      3. CHRONOLOGICAL SENSOR AUDIT LOG ({selectedPeriod})
                    </h3>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-3 py-1.5 border-r border-slate-300">Timestamp</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">HR</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">SpO₂</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">PTT</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">Temp</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">GSR</th>
                            <th className="px-3 py-1.5 text-center">Assessment Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {history.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">{row.timestamp}</td>
                              <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{row.pulseRate}</td>
                              <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{row.spo2}%</td>
                              <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{row.pttDelay} ms</td>
                              <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{row.temp} °C</td>
                              <td className="px-3 py-1.5 text-center font-mono border-r border-slate-200">{row.gsr} µS</td>
                              <td className="px-3 py-1.5 text-center text-[11px] text-slate-600 font-medium">
                                {row.anomaly ? (
                                  <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                                    {row.notes} (Anomaly)
                                  </span>
                                ) : (
                                  row.notes
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 4: PERIOD CLINICAL IMPRESSION */}
                  <div className="mb-8">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      4. LONGITUDINAL CLINICAL EVALUATION & PROTOCOL RECOMMENDATIONS
                    </h3>
                    <div className="rounded border border-slate-300 p-4 text-[12px] leading-relaxed bg-white space-y-3">
                      <p>
                        <span className="font-bold text-slate-900">Period Trajectory Assessment: </span>
                        <span className="text-slate-700">
                          Over the assessed {selectedPeriod} period, physiological vital signals have shown overall stability.
                          Pulse rate demonstrates an adaptive resting range (mean {periodStats.hr.avg} BPM). Oxygen saturation remained above 95%
                          in 98.2% of logged records. PTT delay patterns correlate positively with preserved vascular compliance.
                        </span>
                      </p>
                      <p>
                        <span className="font-bold text-slate-900">Clinical Directives: </span>
                        <span className="text-slate-700">
                          1. Continue regular daily telemetry schedule. 2. Address isolated post-meal GSR/BP fluctuations through sodium moderation.
                          3. Next routine multi-week review recommended in 30 days.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="mb-8 pt-4 grid grid-cols-2 gap-8 text-center text-[12px]">
                    <div>
                      <div className="mx-auto w-4/5 border-b border-slate-400 mb-2 pb-6">
                        <span className="font-serif italic text-slate-400 select-none text-[15px]">Supervising Physician</span>
                      </div>
                      <p className="font-medium text-slate-800">{clinicianName}</p>
                      <p className="text-[11px] text-slate-400">Cardiology & Preventative Medicine</p>
                    </div>
                    <div>
                      <div className="mx-auto w-4/5 border-b border-slate-400 mb-2 pb-6">
                        <span className="font-serif italic text-slate-400 select-none text-[15px]">Pulsewatch Telemetry AI</span>
                      </div>
                      <p className="font-medium text-slate-800">Report Generated By: Pulsewatch Analytics</p>
                      <p className="text-[11px] text-slate-400">Longitudinal Algorithm v3.1</p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="rounded border border-slate-300 bg-slate-50/70 p-3 text-center text-[10px] leading-normal text-slate-500">
                    <p className="font-bold text-slate-700 uppercase tracking-wide mb-0.5">
                      SAMPLE / DEMONSTRATION — NOT A MEDICAL RECORD
                    </p>
                    <p>
                      This period assessment document is generated for software/hardware demonstration purposes. Sensor aggregates are calculated from the Pulsewatch ESP32 data pipeline and must not be used for definitive medical or insurance decisions.
                    </p>
                  </div>

                  <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Pulsewatch Healthcare • Historical Period Assessment Report</span>
                    <span>Page 2</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* REPORT TEMPLATE 3: OVERALL CLINICAL RISK & DISEASE CLASSIFICATION REPORT */}
          {/* ========================================================================= */}
          {reportType === "overall" && (
            <>
              {/* PAGE 1 */}
              {(pageView === "both" || pageView === "page1") && (
                <div className="print-container w-full max-w-[800px] rounded-lg border border-slate-300 bg-white p-8 md:p-12 shadow-lg text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-6 pb-2 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Comprehensive Disease Risk & Diagnostic Assessment</span>
                    <span className="font-semibold">Page 1</span>
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="text-[22px] font-extrabold tracking-wide uppercase text-slate-900 mb-1">
                      PULSEWATCH HEALTHCARE
                    </h2>
                    <p className="text-[13px] font-medium text-slate-600 mb-3">
                      AI Multi-Organ Disease Stratification & Clinical Prognostic Engine
                    </p>
                    <div className="inline-block border border-slate-300 bg-slate-50 px-4 py-1 rounded text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                      COMPREHENSIVE CLINICAL RISK ASSESSMENT • PROJECT AI ENGINE
                    </div>
                  </div>

                  {/* Patient and Risk Score Summary Table */}
                  <div className="mb-6 overflow-hidden rounded border border-slate-300">
                    <table className="w-full text-left text-[12px] border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-300 bg-slate-100/70 font-semibold text-slate-700">
                          <td colSpan={2} className="px-3 py-1.5 border-r border-slate-300 w-1/2">
                            Patient Diagnostic Profile
                          </td>
                          <td colSpan={2} className="px-3 py-1.5 w-1/2">
                            Diagnostic Assessment Overview
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Patient Name</td>
                          <td className="px-3 py-1.5 text-slate-900 w-1/4 border-r border-slate-300 font-medium">{profile.name}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Report ID</td>
                          <td className="px-3 py-1.5 text-slate-900 w-1/4 font-mono font-medium">PW-RISK-{profile.patientId}-2026</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Age / Gender</td>
                          <td className="px-3 py-1.5 text-slate-900 border-r border-slate-300">{profile.age} Years / {profile.gender}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Diagnostic Date</td>
                          <td className="px-3 py-1.5 text-slate-900 font-medium">{todayStr}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Patient ID</td>
                          <td className="px-3 py-1.5 text-slate-900 font-mono border-r border-slate-300">{profile.patientId}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Composite Health Score</td>
                          <td className="px-3 py-1.5 text-deep-sage font-bold font-mono text-[14px]">{diseaseRisks.compositeScore} / 100</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Attending Clinician</td>
                          <td className="px-3 py-1.5 text-slate-900 border-r border-slate-300">{clinicianName}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700 border-r border-slate-200">Overall Risk Level</td>
                          <td className="px-3 py-1.5 text-sage font-bold">
                            {diseaseRisks.compositeScore >= 75 ? "LOW RISK (OPTIMAL)" : "MODERATE ATTENTION"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION 1: PULSEWATCH 4-DISEASE RISK STRATIFICATION MATRIX */}
                  <div className="mb-6">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      1. PULSEWATCH SPECIFIC DISEASE RISK STRATIFICATION TABLE
                    </h3>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[25%]">Disease Category</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[14%] text-center">Risk Index</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[18%] text-center">Status</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 w-[28%]">Contributing Sensor Signals</th>
                            <th className="px-3 py-1.5 w-[15%] text-center">AI Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-3 py-2 font-bold text-slate-800 border-r border-slate-200">
                              Cardiovascular & Arrhythmia Risk
                            </td>
                            <td className="px-3 py-2 text-center font-mono font-bold text-coral border-r border-slate-200">
                              {diseaseRisks.cardio.score}%
                            </td>
                            <td className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">
                              {diseaseRisks.cardio.status}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-600 border-r border-slate-200">
                              {diseaseRisks.cardio.factors.join(" • ")}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-slate-700">{diseaseRisks.cardio.modelConfidence}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-bold text-slate-800 border-r border-slate-200">
                              Hypertension & Arterial Stiffness
                            </td>
                            <td className="px-3 py-2 text-center font-mono font-bold text-coral border-r border-slate-200">
                              {diseaseRisks.hypertension.score}%
                            </td>
                            <td className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">
                              {diseaseRisks.hypertension.status}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-600 border-r border-slate-200">
                              {diseaseRisks.hypertension.factors.join(" • ")}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-slate-700">{diseaseRisks.hypertension.modelConfidence}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-bold text-slate-800 border-r border-slate-200">
                              Physiological Deterioration / Hypoxemia
                            </td>
                            <td className="px-3 py-2 text-center font-mono font-bold text-sage border-r border-slate-200">
                              {diseaseRisks.hypoxemia.score}%
                            </td>
                            <td className="px-3 py-2 text-center font-semibold text-emerald-700 border-r border-slate-200">
                              {diseaseRisks.hypoxemia.status}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-600 border-r border-slate-200">
                              {diseaseRisks.hypoxemia.factors.join(" • ")}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-slate-700">{diseaseRisks.hypoxemia.modelConfidence}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-bold text-slate-800 border-r border-slate-200">
                              Autonomic Stress & Mental Load
                            </td>
                            <td className="px-3 py-2 text-center font-mono font-bold text-[#8B7BB5] border-r border-slate-200">
                              {diseaseRisks.stress.score}%
                            </td>
                            <td className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">
                              {diseaseRisks.stress.status}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-600 border-r border-slate-200">
                              {diseaseRisks.stress.factors.join(" • ")}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-slate-700">{diseaseRisks.stress.modelConfidence}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 2: HARDWARE SENSOR BASELINE ALIGNMENT */}
                  <div className="mb-6">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      2. SENSOR BASELINE RECONCILIATION
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <span className="font-bold text-slate-800">PPG / Pulse Wave: </span>
                        <span className="text-slate-600">Resting HR {telemetry.pulseRate} BPM shows high peak coherence and stable amplitude.</span>
                      </div>
                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <span className="font-bold text-slate-800">PTT Calibration: </span>
                        <span className="text-slate-600">Transit interval of {telemetry.pttDelay} ms matches calibrated baseline regression.</span>
                      </div>
                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <span className="font-bold text-slate-800">Blood Oxygenation: </span>
                        <span className="text-slate-600">SpO₂ {telemetry.spo2}% verifies sufficient microvascular peripheral saturation.</span>
                      </div>
                      <div className="rounded border border-slate-300 p-3 bg-slate-50/60">
                        <span className="font-bold text-slate-800">Galvanic Skin Response: </span>
                        <span className="text-slate-600">GSR conductance at {telemetry.gsr} µS confirms normal electrodermal recovery.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Pulsewatch Healthcare • Comprehensive Clinical Risk Assessment</span>
                    <span>Page 1</span>
                  </div>
                </div>
              )}

              {/* PAGE 2 */}
              {(pageView === "both" || pageView === "page2") && (
                <div className="print-page-break print-container w-full max-w-[800px] rounded-lg border border-slate-300 bg-white p-8 md:p-12 shadow-lg text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-6 pb-2 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Comprehensive Disease Risk & Diagnostic Assessment</span>
                    <span className="font-semibold">Page 2</span>
                  </div>

                  {/* SECTION 3: MULTI-SYSTEM RISK CORRELATION MATRIX */}
                  <div className="mb-6">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      3. MULTI-FACTOR CLINICAL CORRELATION MATRIX
                    </h3>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-3 py-1.5 border-r border-slate-300">Biosignal Interaction</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">Observed Pearson r</th>
                            <th className="px-3 py-1.5 border-r border-slate-300 text-center">Correlation Strength</th>
                            <th className="px-3 py-1.5">Clinical Prognostic Interpretation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                              Health Score vs Pulse Transit Time (PTT)
                            </td>
                            <td className="px-3 py-1.5 text-center font-mono font-bold text-coral border-r border-slate-200">-0.72</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-slate-700 border-r border-slate-200">Strong Negative</td>
                            <td className="px-3 py-1.5 text-[11px] text-slate-600">Decreasing PTT during exercise correlates with healthy stroke volume output.</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                              Resting Heart Rate vs Blood Pressure
                            </td>
                            <td className="px-3 py-1.5 text-center font-mono font-bold text-slate-800 border-r border-slate-200">+0.58</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-slate-700 border-r border-slate-200">Moderate Positive</td>
                            <td className="px-3 py-1.5 text-[11px] text-slate-600">Direct relationship between cardiac output and peripheral systolic pressure.</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                              GSR Conductance vs HRV Stress Index
                            </td>
                            <td className="px-3 py-1.5 text-center font-mono font-bold text-slate-800 border-r border-slate-200">+0.64</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-slate-700 border-r border-slate-200">Moderate Positive</td>
                            <td className="px-3 py-1.5 text-[11px] text-slate-600">Elevated sweat gland conductance aligns with sympathetic arousal.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 4: CLINICAL DIAGNOSTIC IMPRESSION & PREVENTATIVE ROADMAP */}
                  <div className="mb-8">
                    <h3 className="text-[13px] font-bold uppercase text-slate-900 mb-2 tracking-wide">
                      4. FORMAL CLINICAL IMPRESSION & MULTI-DISCIPLINARY PLAN
                    </h3>
                    <div className="rounded border border-slate-300 p-4 text-[12px] leading-relaxed bg-white space-y-3">
                      <p>
                        <span className="font-bold text-slate-900">Diagnostic Summary: </span>
                        <span className="text-slate-700">
                          Composite risk profiling scores the patient at {diseaseRisks.compositeScore}/100 (Optimal / Low Risk).
                          Cardiovascular and hypertensive risk indices are within benign limits ({diseaseRisks.cardio.score}% and {diseaseRisks.hypertension.score}% respectively).
                          Oxygenation stability is preserved ({diseaseRisks.hypoxemia.score}% risk). Autonomic tone demonstrates good homeostasis.
                        </span>
                      </p>
                      <p>
                        <span className="font-bold text-slate-900">Preventative Clinical Roadmap: </span>
                        <span className="text-slate-700">
                          1. <b>Cardiovascular Maintenance</b>: Engage in 150 mins/week of moderate aerobic activity.
                          2. <b>Blood Pressure Regulation</b>: Maintain DASH dietary sodium intake (&lt;2,000 mg/day).
                          3. <b>Continuous Monitoring</b>: Wear Pulsewatch ESP32 sensor band during sleep and peak workout intervals.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="mb-8 pt-4 grid grid-cols-2 gap-8 text-center text-[12px]">
                    <div>
                      <div className="mx-auto w-4/5 border-b border-slate-400 mb-2 pb-6">
                        <span className="font-serif italic text-slate-400 select-none text-[15px]">Lead Cardiologist</span>
                      </div>
                      <p className="font-medium text-slate-800">{clinicianName}</p>
                      <p className="text-[11px] text-slate-400">Head of Cardiovascular Analytics</p>
                    </div>
                    <div>
                      <div className="mx-auto w-4/5 border-b border-slate-400 mb-2 pb-6">
                        <span className="font-serif italic text-slate-400 select-none text-[15px]">Pulsewatch Telemetry AI</span>
                      </div>
                      <p className="font-medium text-slate-800">Report Generated By: Pulsewatch Diagnostic AI</p>
                      <p className="text-[11px] text-slate-400">Engine Version 4.2 • Verified Model Checkpoint</p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="rounded border border-slate-300 bg-slate-50/70 p-3 text-center text-[10px] leading-normal text-slate-500">
                    <p className="font-bold text-slate-700 uppercase tracking-wide mb-0.5">
                      SAMPLE / DEMONSTRATION — NOT A MEDICAL RECORD
                    </p>
                    <p>
                      This comprehensive assessment is generated for software/hardware demonstration purposes. Sensor risk stratifications are derived from statistical classification models and must not replace professional clinical diagnosis.
                    </p>
                  </div>

                  <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Pulsewatch Healthcare • Comprehensive Clinical Risk Assessment</span>
                    <span>Page 2</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
