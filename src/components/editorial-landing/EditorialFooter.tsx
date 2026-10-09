"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function EditorialFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer 
      id="origin"
      className="relative z-30 bg-[#01472e] text-[#ccd5ae] rounded-t-[5rem] -mt-20 pt-28 pb-14 px-5 sm:px-8 overflow-hidden shadow-2xl"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left 6 Cols: Large Newsletter Signup with Underline-Only Input Field */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-75 block">
              COMMUNICATION // BULLETINS
            </span>
            <h2 className="font-anton text-4xl sm:text-5xl lg:text-6xl text-[#fefae0] tracking-[-0.03em] uppercase leading-none">
              CLINICAL DISPATCH
            </h2>
            <p className="text-xs sm:text-sm font-medium tracking-[0.06em] text-[#ccd5ae]/85 max-w-md leading-relaxed">
              RECEIVE WEEKLY HIGH-ALERT PHARMACOLOGY BULLETINS, NCLEX CLINICAL CASE VIGNETTES, AND NEW STUDY RELEASES DIRECTLY.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-3 pt-6 text-sm font-bold tracking-[0.2em] uppercase text-[#e9edc9]">
                <CheckCircle2 size={20} className="text-[#ccd5ae]" />
                <span>CONFIRMED. DISPATCHES WILL BE SENT TO YOUR EMAIL.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-4 space-y-5 max-w-lg">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER CLINICAL EMAIL ADDRESS"
                    className="w-full bg-transparent border-0 border-b-2 border-[#ccd5ae]/40 pb-3 pt-4 text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#fefae0] placeholder-[#ccd5ae]/40 focus:outline-none focus:border-[#ccd5ae] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#ccd5ae] text-[#01472e] text-xs font-bold tracking-[0.24em] uppercase hover:bg-[#e9edc9] transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <span>SUBSCRIBE</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Right 6 Cols: Two Columns of Links using bold, tracked-out 11px uppercase text */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 pt-4 lg:pt-2">
            
            {/* Link Column 1 */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#fefae0] block pb-2 border-b border-[#ccd5ae]/20">
                CURRICULUM
              </span>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/study"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    PHARMACOLOGY
                  </Link>
                </li>
                <li>
                  <Link
                    href="/study"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    MED-SURG & TRIAGE
                  </Link>
                </li>
                <li>
                  <Link
                    href="/study"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    CRITICAL CARE ICU
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workspace"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    PDF WORKSPACE
                  </Link>
                </li>
                <li>
                  <Link
                    href="/study"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    FLASHCARD STUDIO
                  </Link>
                </li>
              </ul>
            </div>

            {/* Link Column 2 */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#fefae0] block pb-2 border-b border-[#ccd5ae]/20">
                ARCHITECTURE
              </span>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#protocol"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    SM-2 ALGORITHM
                  </a>
                </li>
                <li>
                  <a
                    href="#curriculum"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    NCLEX-RN CASES
                  </a>
                </li>
                <li>
                  <Link
                    href="/workspace"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    FOLDER SYSTEM
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    METHODOLOGY
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@anowla.clinical"
                    className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae] hover:text-[#fefae0] transition-colors block"
                  >
                    SUPPORT DESK
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom: Copyright and legal links with 30% opacity */}
        <div className="mt-20 pt-8 border-t border-[#ccd5ae]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold tracking-[0.25em] uppercase text-[#ccd5ae]/30">
          <span>
            © 2026 ANOWLA CLINICAL STUDIO. ZERO MATHEMATICS. ALL RIGHTS RESERVED.
          </span>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#ccd5ae]/60 transition-colors cursor-pointer">PRIVACY POLICY</span>
            <span className="hover:text-[#ccd5ae]/60 transition-colors cursor-pointer">TERMS OF PRACTICE</span>
            <span className="hover:text-[#ccd5ae]/60 transition-colors cursor-pointer">CLINICAL DISCLAIMER</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
