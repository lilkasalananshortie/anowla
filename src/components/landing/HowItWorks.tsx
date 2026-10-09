"use client";

import { useState } from "react";
import { Upload, Brain, Check, FileText, ArrowRight, ShieldCheck, HeartPulse } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "./Reveal";

type Step = {
  step: string;
  title: string;
  desc: string;
  badge: string;
};

const STEPS: Step[] = [
  {
    step: "01",
    title: "Upload & Edit Clinical PDF",
    desc: "Import drug handbooks, pathophysiology notes, or NCLEX guides. Edit and curate the extracted text client-side before generating cards.",
    badge: "In-Browser Privacy",
  },
  {
    step: "02",
    title: "Synthesize Active-Recall Cards",
    desc: "Generate high-yield clinical vignettes with correct rationales and plausible distractors. Tweak questions or add manual cards with one click.",
    badge: "Clinical Accuracy",
  },
  {
    step: "03",
    title: "Master on Hospital Shifts",
    desc: "Practice using the SM-2 algorithm. Due cards adjust automatically so you retain high-alert medications and critical lab values permanently.",
    badge: "SM-2 Spaced Repetition",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Section id="how-it-works">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#84a282]">
          Clinical Learning Workflow
        </p>
        <h2 className="mt-3 font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#19251a]">
          From syllabus notes to <br />
          board-exam mastery.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#586c5a] leading-relaxed">
          No manual copy-pasting, no math quizzes, and no generic flashcards. Built to handle complex nursing prioritization, high-alert pharmacology, and medical-surgical emergencies.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {STEPS.map((s, idx) => {
          const isSelected = activeStep === idx;
          return (
            <Reveal key={s.step} delay={idx * 0.12}>
              <div
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-3xl p-8 border transition-all duration-300 h-full flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-[#84a282] shadow-xl shadow-[#84a282]/15 ring-2 ring-[#84a282]/20"
                    : "bg-white/60 border-[#dfe8dc] hover:bg-white hover:border-[#b8cfb3]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold text-[#84a282]/40 tracking-tight">
                      {s.step}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f6e2e9] text-[#703348]">
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#19251a] mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm text-[#586c5a] leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#dfe8dc] flex items-center justify-between text-xs font-semibold text-[#84a282]">
                  <span>Step {idx + 1} of 3</span>
                  <ArrowRight size={14} className={isSelected ? "translate-x-1 transition-transform" : ""} />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Interactive Step Preview Panel */}
      <Reveal delay={0.3} className="mt-12">
        <div className="rounded-3xl bg-[#18251a] border border-[#84a282]/30 p-6 sm:p-10 text-[#fefaf3] shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#84a282]/20 text-[#b8cfb3] border border-[#84a282]/30 mb-4">
                Interactive Studio Simulation
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                {activeStep === 0 && "In-Browser PDF Clinical Extraction"}
                {activeStep === 1 && "Active-Recall Vignette Formulation"}
                {activeStep === 2 && "SM-2 Rotation Review Queue"}
              </h3>
              <p className="text-sm text-[#fefaf3]/70 leading-relaxed mb-6">
                {activeStep === 0 &&
                  "Extract drug monographs, nursing diagnoses, and physiological flowcharts with zero server uploads. Edit and polish clinical passages directly inside the integrated studio."}
                {activeStep === 1 &&
                  "Each generated flashcard includes plausible NCLEX-style distractors and comprehensive clinical rationales. Fix, rephrase, or add custom mnemonics inline."}
                {activeStep === 2 &&
                  "Spaced repetition schedules cards based on response quality. Review on your tablet or smartphone during 15-minute floor breaks."}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-[#b8cfb3]">
                  ✓ American Nurses Association Guidelines
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-[#b8cfb3]">
                  ✓ Zero Mathematics or Code
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#203023] border border-[#84a282]/30 p-5 font-sans">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-[#b8cfb3]">
                <span className="font-semibold">Clinical Note Studio</span>
                <span className="bg-[#84a282] text-white px-2 py-0.5 rounded text-[10px] font-bold">Live Preview</span>
              </div>

              {activeStep === 0 && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-xs text-[#fefaf3]/90 leading-relaxed">
                    <span className="text-[#84a282] font-bold block mb-1">Extracted Note:</span>
                    "Patient with acute left ventricular failure receiving IV furosemide. Monitor for hypokalemia (normal: 3.5–5.0 mEq/L) and ototoxicity if administered too rapidly."
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#b8cfb3]/70 pt-2">
                    <span>Folder: Pharmacology</span>
                    <span>Words: 28</span>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-xs">
                    <span className="text-[#b8cfb3] font-bold uppercase text-[10px] block mb-1">Front Vignette:</span>
                    <p className="font-semibold text-white">Why must IV furosemide be pushed slowly at a rate not exceeding 4 mg/min?</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#84a282]/20 border border-[#84a282]/40 text-xs">
                    <span className="text-[#84a282] font-bold uppercase text-[10px] block mb-1">Clinical Rationale:</span>
                    <p className="text-white">Rapid infusion causes transient or permanent ototoxicity (tinnitus/hearing loss) and sudden hypotension.</p>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 font-semibold">
                      Again <span className="block text-[10px] opacity-75">10m</span>
                    </div>
                    <div className="p-2 rounded-lg bg-yellow-950/40 border border-yellow-500/30 text-yellow-300 font-semibold">
                      Hard <span className="block text-[10px] opacity-75">1d</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold">
                      Good <span className="block text-[10px] opacity-75">3d</span>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300 font-semibold">
                      Easy <span className="block text-[10px] opacity-75">7d</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-center text-[#b8cfb3]/70 mt-2">
                    Daily target: 20 cards per shift · 94% retention rate
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
