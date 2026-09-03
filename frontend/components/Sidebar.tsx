"use client";

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
} from "lucide-react";

import { useDeviceProfile } from "./DeviceProfileContext";

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
  const { profile, openProfileModal, telemetry } = useDeviceProfile();

  return (
    <aside className="flex w-[240px] xl:w-[256px] h-screen shrink-0 flex-col justify-between border-r border-paper-border bg-[#F7F6F0] px-4 py-5 overflow-y-auto sticky top-0 z-20">
      <div>
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
            {telemetry.isStreaming ? "Live Device Connected" : "Precision Health"}
          </p>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#E8EFE4] text-sage"
                    : "text-slate-500 hover:bg-white/70 hover:text-ink"
                }`}
              >
                <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-4 space-y-2.5 pt-2 border-t border-paper-border/50">
        <div className="rounded-xl border border-paper-border bg-white p-3 shadow-2xs">
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8EFE4] text-sage shrink-0">
              <Clock3 className="h-3 w-3" />
            </span>
            Next Check-in
          </div>
          <p className="font-mono text-xs font-bold text-ink">May 26, 2025</p>
          <p className="mt-0.5 text-[10px] font-medium text-coral">3 days left</p>
        </div>

        <button
          onClick={openProfileModal}
          title="Click to edit profile & avatar"
          className="w-full flex items-center gap-2.5 rounded-xl border border-paper-border bg-white p-2 shadow-2xs text-left hover:border-sage transition-all group"
        >
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-ink leading-tight group-hover:text-sage transition-colors">{profile.name}</p>
            <p className="font-mono text-[9px] text-slate-400">ID: {profile.patientId}</p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0 group-hover:text-slate-600" />
        </button>
      </div>
    </aside>
  );
}
