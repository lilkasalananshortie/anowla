"use client";

import Reveal from "./Reveal";

export default function ClinicalManifesto() {
  return (
    <section id="evidence" className="relative overflow-hidden bg-[#18251a] py-24 md:py-32">
      {/* Ambient Forest Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#84a282]/15 rounded-full blur-[160px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-5 md:px-8 text-center">
        <Reveal>
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#84a282]/20 text-[#b8cfb3] border border-[#84a282]/30 mb-6">
            Clinical Manifesto
          </span>
          <h2 className="font-sans font-semibold text-2xl sm:text-3xl md:text-4xl text-[#fefaf3] leading-[1.25] tracking-tight max-w-4xl mx-auto">
            Every clinical concept, made retention-ready, accurate, and fatigue-free — for the nursing student, the NCLEX candidate, and the bedside clinician.
          </h2>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#b8cfb3]/70">
            <span className="flex items-center gap-2">
              <span className="text-white font-extrabold text-base">100%</span> Clinical Accuracy
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-2">
              <span className="text-white font-extrabold text-base">0%</span> Math or Irrelevant Coding
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-2">
              <span className="text-white font-extrabold text-base">4</span> Core Medical Specialties
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-2">
              <span className="text-white font-extrabold text-base">SM-2</span> Spaced Repetition
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
