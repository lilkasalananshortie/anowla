"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Layers, Edit3, Sparkles } from "lucide-react";

export default function EditorialHero() {
  return (
    <section className="relative min-h-[92vh] bg-[#fbfbfa] text-[#121316] overflow-hidden flex flex-col justify-between pt-28 pb-14 px-5 sm:px-8 border-b border-[#e5e7eb]">
      {/* Top Tagline */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between text-[11px] font-semibold tracking-[0.2em] uppercase text-[#6b7280]">
        <span>INTELLIGENT ACTIVE RECALL & PDF WORKSPACE</span>
        <span className="hidden sm:inline">SM-2 SPACED RETENTION // ED. 2026</span>
      </div>

      {/* Main Hero Showcase */}
      <div className="max-w-6xl w-full mx-auto my-auto py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Column: Bold, Dignified Typography & CTAs */}
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121316]/5 border border-[#121316]/10 text-xs font-semibold text-[#121316]">
            <Sparkles size={13} className="text-blue-600" />
            <span>PDF MARKUP STUDIO & ACTIVE RECALL</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.035em] text-[#121316] leading-[1.05]">
            Master any subject through intentional retrieval.
          </h1>

          <p className="text-base text-[#4b5563] leading-relaxed max-w-lg">
            Import lecture slides and textbooks directly into organized folders. Markup and highlight pages natively, extract high-yield conceptual flashcards, and retain them with proven SM-2 spaced repetition.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#121316] hover:bg-[#27272a] text-white text-xs font-bold tracking-wider uppercase shadow-md transition-all active:scale-95 group cursor-pointer"
            >
              <span>Open PDF Workspace</span>
              <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <Link
              href="/study"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#e5e7eb] hover:bg-[#f4f4f5] text-[#121316] text-xs font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
            >
              <span>Explore Study Decks</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Clean Product Mockup Preview (PDF Reader + Deck) */}
        <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e5e7eb] shadow-xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f3f4f6] text-xs font-semibold text-[#6b7280]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-[#374151]">CS102_Graph_Traversals.pdf</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Markup Active
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#475569]">
                <span>Definition // Shortest Path</span>
                <span className="text-blue-600 font-mono">Dijkstra</span>
              </div>
              <p className="text-xs font-medium text-[#1e293b] leading-relaxed">
                “Dijkstra’s algorithm computes single-source shortest paths in O((V + E) log V) time by greedily extracting the nearest unvisited node from a min-heap.”
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]">
                <span className="block font-bold">SM-2 INTERVAL</span>
                <span>Next review: +6 days</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af]">
                <span className="block font-bold">RETENTION RATE</span>
                <span>94.8% mastery</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Metadata */}
      <div className="max-w-6xl w-full mx-auto grid sm:grid-cols-2 gap-6 items-end pt-6 border-t border-[#e5e7eb]">
        <div>
          <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b7280] mb-1">
            DOMAIN AGNOSTIC
          </span>
          <p className="text-xs font-medium text-[#374151] leading-relaxed max-w-md">
            Built for computer science, cognitive psychology, international law, molecular biology, and any rigorous curriculum.
          </p>
        </div>

        <div className="sm:text-right">
          <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b7280] mb-1">
            CORE PRINCIPLES
          </span>
          <p className="text-xs font-medium text-[#374151] leading-relaxed">
            Zero decorative fluff. Fast, authentic native PDF markups. Proven cognitive intervals.
          </p>
        </div>
      </div>
    </section>
  );
}
