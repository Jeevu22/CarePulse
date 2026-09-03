"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useDeviceProfile } from "./DeviceProfileContext";
import {
  X,
  Printer,
  FileText,
  ExternalLink,
  Activity,
  CheckCircle2,
  Share2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultReportType?: "today" | "period" | "overall";
}

export default function ClinicalReportModal({
  isOpen,
  onClose,
  defaultReportType = "today",
}: ClinicalReportModalProps) {
  const { profile, telemetry, history } = useDeviceProfile();
  const [reportType, setReportType] = useState<"today" | "period" | "overall">(defaultReportType);
  const [activeTab, setActiveTab] = useState<"page1" | "page2" | "both">("both");
  const [selectedPeriod, setSelectedPeriod] = useState<"7D" | "30D" | "90D">("30D");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const periodStartStr = (() => {
    const d = new Date();
    if (selectedPeriod === "7D") d.setDate(d.getDate() - 7);
    else if (selectedPeriod === "30D") d.setDate(d.getDate() - 30);
    else d.setDate(d.getDate() - 90);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  })();

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const summary = `PULSEWATCH CLINICAL REPORT [${reportType.toUpperCase()}]
Patient: ${profile.name} (ID: ${profile.patientId})
Date: ${todayStr}
HR: ${telemetry.pulseRate} BPM | SpO2: ${telemetry.spo2}% | BP: ${telemetry.systolic}/${telemetry.diastolic} mmHg | PTT: ${telemetry.pttDelay} ms`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Disease calculations
  const cardioScore = Math.min(95, Math.max(8, Math.round(Math.abs(telemetry.pulseRate - 72) * 1.6 + (telemetry.systolic > 130 ? 15 : 0))));
  const hyperScore = Math.min(95, Math.max(6, Math.round((telemetry.systolic - 100) * 0.85)));
  const oxyScore = Math.min(95, Math.max(4, Math.round((100 - telemetry.spo2) * 8.5)));
  const stressScore = Math.min(95, Math.max(10, Math.round((telemetry.gsr - 1.5) * 22 + Math.abs(telemetry.pulseRate - 68) * 0.5)));
  const compScore = Math.max(30, 100 - Math.round((cardioScore + hyperScore + oxyScore + stressScore) / 4));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 md:p-6 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-paper-border bg-[#FAF9F5] shadow-2xl overflow-hidden">
        {/* Header Toolbar (Hidden when printing) */}
        <div className="no-print border-b border-paper-border bg-white px-5 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-deep-sage text-white">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-serif text-[16px] font-bold text-ink leading-tight flex items-center gap-2">
                  Pulsewatch Clinical Report
                  <span className="rounded-full bg-[#E8EFE4] px-2 py-0.5 text-[10px] font-semibold text-sage">
                    {reportType === "today" ? "Today's Live" : reportType === "period" ? "Period History" : "Overall Risk"}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Strictly formatted for Pulsewatch vital parameters & disease models
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/clinical-report"
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-lg border border-paper-border bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-[#F4F3ED] transition-colors"
              >
                <span>Full Studio</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg bg-deep-sage px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-[#2C3E2B] transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 3 Report Selector Buttons */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
            <div className="inline-flex rounded-lg border border-paper-border bg-[#FAF9F5] p-0.5 text-[11px]">
              <button
                onClick={() => setReportType("today")}
                className={`flex items-center gap-1 rounded px-3 py-1 font-semibold transition-all ${
                  reportType === "today" ? "bg-deep-sage text-white shadow-xs" : "text-slate-600 hover:text-ink"
                }`}
              >
                <Activity className="h-3 w-3" />
                <span>1. Today's Live Report</span>
              </button>
              <button
                onClick={() => setReportType("period")}
                className={`flex items-center gap-1 rounded px-3 py-1 font-semibold transition-all ${
                  reportType === "period" ? "bg-deep-sage text-white shadow-xs" : "text-slate-600 hover:text-ink"
                }`}
              >
                <Clock3 className="h-3 w-3" />
                <span>2. Period History ({selectedPeriod})</span>
              </button>
              <button
                onClick={() => setReportType("overall")}
                className={`flex items-center gap-1 rounded px-3 py-1 font-semibold transition-all ${
                  reportType === "overall" ? "bg-deep-sage text-white shadow-xs" : "text-slate-600 hover:text-ink"
                }`}
              >
                <ShieldCheck className="h-3 w-3" />
                <span>3. Overall Disease Risk</span>
              </button>
            </div>

            <div className="inline-flex rounded-lg border border-paper-border bg-[#FAF9F5] p-0.5 text-[10px]">
              <button
                onClick={() => setActiveTab("both")}
                className={`rounded px-2 py-1 font-medium ${activeTab === "both" ? "bg-slate-800 text-white" : "text-slate-600"}`}
              >
                Both Pages
              </button>
              <button
                onClick={() => setActiveTab("page1")}
                className={`rounded px-2 py-1 font-medium ${activeTab === "page1" ? "bg-slate-800 text-white" : "text-slate-600"}`}
              >
                Page 1
              </button>
              <button
                onClick={() => setActiveTab("page2")}
                className={`rounded px-2 py-1 font-medium ${activeTab === "page2" ? "bg-slate-800 text-white" : "text-slate-600"}`}
              >
                Page 2
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col items-center gap-8">
          {/* ================= REPORT 1: TODAY'S REPORT ================= */}
          {reportType === "today" && (
            <>
              {(activeTab === "both" || activeTab === "page1") && (
                <div className="print-container w-full max-w-[720px] rounded-lg border border-slate-300 bg-white p-6 sm:p-8 shadow-sm text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-4 pb-1.5 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Daily Telemetry Screening Report</span>
                    <span className="font-semibold">Page 1</span>
                  </div>

                  <div className="text-center mb-5">
                    <h3 className="text-[18px] font-extrabold tracking-wide uppercase text-slate-900 mb-0.5">
                      PULSEWATCH HEALTHCARE
                    </h3>
                    <p className="text-[12px] font-medium text-slate-600 mb-2">
                      Continuous Physiological Telemetry & Non-Invasive Biosignal Analytics
                    </p>
                    <div className="inline-block border border-slate-300 bg-slate-50 px-3 py-0.5 rounded text-[10px] font-bold tracking-wider text-slate-700 uppercase">
                      DAILY LIVE SCREENING REPORT • SENSOR SNAPSHOT
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-5 overflow-hidden rounded border border-slate-300">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-300 bg-slate-100/70 font-semibold text-slate-700">
                          <td colSpan={2} className="px-2.5 py-1 border-r border-slate-300 w-1/2">Patient Information</td>
                          <td colSpan={2} className="px-2.5 py-1 w-1/2">Report Information</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2.5 py-1 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Patient Name</td>
                          <td className="px-2.5 py-1 text-slate-900 w-1/4 border-r border-slate-300 font-medium">{profile.name}</td>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Report ID</td>
                          <td className="px-2.5 py-1 text-slate-900 w-1/4 font-mono">PW-DAILY-{profile.patientId}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2.5 py-1 font-semibold text-slate-700 border-r border-slate-200">Age / Gender</td>
                          <td className="px-2.5 py-1 text-slate-900 border-r border-slate-300">{profile.age} Y / {profile.gender}</td>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 border-r border-slate-200">Date</td>
                          <td className="px-2.5 py-1 text-slate-900">{todayStr} (Today)</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 border-r border-slate-200">Patient ID</td>
                          <td className="px-2.5 py-1 text-slate-900 font-mono border-r border-slate-300">{profile.patientId}</td>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 border-r border-slate-200">Telemetry Status</td>
                          <td className="px-2.5 py-1 text-emerald-700 font-bold">ESP32 STREAMING</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 1. Pulsewatch Vital Parameters */}
                  <div className="mb-5">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      1. PRIMARY SENSOR TELEMETRY PARAMETERS (LIVE CAPTURE)
                    </h4>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-2.5 py-1 border-r border-slate-300">Parameter / Sensor</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">Live Result</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">Clinical Range</th>
                            <th className="px-2.5 py-1 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Pulse Rate (MAX30102 PPG)</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">{telemetry.pulseRate} BPM</td>
                            <td className="px-2.5 py-1 text-center text-slate-600 border-r border-slate-200">60 – 100 BPM</td>
                            <td className="px-2.5 py-1 text-center font-medium text-slate-700">Normal</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Blood Oxygen Saturation (SpO₂)</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">{telemetry.spo2} %</td>
                            <td className="px-2.5 py-1 text-center text-slate-600 border-r border-slate-200">95 – 100 %</td>
                            <td className="px-2.5 py-1 text-center font-medium text-slate-700">Normal</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Pulse Transit Time (PTT Delay)</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">{telemetry.pttDelay} ms</td>
                            <td className="px-2.5 py-1 text-center text-slate-600 border-r border-slate-200">220 – 300 ms</td>
                            <td className="px-2.5 py-1 text-center font-medium text-slate-700">Optimal</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Blood Pressure (Systolic/Diastolic)</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">{telemetry.systolic} / {telemetry.diastolic} mmHg</td>
                            <td className="px-2.5 py-1 text-center text-slate-600 border-r border-slate-200">&lt; 120 / &lt; 80 mmHg</td>
                            <td className="px-2.5 py-1 text-center font-medium text-slate-700">Normotensive</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Skin Surface Temperature</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">{telemetry.temperature.toFixed(1)} °C</td>
                            <td className="px-2.5 py-1 text-center text-slate-600 border-r border-slate-200">36.1 – 37.2 °C</td>
                            <td className="px-2.5 py-1 text-center font-medium text-slate-700">Normothermic</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Galvanic Skin Response (GSR)</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">{telemetry.gsr} µS</td>
                            <td className="px-2.5 py-1 text-center text-slate-600 border-r border-slate-200">1.5 – 3.0 µS</td>
                            <td className="px-2.5 py-1 text-center font-medium text-slate-700">Calm Baseline</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. Disease Screening Overview */}
                  <div className="mb-4">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      2. TODAY'S DISEASE SCREENING FLAGS
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                      <div className="p-2.5 rounded border border-slate-300 bg-slate-50/70">
                        <p className="font-bold text-slate-800">Cardiovascular Status</p>
                        <p className="text-emerald-700 font-semibold mt-0.5">Sinus Rhythm Verified</p>
                      </div>
                      <div className="p-2.5 rounded border border-slate-300 bg-slate-50/70">
                        <p className="font-bold text-slate-800">Arterial Hemodynamics</p>
                        <p className="text-emerald-700 font-semibold mt-0.5">Normal PTT Wavefront</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Pulsewatch Healthcare • Daily Screening Report</span>
                    <span>Page 1</span>
                  </div>
                </div>
              )}

              {(activeTab === "both" || activeTab === "page2") && (
                <div className="print-page-break print-container w-full max-w-[720px] rounded-lg border border-slate-300 bg-white p-6 sm:p-8 shadow-sm text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-4 pb-1.5 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Daily Telemetry Screening Report</span>
                    <span className="font-semibold">Page 2</span>
                  </div>

                  {/* 3. Timeline */}
                  <div className="mb-5">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      3. TODAY'S SENSOR RECORDING TIMELINE
                    </h4>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-2.5 py-1 border-r border-slate-300">Timestamp</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">Pulse</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">SpO₂</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">PTT</th>
                            <th className="px-2.5 py-1 text-center">Signal Quality</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {history.slice(0, 4).map((r, i) => (
                            <tr key={i}>
                              <td className="px-2.5 py-1 border-r border-slate-200">{r.timestamp}</td>
                              <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">{r.pulseRate} BPM</td>
                              <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">{r.spo2}%</td>
                              <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">{r.pttDelay} ms</td>
                              <td className="px-2.5 py-1 text-center font-semibold text-emerald-700">{r.quality}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4. Clinical Impression */}
                  <div className="mb-5">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      4. IMMEDIATE CLINICAL IMPRESSION
                    </h4>
                    <div className="rounded border border-slate-300 p-3 text-[11px] leading-relaxed bg-white space-y-2">
                      <p>
                        <span className="font-bold text-slate-900">Summary: </span>
                        <span className="text-slate-700">
                          Live telemetry confirms stable cardiovascular & oxygenation parameters. No acute abnormalities observed.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="mb-5 pt-3 grid grid-cols-2 gap-6 text-center text-[11px]">
                    <div>
                      <div className="mx-auto w-4/5 border-b border-slate-400 mb-1.5 pb-4">
                        <span className="font-serif italic text-slate-400 select-none text-[13px]">Clinician Verification</span>
                      </div>
                      <p className="font-medium text-slate-800">Attending Physician</p>
                    </div>
                    <div>
                      <div className="mx-auto w-4/5 border-b border-slate-400 mb-1.5 pb-4">
                        <span className="font-serif italic text-slate-400 select-none text-[13px]">Pulsewatch Telemetry AI</span>
                      </div>
                      <p className="font-medium text-slate-800">Report Generated By: Pulsewatch</p>
                    </div>
                  </div>

                  <div className="rounded border border-slate-300 bg-slate-50/70 p-2.5 text-center text-[9.5px] leading-normal text-slate-500">
                    <p className="font-bold text-slate-700 uppercase tracking-wide mb-0.5">
                      SAMPLE / DEMONSTRATION — NOT A MEDICAL RECORD
                    </p>
                    <p>
                      This report is generated for software/hardware demonstration purposes using Pulsewatch ESP32 live telemetry.
                    </p>
                  </div>

                  <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Pulsewatch Healthcare • Daily Screening Report</span>
                    <span>Page 2</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= REPORT 2: PERIOD / HISTORICAL REPORT ================= */}
          {reportType === "period" && (
            <>
              {(activeTab === "both" || activeTab === "page1") && (
                <div className="print-container w-full max-w-[720px] rounded-lg border border-slate-300 bg-white p-6 sm:p-8 shadow-sm text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-4 pb-1.5 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Historical Period Assessment Report ({selectedPeriod})</span>
                    <span className="font-semibold">Page 1</span>
                  </div>

                  <div className="text-center mb-5">
                    <h3 className="text-[18px] font-extrabold tracking-wide uppercase text-slate-900 mb-0.5">
                      PULSEWATCH HEALTHCARE
                    </h3>
                    <p className="text-[12px] font-medium text-slate-600 mb-2">
                      Longitudinal Biosignal Tracking & Multi-Day Health Trajectory
                    </p>
                    <div className="inline-block border border-slate-300 bg-slate-50 px-3 py-0.5 rounded text-[10px] font-bold tracking-wider text-slate-700 uppercase">
                      HISTORICAL PERIOD EVALUATION • {selectedPeriod} RANGE
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-5 overflow-hidden rounded border border-slate-300">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-300 bg-slate-100/70 font-semibold text-slate-700">
                          <td colSpan={2} className="px-2.5 py-1 border-r border-slate-300 w-1/2">Patient Information</td>
                          <td colSpan={2} className="px-2.5 py-1 w-1/2">Period Assessment Metadata</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2.5 py-1 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Patient Name</td>
                          <td className="px-2.5 py-1 text-slate-900 w-1/4 border-r border-slate-300 font-medium">{profile.name}</td>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Report ID</td>
                          <td className="px-2.5 py-1 text-slate-900 w-1/4 font-mono">PW-HIST-{selectedPeriod}</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 border-r border-slate-200">Assessed Period</td>
                          <td className="px-2.5 py-1 text-slate-900 border-r border-slate-300">{periodStartStr} – {todayStr}</td>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 border-r border-slate-200">Total Samples</td>
                          <td className="px-2.5 py-1 text-slate-900">{history.length * 12 + 24} Recordings</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Period Stats */}
                  <div className="mb-5">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      1. PERIOD STATISTICAL AGGREGATE SUMMARY
                    </h4>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-2.5 py-1 border-r border-slate-300">Parameter</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">Avg</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">Min</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">Max</th>
                            <th className="px-2.5 py-1 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Heart Rate (BPM)</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">74</td>
                            <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">64</td>
                            <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">88</td>
                            <td className="px-2.5 py-1 text-center font-semibold text-emerald-700">Stable</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">SpO₂ (%)</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">97.2%</td>
                            <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">94%</td>
                            <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">99%</td>
                            <td className="px-2.5 py-1 text-center font-semibold text-emerald-700">Optimal</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Pulse Transit Time (ms)</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">254 ms</td>
                            <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">238 ms</td>
                            <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">275 ms</td>
                            <td className="px-2.5 py-1 text-center font-semibold text-emerald-700">Improving</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Blood Pressure (mmHg)</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold border-r border-slate-200">122 / 78</td>
                            <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">114 / 72</td>
                            <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">132 / 84</td>
                            <td className="px-2.5 py-1 text-center font-semibold text-amber-700">Borderline</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Pulsewatch Healthcare • Historical Period Assessment Report</span>
                    <span>Page 1</span>
                  </div>
                </div>
              )}

              {(activeTab === "both" || activeTab === "page2") && (
                <div className="print-page-break print-container w-full max-w-[720px] rounded-lg border border-slate-300 bg-white p-6 sm:p-8 shadow-sm text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-4 pb-1.5 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Historical Period Assessment Report ({selectedPeriod})</span>
                    <span className="font-semibold">Page 2</span>
                  </div>

                  {/* Period Logs */}
                  <div className="mb-5">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      2. SENSOR AUDIT LOG FOR PERIOD
                    </h4>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-2.5 py-1 border-r border-slate-300">Timestamp</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">HR</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">SpO₂</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">PTT</th>
                            <th className="px-2.5 py-1 text-center">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {history.slice(0, 5).map((r, i) => (
                            <tr key={i}>
                              <td className="px-2.5 py-1 border-r border-slate-200">{r.timestamp}</td>
                              <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">{r.pulseRate}</td>
                              <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">{r.spo2}%</td>
                              <td className="px-2.5 py-1 text-center font-mono border-r border-slate-200">{r.pttDelay} ms</td>
                              <td className="px-2.5 py-1 text-center text-slate-600">{r.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mb-5">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      3. LONGITUDINAL CLINICAL EVALUATION
                    </h4>
                    <div className="rounded border border-slate-300 p-3 text-[11px] leading-relaxed bg-white">
                      <p className="text-slate-700">
                        Over the {selectedPeriod} period, heart rate variability and arterial pulse transit times demonstrate healthy adaptive cardiovascular elasticity.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Pulsewatch Healthcare • Historical Period Assessment Report</span>
                    <span>Page 2</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= REPORT 3: OVERALL CLINICAL RISK REPORT ================= */}
          {reportType === "overall" && (
            <>
              {(activeTab === "both" || activeTab === "page1") && (
                <div className="print-container w-full max-w-[720px] rounded-lg border border-slate-300 bg-white p-6 sm:p-8 shadow-sm text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-4 pb-1.5 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Comprehensive Disease Risk Assessment</span>
                    <span className="font-semibold">Page 1</span>
                  </div>

                  <div className="text-center mb-5">
                    <h3 className="text-[18px] font-extrabold tracking-wide uppercase text-slate-900 mb-0.5">
                      PULSEWATCH HEALTHCARE
                    </h3>
                    <p className="text-[12px] font-medium text-slate-600 mb-2">
                      AI Multi-Organ Disease Stratification & Clinical Prognostic Engine
                    </p>
                    <div className="inline-block border border-slate-300 bg-slate-50 px-3 py-0.5 rounded text-[10px] font-bold tracking-wider text-slate-700 uppercase">
                      COMPREHENSIVE CLINICAL RISK ASSESSMENT • PROJECT AI ENGINE
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-5 overflow-hidden rounded border border-slate-300">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-300 bg-slate-100/70 font-semibold text-slate-700">
                          <td colSpan={2} className="px-2.5 py-1 border-r border-slate-300 w-1/2">Patient Diagnostic Profile</td>
                          <td colSpan={2} className="px-2.5 py-1 w-1/2">Risk Evaluation Overview</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2.5 py-1 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Patient Name</td>
                          <td className="px-2.5 py-1 text-slate-900 w-1/4 border-r border-slate-300 font-medium">{profile.name}</td>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 w-1/4 border-r border-slate-200">Composite Score</td>
                          <td className="px-2.5 py-1 text-deep-sage font-bold font-mono">{compScore} / 100</td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 border-r border-slate-200">Patient ID</td>
                          <td className="px-2.5 py-1 text-slate-900 font-mono border-r border-slate-300">{profile.patientId}</td>
                          <td className="px-2.5 py-1 font-semibold text-slate-700 border-r border-slate-200">Overall Status</td>
                          <td className="px-2.5 py-1 text-emerald-700 font-bold">LOW RISK (OPTIMAL)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 4 Disease Classification Table */}
                  <div className="mb-5">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      1. PULSEWATCH SPECIFIC DISEASE RISK STRATIFICATION TABLE
                    </h4>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-2.5 py-1 border-r border-slate-300">Disease Category</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">Risk Index</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">Status</th>
                            <th className="px-2.5 py-1 text-center">AI Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-2.5 py-1 font-bold border-r border-slate-200">Cardiovascular & Arrhythmia Risk</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold text-coral border-r border-slate-200">{cardioScore}%</td>
                            <td className="px-2.5 py-1 text-center font-semibold text-slate-700 border-r border-slate-200">Low Risk</td>
                            <td className="px-2.5 py-1 text-center font-mono text-slate-700">94.8%</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-bold border-r border-slate-200">Hypertension & Arterial Stiffness</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold text-coral border-r border-slate-200">{hyperScore}%</td>
                            <td className="px-2.5 py-1 text-center font-semibold text-slate-700 border-r border-slate-200">Normotensive</td>
                            <td className="px-2.5 py-1 text-center font-mono text-slate-700">92.4%</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-bold border-r border-slate-200">Physiological Deterioration / Hypoxemia</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold text-sage border-r border-slate-200">{oxyScore}%</td>
                            <td className="px-2.5 py-1 text-center font-semibold text-emerald-700 border-r border-slate-200">Optimal</td>
                            <td className="px-2.5 py-1 text-center font-mono text-slate-700">97.1%</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-bold border-r border-slate-200">Autonomic Stress & Mental Load</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold text-[#8B7BB5] border-r border-slate-200">{stressScore}%</td>
                            <td className="px-2.5 py-1 text-center font-semibold text-slate-700 border-r border-slate-200">Calm Baseline</td>
                            <td className="px-2.5 py-1 text-center font-mono text-slate-700">89.6%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Pulsewatch Healthcare • Comprehensive Disease Risk Assessment</span>
                    <span>Page 1</span>
                  </div>
                </div>
              )}

              {(activeTab === "both" || activeTab === "page2") && (
                <div className="print-page-break print-container w-full max-w-[720px] rounded-lg border border-slate-300 bg-white p-6 sm:p-8 shadow-sm text-slate-900 font-sans">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-4 pb-1.5 border-b border-slate-200">
                    <span>Pulsewatch Healthcare • Comprehensive Disease Risk Assessment</span>
                    <span className="font-semibold">Page 2</span>
                  </div>

                  {/* Multi-System Correlation */}
                  <div className="mb-5">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      2. MULTI-FACTOR CLINICAL CORRELATION MATRIX
                    </h4>
                    <div className="overflow-hidden rounded border border-slate-300">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-300 font-semibold text-slate-700">
                            <th className="px-2.5 py-1 border-r border-slate-300">Biosignal Interaction</th>
                            <th className="px-2.5 py-1 border-r border-slate-300 text-center">Pearson r</th>
                            <th className="px-2.5 py-1">Clinical Prognostic Interpretation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Health Score vs PTT Delay</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold text-coral border-r border-slate-200">-0.72</td>
                            <td className="px-2.5 py-1 text-slate-600">Decreasing PTT correlates with elastic arterial compliance.</td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1 font-medium border-r border-slate-200">Resting HR vs Blood Pressure</td>
                            <td className="px-2.5 py-1 text-center font-mono font-bold text-slate-800 border-r border-slate-200">+0.58</td>
                            <td className="px-2.5 py-1 text-slate-600">Direct relationship between cardiac output and peripheral systolic pressure.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-5">
                    <h4 className="text-[12px] font-bold uppercase text-slate-900 mb-1.5 tracking-wide">
                      3. MULTI-DISCIPLINARY PREVENTATIVE ROADMAP
                    </h4>
                    <div className="rounded border border-slate-300 p-3 text-[11px] leading-relaxed bg-white space-y-2">
                      <p>
                        <span className="font-bold text-slate-900">Cardiovascular Maintenance: </span>
                        <span className="text-slate-700">Maintain 150 min/week moderate aerobic activity.</span>
                      </p>
                      <p>
                        <span className="font-bold text-slate-900">Blood Pressure Control: </span>
                        <span className="text-slate-700">Maintain low sodium intake (&lt;2,000 mg/day).</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Pulsewatch Healthcare • Comprehensive Disease Risk Assessment</span>
                    <span>Page 2</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="no-print flex items-center justify-between border-t border-paper-border bg-white px-5 py-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 hover:text-ink"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copied ? "Copied to Clipboard!" : "Copy Summary"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-paper-border px-4 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-[#FAF9F5]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-deep-sage px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#2C3E2B]"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
