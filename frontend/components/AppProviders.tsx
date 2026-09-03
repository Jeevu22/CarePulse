"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/lib/authContext";
import { DeviceProfileProvider } from "./DeviceProfileContext";
import UserProfileModal from "./UserProfileModal";
import AuthScreen from "./AuthScreen";
import { Activity } from "lucide-react";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FAF9F5]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral text-white shadow-md animate-pulse">
          <Activity className="h-6 w-6" strokeWidth={2.4} />
        </div>
        <p className="mt-4 font-serif text-lg font-bold text-ink">PULSEWATCH</p>
        <p className="mt-1 text-xs text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <DeviceProfileProvider>
      {children}
      <UserProfileModal />
    </DeviceProfileProvider>
  );
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
