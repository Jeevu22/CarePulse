import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, CheckCircle2, Clock3 } from "lucide-react";

const pageContent: Record<string, { title: string; description: string; items: string[] }> = {
  "risk-analysis": {
    title: "Risk analysis",
    description: "Review the latest screening signals and understand what changed.",
    items: ["Cardiovascular risk factors", "Blood pressure pattern", "Oxygenation and respiratory trend", "Stress and recovery indicators"],
  },
  "trend-reports": {
    title: "Trend reports",
    description: "A longitudinal view of your recorded screening parameters.",
    items: ["30-day vital parameter trend", "Weekly screening consistency", "Risk score movement", "Clinician discussion points"],
  },
  "health-profile": {
    title: "Health profile",
    description: "Keep the information used to personalize your screening experience current.",
    items: ["Patient identity and contact details", "Known conditions and allergies", "Medications and care team", "Preferred measurement units"],
  },
  alerts: {
    title: "Alerts",
    description: "Review reminders and safety notices associated with your readings.",
    items: ["No urgent alerts", "Next screening reminder", "Measurement quality reminders", "Care-team follow-up status"],
  },
  history: {
    title: "Screening history",
    description: "Access previous readings and downloaded reports.",
    items: ["Latest screening", "Previous 7-day average", "Saved clinical reports", "Export history"],
  },
  settings: {
    title: "Settings",
    description: "Configure your account, privacy, and notification preferences.",
    items: ["Notification preferences", "Privacy and data controls", "Units and accessibility", "Sign out of this device"],
  },
};

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const content = pageContent[section] ?? {
    title: "Page not found",
    description: "This PulseWatch destination is not available.",
    items: [],
  };
  return (
    <div className="min-h-screen bg-sage-paper p-4 lg:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1440px] overflow-hidden rounded-3xl border border-paper-border bg-canvas">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10 lg:py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-sage hover:underline"><ArrowLeft className="h-4 w-4" /> Back to overview</Link>
          <div className="mt-8 max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sage">PulseWatch workspace</p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-ink">{content.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{content.description}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {content.items.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-paper-border bg-white p-4 shadow-2xs">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-sage" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#DDE8D8] bg-[#F2F7EF] p-4 text-xs leading-relaxed text-slate-600">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <p>PulseWatch is a screening and tracking tool. It does not diagnose emergencies. If you have severe symptoms, contact local emergency services.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
