"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface CurriculumItem {
  id: string;
  code: string;
  title: string;
  desc: string;
  image: string;
  actionText: string;
  actionHref: string;
  count: string;
}

const ITEMS: CurriculumItem[] = [
  {
    id: "card-1",
    code: "01 // HIGH-ALERT MEDS",
    title: "CARDIAC & ICU PHARMACOLOGY",
    desc: "Inotropes, vasopressors, titration pearls, and fatal dysrhythmia signs.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    actionText: "START STUDY",
    actionHref: "/study",
    count: "48 CARDS",
  },
  {
    id: "card-2",
    code: "02 // CLINICAL TRIAGE",
    title: "MED-SURG & PRIORITIZATION",
    desc: "Next-Gen NCLEX judgment cases, fluid resuscitation, and triage delegation.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    actionText: "START STUDY",
    actionHref: "/study",
    count: "64 CARDS",
  },
  {
    id: "card-3",
    code: "03 // CLIENT STUDIO",
    title: "BROWSER NATIVE PDF WORKSPACE",
    desc: "Organize guidelines into specialty folders, highlight slides, and generate quizzes.",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    actionText: "OPEN WORKSPACE",
    actionHref: "/workspace",
    count: "PDF STUDIO",
  },
];

export default function EditorialFeatureGrid() {
  return (
    <section 
      id="curriculum"
      className="relative z-10 bg-[#e9edc9] text-[#01472e] rounded-t-[5rem] -mt-20 pt-28 pb-32 px-5 sm:px-8 overflow-hidden shadow-2xl"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header: Massive 15vw Anton Display Text + Circular CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-[#01472e]/20"
        >
          <div>
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase opacity-75 block mb-2">
              CURATED CLINICAL ROTATIONS
            </span>
            <h2 className="font-anton text-[15vw] leading-[0.8] tracking-[-0.035em] text-[#01472e] uppercase select-none">
              MODULES
            </h2>
          </div>

          {/* Large Circular CTA Button */}
          <Link
            href="/study"
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#01472e] text-[#fefae0] flex flex-col items-center justify-center p-3 text-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-forest group shrink-0 mb-2 cursor-pointer"
          >
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.24em] uppercase">
              EXPLORE ALL
            </span>
            <ArrowUpRight size={18} className="mt-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </motion.div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-16">
          {ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 1.2,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col space-y-4"
            >
              {/* Aspect Ratio [4/5] Image with 2.5rem radius */}
              <div className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-forest border border-[#01472e]/10 bg-[#ccd5ae]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />

                {/* Top Badge Overlay */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-[10px] font-bold tracking-[0.2em] uppercase text-white bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-none">
                  <span>{item.code}</span>
                  <span className="text-[#fefae0]">{item.count}</span>
                </div>

                {/* Blur-Reveal Button: Overlay + Button Translates Up 32px on Hover */}
                <div
                  className="absolute inset-0 bg-[#01472e]/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-end justify-center p-6 sm:p-8"
                >
                  <Link
                    href={item.actionHref}
                    className="w-full py-4 rounded-full bg-white text-[#01472e] text-xs font-bold tracking-[0.25em] uppercase text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xl hover:bg-[#fefae0] cursor-pointer"
                  >
                    {item.actionText}
                  </Link>
                </div>
              </div>

              {/* Card Meta Typography */}
              <div className="pt-2">
                <span className="text-[10px] font-bold tracking-[0.28em] uppercase opacity-70">
                  {item.code}
                </span>
                <h3 className="font-anton text-2xl tracking-[-0.02em] text-[#01472e] uppercase mt-1">
                  {item.title}
                </h3>
                <p className="text-xs font-medium tracking-[0.05em] text-[#01472e]/80 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
