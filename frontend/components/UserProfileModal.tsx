"use client";

import React, { useState, useEffect } from "react";
import { useDeviceProfile } from "./DeviceProfileContext";
import { X, Check, User, Plus, Users, Heart } from "lucide-react";
import { CreateProfileInput } from "@/lib/types";

export default function UserProfileModal() {
  const {
    profiles,
    activeProfile,
    switchProfile,
    createProfile,
    isProfileModalOpen,
    closeProfileModal,
  } = useDeviceProfile();

  const [mode, setMode] = useState<"switch" | "create">("switch");
  const [formData, setFormData] = useState<CreateProfileInput>({
    name: "",
    age: 30,
    sex: "F",
    relation: "Self",
    baselineHeartRate: 72,
    baselineSpo2: 98,
    baselineSystolic: 120,
    baselineDiastolic: 80,
    baselineSdnn: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isProfileModalOpen) {
      setMode("switch");
      setError(null);
    }
  }, [isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please provide a name.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createProfile(formData);
      closeProfileModal();
    } catch (err: any) {
      setError(err.message || "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-paper-border bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EFE4] text-sage">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">Monitored Profiles</h2>
              <p className="text-xs text-slate-500">Switch profile or register a new family member</p>
            </div>
          </div>
          <button
            onClick={closeProfileModal}
            className="rounded-full p-2 text-slate-400 hover:bg-gray-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="mb-5 flex rounded-xl bg-[#F7F6F0] p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("switch")}
            className={`flex-1 rounded-lg py-2 font-semibold transition-all ${
              mode === "switch" ? "bg-white text-ink shadow-xs" : "text-slate-500 hover:text-ink"
            }`}
          >
            Choose Monitored Person ({profiles.length})
          </button>
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex-1 rounded-lg py-2 font-semibold transition-all ${
              mode === "create" ? "bg-white text-ink shadow-xs" : "text-slate-500 hover:text-ink"
            }`}
          >
            + Add New Profile
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {mode === "switch" ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Select a family member to view their real-time telemetry, 7-day trend deltas, and scoring engine evaluations:
            </p>
            <div className="space-y-2">
              {profiles.map((p) => {
                const isCurrent = p.id === activeProfile?.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={async () => {
                      await switchProfile(p.id);
                      closeProfileModal();
                    }}
                    className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                      isCurrent
                        ? "border-deep-sage bg-[#F2F7EF] ring-2 ring-deep-sage/20"
                        : "border-paper-border bg-white hover:border-gray-300 hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EFE4] font-serif font-bold text-sage">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-ink">{p.name}</h4>
                          <span className="rounded-full bg-[#E8EFE4] px-2 py-0.5 text-[10px] font-bold text-sage">
                            {p.relation}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Age: {p.age} • Sex: {p.sex} • Baseline HR: {p.baseline?.heartRate || 72} BPM • BP: {p.baseline?.systolic}/{p.baseline?.diastolic}
                        </p>
                      </div>
                    </div>
                    {isCurrent && <Check className="h-5 w-5 text-deep-sage stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setMode("create")}
                className="flex items-center gap-1.5 text-xs font-semibold text-sage hover:underline"
              >
                <Plus className="h-4 w-4" /> Add another person
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Kaveri, Grandfather, Rajesh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-paper-border bg-[#FAF9F5] px-3 py-2 text-xs font-medium outline-none focus:border-sage"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 30 })}
                  className="w-full rounded-xl border border-paper-border bg-[#FAF9F5] px-3 py-2 text-xs outline-none focus:border-sage"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sex</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full rounded-xl border border-paper-border bg-[#FAF9F5] px-3 py-2 text-xs outline-none focus:border-sage"
                >
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Relation / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Self, Grandmother, Father, Spouse"
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full rounded-xl border border-paper-border bg-[#FAF9F5] px-3 py-2 text-xs outline-none focus:border-sage"
                />
              </div>
            </div>

            <div className="rounded-xl border border-paper-border bg-[#FAF9F5] p-3 space-y-2">
              <p className="font-semibold text-slate-700">Personal Calibration Baselines</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500">Baseline HR (BPM)</span>
                  <input
                    type="number"
                    value={formData.baselineHeartRate}
                    onChange={(e) => setFormData({ ...formData, baselineHeartRate: parseFloat(e.target.value) || 72 })}
                    className="w-full rounded-lg border border-paper-border bg-white px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Baseline SpO₂ (%)</span>
                  <input
                    type="number"
                    value={formData.baselineSpo2}
                    onChange={(e) => setFormData({ ...formData, baselineSpo2: parseFloat(e.target.value) || 98 })}
                    className="w-full rounded-lg border border-paper-border bg-white px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Baseline Systolic BP</span>
                  <input
                    type="number"
                    value={formData.baselineSystolic}
                    onChange={(e) => setFormData({ ...formData, baselineSystolic: parseFloat(e.target.value) || 120 })}
                    className="w-full rounded-lg border border-paper-border bg-white px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Baseline Diastolic BP</span>
                  <input
                    type="number"
                    value={formData.baselineDiastolic}
                    onChange={(e) => setFormData({ ...formData, baselineDiastolic: parseFloat(e.target.value) || 80 })}
                    className="w-full rounded-lg border border-paper-border bg-white px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode("switch")}
                className="rounded-full border border-paper-border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-deep-sage px-5 py-2 text-xs font-semibold text-white hover:bg-[#2C3E2B] disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
