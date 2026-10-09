"use client";

import { useState } from "react";
import { ShieldCheck, AlertCircle, HeartPulse, Stethoscope, CheckCircle2, ChevronRight, type LucideIcon } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "./Reveal";

type Standard = {
  icon: LucideIcon;
  title: string;
  tag: string;
  desc: string;
  points: string[];
};

const STANDARDS: Standard[] = [
  {
    icon: HeartPulse,
    title: "High-Alert Medication Protocols",
    tag: "ISMP Guidelines",
    desc: "Built around the Institute for Safe Medication Practices (ISMP) standards. Flashcards emphasize independent double-checks, therapeutic windows, and emergency reversal agents.",
    points: [
      "Digoxin: Toxicity thresholds (> 2.0 ng/mL) and DigiFab antidote",
      "Heparin & Enoxaparin: aPTT monitoring and Protamine Sulfate reversal",
      "Insulin: Peak times, hypoglycemia rescue (Rule of 15), and dual verification",
    ],
  },
  {
    icon: Stethoscope,
    title: "Prioritization & Triage Frameworks",
    tag: "NCLEX Clinical Judgment",
    desc: "Train your clinical intuition using the recognized emergency triage levels and delegation rules. Never delegate nursing evaluation, assessment, or teaching.",
    points: [
      "Airway, Breathing, Circulation (ABC) emergency triage prioritization",
      "EAT Delegation Rules: RN retains Evaluation, Assessment, Teaching",
      "Acute vs. Chronic: Prioritize unstable and newly symptomatic clients first",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Diagnostic Lab & Vital Thresholds",
    tag: "Clinical Benchmarks",
    desc: "Immediate active recall on critical adult laboratory references, electrolyte alarms, and arterial blood gas (ABG) interpretations.",
    points: [
      "Potassium (3.5–5.0 mEq/L): Peaked T-waves vs. U-waves",
      "Sodium (135–145 mEq/L): Seizure precautions and neuro checks",
      "Arterial Blood Gases (ABGs): ROME method for Acid-Base interpretation",
    ],
  },
];

export default function ClinicalSafety() {
  const [active, setActive] = useState(0);

  return (
    <Section id="evidence" className="bg-[#fefaf3]">
      <div className="grid lg:grid-cols-[1fr_22rem] gap-x-16 gap-y-6 items-end mb-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#84a282]">
            Evidence-Based Nursing Standards
          </p>
          <h2 className="mt-3 font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#19251a]">
            Patient safety, <br />
            grounded in evidence.
          </h2>
        </div>
        <ul className="space-y-2.5 text-sm text-[#586c5a]">
          <li className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#84a282] shrink-0" />
            <span>NCLEX-RN Next-Generation Alignment</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#84a282] shrink-0" />
            <span>ISMP High-Alert Medication Safeguards</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#84a282] shrink-0" />
            <span>Client Privacy: 100% Client-Side PDF Parsing</span>
          </li>
        </ul>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {STANDARDS.map((s, idx) => {
          const isSelected = active === idx;
          const Icon = s.icon;
          return (
            <Reveal key={s.title} delay={idx * 0.1}>
              <div
                onClick={() => setActive(idx)}
                className={`cursor-pointer rounded-3xl p-7 border transition-all duration-300 h-full flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-[#84a282] shadow-xl shadow-[#84a282]/10 ring-2 ring-[#84a282]/25"
                    : "bg-white/60 border-[#dfe8dc] hover:bg-white hover:border-[#b8cfb3]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-[#84a282] text-white shadow-sm"
                          : "bg-[#b8cfb3]/25 text-[#19251a]"
                      }`}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f6e2e9] text-[#703348]">
                      {s.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#19251a] mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#586c5a] leading-relaxed mb-6">
                    {s.desc}
                  </p>

                  <ul className="space-y-2 text-xs text-[#19251a] pt-4 border-t border-[#dfe8dc]">
                    {s.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#84a282] font-bold mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#dfe8dc] flex items-center justify-between text-xs font-semibold text-[#84a282]">
                  <span>Protocol {idx + 1}</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
