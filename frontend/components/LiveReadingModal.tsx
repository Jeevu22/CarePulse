"use client";

import React, { useState, useEffect } from "react";

interface LiveReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function LiveReadingModal({
  isOpen,
  onClose,
  onComplete,
}: LiveReadingModalProps) {
  const [seconds, setSeconds] = useState<number>(15);
  const [pulse, setPulse] = useState<number>(72);
  const [temp, setTemp] = useState<number>(36.6);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Countdown timer simulation
  useEffect(() => {
    if (!isOpen) {
      setSeconds(15);
      setIsCompleted(false);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });

      // Simulate live vital fluctuations during capture
      setPulse(() => 70 + Math.floor(Math.random() * 5));
      setTemp((prev) => {
        const delta = (Math.random() - 0.5) * 0.1;
        return Number((prev + delta).toFixed(1));
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  // Radial progress constants
  const size = 140;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Progress fraction represents time elapsed
  const timeElapsed = 15 - seconds;
  const strokeDashoffset = circumference - (timeElapsed / 15) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark-slate/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-paper-white rounded-2xl border border-paper-border shadow-2xl p-6 md:p-8 z-10 overflow-hidden transform scale-100 transition-all duration-300 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper-border/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <h3 className="font-serif text-lg font-bold text-dark-slate">
              Real-time Sensor Capture
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-warm-sage/50"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Core content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Progress Ring (Span 5) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center gap-3">
            <div className="relative w-[140px] h-[140px] flex items-center justify-center">
              
              {/* SVG Ring */}
              <svg className="absolute transform -rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#F2F0E6"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={isCompleted ? "#5E8152" : "#E0654A"}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>

              {/* Progress text */}
              <div className="z-10 flex flex-col items-center justify-center text-center">
                {isCompleted ? (
                  <span className="font-serif text-sm font-bold text-sage-green animate-bounce">
                    Completed
                  </span>
                ) : (
                  <>
                    <span className="font-mono text-2xl font-bold text-dark-slate">
                      {seconds}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">
                      Seconds Left
                    </span>
                  </>
                )}
              </div>

            </div>
            
            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">
              {isCompleted ? "Analysis Ready" : `${timeElapsed} / 15 seconds elapsed`}
            </p>
          </div>

          {/* Right Column: Sensor Data Stream (Span 7) */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <h4 className="font-serif text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Active Sensor Feeds
            </h4>

            {/* Vitals rows */}
            <div className="flex flex-col gap-2.5">
              
              {/* Finger Pulse */}
              <div className="bg-warm-sage/40 rounded-xl border border-paper-border/60 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-coral fill-current animate-pulse" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="text-xs font-semibold text-slate-600 font-sans">Finger Pulse</span>
                </div>
                <span className="font-mono text-sm font-bold text-dark-slate">
                  {isCompleted ? "72 BPM" : `${pulse} BPM`}
                </span>
              </div>

              {/* ECG Signal */}
              <div className="bg-warm-sage/40 rounded-xl border border-paper-border/60 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-sage-green fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-600 font-sans">ECG Signal</span>
                </div>
                <span className={`font-mono text-xs font-bold ${isCompleted ? "text-sage-green" : "text-sage-green animate-pulse"}`}>
                  Good
                </span>
              </div>

              {/* Body Temperature */}
              <div className="bg-warm-sage/40 rounded-xl border border-paper-border/60 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-amber-500 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-600 font-sans">Body Temperature</span>
                </div>
                <span className="font-mono text-sm font-bold text-dark-slate">
                  {isCompleted ? "36.6 °C" : `${temp} °C`}
                </span>
              </div>

              {/* Skin Response */}
              <div className="bg-warm-sage/40 rounded-xl border border-paper-border/60 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-cyan-500 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707-.707m12.728 0l-.707.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-600 font-sans">Skin Response</span>
                </div>
                <span className="font-mono text-xs font-bold text-dark-slate">
                  Balanced
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Area with Badges & Tips */}
        <div className="flex flex-col gap-3.5 mt-2 border-t border-paper-border/80 pt-4">
          
          {/* Encryption notice */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans font-medium bg-warm-sage/20 border border-paper-border/40 py-2 px-3 rounded-xl justify-center">
            <svg className="w-3.5 h-3.5 text-sage-green fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure 256-bit Encrypted Stream • HIPAA compliant protocol active</span>
          </div>

          {/* Guidelines tip */}
          <div className="bg-rose-50/30 border border-rose-100/50 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed font-sans flex items-start gap-2.5">
            <span className="text-coral shrink-0 mt-0.5">ℹ</span>
            <p>
              <strong className="text-dark-slate font-semibold">Health Tip:</strong> Keep your arm resting flat on a stable surface and maintain normal breathing during the vital capture. Avoid speaking or movement.
            </p>
          </div>

          {/* Action button if completed */}
          {isCompleted && (
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-sage-green hover:bg-sage-green-light active:bg-sage-green text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(94,129,82,0.15)] mt-2"
            >
              Analyze Collected Vitals
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
