/**
 * Pulsewatch Core Types & Interfaces
 * Matches backend Flask models and scoring engine response shapes.
 */

export interface ProfileBaseline {
  heartRate: number;
  spo2: number;
  systolic: number;
  diastolic: number;
  sdnn: number;
}

export interface Profile {
  id: string;
  ownerId: string;
  name: string;
  age: number;
  sex: string;
  relation: string;
  baseline: ProfileBaseline;
  createdAt: string;
}

export interface CreateProfileInput {
  name: string;
  age?: number;
  sex?: string;
  relation?: string;
  baselineHeartRate?: number;
  baselineSpo2?: number;
  baselineSystolic?: number;
  baselineDiastolic?: number;
  baselineSdnn?: number;
}

export interface PredictModuleResult {
  available: boolean;
  score: number | null;
  band: "normal" | "elevated" | "moderate" | "high" | "critical" | null;
  label: string;
  detail: string;
  metrics?: Record<string, any>;
}

export interface PredictModules {
  heartDisease: PredictModuleResult;
  hypertension: PredictModuleResult;
  deterioration: PredictModuleResult;
  stress: PredictModuleResult;
}

export interface PredictResultData {
  overallBand: "normal" | "elevated" | "moderate" | "high" | "critical" | null;
  disclaimer: string;
  modules: PredictModules;
}

export interface PredictResponse {
  status: string;
  engine: string;
  readingId?: string;
  result: PredictResultData;
}

export interface PredictInput {
  profile_id?: string;
  heart_rate: number;
  spo2: number;
  temperature?: number;
  systolic?: number;
  diastolic?: number;
  bp?: {
    systolic?: number;
    diastolic?: number;
  };
  ptt_ms?: number;
  rr_intervals_ms?: number[];
  eda_microsiemens?: number;
  respiratory_rate?: number;
  consciousness?: "alert" | "voice" | "pain" | "unresponsive" | string;
}

export interface Reading {
  id: string;
  profileId: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  bp: {
    systolic: number;
    diastolic: number;
  };
  pttMs: number;
  edaMicrosiemens: number;
  respiratoryRate: number;
  consciousness: string;
  result: PredictResultData | null;
  recordedAt: string;
}

export interface Alert {
  id: string;
  profileId: string;
  readingId: string | null;
  category: "heart" | "bp" | "deterioration" | "stress" | string;
  severity: "info" | "warning" | "critical";
  message: string;
  acknowledged: boolean;
  createdAt: string;
}
