"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Profile,
  CreateProfileInput,
  Reading,
  Alert,
  PredictResultData,
  PredictResponse,
  PredictInput,
} from "@/lib/types";
import * as api from "@/lib/api";

export type DeviceTelemetry = {
  pulseRate: number;
  spo2: number;
  pttDelay: number;
  temperature: number;
  gsr: number;
  systolic: number;
  diastolic: number;
  signalQuality: number;
  isStreaming: boolean;
  lastSync: string;
};

// Default fallback telemetry
const defaultTelemetry: DeviceTelemetry = {
  pulseRate: 74,
  spo2: 98,
  pttDelay: 248,
  temperature: 36.8,
  gsr: 2.2,
  systolic: 120,
  diastolic: 80,
  signalQuality: 98,
  isStreaming: true,
  lastSync: "Just now",
};

interface DeviceProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  activeProfileId: string | null;
  profile: any; // Compatibility alias
  history: any[]; // Compatibility alias
  switchProfile: (profileId: string) => Promise<void>;
  createProfile: (data: CreateProfileInput) => Promise<Profile>;
  updateProfile?: (data: any) => void;
  telemetry: DeviceTelemetry;
  toggleStreaming: () => void;
  latestPredictResult: PredictResultData | null;
  readings: Reading[];
  alerts: Alert[];
  ackAlert: (alertId: string) => Promise<void>;
  addAlert?: (alert: any) => void;
  recordReading: (input: Partial<PredictInput>) => Promise<PredictResponse>;
  addReading?: (input: any) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  // Modals
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  isLiveReadingModalOpen: boolean;
  openLiveReadingModal: () => void;
  closeLiveReadingModal: () => void;
}

const DeviceProfileContext = createContext<DeviceProfileContextType | undefined>(undefined);

export function DeviceProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>(defaultTelemetry);
  const [latestPredictResult, setLatestPredictResult] = useState<PredictResultData | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLiveReadingModalOpen, setIsLiveReadingModalOpen] = useState(false);

  // Fetch readings & alerts for a given profile
  const fetchProfileData = useCallback(async (profileId: string) => {
    try {
      const [readingsData, alertsData] = await Promise.all([
        api.getReadings(profileId, 50).catch(() => [] as Reading[]),
        api.getAlerts(profileId).catch(() => [] as Alert[]),
      ]);
      setReadings(readingsData);
      setAlerts(alertsData);

      // If there are stored readings, update telemetry and latest predict result
      if (readingsData.length > 0) {
        const latest = readingsData[0];
        setTelemetry((prev) => ({
          ...prev,
          pulseRate: latest.heartRate,
          spo2: latest.spo2,
          temperature: latest.temperature || prev.temperature,
          systolic: latest.bp?.systolic || prev.systolic,
          diastolic: latest.bp?.diastolic || prev.diastolic,
          pttDelay: latest.pttMs || prev.pttDelay,
          gsr: latest.edaMicrosiemens || prev.gsr,
          lastSync: "Just now",
        }));
        if (latest.result) {
          setLatestPredictResult(latest.result);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    }
  }, []);

  // Initial load: Fetch profiles from backend
  useEffect(() => {
    let isMounted = true;
    async function initProfiles() {
      setIsLoading(true);
      try {
        let profileList = await api.getProfiles();
        // If no profiles exist, seed a default one
        if (!profileList || profileList.length === 0) {
          const created = await api.createProfile({
            name: "Kaveri (Self)",
            age: 22,
            sex: "F",
            relation: "Self",
            baselineHeartRate: 74,
            baselineSpo2: 98,
            baselineSystolic: 114,
            baselineDiastolic: 74,
            baselineSdnn: 58,
          });
          profileList = [created];
        }

        if (isMounted) {
          setProfiles(profileList);
          // Pick saved active profile id or default to first
          const savedId = typeof window !== "undefined" ? localStorage.getItem("pulsewatch-active-profile-id") : null;
          const chosen = profileList.find((p) => p.id === savedId) || profileList[0];
          setActiveProfile(chosen);
          if (chosen) {
            await fetchProfileData(chosen.id);
          }
        }
      } catch (err) {
        console.error("Failed to initialize profiles from backend:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initProfiles();
    return () => {
      isMounted = false;
    };
  }, [fetchProfileData]);

  // Switch profile handler
  const switchProfile = async (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;
    setActiveProfile(target);
    if (typeof window !== "undefined") {
      localStorage.setItem("pulsewatch-active-profile-id", profileId);
    }
    // Update baseline telemetry from profile
    setTelemetry((prev) => ({
      ...prev,
      pulseRate: target.baseline?.heartRate || prev.pulseRate,
      spo2: target.baseline?.spo2 || prev.spo2,
      systolic: target.baseline?.systolic || prev.systolic,
      diastolic: target.baseline?.diastolic || prev.diastolic,
    }));
    await fetchProfileData(target.id);
  };

  // Create new profile handler
  const createProfile = async (data: CreateProfileInput): Promise<Profile> => {
    const created = await api.createProfile(data);
    setProfiles((prev) => [...prev, created]);
    await switchProfile(created.id);
    return created;
  };

  // Submit reading to scoring engine & persist
  const recordReading = async (input: Partial<PredictInput>): Promise<PredictResponse> => {
    const hr = input.heart_rate ?? telemetry.pulseRate;
    const spo2 = input.spo2 ?? telemetry.spo2;
    const sys = input.systolic ?? input.bp?.systolic ?? telemetry.systolic;
    const dia = input.diastolic ?? input.bp?.diastolic ?? telemetry.diastolic;
    const ptt = input.ptt_ms ?? telemetry.pttDelay;
    const temp = input.temperature ?? telemetry.temperature;
    const gsr = input.eda_microsiemens ?? telemetry.gsr;

    // Generate RR intervals based on baseline SDNN or heart rate for HRV engine
    const sdnnBase = activeProfile?.baseline?.sdnn || 50;
    const rrIntervals = input.rr_intervals_ms || Array.from({ length: 20 }, () =>
      Number((60000 / hr + (Math.random() - 0.5) * (sdnnBase * 0.8)).toFixed(1))
    );

    const payload: PredictInput = {
      profile_id: activeProfile?.id,
      heart_rate: hr,
      spo2: spo2,
      temperature: temp,
      systolic: sys,
      diastolic: dia,
      bp: { systolic: sys, diastolic: dia },
      ptt_ms: ptt,
      rr_intervals_ms: rrIntervals,
      eda_microsiemens: gsr,
      respiratory_rate: input.respiratory_rate ?? 16,
      consciousness: input.consciousness ?? "alert",
    };

    const response = await api.predictReading(payload);
    setLatestPredictResult(response.result);

    // Update telemetry
    setTelemetry((prev) => ({
      ...prev,
      pulseRate: hr,
      spo2: spo2,
      systolic: sys,
      diastolic: dia,
      pttDelay: ptt,
      temperature: temp,
      gsr: gsr,
      lastSync: "Just now",
    }));

    // Refresh history & alerts in background
    if (activeProfile?.id) {
      fetchProfileData(activeProfile.id);
    }

    return response;
  };

  // Acknowledge alert handler
  const ackAlert = async (alertId: string) => {
    try {
      const updated = await api.acknowledgeAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    }
  };

  // Live telemetry pulse simulation stream
  useEffect(() => {
    if (!telemetry.isStreaming || !activeProfile) return;

    let isRunning = false;
    const interval = setInterval(async () => {
      if (isRunning) return;
      isRunning = true;

      // Small jitter around baseline/current
      const pulseDelta = Math.round((Math.random() - 0.5) * 4);
      const newPulse = Math.min(105, Math.max(55, telemetry.pulseRate + pulseDelta));
      const pttDelta = Math.round((Math.random() - 0.5) * 4);
      const newPtt = Math.min(290, Math.max(220, telemetry.pttDelay + pttDelta));
      const gsrDelta = (Math.random() - 0.5) * 0.06;
      const newGsr = Math.min(3.8, Math.max(1.4, Number((telemetry.gsr + gsrDelta).toFixed(2))));
      const spo2Rand = Math.random();
      const newSpo2 = spo2Rand > 0.85 ? Math.min(100, Math.max(94, telemetry.spo2 + (Math.random() > 0.5 ? 1 : -1))) : telemetry.spo2;

      // Call real backend predict
      try {
        const sdnnBase = activeProfile.baseline?.sdnn || 50;
        const rrIntervals = Array.from({ length: 15 }, () =>
          Number((60000 / newPulse + (Math.random() - 0.5) * (sdnnBase * 0.8)).toFixed(1))
        );

        const res = await api.predictReading({
          profile_id: activeProfile.id,
          heart_rate: newPulse,
          spo2: newSpo2,
          temperature: telemetry.temperature,
          systolic: telemetry.systolic,
          diastolic: telemetry.diastolic,
          ptt_ms: newPtt,
          eda_microsiemens: newGsr,
          rr_intervals_ms: rrIntervals,
          respiratory_rate: 16,
          consciousness: "alert",
        });

        setLatestPredictResult(res.result);
        setTelemetry((prev) => ({
          ...prev,
          pulseRate: newPulse,
          spo2: newSpo2,
          pttDelay: newPtt,
          gsr: newGsr,
          lastSync: "Just now",
        }));
      } catch (err) {
        console.warn("Telemetry predict tick error (backend may be refreshing):", err);
      } finally {
        isRunning = false;
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [telemetry.isStreaming, telemetry.pulseRate, telemetry.spo2, telemetry.pttDelay, telemetry.gsr, telemetry.temperature, telemetry.systolic, telemetry.diastolic, activeProfile]);

  const toggleStreaming = () => {
    setTelemetry((prev) => ({ ...prev, isStreaming: !prev.isStreaming }));
  };

  const refreshData = async () => {
    if (activeProfile) {
      await fetchProfileData(activeProfile.id);
    }
  };

  // Compatibility object for profile
  const profileCompat = {
    name: activeProfile?.name || "Patient",
    patientId: activeProfile?.id?.slice(0, 8) || "PW-101",
    age: activeProfile?.age || 30,
    gender: activeProfile?.sex === "F" ? "Female" : activeProfile?.sex === "M" ? "Male" : "Other",
    height: "170 cm",
    weight: "68 kg",
    bloodGroup: "O+",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    phone: "+91 98765 12345",
    emergencyContactName: "Emergency Contact",
    emergencyContactPhone: "+91 98765 43210",
    emergencyContactRelation: "Family",
  };

  return (
    <DeviceProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        activeProfileId: activeProfile?.id || null,
        profile: profileCompat,
        history: readings.map((r, i) => ({
          id: i + 1,
          timestamp: r.recordedAt ? new Date(r.recordedAt).toLocaleString() : "Recent",
          pulseRate: r.heartRate,
          spo2: r.spo2,
          pttDelay: r.pttMs || 248,
          temp: r.temperature || 36.8,
          gsr: r.edaMicrosiemens || 2.2,
          quality: "Good",
          notes: r.result?.modules?.heartDisease?.label || "Live reading",
        })),
        switchProfile,
        createProfile,
        telemetry,
        toggleStreaming,
        latestPredictResult,
        readings,
        alerts,
        ackAlert,
        recordReading,
        addReading: (r: any) => recordReading({ heart_rate: r.pulseRate, spo2: r.spo2 }),
        isLoading,
        refreshData,
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
        isLiveReadingModalOpen,
        openLiveReadingModal: () => setIsLiveReadingModalOpen(true),
        closeLiveReadingModal: () => setIsLiveReadingModalOpen(false),
      }}
    >
      {children}
    </DeviceProfileContext.Provider>
  );
}

export function useDeviceProfile() {
  const context = useContext(DeviceProfileContext);
  if (!context) {
    throw new Error("useDeviceProfile must be used within a DeviceProfileProvider");
  }
  return context;
}
