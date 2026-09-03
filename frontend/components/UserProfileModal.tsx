"use client";

import React, { useState, useEffect } from "react";
import { useDeviceProfile, UserProfile } from "./DeviceProfileContext";
import { X, Check, User, Camera, ShieldCheck, Heart } from "lucide-react";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
];

export default function UserProfileModal() {
  const { profile, updateProfile, isProfileModalOpen, closeProfileModal } = useDeviceProfile();
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [customAvatar, setCustomAvatar] = useState("");

  useEffect(() => {
    if (isProfileModalOpen) {
      setFormData(profile);
    }
  }, [isProfileModalOpen, profile]);

  if (!isProfileModalOpen) return null;

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    closeProfileModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-paper-border bg-canvas p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EFE4] text-sage">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">Edit Patient Profile</h2>
              <p className="text-xs text-slate-500">Update personal biometrics & avatar photo</p>
            </div>
          </div>
          <button
            onClick={closeProfileModal}
            className="rounded-full p-2 text-slate-400 hover:bg-gray-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Avatar Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Patient Profile Photo</label>
            <div className="flex items-center gap-4">
              <img
                src={formData.avatarUrl}
                alt="Selected Avatar"
                className="h-16 w-16 rounded-full object-cover border-2 border-sage shadow-xs shrink-0"
              />
              <div className="flex-1">
                <p className="text-[11px] text-slate-500 mb-2">Select from avatar presets:</p>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChange("avatarUrl", url)}
                      className={`relative rounded-full overflow-hidden h-9 w-9 border-2 transition-transform hover:scale-105 ${
                        formData.avatarUrl === url ? "border-sage ring-2 ring-sage/30" : "border-transparent"
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="h-full w-full object-cover" />
                      {formData.avatarUrl === url && (
                        <div className="absolute inset-0 bg-sage/40 flex items-center justify-center text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="url"
                placeholder="Or paste custom image URL..."
                value={customAvatar}
                onChange={(e) => setCustomAvatar(e.target.value)}
                className="flex-1 rounded-lg border border-paper-border bg-white px-3 py-1.5 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customAvatar) {
                    handleChange("avatarUrl", customAvatar);
                    setCustomAvatar("");
                  }
                }}
                className="rounded-lg bg-gray-100 px-3 py-1.5 font-semibold text-slate-700 hover:bg-gray-200"
              >
                Apply URL
              </button>
            </div>
          </div>

          <hr className="border-paper-border" />

          {/* Biometrics */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full rounded-lg border border-paper-border bg-white px-3 py-2 text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient ID</label>
              <input
                required
                type="text"
                value={formData.patientId}
                onChange={(e) => handleChange("patientId", e.target.value)}
                className="w-full rounded-lg border border-paper-border bg-white px-3 py-2 text-xs font-mono font-bold outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age (Years)</label>
              <input
                required
                type="number"
                value={formData.age}
                onChange={(e) => handleChange("age", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-paper-border bg-white px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full rounded-lg border border-paper-border bg-white px-3 py-2 text-xs outline-none"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Height</label>
              <input
                type="text"
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
                className="w-full rounded-lg border border-paper-border bg-white px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weight</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className="w-full rounded-lg border border-paper-border bg-white px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange("bloodGroup", e.target.value)}
                className="w-full rounded-lg border border-paper-border bg-white px-3 py-2 text-xs outline-none font-semibold"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full rounded-lg border border-paper-border bg-white px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>

          <hr className="border-paper-border" />

          {/* Emergency Contact */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Emergency Contact</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="Contact Name"
                value={formData.emergencyContactName}
                onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                className="rounded-lg border border-paper-border bg-white px-3 py-2 text-xs outline-none"
              />
              <input
                placeholder="Relation (e.g. Son)"
                value={formData.emergencyContactRelation}
                onChange={(e) => handleChange("emergencyContactRelation", e.target.value)}
                className="rounded-lg border border-paper-border bg-white px-3 py-2 text-xs outline-none"
              />
              <input
                placeholder="Phone Number"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                className="rounded-lg border border-paper-border bg-white px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeProfileModal}
              className="rounded-full border border-paper-border px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-deep-sage px-5 py-2 text-xs font-semibold text-white hover:bg-[#2C3E2B]"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
