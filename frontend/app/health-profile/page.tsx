"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import UserProfileModal from "@/components/UserProfileModal";
import { useDeviceProfile } from "@/components/DeviceProfileContext";
import {
  Download,
  Edit2,
  RefreshCw,
  Plus,
  MessageSquare,
  Phone,
  Lock,
  CheckCircle2,
  Heart,
  Calendar,
  User,
  Users,
} from "lucide-react";

export default function HealthProfilePage() {
  const { profiles, activeProfile, switchProfile, openProfileModal, telemetry } = useDeviceProfile();

  const biometrics = [
    { label: "Full Name", val: activeProfile?.name || "Patient" },
    { label: "Age", val: `${activeProfile?.age || 25} years` },
    { label: "Gender / Sex", val: activeProfile?.sex === "F" ? "Female" : activeProfile?.sex === "M" ? "Male" : "Other" },
    { label: "Relation / Role", val: activeProfile?.relation || "Self" },
    { label: "Profile ID", val: activeProfile?.id?.slice(0, 8) || "PW-123" },
    { label: "Account ID", val: activeProfile?.ownerId || "mock-user-123" },
  ];

  const baselines = [
    {
      label: "Baseline Heart Rate",
      val: `${activeProfile?.baseline?.heartRate || 72} BPM`,
      status: "Personal Baseline",
    },
    {
      label: "Baseline SpO₂",
      val: `${activeProfile?.baseline?.spo2 || 98} %`,
      status: "Target Range",
    },
    {
      label: "Baseline Systolic BP",
      val: `${activeProfile?.baseline?.systolic || 120} mmHg`,
      status: "Target Range",
    },
    {
      label: "Baseline Diastolic BP",
      val: `${activeProfile?.baseline?.diastolic || 80} mmHg`,
      status: "Target Range",
    },
    {
      label: "Baseline SDNN (HRV)",
      val: `${activeProfile?.baseline?.sdnn || 50} ms`,
      status: "Autonomic Ref",
    },
    {
      label: "Live Stream Pulse",
      val: `${telemetry.pulseRate} BPM`,
      status: "Current Reading",
    },
    {
      label: "Live Stream SpO₂",
      val: `${telemetry.spo2} %`,
      status: "Current Reading",
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">
              Health Profile & Baselines
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Personalized baselines and family profile switcher for Pulsewatch.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 min-w-0 space-y-5">
            {/* Monitored Family Profiles Selector */}
            <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-ink">Monitored Family Profiles</h2>
                  <p className="text-[12px] text-slate-500">
                    Switch between family members to load their baseline calibrations & readings.
                  </p>
                </div>
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-1 text-[12px] font-semibold text-deep-sage hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Profile
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {profiles.map((p) => {
                  const isSelected = p.id === activeProfile?.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => switchProfile(p.id)}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-deep-sage bg-[#F2F7EF] shadow-xs"
                          : "border-paper-border bg-white hover:border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-2.5 top-2.5">
                          <CheckCircle2 className="h-4 w-4 text-deep-sage" />
                        </div>
                      )}
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EFE4] font-serif font-bold text-sage">
                        {p.name.charAt(0)}
                      </div>
                      <p className="text-[14px] font-bold text-ink">{p.name}</p>
                      <p className="text-[12px] text-slate-500">
                        {p.age} years • {p.sex}
                      </p>
                      <span className="mt-1.5 inline-flex items-center rounded-full bg-[#E3F0E4] px-2 py-0.5 text-[10px] font-semibold text-sage">
                        {p.relation}
                      </span>
                      <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-slate-500 border-t border-paper-border pt-2">
                        <div>
                          <span>Baseline HR</span>
                          <p className="font-bold text-ink text-[12px]">
                            {p.baseline?.heartRate || 72} BPM
                          </p>
                        </div>
                        <div>
                          <span>Baseline BP</span>
                          <p className="font-bold text-ink text-[12px]">
                            {p.baseline?.systolic || 120}/{p.baseline?.diastolic || 80}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Biometrics */}
            <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-ink">Personal Information</h2>
                  <p className="text-[12px] text-slate-500">
                    Active identity details for {activeProfile?.name}.
                  </p>
                </div>
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-sage hover:underline cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Information
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
                {biometrics.map((b) => (
                  <div key={b.label}>
                    <p className="text-[10px] text-slate-400 mb-0.5">{b.label}</p>
                    <p className="text-[13px] font-semibold text-ink truncate">{b.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Calibration Baselines */}
            <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-ink">
                    Sensor Calibration Baselines (Backend Grounding)
                  </h2>
                  <p className="text-[12px] text-slate-500">
                    Individual thresholds stored in SQLite database to eliminate shared-mock bugs.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {baselines.map((b) => (
                  <div key={b.label} className="rounded-xl border border-paper-border p-3.5 bg-[#FAF9F5]">
                    <p className="text-[10px] text-slate-400 mb-1">{b.label}</p>
                    <p className="text-[14px] font-bold text-ink leading-tight">{b.val}</p>
                    <p className="mt-1 text-[11px] font-semibold text-sage">{b.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <UserProfileModal />
    </div>
  );
}
