"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, UserPlus, LogIn } from "lucide-react";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      let msg = "Authentication failed. Please check your credentials.";
      if (err.code === "auth/configuration-not-found") {
        msg = "Email/Password sign-in is not enabled in Firebase Console for 'carepulse-2c4eb'. Please go to Firebase Console -> Authentication -> Sign-in method -> Email/Password and click Enable.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Invalid email or password. If you don't have an account, click 'Create Account'.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Please sign in.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setEmail("caregiver@pulsewatch.com");
    setPassword("pulsewatch123");
    setError(null);
    setLoading(true);
    try {
      await signIn("caregiver@pulsewatch.com", "pulsewatch123");
    } catch {
      // If demo user doesn't exist yet, create it!
      try {
        await signUp("caregiver@pulsewatch.com", "pulsewatch123");
      } catch (err: any) {
        setError(err.message || "Failed to sign in with demo account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FAF9F5] p-4 font-sans text-slate-800">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-coral text-white shadow-md">
            <Activity className="h-6 w-6" strokeWidth={2.4} />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
            PULSEWATCH
          </h1>
          <p className="mt-1.5 text-xs font-medium tracking-wide text-slate-500">
            AI-Assisted Wearable Health Risk-Screening Dashboard
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-paper-border bg-white p-7 shadow-xl">
          {/* Mode Switcher */}
          <div className="mb-6 flex rounded-xl bg-[#F7F6F0] p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-white text-ink shadow-xs"
                  : "text-slate-500 hover:text-ink"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-white text-ink shadow-xs"
                  : "text-slate-500 hover:text-ink"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-coral" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-paper-border bg-[#FAF9F5] px-3.5 py-2.5 focus-within:border-sage focus-within:bg-white transition-all">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  required
                  type="email"
                  placeholder="caregiver@pulsewatch.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-paper-border bg-[#FAF9F5] px-3.5 py-2.5 focus-within:border-sage focus-within:bg-white transition-all">
                <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-paper-border bg-[#FAF9F5] px-3.5 py-2.5 focus-within:border-sage focus-within:bg-white transition-all">
                  <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-deep-sage py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#2C3E2B] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : mode === "signin" ? (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Dashboard</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Login Shortcut */}
          <div className="mt-5 border-t border-paper-border pt-4 text-center">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage hover:underline cursor-pointer"
            >
              <span>Quick Demo Sign-In (caregiver@pulsewatch.com)</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Security / Non-diagnostic Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-sage shrink-0" />
          <span>Firebase Client Auth • Token verification verified by Flask backend</span>
        </div>
      </div>
    </div>
  );
}
