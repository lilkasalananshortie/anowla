"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, FileText, CheckCircle2, RotateCw, HeartPulse, Stethoscope, BookOpen } from "lucide-react";

export default function Hero() {
  const [flipped, setFlipped] = useState(false);

  return (
    <header className="relative overflow-hidden bg-[#18251a] font-sans pt-32 pb-20 lg:pt-0 lg:pb-0 lg:min-h-screen lg:flex lg:items-center">
      {/* Structural subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-8 lg:pt-16">
        <div className="grid lg:grid-cols-2 xl:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#84a282]/15 border border-[#84a282]/30 text-xs font-semibold text-[#b8cfb3] mb-6">
              <Stethoscope size={13} className="text-[#84a282]" />
              <span>Evidence-Based Clinical Recall · Zero Math</span>
            </div>

            <h1 className="font-sans font-bold text-[#fefaf3] leading-[1.05] tracking-[-0.035em] text-5xl sm:text-6xl lg:text-[52px] xl:text-[62px]">
              Master Clinical Care. <br />
              <span className="text-[#84a282]">Without the Fatigue.</span>
            </h1>

            <div className="mt-8 lg:mt-9 h-px w-24 bg-white/20" />

            <p className="mt-6 max-w-lg text-lg text-[#fefaf3]/70 leading-[1.7]">
              Transform your nursing syllabi, drug handbooks, and clinical notes into active-recall flashcards. Designed for bedside nurses, NCLEX-RN candidates, and medical students.
            </p>

            <div className="mt-8 lg:mt-9 flex flex-wrap items-center gap-5 sm:gap-7 shrink-0">
              <Link
                href="/study"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold bg-[#84a282] text-[#fefaf3] hover:bg-[#6e8c6c] transition-all shadow-xl shadow-[#84a282]/30 hover:shadow-2xl hover:shadow-[#84a282]/45 cursor-pointer"
              >
                <span>Launch Clinical Studio</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="group inline-flex items-center gap-2 text-base font-medium text-[#fefaf3]/75 hover:text-[#fefaf3] transition-colors"
              >
                <span>Explore Features</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Specialties Strip */}
            <div className="mt-12 lg:mt-14 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#b8cfb3]/70">
              <span>Pharmacology</span>
              <span className="w-6 h-px bg-white/20" />
              <span>Med-Surg</span>
              <span className="w-6 h-px bg-white/20" />
              <span>NCLEX-RN</span>
              <span className="hidden sm:inline text-[#fefaf3]/35">— No Maths · No Coding</span>
            </div>
          </motion.div>

          {/* Right Column: High-Craft Interactive Clinical Device Mockup */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
          >
            {/* Ambient Sage Glow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] rounded-full bg-[#84a282]/20 blur-[130px] pointer-events-none" />

            {/* Studio Device Container */}
            <div className="relative rounded-3xl bg-[#203023] border border-[#84a282]/30 p-5 sm:p-7 shadow-2xl shadow-black/50 backdrop-blur-md">
              {/* Studio Window Chrome Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#f6e2e9]/70" />
                  <span className="w-3 h-3 rounded-full bg-[#b8cfb3]/70" />
                  <span className="w-3 h-3 rounded-full bg-[#84a282]" />
                  <span className="ml-2 text-xs font-semibold text-[#fefaf3]/70">
                    Pharmacology: Cardiac & High-Alert Meds
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#84a282]/20 text-[#b8cfb3] border border-[#84a282]/30">
                    NCLEX High Yield
                  </span>
                </div>
              </div>

              {/* Interactive Flashcard Preview */}
              <div className="mt-5">
                <div
                  onClick={() => setFlipped(!flipped)}
                  className="cursor-pointer select-none relative min-h-[260px] sm:min-h-[290px] rounded-2xl bg-[#fefaf3] p-6 text-[#19251a] shadow-lg transition-transform duration-300 hover:scale-[1.01] flex flex-col justify-between border border-[#b8cfb3]/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#b8cfb3]/30 text-[#19251a]">
                      <HeartPulse size={12} className="text-[#84a282]" />
                      Card 01 of 18
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#586c5a] hover:text-[#19251a] bg-black/5 px-2 py-1 rounded-md"
                    >
                      <RotateCw size={12} />
                      <span>{flipped ? "Show Question" : "Tap to Flip"}</span>
                    </button>
                  </div>

                  {!flipped ? (
                    <div className="my-auto py-4">
                      <p className="text-xs uppercase tracking-wider text-[#586c5a] font-bold mb-2">
                        Clinical Vignette & Triage
                      </p>
                      <h3 className="text-lg sm:text-xl font-bold leading-snug text-[#19251a]">
                        A patient receiving Digoxin presents with nausea, vomiting, yellow-green visual halos, and a heart rate of 48 bpm. What is the priority nursing intervention?
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-[#f6e2e9] text-[#703348] font-semibold">
                          Hold Dose & Notify Provider
                        </span>
                        <span className="px-2 py-1 rounded bg-black/5 text-[#586c5a]">
                          Check Potassium (K+)
                        </span>
                        <span className="px-2 py-1 rounded bg-black/5 text-[#586c5a]">
                          Obtain Serum Digoxin Level
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="my-auto py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#84a282] text-[#fefaf3] mb-2">
                        Correct Clinical Rationale
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-[#19251a] mb-2">
                        Hold Digoxin, assess apical pulse for 1 full minute, check serum potassium and digoxin levels, and notify the HCP immediately.
                      </h4>
                      <p className="text-xs text-[#586c5a] leading-relaxed">
                        <strong className="text-[#19251a]">NCLEX Pearl:</strong> Hypokalemia (&lt; 3.5 mEq/L) potentiates digoxin toxicity. Visual halos (xanthopsia) and bradycardia (&lt; 60 bpm in adults) are classic hallmarks. Antidote is Digoxin Immune Fab (DigiFab).
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-black/10 flex items-center justify-between text-[11px] text-[#586c5a]">
                    <span>SM-2 Interval: 4 Days</span>
                    <span className="font-semibold text-[#84a282]">Retention Score: 94%</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Badges */}
              <div className="mt-5 grid grid-cols-3 gap-2.5 pt-4 border-t border-white/10 text-center">
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                  <p className="text-[10px] text-[#b8cfb3] font-semibold uppercase">PDF Extraction</p>
                  <p className="text-xs font-bold text-[#fefaf3] mt-0.5">100% In-Browser</p>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                  <p className="text-[10px] text-[#b8cfb3] font-semibold uppercase">Subject Focus</p>
                  <p className="text-xs font-bold text-[#fefaf3] mt-0.5">Strictly Nursing</p>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                  <p className="text-[10px] text-[#b8cfb3] font-semibold uppercase">Recall System</p>
                  <p className="text-xs font-bold text-[#fefaf3] mt-0.5">SM-2 Spaced</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
