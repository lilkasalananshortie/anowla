"use client";

import Link from "next/link";
import { Stethoscope, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#18251a] py-24 text-white">
      {/* Ambient Forest Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#84a282]/20 rounded-full blur-[160px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#84a282]/20 border border-[#84a282]/30 text-xs font-semibold text-[#b8cfb3] mb-5">
              <ShieldCheck size={13} className="text-[#84a282]" />
              <span>Evidence-Based Healthcare Learning</span>
            </div>

            <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-[1.1]">
              Ready to Master Your <br />
              Nursing Rotations?
            </h2>
            <p className="mt-5 text-[#fefaf3]/70 max-w-md leading-relaxed text-base">
              Turn dense medical textbooks into retention-ready flashcards. No maths, no distractions, zero generic coding slop.
            </p>
          </div>

          {/* Clinical Boarding Pass Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm rounded-3xl bg-[#fefaf3] text-[#19251a] shadow-2xl shadow-black/40 overflow-hidden border border-[#b8cfb3]/40">
              <div className="p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#586c5a]">
                    ANOWLA Clinical Pass
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#84a282]/20 text-[#84a282]">
                    SM-2 Active
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-[#586c5a] uppercase font-bold tracking-wider">Starting Point</p>
                    <p className="text-lg font-extrabold text-[#19251a]">Raw PDF Notes</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#84a282]/15 text-[#84a282] flex items-center justify-center shrink-0">
                    <Stethoscope size={16} strokeWidth={2.4} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#586c5a] uppercase font-bold tracking-wider">Destination</p>
                    <p className="text-lg font-extrabold text-[#19251a]">Board Certified RN</p>
                  </div>
                </div>
              </div>

              {/* Ticket Notched Perforated Line */}
              <div className="relative border-t border-dashed border-[#dfe8dc]">
                <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#18251a]" />
                <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#18251a]" />
              </div>

              <div className="p-7 space-y-3">
                <Link
                  href="/study"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition-all shadow-lg shadow-[#84a282]/25"
                >
                  <span>Launch Clinical Studio</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/signup"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold border border-[#dfe8dc] text-[#19251a] hover:bg-white transition-colors"
                >
                  <span>Create Free Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
