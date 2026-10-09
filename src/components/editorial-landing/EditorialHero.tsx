"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function EditorialHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headlineLetters = ["A", "N", "O", "W", "L", "A"];

  return (
    <section className="relative min-h-screen bg-[#ccd5ae] text-[#01472e] overflow-hidden flex flex-col justify-between pt-28 pb-12 sm:pb-16 px-5 sm:px-8">
      {/* Top Meta Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl w-full mx-auto flex items-center justify-between text-[11px] font-bold tracking-[0.28em] uppercase text-[#01472e]"
      >
        <span>CLINICAL RETENTION STUDIO</span>
        <span className="hidden sm:inline">NO. 04 / ED. 2026</span>
      </motion.div>

      {/* Centerpiece: Massive 'Anton' Display Text (23vw) + Floating Organic Cards */}
      <div className="relative my-auto w-full max-w-[96vw] mx-auto py-12 flex flex-col items-center justify-center">
        
        {/* Floating Organic Card 1: Top Left */}
        <div
          className="absolute -top-4 left-2 sm:left-12 lg:left-24 z-20 w-36 sm:w-52 md:w-60 aspect-[4/5] rounded-[3rem] overflow-hidden shadow-forest border-2 border-white/20 animate-float pointer-events-none hidden sm:block"
          style={{
            transform: `translateY(${scrollY * 0.05}px)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80"
            alt="Organic medicinal botanicals"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-[#01472e]/10 mix-blend-multiply" />
        </div>

        {/* Floating Organic Card 2: Top Right */}
        <div
          className="absolute -bottom-6 right-2 sm:right-10 lg:right-20 z-20 w-40 sm:w-56 md:w-64 aspect-[4/5] rounded-[3rem] overflow-hidden shadow-forest border-2 border-white/20 animate-float-delayed pointer-events-none hidden sm:block"
          style={{
            transform: `translateY(${-scrollY * 0.04}px)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80"
            alt="Clinical pharmacology vials"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-[#01472e]/10 mix-blend-multiply" />
        </div>

        {/* Floating Organic Card 3: Ambient Center Right */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-1/2 translate-x-28 sm:translate-x-44 z-0 w-32 sm:w-44 aspect-square rounded-[3rem] overflow-hidden shadow-forest border border-white/20 animate-float-reverse opacity-75 pointer-events-none hidden lg:block"
          style={{
            transform: `translateY(${scrollY * 0.03}px)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80"
            alt="Sage foliage texture"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Massive 23vw Anton Display Text */}
        <h1 className="relative z-10 font-anton text-[23vw] leading-[0.75] tracking-[-0.05em] text-[#01472e] uppercase text-center select-none flex justify-center items-center overflow-visible">
          {headlineLetters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.2,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Center Pill Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 z-20"
        >
          <Link
            href="/study"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#01472e] text-[#fefae0] text-xs font-bold tracking-[0.24em] uppercase hover:bg-[#013723] shadow-forest transition-all duration-300 active:scale-95 group"
          >
            <span>ENTER CLINICAL STUDIO</span>
            <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

      </div>

      {/* Bottom: Dual-column descriptive text and location/origin labels */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl w-full mx-auto grid sm:grid-cols-2 gap-8 items-end pt-6 border-t border-[#01472e]/20"
      >
        <div>
          <span className="block text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 mb-1">
            PURPOSE & SCOPE
          </span>
          <p className="text-xs sm:text-sm font-bold tracking-[0.22em] uppercase text-[#01472e] leading-relaxed max-w-md">
            ACTIVE RECALL FOR NCLEX-RN, CLINICAL PHARMACOLOGY & BEDSIDE MEDICINE. ZERO MATHEMATICS. ZERO FILLER.
          </p>
        </div>

        <div className="sm:text-right">
          <span className="block text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 mb-1">
            ORIGIN & METHOD
          </span>
          <p className="text-xs sm:text-sm font-bold tracking-[0.22em] uppercase text-[#01472e] leading-relaxed">
            EDITION 2026 // SPHERICAL SM-2 PROTOCOL // MANILA & GLOBAL HEALTHCARE
          </p>
        </div>
      </motion.div>
    </section>
  );
}
