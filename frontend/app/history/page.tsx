"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import ClinicalReportModal from "@/components/ClinicalReportModal";
import UserProfileModal from "@/components/UserProfileModal";
import { useDeviceProfile } from "@/components/DeviceProfileContext";
import {
  Calendar,
  Download,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Droplets,
  Activity,
  Thermometer,
  Zap,
  ShieldCheck,
} from "lucide-react";

export default function HistoryPage() {
  const { activeProfile, readings } = useDeviceProfile();
  const [reportOpen, setReportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Transform backend Reading records into UI display rows
  const allRows = useMemo(() => {
    return readings.map((r) => {
      const dateStr = r.recordedAt
        ? new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }).format(new Date(r.recordedAt))
        : "Recent";

      const sys = r.bp?.systolic || 120;
      const dia = r.bp?.diastolic || 80;
      const band = r.result?.overallBand || "normal";
      const quality = band === "critical" ? "Poor" : band === "high" ? "Fair" : "Good";

      return {
        id: r.id,
        timestamp: dateStr,
        pulseRate: Math.round(r.heartRate),
        spo2: Math.round(r.spo2),
        bpStr: `${Math.round(sys)}/${Math.round(dia)}`,
        pttDelay: Math.round(r.pttMs || 248),
        temp: r.temperature ? Number(r.temperature.toFixed(1)) : 36.8,
        gsr: r.edaMicrosiemens ? Number(r.edaMicrosiemens.toFixed(2)) : 2.2,
        quality: quality,
        band: band,
        notes: r.result?.modules?.heartDisease?.label || `${r.consciousness || "alert"} screening record`,
        anomaly: r.heartRate > 100 || r.spo2 < 95 ? "pulse" : undefined,
      };
    });
  }, [readings]);

  const filtered = useMemo(() => {
    return allRows.filter((r) => {
      if (
        search &&
        !r.notes.toLowerCase().includes(search.toLowerCase()) &&
        !r.timestamp.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [allRows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const showing = filtered.slice(startIndex, startIndex + pageSize);

  const exportCSV = () => {
    const headers = [
      "ID",
      "Timestamp",
      "Pulse Rate (BPM)",
      "SpO2 (%)",
      "Blood Pressure (mmHg)",
      "PTT Delay (ms)",
      "Temp (°C)",
      "GSR (µS)",
      "Risk Band",
      "Clinical Notes",
    ];
    const rows = filtered.map((r) => [
      r.id,
      r.timestamp,
      r.pulseRate,
      r.spo2,
      r.bpStr,
      r.pttDelay,
      r.temp,
      r.gsr,
      r.band,
      `"${r.notes}"`,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulsewatch-history-${activeProfile?.name?.replace(/\s+/g, "_") || "patient"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const qColor: Record<string, string> = {
    Excellent: "bg-[#E8F5E9] text-[#2E7D32]",
    Good: "bg-[#E3F0E4] text-[#5E8152]",
    Fair: "bg-[#FFF3E0] text-[#E65100]",
    Poor: "bg-[#FFEBEE] text-[#C62828]",
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">
              Data History
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Live reading ingestion history for{" "}
              <strong className="text-ink">{activeProfile?.name || "Patient"}</strong> ({readings.length} total entries).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-deep-sage px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-[#2C3E2B] transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Generate Clinical Report
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-paper-border bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
            >
              <Download className="h-4 w-4 text-slate-500" />
              Export CSV
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
          <div className="flex-1 min-w-[240px]">
            <p className="mb-1.5 text-[11px] font-semibold text-slate-500">Search Readings</p>
            <div className="flex items-center gap-2 rounded-lg border border-paper-border bg-[#FAFAF7] px-3 py-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by notes or date..."
                className="flex-1 bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="self-end flex items-center gap-1 rounded-lg border border-paper-border bg-white px-3 py-2 text-[11px] font-medium text-slate-500 hover:bg-gray-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-paper-border bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-[12px]">
              <thead>
                <tr className="border-b border-paper-border bg-[#FAFAF8]">
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">Timestamp</th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                      <Heart className="h-3.5 w-3.5 text-coral" fill="currentColor" />
                      Pulse (BPM)
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                      <Droplets className="h-3.5 w-3.5 text-blue-400" />
                      SpO₂ (%)
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                      <Droplets className="h-3.5 w-3.5 text-coral" />
                      BP (mmHg)
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                      <Activity className="h-3.5 w-3.5 text-sage" />
                      PTT (ms)
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                      <Thermometer className="h-3.5 w-3.5 text-orange-400" />
                      Temp (°C)
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                      <Zap className="h-3.5 w-3.5 text-yellow-500" />
                      GSR (µS)
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                      <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                      Scoring Band
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">Clinical Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {showing.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      No readings found for {activeProfile?.name}.
                    </td>
                  </tr>
                ) : (
                  showing.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-paper-border transition-colors hover:bg-[#FAFAF8]"
                    >
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{row.timestamp}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.pulseRate}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.spo2}%</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{row.bpStr}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{row.pttDelay}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{row.temp}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{row.gsr}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            row.band === "critical"
                              ? "bg-red-100 text-red-700"
                              : row.band === "high" || row.band === "moderate"
                              ? "bg-[#FFF3E0] text-[#E65100]"
                              : "bg-[#E8EFE4] text-[#5E8152]"
                          }`}
                        >
                          {row.band}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate">{row.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-paper-border px-4 py-3">
            <p className="text-[12px] text-slate-500">
              Showing {showing.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} readings
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded border border-paper-border bg-white text-slate-500 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-semibold px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded border border-paper-border bg-white text-slate-500 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
      <ClinicalReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} defaultReportType="period" />
      <UserProfileModal />
    </div>
  );
}
