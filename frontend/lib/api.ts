/**
 * Pulsewatch Typed API Client
 * Base URL configurable via NEXT_PUBLIC_API_BASE_URL or VITE_API_BASE_URL.
 * Automatically attaches Firebase ID Token as Authorization: Bearer <token>.
 */

import {
  Profile,
  CreateProfileInput,
  PredictInput,
  PredictResponse,
  Reading,
  Alert,
} from "./types";
import { getFirebaseAuthToken } from "./firebase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000";

/**
 * Retrieves Firebase Auth ID token and attaches Authorization: Bearer <token>
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const token = await getFirebaseAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("Error attaching Firebase Authorization token:", err);
  }

  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `API request failed: ${res.status} ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData?.error) errorMsg = errData.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
export async function getHealth(): Promise<{ status: string; environment?: string; database_connected?: boolean }> {
  return request("/api/health");
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------
export async function getProfiles(): Promise<Profile[]> {
  return request<Profile[]>("/api/profiles");
}

export async function createProfile(data: CreateProfileInput): Promise<Profile> {
  return request<Profile>("/api/profiles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProfile(id: string): Promise<Profile> {
  return request<Profile>(`/api/profiles/${id}`);
}

// ---------------------------------------------------------------------------
// Predict / Scoring
// ---------------------------------------------------------------------------
export async function predictReading(data: PredictInput): Promise<PredictResponse> {
  return request<PredictResponse>("/api/predict", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Readings History
// ---------------------------------------------------------------------------
export async function getReadings(profileId: string, limit: number = 50): Promise<Reading[]> {
  return request<Reading[]>(`/api/profiles/${profileId}/readings?limit=${limit}`);
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
export async function getAlerts(profileId: string, unacknowledged?: boolean): Promise<Alert[]> {
  const query = unacknowledged ? "?unacknowledged=true" : "";
  return request<Alert[]>(`/api/profiles/${profileId}/alerts${query}`);
}

export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  return request<Alert>(`/api/alerts/${alertId}/acknowledge`, {
    method: "POST",
  });
}
