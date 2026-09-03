"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShieldCheck,
  LineChart,
  UserRound,
  Bell,
  Clock3,
  Settings,
  ChevronsUpDown,
  Activity,
  FileText,
  Check,
  Plus,
  Users,
  LogOut,
  Shield,
} from "lucide-react";

import { useDeviceProfile } from "./DeviceProfileContext";
import { useAuth } from "@/lib/authContext";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutGrid },
  { name: "Risk Analysis", href: "/risk-analysis", icon: ShieldCheck },
  { name: "Trend Reports", href: "/trend-reports", icon: LineChart },
  { name: "Clinical Report", href: "/clinical-report", icon: FileText },
  { name: "Health Profile", href: "/health-profile", icon: UserRound },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "History", href: "/history", icon: Clock3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profiles, activeProfile, switchProfile, openProfileModal, telemetry, alerts } = useDeviceProfile();
  const { user, signOut } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unacknowledgedAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <aside className="flex w-[240px] xl:w-[256px] h-screen shrink-0 flex-col justify-between border-r border-paper-border bg-[#F7F6F0] px-4 py-5 overflow-y-auto sticky top-0 z-20">
      <div>
        {/* Brand Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-white shrink-0">
              <Activity className="h-4 w-4" strokeWidth={2.4} />
            </div>
            <span className="font-serif text-[20px] font-bold tracking-tight text-ink">
              PULSEWATCH
            </span>
          </div>
          <p className="mt-0.5 pl-10 text-[10px] font-medium tracking-wide text-slate-500 flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${telemetry.isStreaming ? "bg-emerald-500 animate-ping" : "bg-gray-400"}`}></span>
            {telemetry.isStreaming ? "Live Engine Connected" : "Precision Screening"}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isAlerts = item.name === "Alerts";

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#E8EFE4] text-sage"
                    : "text-slate-500 hover:bg-white/70 hover:text-ink"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
                  <span>{item.name}</span>
                </div>
                {isAlerts && unacknowledgedAlertsCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                    {unacknowledgedAlertsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Switcher & Auth Footer */}
      <div className="mt-4 space-y-2.5 pt-2 border-t border-paper-border/50 relative">
        {/* Monitored Person Info */}
        <div className="rounded-xl border border-paper-border bg-white p-3 shadow-2xs">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8EFE4] text-sage shrink-0">
                <Users className="h-3 w-3" />
              </span>
              Active Profile
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sage">
              {activeProfile?.relation || "Patient"}
            </span>
          </div>
          <p className="font-serif text-xs font-bold text-ink truncate">{activeProfile?.name || "Loading profile..."}</p>
          <p className="mt-0.5 font-mono text-[9px] text-slate-400">Baseline HR: {activeProfile?.baseline?.heartRate || 72} BPM • SpO₂: {activeProfile?.baseline?.spo2 || 98}%</p>
        </div>

        {/* Profile Selector Dropdown / Button */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            title="Click to switch or edit monitored profile"
            className="w-full flex items-center gap-2.5 rounded-xl border border-paper-border bg-white p-2 shadow-2xs text-left hover:border-sage transition-all group cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EFE4] font-serif font-bold text-sage shrink-0 border border-slate-200 group-hover:scale-105 transition-transform text-sm">
              {activeProfile?.name?.charAt(0) || "P"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-ink leading-tight group-hover:text-sage transition-colors">
                {activeProfile?.name || "Select Profile"}
              </p>
              <p className="font-mono text-[9px] text-slate-400">
                {activeProfile ? `Age: ${activeProfile.age || 25} • ${activeProfile.sex || "F"}` : "No profile"}
              </p>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0 group-hover:text-slate-600" />
          </button>

          {/* Switcher Modal / Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-paper-border bg-white p-2 shadow-xl z-30 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Monitored Person
              </div>
              {profiles.map((p) => {
                const isCurrent = p.id === activeProfile?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchProfile(p.id);
                      setProfileDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-[#E8EFE4] font-semibold text-sage"
                        : "text-slate-700 hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.relation} • Age {p.age}</p>
                    </div>
                    {isCurrent && <Check className="h-4 w-4 shrink-0 text-sage" />}
                  </button>
                );
              })}
              <div className="border-t border-paper-border pt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    openProfileModal();
                  }}
                  className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-deep-sage hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create / Edit Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User & Sign Out */}
        {user && (
          <div className="flex items-center justify-between rounded-xl border border-paper-border/60 bg-white/70 px-2.5 py-2 text-[11px]">
            <div className="truncate min-w-0 pr-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Firebase User</p>
              <p className="truncate text-slate-700 font-medium" title={user.email || ""}>
                {user.email || "Authenticated"}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out of Firebase"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-500 hover:bg-red-50 hover:text-coral transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
