"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  FolderTree,
  HeartPulse,
  Stethoscope,
  Brain,
  RotateCcw,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "./Reveal";

type Feature = {
  icon: LucideIcon;
  title: string;
  category: string;
  desc: string;
  highlight: string;
};

const FEATURES: Feature[] = [
  {
    icon: FileText,
    title: "In-Browser Medical PDF Studio",
    category: "Study Tool",
    desc: "Upload textbook chapters, drug guides, or hospital protocol PDFs. Review and edit the extracted clinical text client-side before synthesizing flashcards.",
    highlight: "100% In-Browser Privacy · Zero Uploads",
  },
  {
    icon: FolderTree,
    title: "Clinical Department Folders",
    category: "Organization",
    desc: "Create and organize decks into clinical specialties: Pharmacology, Med-Surg, Maternal & Newborn, NCLEX-RN Prep, and Critical Care.",
    highlight: "Specialty Organization & Quick Filters",
  },
  {
    icon: HeartPulse,
    title: "High-Alert Medication Safety",
    category: "Pharmacology",
    desc: "Specialized flashcard formulations for narrow therapeutic index drugs: Digoxin, Heparin, Insulin, Warfarin, and Potassium chloride administration.",
    highlight: "Toxicities, Antidotes & Lab Triggers",
  },
  {
    icon: Stethoscope,
    title: "Prioritization & Delegation Framework",
    category: "NCLEX-RN",
    desc: "Master emergency triage and the EAT framework (Do not delegate Evaluation, Assessment, or Teaching to LPN/UAP) with high-yield clinical scenarios.",
    highlight: "Next-Gen NCLEX Clinical Judgment",
  },
  {
    icon: Brain,
    title: "Active Recall & Distractor Analysis",
    category: "Retention",
    desc: "Every card includes plausible distractors and evidence-based rationales explaining why the wrong answers fail, reinforcing critical clinical judgment.",
    highlight: "Diagnostic Logic & Memory Mnemonics",
  },
  {
    icon: RotateCcw,
    title: "Shift-Optimized SM-2 Repetition",
    category: "Algorithm",
    desc: "Intelligent scheduling intervals (Again, Hard, Good, Easy) calibrate based on your recall accuracy, keeping review queues manageable during 12-hour shifts.",
    highlight: "Fatigue-Free Daily Review Quotas",
  },
  {
    icon: Smartphone,
    title: "Multi-Device Clinical Responsiveness",
    category: "Cross-Platform",
    desc: "Seamless responsive interface tailored for clinic tablets, bedside smartphones, and desktop study setups with zero horizontal scroll overflow.",
    highlight: "Mobile, Tablet & Desktop Ready",
  },
];

export default function ClinicalFeatures() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % FEATURES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const feat = FEATURES[active];

  return (
    <Section id="features" className="bg-[#fefaf3]">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#84a282]">
          Built for Healthcare Education
        </p>
        <h2 className="mt-3 font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#19251a]">
          Features tailored strictly for <br />
          medical and nursing mastery.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#586c5a] leading-relaxed">
          Zero generic software flashcards. Every screen, card generator, and folder is tailored for clinical pharmacology, pathophysiology, and patient care.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Feature tabs */}
        <div className="lg:col-span-5 space-y-2">
          {FEATURES.map((f, i) => {
            const isSelected = active === i;
            const Icon = f.icon;
            return (
              <button
                key={f.title}
                type="button"
                onClick={() => setActive(i)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                  isSelected
                    ? "bg-white border-[#84a282] shadow-md shadow-[#84a282]/10 ring-1 ring-[#84a282]/30"
                    : "bg-white/40 border-transparent hover:bg-white/80 hover:border-[#dfe8dc]"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#84a282] text-white shadow-sm"
                        : "bg-[#b8cfb3]/25 text-[#19251a]"
                    }`}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </span>
                  <div>
                    <span className="block text-sm font-bold text-[#19251a]">
                      {f.title}
                    </span>
                    <span className="block text-xs text-[#586c5a]">
                      {f.category}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className={`text-[#84a282] transition-transform ${
                    isSelected ? "translate-x-1 opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right column: Active Feature Interactive Preview Canvas */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-white border border-[#dfe8dc] p-6 sm:p-9 shadow-xl shadow-black/5 flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#b8cfb3]/30 text-[#19251a]">
                  {feat.category}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f6e2e9] text-[#703348]">
                  {feat.highlight}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-[#19251a] mb-3">
                {feat.title}
              </h3>
              <p className="text-base text-[#586c5a] leading-relaxed mb-8">
                {feat.desc}
              </p>

              {/* Specific Visual Mockups for Features */}
              <div className="rounded-2xl bg-[#fefaf3] border border-[#dfe8dc] p-5">
                {active === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#586c5a] pb-2 border-b border-[#dfe8dc]">
                      <span className="flex items-center gap-1.5 text-[#19251a]">
                        <FileText size={14} className="text-[#84a282]" />
                        Harrison_Principles_Cardio_Ch4.pdf
                      </span>
                      <span className="text-[#84a282] font-bold">Extracted Cleanly</span>
                    </div>
                    <p className="text-xs text-[#19251a] leading-relaxed italic bg-white p-3 rounded-lg border border-[#dfe8dc]">
                      "Nitroglycerin sublingual tablets should be taken 1 tab every 5 minutes up to 3 doses for acute angina. Call 911 if pain unrelieved after dose 1."
                    </p>
                  </div>
                )}

                {active === 1 && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-[#dfe8dc]">
                      <span className="font-bold text-[#19251a] block mb-1">📁 Pharmacology</span>
                      <span className="text-[#586c5a]">3 Decks · 48 Cards</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#dfe8dc]">
                      <span className="font-bold text-[#19251a] block mb-1">📁 Medical-Surgical</span>
                      <span className="text-[#586c5a]">4 Decks · 62 Cards</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#dfe8dc]">
                      <span className="font-bold text-[#19251a] block mb-1">📁 NCLEX-RN Prep</span>
                      <span className="text-[#586c5a]">5 Decks · 85 Cards</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#dfe8dc]">
                      <span className="font-bold text-[#19251a] block mb-1">📁 Maternal & Pediatrics</span>
                      <span className="text-[#586c5a]">3 Decks · 38 Cards</span>
                    </div>
                  </div>
                )}

                {active === 2 && (
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                      <span className="font-bold text-red-900 block">⚠️ Digoxin Toxicity Alert</span>
                      <span className="text-red-700">Hold if apical pulse &lt; 60 bpm. Antidote: DigiFab. Toxic range: &gt; 2.0 ng/mL.</span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="font-bold text-amber-900 block">⚠️ Heparin-Induced Thrombocytopenia (HIT)</span>
                      <span className="text-amber-700">Monitor aPTT (target 1.5–2.5x normal) & platelet counts. Antidote: Protamine sulfate.</span>
                    </div>
                  </div>
                )}

                {active === 3 && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-[#dfe8dc]">
                      <span className="font-bold text-[#19251a] block mb-1">EAT Delegation Framework</span>
                      <p className="text-[#586c5a]">
                        <strong className="text-[#84a282]">E</strong> - Evaluation (Do NOT delegate)<br />
                        <strong className="text-[#84a282]">A</strong> - Assessment (Do NOT delegate)<br />
                        <strong className="text-[#84a282]">T</strong> - Teaching (Do NOT delegate)
                      </p>
                    </div>
                  </div>
                )}

                {active === 4 && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-[#dfe8dc]">
                      <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        Distractor Rationale
                      </span>
                      <p className="mt-1 text-[#19251a]">
                        "Administering Potassium IV Push is FATAL. Potassium must NEVER be given IV push or bolus—always diluted on an infusion pump."
                      </p>
                    </div>
                  </div>
                )}

                {active === 5 && (
                  <div className="space-y-2 text-xs text-center py-2">
                    <div className="inline-flex items-center gap-3 p-3 bg-white rounded-xl border border-[#dfe8dc] shadow-sm">
                      <div className="text-center">
                        <span className="text-lg font-bold text-[#84a282]">SM-2</span>
                        <span className="block text-[10px] text-[#586c5a]">SuperMemo Engine</span>
                      </div>
                      <div className="h-8 w-px bg-gray-200" />
                      <div className="text-left text-[11px] text-[#586c5a]">
                        <span>• Next Interval: <strong>6 days</strong></span><br />
                        <span>• Ease Factor: <strong>2.5</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {active === 6 && (
                  <div className="flex items-center justify-around py-3 text-xs text-[#586c5a]">
                    <div className="text-center">
                      <Smartphone size={24} className="mx-auto text-[#84a282] mb-1" />
                      <span className="font-bold text-[#19251a]">Mobile Phone</span>
                      <span className="block text-[10px]">Pocket rounds</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-6 border-2 border-[#84a282] rounded mx-auto mb-1 flex items-center justify-center text-[10px] text-[#84a282] font-bold">10"</div>
                      <span className="font-bold text-[#19251a]">Tablet / iPad</span>
                      <span className="block text-[10px]">Split PDF studio</span>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-7 border-2 border-[#84a282] rounded mx-auto mb-1 flex items-center justify-center text-[10px] text-[#84a282] font-bold">14"</div>
                      <span className="font-bold text-[#19251a]">Desktop</span>
                      <span className="block text-[10px]">Full sidebar studio</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#dfe8dc] flex items-center justify-between text-xs text-[#586c5a]">
              <span>Active Specialty Feature</span>
              <span className="font-semibold text-[#84a282]">{active + 1} of {FEATURES.length}</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
