"use client";

import React from "react";
import Link from "next/link";

interface EditorialNavbarProps {
  dueCount?: number;
}

export default function EditorialNavbar({ dueCount = 4 }: EditorialNavbarProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 px-5 sm:px-8 py-4 bg-[#fbfbfa]/85 backdrop-blur-md border-b border-[#e5e7eb]/80">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Left: Clean Brand Logo */}
        <Link
          href="/"
          className="font-bold text-sm sm:text-base tracking-[0.2em] text-[#121316] uppercase transition-opacity hover:opacity-80"
        >
          ANOWLA
        </Link>

        {/* Center: Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/workspace"
            className="text-xs font-semibold tracking-wider text-[#4b5563] hover:text-[#121316] transition-colors"
          >
            PDF WORKSPACE
          </Link>
          <a
            href="#features"
            className="text-xs font-semibold tracking-wider text-[#4b5563] hover:text-[#121316] transition-colors"
          >
            CURRICULUM
          </a>
          <a
            href="#method"
            className="text-xs font-semibold tracking-wider text-[#4b5563] hover:text-[#121316] transition-colors"
          >
            SM-2 PROTOCOL
          </a>
        </nav>

        {/* Right: Study Action with Counter Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/study"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121316] text-white text-xs font-bold tracking-wider uppercase shadow-xs hover:bg-[#27272a] transition active:scale-95 cursor-pointer"
          >
            <span>Study Decks</span>
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {dueCount}
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
}
