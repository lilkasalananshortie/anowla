"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";

export default function Footer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="bg-[#18251a] border-t border-white/10 text-white/50">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>&copy; {new Date().getFullYear()} ANOWLA Clinical Care. All rights reserved.</span>
          <span>Strictly for nursing and healthcare education · No math or code</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#18251a] text-white/60 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#84a282] text-white flex items-center justify-center shadow-md">
                <Stethoscope size={20} strokeWidth={2.4} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight leading-none">ANOWLA</span>
                <span className="text-[10px] font-semibold text-[#b8cfb3] uppercase tracking-wider mt-0.5">Clinical Care</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-white/60">
              Evidence-based clinical flashcards and SM-2 spaced repetition for nursing students, NCLEX candidates, and medical practitioners.
            </p>
          </div>

          {/* Clinical Specialties */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Clinical Specialties
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Cardiac Pharmacology</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Med-Surg Fluid & Electrolytes</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">NCLEX-RN Prioritization (EAT)</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Obstetrics & Neonatal Care</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Pediatric Milestones & Dehydration</a></li>
            </ul>
          </div>

          {/* Clinical Tools */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Platform & Tools
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/study" className="hover:text-white transition-colors">Interactive PDF Studio</Link></li>
              <li><Link href="/study" className="hover:text-white transition-colors">Specialty Folders Manager</Link></li>
              <li><Link href="/study" className="hover:text-white transition-colors">SM-2 Spaced Repetition Engine</Link></li>
              <li><Link href="/study" className="hover:text-white transition-colors">Explore Curated Decks</Link></li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Standards & Integrity
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="text-white/40">American Nurses Association (ANA) Alignment</span></li>
              <li><span className="text-white/40">ISMP High-Alert Medication Standards</span></li>
              <li><span className="text-white/40">100% Client-Side PDF Privacy</span></li>
              <li><span className="text-white/40">Strictly Non-Math & Non-Code Domain</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <span>&copy; {new Date().getFullYear()} ANOWLA Clinical. Dedicated to excellence in nursing.</span>
          <div className="flex items-center gap-6">
            <Link href="/study" className="hover:text-white transition-colors">Clinical Studio</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Create Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
