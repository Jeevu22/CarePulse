"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Download, ChevronLeft, ChevronRight, Edit2, RefreshCw, Plus, MessageSquare, Phone, Lock, CheckCircle2, Heart, Calendar } from "lucide-react";

const familyMembers = [
  { name:"Father", age:68, role:"Primary Monitored Profile", score:72, lastCheckIn:"May 23, 2025", avatar:"👴", selected:true },
  { name:"Mother", age:64, role:"Secondary Profile", score:65, lastCheckIn:"May 21, 2025", avatar:"👩", selected:false },
  { name:"Self", age:26, role:"Active Profile", score:82, lastCheckIn:"May 23, 2025", avatar:"👦", selected:false },
  { name:"Spouse", age:24, role:"Secondary Profile", score:68, lastCheckIn:"May 23, 2025", avatar:"👧", selected:false },
];

const biometrics = [
  { label:"Full Name", val:"Rajesh Sharma" },
  { label:"Date of Birth", val:"May 12, 1957" },
  { label:"Age", val:"68 years" },
  { label:"Gender", val:"Male" },
  { label:"Height", val:"168 cm" },
  { label:"Weight", val:"72 kg" },
  { label:"BMI", val:"25.5", badge:"Overweight", badgeColor:"bg-[#FFF3E0] text-[#E65100]" },
];

const biometrics2 = [
  { label:"Blood Group", val:"O+" },
  { label:"Occupation", val:"Retired" },
  { label:"Lifestyle", val:"Moderately Active" },
  { label:"Smoking Status", val:"Non-Smoker" },
  { label:"Alcohol Consumption", val:"Occasional" },
  { label:"Diet Type", val:"Balanced" },
  { label:"Sleep Duration", val:"6.5 hrs (avg)" },
];

const baselines = [
  { label:"Resting Heart Rate", val:"72 bpm", status:"Normal" },
  { label:"Baseline PTT", val:"248 ms", status:"Normal" },
  { label:"HRV (SDNN)", val:"48 ms", status:"Normal" },
  { label:"Blood Pressure", val:"118/76 mmHg", status:"Normal" },
  { label:"Blood Glucose (Fasting)", val:"92 mg/dL", status:"Normal" },
  { label:"SpO₂ (Avg)", val:"98 %", status:"Normal" },
  { label:"Skin Temp (Avg)", val:"33.2 °C", status:"Normal" },
];

import { useDeviceProfile } from "@/components/DeviceProfileContext";

export default function HealthProfilePage() {
  const { profile, openProfileModal, telemetry } = useDeviceProfile();
  const [selectedMember, setSelectedMember] = useState(0);

  const biometrics = [
    { label:"Full Name", val: profile.name },
    { label:"Date of Birth", val:"May 12, 1957" },
    { label:"Age", val:`${profile.age} years` },
    { label:"Gender", val: profile.gender },
    { label:"Height", val: profile.height },
    { label:"Weight", val: profile.weight },
    { label:"BMI", val:"25.5", badge:"Overweight", badgeColor:"bg-[#FFF3E0] text-[#E65100]" },
  ];

  const biometrics2 = [
    { label:"Blood Group", val: profile.bloodGroup },
    { label:"Occupation", val:"Engineer / Executive" },
    { label:"Lifestyle", val:"Moderately Active" },
    { label:"Smoking Status", val:"Non-Smoker" },
    { label:"Alcohol Consumption", val:"Occasional" },
    { label:"Diet Type", val:"Balanced" },
    { label:"Sleep Duration", val:"6.5 hrs (avg)" },
  ];

  const baselines = [
    { label:"Resting Heart Rate", val:`${telemetry.pulseRate} bpm`, status:"Normal" },
    { label:"Baseline PTT", val:`${telemetry.pttDelay} ms`, status:"Normal" },
    { label:"HRV (SDNN)", val:"48 ms", status:"Normal" },
    { label:"Blood Pressure", val:`${telemetry.systolic}/${telemetry.diastolic} mmHg`, status:"Normal" },
    { label:"Blood Glucose (Fasting)", val:"92 mg/dL", status:"Normal" },
    { label:"SpO₂ (Avg)", val:`${telemetry.spo2} %`, status:"Normal" },
    { label:"Skin Temp (Avg)", val:`${telemetry.temperature} °C`, status:"Normal" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 lg:py-7">
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">Health Profile</h1>
              <p className="mt-1 text-[13px] text-slate-500">Manage and update your personal health information and monitoring preferences.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-paper-border bg-white px-3.5 py-2 text-[12px] text-slate-600 shadow-2xs">
                <Calendar className="h-4 w-4 text-slate-400" />Apr 23 – May 23, 2025
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-deep-sage px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#2C3E2B]">
                <Download className="h-4 w-4" />Export Profile
              </button>
            </div>
          </header>

          <div className="flex gap-6">
            <div className="flex-1 min-w-0 space-y-5">
              {/* Family Profile Selector */}
              <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-ink">Select Profile</h2>
                    <p className="text-[12px] text-slate-500">Choose a family member to view or update their health profile.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-paper-border bg-white hover:bg-gray-50"><ChevronLeft className="h-4 w-4 text-slate-400" /></button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-paper-border bg-white hover:bg-gray-50"><ChevronRight className="h-4 w-4 text-slate-400" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {familyMembers.map((m,i)=>(
                    <button key={m.name} onClick={()=>setSelectedMember(i)} className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${i===selectedMember?"border-deep-sage bg-[#F2F7EF]":"border-paper-border bg-white hover:border-gray-300"}`}>
                      {i===selectedMember && <div className="absolute right-2.5 top-2.5"><CheckCircle2 className="h-4 w-4 text-deep-sage" /></div>}
                      <div className="mb-2 text-3xl">{m.avatar}</div>
                      <p className="text-[14px] font-bold text-ink">{m.name}</p>
                      <p className="text-[12px] text-slate-500">{m.age} years</p>
                      <span className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${i===0?"bg-[#E3F0E4] text-sage":i===2?"bg-[#E8F0FF] text-blue-600":"bg-[#FFF3E0] text-[#E65100]"}`}>{m.role}</span>
                      <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                        <div><Heart className="h-3 w-3 text-coral inline-block mr-0.5" /><span>Health Score</span><p className="font-bold text-ink text-[13px]">{m.score}<span className="text-slate-400 font-normal">/100</span></p></div>
                        <div><Calendar className="h-3 w-3 text-slate-400 inline-block mr-0.5" /><span>Last Check-in</span><p className="font-semibold text-ink text-[11px]">{m.lastCheckIn}</p></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Biometrics */}
              <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-ink">Personal Biometrics</h2>
                    <p className="text-[12px] text-slate-500">Key personal details and baseline health information.</p>
                  </div>
                  <button onClick={openProfileModal} className="flex items-center gap-1.5 text-[12px] font-semibold text-sage hover:underline">
                    <Edit2 className="h-3.5 w-3.5" />Edit Information
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4 lg:grid-cols-7">
                  {biometrics.map(b=>(
                    <div key={b.label}>
                      <p className="text-[10px] text-slate-400 mb-0.5">{b.label}</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-semibold text-ink">{b.val}</p>
                        {b.badge && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${b.badgeColor}`}>{b.badge}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-4 border-t border-paper-border pt-4 lg:grid-cols-7">
                  {biometrics2.map(b=>(
                    <div key={b.label}>
                      <p className="text-[10px] text-slate-400 mb-0.5">{b.label}</p>
                      <p className="text-[13px] font-semibold text-ink">{b.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calibration Baselines */}
              <div className="rounded-xl border border-paper-border bg-white p-5 shadow-2xs">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-ink">Sensor Calibration Baselines</h2>
                    <p className="text-[12px] text-slate-500">Device and sensor baseline readings for accurate monitoring.</p>
                  </div>
                  <button className="flex items-center gap-1.5 rounded-lg border border-paper-border bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-gray-50">
                    <RefreshCw className="h-3.5 w-3.5" />Recalibrate Sensors
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-7">
                  {baselines.map(b=>(
                    <div key={b.label} className="rounded-xl border border-paper-border p-3.5">
                      <p className="text-[10px] text-slate-400 mb-1">{b.label}</p>
                      <p className="text-[14px] font-bold text-ink leading-tight">{b.val}</p>
                      <p className="mt-1 text-[11px] font-semibold text-sage">{b.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="w-64 shrink-0 space-y-4">
              {/* Profile Summary */}
              <div className="rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
                <div className="mb-3 flex items-center gap-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E3F0E4]"><Lock className="h-3.5 w-3.5 text-sage" /></div>
                  <h3 className="text-[13px] font-semibold text-ink">Profile Summary</h3>
                </div>
                {[
                  { label:"Primary Condition", val:"Hypertension (Controlled)" },
                  { label:"Monitoring Since", val:"Jan 15, 2024" },
                  { label:"Health Goal", val:"Maintain heart health & mobility" },
                  { label:"Last Health Assessment", val:"May 10, 2025" },
                ].map(item=>(
                  <div key={item.label} className="flex items-start justify-between border-b border-paper-border py-2 last:border-0 gap-2">
                    <span className="text-[11px] text-slate-500 shrink-0">{item.label}</span>
                    <span className="text-[11px] font-semibold text-ink text-right">{item.val}</span>
                  </div>
                ))}
                <button className="mt-2 text-[12px] font-semibold text-sage hover:underline">View Full Health Summary →</button>
              </div>

              {/* Emergency Contacts */}
              <div className="rounded-xl border border-paper-border bg-white p-4 shadow-2xs">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-ink">Emergency Contacts</h3>
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-sage hover:underline"><Plus className="h-3 w-3" />Add Contact</button>
                </div>
                {[
                  { name:"Rahul Sharma", role:"Son", phone:"+91 98765 43210", badge:"Primary", badgeClass:"bg-[#E3F0E4] text-sage" },
                  { name:"Neha Sharma", role:"Daughter", phone:"+91 91234 56789", badge:"Secondary", badgeClass:"bg-[#FFF3E0] text-[#E65100]" },
                ].map(contact=>(
                  <div key={contact.name} className="mb-3 last:mb-0 rounded-xl border border-paper-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F6F0] text-[14px]">👤</div>
                        <div>
                          <p className="text-[12px] font-semibold text-ink">{contact.name}</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${contact.badgeClass}`}>{contact.badge}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100"><MessageSquare className="h-3.5 w-3.5 text-slate-400" /></button>
                        <button className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100"><Phone className="h-3.5 w-3.5 text-slate-400" /></button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">{contact.phone}</p>
                  </div>
                ))}
              </div>

              {/* Privacy Notice */}
              <div className="rounded-xl border border-paper-border bg-[#FAFAF8] p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <p className="text-[12px] font-semibold text-slate-600">Your health data is encrypted and secure.</p>
                </div>
                <p className="text-[11px] text-slate-500">Only authorized users can access this profile.</p>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
