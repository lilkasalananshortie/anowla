"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, BookOpen, Layers, ShieldCheck, Stethoscope } from "lucide-react";

export default function EditorialMethod() {
  const protocols = [
    {
      num: "01",
      title: "EXTRACT & ORGANIZE",
      desc: "Import hospital PDFs, syllabus slides, and pharmacology handbooks into specialty folders without plain text distortion.",
    },
    {
      num: "02",
      title: "SYNTHESIZE ACTIVE RECALL",
      desc: "Generate high-yield vignettes and clinical rationales. No coding syntax, no math problems, only nursing judgment.",
    },
    {
      num: "03",
      title: "SPHERICAL SM-2 INTERVALS",
      desc: "Cards resurface based on evidence-based memory decay intervals, guaranteeing 95%+ NCLEX recall on shift.",
    },
  ];

  return (
    <section 
      id="protocol"
      className="relative z-20 bg-[#fefae0] text-[#01472e] rounded-t-[5rem] -mt-20 pt-28 pb-36 px-5 sm:px-8 overflow-hidden shadow-2xl"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="pb-14 border-b border-[#01472e]/20"
        >
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase opacity-75 block mb-2">
            SCIENCE OF MEMORY RETENTION
          </span>
          <h2 className="font-anton text-[15vw] leading-[0.8] tracking-[-0.035em] text-[#01472e] uppercase select-none">
            PROTOCOL
          </h2>
        </motion.div>

        {/* 2-Column High-End Editorial Layout */}
        <div className="grid lg:grid-cols-12 gap-12 pt-16 items-start">
          
          {/* Left Column: Numbered Protocols */}
          <div className="lg:col-span-7 space-y-10">
            {protocols.map((p, idx) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 1.2,
                  delay: idx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-start gap-6 pb-8 border-b border-[#01472e]/15 last:border-b-0"
              >
                <span className="font-anton text-4xl text-[#01472e]/40 select-none">
                  {p.num}
                </span>
                <div>
                  <h3 className="font-anton text-2xl tracking-[-0.02em] text-[#01472e] uppercase">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium tracking-[0.06em] text-[#01472e]/80 mt-2 leading-relaxed max-w-lg">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            <div className="pt-4">
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#01472e] text-[#fefae0] text-xs font-bold tracking-[0.24em] uppercase hover:bg-[#013723] shadow-forest transition-all active:scale-95 group"
              >
                <span>OPEN CLINICAL PDF WORKSPACE</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Editorial Showcase Card with 2.5rem radius */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.2, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 rounded-[2.5rem] bg-[#a3b18a] p-8 sm:p-10 text-[#01472e] shadow-forest border border-[#01472e]/15 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#01472e]/20">
              <span className="text-[10px] font-bold tracking-[0.28em] uppercase">
                VIGNETTE SAMPLE // NCLEX-RN
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#01472e] text-[#fefae0] text-[9px] font-bold tracking-widest uppercase">
                PRIORITY
              </span>
            </div>

            <div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-75">
                QUESTION 014 // CARDIOLOGY
              </span>
              <p className="font-inter font-bold text-base sm:text-lg text-[#01472e] mt-2 leading-snug">
                A client in the ICU receives continuous IV dopamine at 8 mcg/kg/min. Which clinical finding requires immediate notification of the provider?
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#fefae0] border border-[#01472e]/20 text-xs font-bold tracking-[0.05em] text-[#01472e] flex items-center justify-between">
                <span>A. Urine output of 45 mL/hr</span>
                <span className="text-[10px] opacity-60">Expected</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#01472e] text-[#fefae0] text-xs font-bold tracking-[0.05em] flex items-center justify-between shadow-sm">
                <span>B. Ventricular ectopy &gt; 6/min</span>
                <span className="text-[10px] text-[#ccd5ae]">Correct Priority</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#fefae0] border border-[#01472e]/20 text-xs font-bold tracking-[0.05em] text-[#01472e] flex items-center justify-between">
                <span>C. Systolic BP 108 mmHg</span>
                <span className="text-[10px] opacity-60">Expected</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#01472e]/20 flex items-center justify-between text-[11px] font-bold tracking-[0.2em] uppercase">
              <span>SM-2 INTERVAL: +4 DAYS</span>
              <Link href="/study" className="text-[#01472e] underline hover:opacity-75">
                START SESSION →
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
