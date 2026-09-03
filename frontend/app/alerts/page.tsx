"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import UserProfileModal from "@/components/UserProfileModal";
import { useDeviceProfile } from "@/components/DeviceProfileContext";
import {
  Calendar,
  Download,
  ChevronDown,
  CheckCircle,
  Heart,
  TrendingUp,
  Droplets,
  Activity,
  RefreshCw,
  Battery,
  Flame,
  Info,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Alert } from "@/lib/types";

function AlertIcon({ category, severity }: { category: string; severity: string }) {
  const cls = "h-5 w-5";
  const cat = category.toLowerCase();

  let icon = <Activity className={`${cls} text-orange-500`} />;
  let bg = "bg-[#FFF3E0]";

  if (cat.includes("heart")) {
    icon = <Heart className={`${cls} text-coral`} fill="currentColor" />;
    bg = "bg-[#FBE9E4]";
  } else if (cat.includes("bp") || cat.includes("hyper")) {
    icon = <Droplets className={`${cls} text-coral`} />;
    bg = "bg-[#FBE9E4]";
  } else if (cat.includes("stress")) {
    icon = <Flame className={`${cls} text-coral`} />;
    bg = "bg-[#FBE9E4]";
  } else if (cat.includes("sync") || cat.includes("system")) {
    icon = <RefreshCw className={`${cls} text-sage`} />;
    bg = "bg-[#E8F5E9]";
  }

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg}`}>
      {icon}
    </div>
  );
}

export default function AlertsPage() {
  const { activeProfile, alerts, ackAlert } = useDeviceProfile();
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const warning = alerts.filter((a) => a.severity === "warning").length;
    const info = alerts.filter((a) => a.severity === "info").length;
    const unacknowledged = alerts.filter((a) => !a.acknowledged).length;
    return { critical, warning, info, unacknowledged, total: alerts.length };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filterSeverity !== "All" && a.severity !== filterSeverity.toLowerCase()) return false;
      if (filterStatus === "Unacknowledged" && a.acknowledged) return false;
      if (filterStatus === "Acknowledged" && !a.acknowledged) return false;
      return true;
    });
  }, [alerts, filterSeverity, filterStatus]);

  const handleAck = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAcknowledgingId(id);
    try {
      await ackAlert(id);
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">
              Clinical Alerts & Notifications
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Live alert stream from backend scoring engine for{" "}
              <strong className="text-ink">{activeProfile?.name || "Patient"}</strong>.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Alert list */}
          <div className="flex-1 min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-ink">
                Alerts ({filteredAlerts.length})
                {summary.unacknowledged > 0 && (
                  <span className="ml-2 rounded-full bg-coral/10 text-coral px-2 py-0.5 text-[11px] font-bold">
                    {summary.unacknowledged} Pending Acknowledgment
                  </span>
                )}
              </h2>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="rounded-2xl border border-paper-border bg-white p-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-sage" />
                <h3 className="mt-3 font-serif text-lg font-bold text-ink">No Active Alerts</h3>
                <p className="mt-1 text-xs text-slate-500">
                  All physiological parameters for {activeProfile?.name} are within target screening ranges.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const isAck = alert.acknowledged;
                  const severityBadge =
                    alert.severity === "critical"
                      ? "bg-red-100 text-red-700"
                      : alert.severity === "warning"
                      ? "bg-[#FFF3E0] text-[#E65100]"
                      : "bg-[#E8EFE4] text-[#5E8152]";

                  const createdDate = alert.createdAt
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      }).format(new Date(alert.createdAt))
                    : "Recent";

                  return (
                    <div
                      key={alert.id}
                      className={`flex items-center gap-4 rounded-xl border p-4 shadow-2xs transition-all bg-white ${
                        isAck ? "border-paper-border opacity-70" : "border-paper-border hover:shadow-md"
                      }`}
                    >
                      <AlertIcon category={alert.category} severity={alert.severity} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${severityBadge}`}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-[13px] font-semibold text-ink capitalize">
                              {alert.category} Alert
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">{createdDate}</span>
                        </div>
                        <p className="text-[12px] text-slate-600">{alert.message}</p>
                      </div>

                      {/* Acknowledge Button */}
                      <div className="shrink-0">
                        {isAck ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage">
                            <Check className="h-3.5 w-3.5" />
                            Acknowledged
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleAck(alert.id, e)}
                            disabled={acknowledgingId === alert.id}
                            className="rounded-lg border border-paper-border bg-[#FAF9F5] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#E8EFE4] hover:text-sage hover:border-sage transition-colors cursor-pointer"
                          >
                            {acknowledgingId === alert.id ? "Saving..." : "Acknowledge"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar panel */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            {/* Alert Summary */}
            <div className="rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
              <div className="mb-3 flex items-center gap-1.5">
                <h3 className="text-[13px] font-semibold text-ink">Alert Summary</h3>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              {[
                { label: "Critical", val: summary.critical, cls: "text-red-600" },
                { label: "Warning / High", val: summary.warning, cls: "text-orange-500" },
                { label: "Informational", val: summary.info, cls: "text-sage" },
                { label: "Pending Review", val: summary.unacknowledged, cls: "text-coral" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-paper-border last:border-0"
                >
                  <span className="text-[12px] text-slate-600">{item.label}</span>
                  <span className={`text-[13px] font-bold ${item.cls}`}>{item.val}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-ink">Total Logged</span>
                <span className="text-[13px] font-bold text-ink">{summary.total}</span>
              </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
              <h3 className="text-[13px] font-semibold text-ink mb-3">Filters</h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-slate-500">Severity</p>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full rounded-lg border border-paper-border bg-[#FAFAF7] px-3 py-2 text-[12px] text-slate-600 outline-none"
                  >
                    <option value="All">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="Warning">Warning</option>
                    <option value="Info">Info</option>
                  </select>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-slate-500">Status</p>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full rounded-lg border border-paper-border bg-[#FAFAF7] px-3 py-2 text-[12px] text-slate-600 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Unacknowledged">Unacknowledged Only</option>
                    <option value="Acknowledged">Acknowledged Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <UserProfileModal />
    </div>
  );
}
