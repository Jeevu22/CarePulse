"use client";

import React, { useState, useEffect } from "react";

interface PredictionResult {
  status: string;
  confidence: number;
  recommendation: string;
}

export default function Dashboard() {
  // Input states
  const [heartRate, setHeartRate] = useState<number>(75);
  const [spo2, setSpo2] = useState<number>(98);
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);

  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>(["Core diagnostic stream listening."]);

  // Live telemetry (simulated)
  const [liveHeartRate, setLiveHeartRate] = useState<number>(72);
  const [liveSpo2, setLiveSpo2] = useState<number>(98);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveHeartRate((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const next = prev + delta;
        return Math.min(Math.max(next, 60), 100);
      });
      setLiveSpo2((prev) => {
        const rand = Math.random();
        if (rand > 0.85) {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const next = prev + delta;
          return Math.min(Math.max(next, 95), 100);
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const logMsg = `Querying AI models: HR=${heartRate}, SpO2=${spo2}%, BP=${systolic}/${diastolic}...`;
    setLogs((prev) => [logMsg, ...prev]);

    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          heart_rate: heartRate,
          spo2: spo2,
          bp: {
            systolic,
            diastolic
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned code ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setLogs((prev) => [`Successfully received prediction: ${data.prediction.status}`, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to Flask backend. Please ensure the backend server is running on port 5000.");
      setLogs((prev) => [`[ERROR] Connection failed: ${err.message}`, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Vitals & Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Heart Rate Stat Card */}
        <div className="bg-paper-white rounded-2xl border border-paper-border p-6 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-coral/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif text-xs font-bold text-slate-500 uppercase tracking-wider">
                Telemetry HR
              </span>
              <span className="w-2 h-2 rounded-full bg-coral animate-ping"></span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-mono text-4xl font-bold text-dark-slate">
                {liveHeartRate}
              </span>
              <span className="text-xs font-sans text-slate-500 font-semibold uppercase tracking-wider">
                BPM
              </span>
            </div>
          </div>
          <div className="w-full h-10 mt-3 relative overflow-hidden bg-warm-sage/30 rounded-lg border border-paper-border/60">
            <svg className="absolute bottom-0 w-full h-full text-coral/20" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 20 L20 20 L25 5 L30 35 L35 20 L60 20 L65 5 L70 35 L75 20 L100 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <svg className="absolute bottom-0 w-full h-full text-coral" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path
                d="M0 20 L20 20 L25 5 L30 35 L35 20 L60 20 L65 5 L70 35 L75 20 L100 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="100"
                strokeDashoffset="100"
                style={{ animation: "draw 1.5s infinite linear" }}
              />
            </svg>
          </div>
        </div>

        {/* Oxygen Saturation Card */}
        <div className="bg-paper-white rounded-2xl border border-paper-border p-6 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sage-green/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif text-xs font-bold text-slate-500 uppercase tracking-wider">
                Telemetry SpO₂
              </span>
              <span className="w-2 h-2 rounded-full bg-sage-green"></span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-mono text-4xl font-bold text-dark-slate">
                {liveSpo2}
              </span>
              <span className="text-xs font-sans text-slate-500 font-semibold uppercase tracking-wider">
                %
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-3 py-1 bg-warm-sage/30 rounded border border-paper-border/60 text-center font-medium">
            Pulse Oximetry Level: Optimal Range
          </div>
        </div>

        {/* System Diagnostics Status Card */}
        <div className="bg-paper-white rounded-2xl border border-paper-border p-6 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif text-xs font-bold text-slate-500 uppercase tracking-wider">
                Neural Model Status
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sage-green/10 text-sage-green text-[10px] font-bold border border-sage-green/10">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Neural anomaly classifier connected. Listening to localized Flask endpoint on port 5000.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-3">
            Inference latency: &lt; 5ms
          </div>
        </div>

      </div>

      {/* Analytics Entry Form & Report Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Diagnostic parameters Form Card */}
        <div className="lg:col-span-7 bg-paper-white rounded-2xl border border-paper-border p-6 shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-paper-border/80">
            <h3 className="font-serif text-lg font-bold text-dark-slate">
              Screening Parameters
            </h3>
          </div>

          <form onSubmit={handlePredict} className="flex flex-col gap-6">
            
            {/* Heart Rate Parameter */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500 font-sans uppercase tracking-wider">Heart Rate</span>
                <span className="font-mono text-sm font-bold text-coral">{heartRate} BPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full accent-sage-green bg-warm-sage h-1.5 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>40</span>
                <span>100 (Upper Norm)</span>
                <span>160</span>
              </div>
            </div>

            {/* SpO2 Parameter */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500 font-sans uppercase tracking-wider">Oxygen Saturation (SpO₂)</span>
                <span className="font-mono text-sm font-bold text-sage-green">{spo2}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="100"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full accent-sage-green bg-warm-sage h-1.5 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>80%</span>
                <span>95% (Lower Norm)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Blood Pressure Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-500 font-sans uppercase tracking-wider">Systolic BP</span>
                  <span className="font-mono text-sm font-bold text-dark-slate">{systolic} mmHg</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="180"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-full accent-sage-green bg-warm-sage h-1.5 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-500 font-sans uppercase tracking-wider">Diastolic BP</span>
                  <span className="font-mono text-sm font-bold text-dark-slate">{diastolic} mmHg</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="110"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  className="w-full accent-sage-green bg-warm-sage h-1.5 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-sage-green hover:bg-sage-green-light active:bg-sage-green text-white font-sans text-sm font-semibold tracking-wider transition-all shadow-[0_4px_16px_rgba(94,129,82,0.15)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing vital metrics...</span>
                </>
              ) : (
                <span>Analyze Pulse & Vitals</span>
              )}
            </button>

          </form>
        </div>

        {/* Diagnosis & Logs Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Diagnostic Assessment Report */}
          <div className="bg-paper-white rounded-2xl border border-paper-border p-6 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex-1 flex flex-col justify-between min-h-[220px]">
            <div>
              <h3 className="font-serif text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Clinical Diagnostics
              </h3>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-1.5">
                  <span className="font-bold font-serif text-sm">Connection Warning</span>
                  <span>{error}</span>
                  <span className="text-[10px] text-rose-600 bg-rose-100/50 px-2 py-1 rounded mt-1 font-mono">
                    Terminal tip: `python app.py`
                  </span>
                </div>
              )}

              {!prediction && !error && (
                <div className="text-center py-10 text-slate-400 flex flex-col items-center justify-center gap-3">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-xs font-medium">Select your vitals on the left and submit.</p>
                </div>
              )}

              {prediction && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-paper-border/60 pb-3">
                    <span className="text-xs font-semibold text-slate-500 font-sans uppercase">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                      prediction.status.includes("Normal")
                        ? "bg-sage-green/10 text-sage-green border-sage-green/20"
                        : "bg-coral/10 text-coral border-coral/20"
                    }`}>
                      {prediction.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 font-sans uppercase">Confidence Score</span>
                    <span className="text-xs font-mono font-bold text-dark-slate">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="bg-warm-sage/40 p-4 rounded-xl border border-paper-border/60">
                    <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-sans mb-1">
                      Clinical Recommendation
                    </p>
                    <p className="text-xs leading-relaxed text-slate-700 font-sans">
                      {prediction.recommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {prediction && (
              <div className="mt-4 pt-3 border-t border-paper-border/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Ref: StandardDiagnostics v1</span>
                <span>Latency: ~4ms</span>
              </div>
            )}
          </div>

          {/* Console / Diagnostics Logs */}
          <div className="bg-paper-white rounded-2xl border border-paper-border p-4 shadow-[0_4px_16px_rgba(0,0,0,0.015)] h-[150px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Telemetry Log Output
              </span>
              <button
                onClick={() => setLogs(["Log cleared."])}
                className="text-[9px] text-slate-400 hover:text-slate-600 transition-colors font-sans"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 bg-warm-sage/30 rounded-xl border border-paper-border/60 p-3 font-mono text-[9px] leading-relaxed text-slate-500 overflow-y-auto flex flex-col gap-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-400 shrink-0">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
