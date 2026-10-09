"use client";

import React from "react";
import Link from "next/link";

interface EditorialNavbarProps {
  dueCount?: number;
}

export default function EditorialNavbar({ dueCount = 4 }: EditorialNavbarProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 px-5 sm:px-8 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Logo in bold uppercase with a hyphen prefix */}
        <Link
          href="/"
          className="font-inter font-bold text-sm sm:text-base tracking-[0.25em] text-[#01472e] uppercase transition-opacity hover:opacity-80"
        >
          - ANOWLA
        </Link>

        {/* Center: Pill-shaped navigation bar with blur and semi-transparent background */}
        <nav className="hidden md:flex items-center gap-6 px-7 py-2.5 rounded-full bg-white/10 backdrop-blur-[20px] border border-[#01472e]/10 shadow-xs">
          <a
            href="#curriculum"
            className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#01472e] hover:opacity-70 transition-opacity"
          >
            CURRICULUM
          </a>
          <a
            href="#protocol"
            className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#01472e] hover:opacity-70 transition-opacity"
          >
            PROTOCOL
          </a>
          <Link
            href="/workspace"
            className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#01472e] hover:opacity-70 transition-opacity"
          >
            PDF WORKSPACE
          </Link>
          <a
            href="#origin"
            className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#01472e] hover:opacity-70 transition-opacity"
          >
            ORIGIN
          </a>
        </nav>

        {/* Right: Study/Cart button with a numeric counter badge in a white pill */}
        <Link
          href="/study"
          className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full bg-white text-[#01472e] shadow-sm hover:shadow-md transition-all active:scale-95 border border-[#01472e]/10 cursor-pointer"
        >
          <span className="text-[10px] font-bold tracking-[0.24em] uppercase">
            STUDY
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#01472e] text-[9px] font-bold text-[#fefae0]">
            {dueCount}
          </span>
        </Link>

      </div>
    </header>
  );
}
