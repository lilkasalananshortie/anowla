"use client";

import { ShieldCheck, FileText, HeartPulse, Stethoscope, FolderTree, Sparkles, type LucideIcon } from "lucide-react";

type Item = { icon: LucideIcon; label: string; sub: string };

const ITEMS: Item[] = [
  { icon: ShieldCheck, label: "NCLEX-RN Next-Gen Alignment", sub: "Clinical judgment model cases" },
  { icon: FileText, label: "Browser-Native PDF Studio", sub: "Extract & edit notes client-side" },
  { icon: HeartPulse, label: "High-Alert Pharmacology", sub: "Cardiac, insulin & anticoagulant protocols" },
  { icon: Stethoscope, label: "Prioritization & Delegation", sub: "EAT framework & triage rules" },
  { icon: FolderTree, label: "Medical Folders", sub: "Group decks by clinical department" },
  { icon: Sparkles, label: "Strictly Clinical & Nursing", sub: "Zero math or irrelevant filler" },
];

export default function TrustBar() {
  const loop = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <section className="relative bg-[#fefaf3] border-y border-[#dfe8dc] overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-r from-[#fefaf3] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-l from-[#fefaf3] to-transparent" />

      <div className="group py-6 overflow-hidden">
        <div className="flex w-max items-center gap-10 md:gap-14 ticker-track motion-reduce:animate-none group-hover:[animation-play-state:paused]">
          {loop.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i} className="flex items-center gap-10 md:gap-14 shrink-0">
                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-8 h-8 rounded-lg bg-[#84a282]/15 text-[#84a282] flex items-center justify-center shrink-0 border border-[#84a282]/25">
                    <Icon size={16} strokeWidth={2.2} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#19251a] whitespace-nowrap">{t.label}</span>
                    <span className="text-xs text-[#586c5a] whitespace-nowrap">{t.sub}</span>
                  </div>
                </div>
                {i < loop.length - 1 && <span className="w-px h-5 bg-[#dfe8dc] shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
