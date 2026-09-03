"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserProfile = {
  name: string;
  patientId: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
  bloodGroup: string;
  avatarUrl: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
};

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

export type HistoryReading = {
  id: number;
  timestamp: string;
  pulseRate: number;
  spo2: number;
  pttDelay: number;
  temp: number;
  gsr: number;
  quality: "Excellent" | "Good" | "Fair" | "Poor";
  notes: string;
  anomaly?: "pulse" | "spo2" | "ptt" | "temp" | "gsr";
};

export type AlertItem = {
  id: number;
  icon: "heart" | "trend" | "flame" | "activity" | "sync" | "battery";
  iconBg: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  badge: "High" | "Trend" | "System";
  badgeColor: string;
  source: string;
  date: string;
  time: string;
};

const initialProfile: UserProfile = {
  name: "Arjun Sharma",
  patientId: "PW-78291",
  age: 68,
  gender: "Male",
  height: "168 cm",
  weight: "72 kg",
  bloodGroup: "O+",
  avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
  phone: "+91 98765 12345",
  emergencyContactName: "Rahul Sharma",
  emergencyContactPhone: "+91 98765 43210",
  emergencyContactRelation: "Son",
};

const initialTelemetry: DeviceTelemetry = {
  pulseRate: 74,
  spo2: 98,
  pttDelay: 248,
  temperature: 36.6,
  gsr: 2.14,
  systolic: 122,
  diastolic: 78,
  signalQuality: 98,
  isStreaming: true,
  lastSync: "Just now",
};

const initialHistory: HistoryReading[] = [
  { id: 1, timestamp: "May 23, 2025 10:30 AM", pulseRate: 72, spo2: 97, pttDelay: 248, temp: 36.6, gsr: 2.14, quality: "Excellent", notes: "Morning Routine" },
  { id: 2, timestamp: "May 23, 2025 09:30 AM", pulseRate: 78, spo2: 96, pttDelay: 251, temp: 36.7, gsr: 2.32, quality: "Good", notes: "Post Breakfast" },
  { id: 3, timestamp: "May 23, 2025 08:30 AM", pulseRate: 85, spo2: 95, pttDelay: 265, temp: 36.8, gsr: 2.45, quality: "Fair", notes: "Light Activity", anomaly: "pulse" },
  { id: 4, timestamp: "May 23, 2025 07:30 AM", pulseRate: 68, spo2: 97, pttDelay: 240, temp: 36.5, gsr: 1.98, quality: "Excellent", notes: "Resting" },
  { id: 5, timestamp: "May 22, 2025 10:30 PM", pulseRate: 75, spo2: 96, pttDelay: 250, temp: 36.6, gsr: 2.10, quality: "Good", notes: "Before Sleep" },
  { id: 6, timestamp: "May 22, 2025 09:30 PM", pulseRate: 72, spo2: 97, pttDelay: 246, temp: 36.5, gsr: 2.05, quality: "Good", notes: "Evening Check" },
  { id: 7, timestamp: "May 22, 2025 08:30 PM", pulseRate: 88, spo2: 94, pttDelay: 270, temp: 36.9, gsr: 2.60, quality: "Poor", notes: "Post Workout", anomaly: "pulse" },
  { id: 8, timestamp: "May 22, 2025 07:30 PM", pulseRate: 79, spo2: 97, pttDelay: 255, temp: 36.7, gsr: 2.30, quality: "Good", notes: "Walk" },
];

const initialAlertsList: AlertItem[] = [
  { id: 1, icon: "heart", iconBg: "bg-[#FBE9E4]", title: "High Heart Rate Detected", description: "Resting pulse exceeded baseline threshold (112 BPM).", metric: "112 bpm", metricLabel: "", badge: "High", badgeColor: "bg-[#FFEBEE] text-[#C62828]", source: "Heart Rate", date: "May 23, 2025", time: "10:25 AM" },
  { id: 2, icon: "trend", iconBg: "bg-[#FFF3E0]", title: "Elevated Blood Pressure Trend", description: "Average systolic BP above baseline for 5 days.", metric: "5 days", metricLabel: "Trend", badge: "Trend", badgeColor: "bg-[#FFF3E0] text-[#E65100]", source: "Blood Pressure", date: "May 23, 2025", time: "08:15 AM" },
  { id: 3, icon: "flame", iconBg: "bg-[#FBE9E4]", title: "High Stress Level Detected", description: "Galvanic skin response and HRV indicated peak stress.", metric: "85/100", metricLabel: "", badge: "High", badgeColor: "bg-[#FFEBEE] text-[#C62828]", source: "Stress", date: "May 22, 2025", time: "07:40 PM" },
  { id: 4, icon: "activity", iconBg: "bg-[#FFF3E0]", title: "Reduced HRV Trend", description: "SDNN variable below standard baseline.", metric: "7 days", metricLabel: "Trend", badge: "Trend", badgeColor: "bg-[#FFF3E0] text-[#E65100]", source: "HRV (SDNN)", date: "May 22, 2025", time: "06:30 AM" },
];

type ContextType = {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  telemetry: DeviceTelemetry;
  toggleStreaming: () => void;
  history: HistoryReading[];
  addReading: (reading: Omit<HistoryReading, "id">) => void;
  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, "id">) => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  isLiveReadingModalOpen: boolean;
  openLiveReadingModal: () => void;
  closeLiveReadingModal: () => void;
};

const DeviceProfileContext = createContext<ContextType | undefined>(undefined);

export function DeviceProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>(initialTelemetry);
  const [history, setHistory] = useState<HistoryReading[]>(initialHistory);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlertsList);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLiveReadingModalOpen, setIsLiveReadingModalOpen] = useState(false);

  // Load saved state from localStorage if available
  useEffect(() => {
    try {
      const savedProf = localStorage.getItem("pulsewatch-user-profile");
      if (savedProf) setProfile(JSON.parse(savedProf));
      const savedHist = localStorage.getItem("pulsewatch-history");
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch {}
  }, []);

  // Live telemetry pulse simulation interval
  useEffect(() => {
    if (!telemetry.isStreaming) return;
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const pulseDelta = (Math.random() - 0.5) * 3;
        const newPulse = Math.min(100, Math.max(58, Math.round(prev.pulseRate + pulseDelta)));
        const pttDelta = (Math.random() - 0.5) * 4;
        const newPtt = Math.min(290, Math.max(220, Math.round(prev.pttDelay + pttDelta)));
        const gsrDelta = (Math.random() - 0.5) * 0.08;
        const newGsr = Math.min(3.5, Math.max(1.5, Number((prev.gsr + gsrDelta).toFixed(2))));
        
        return {
          ...prev,
          pulseRate: newPulse,
          pttDelay: newPtt,
          gsr: newGsr,
          lastSync: "Just now",
        };
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [telemetry.isStreaming]);

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem("pulsewatch-user-profile", JSON.stringify(next));
      return next;
    });
  };

  const toggleStreaming = () => {
    setTelemetry((prev) => ({ ...prev, isStreaming: !prev.isStreaming }));
  };

  const addReading = (reading: Omit<HistoryReading, "id">) => {
    setHistory((prev) => {
      const newEntry: HistoryReading = { id: Date.now(), ...reading };
      const next = [newEntry, ...prev];
      localStorage.setItem("pulsewatch-history", JSON.stringify(next));
      return next;
    });

    // Update telemetry state to reflect latest reading
    setTelemetry((prev) => ({
      ...prev,
      pulseRate: reading.pulseRate,
      spo2: reading.spo2,
      pttDelay: reading.pttDelay,
      temperature: reading.temp,
      gsr: reading.gsr,
      lastSync: "Just now",
    }));

    // If reading is anomalous, auto generate an alert!
    if (reading.pulseRate > 100 || reading.spo2 < 95 || reading.temp > 37.8) {
      const newAlert: AlertItem = {
        id: Date.now(),
        icon: reading.pulseRate > 100 ? "heart" : reading.spo2 < 95 ? "activity" : "flame",
        iconBg: "bg-[#FBE9E4]",
        title: reading.pulseRate > 100 ? "High Heart Rate Alert" : reading.spo2 < 95 ? "Low SpO₂ Detected" : "Elevated Temperature",
        description: `Live reading recorded ${reading.pulseRate} BPM / ${reading.spo2}% SpO₂.`,
        metric: `${reading.pulseRate} BPM`,
        metricLabel: "",
        badge: "High",
        badgeColor: "bg-[#FFEBEE] text-[#C62828]",
        source: "Hardware Sensor",
        date: "Today",
        time: new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(new Date()),
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  const addAlert = (alert: Omit<AlertItem, "id">) => {
    setAlerts((prev) => [{ id: Date.now(), ...alert }, ...prev]);
  };

  return (
    <DeviceProfileContext.Provider
      value={{
        profile,
        updateProfile,
        telemetry,
        toggleStreaming,
        history,
        addReading,
        alerts,
        addAlert,
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
