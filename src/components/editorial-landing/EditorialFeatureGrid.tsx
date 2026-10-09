"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Code, Brain, Globe, Dna } from "lucide-react";

interface CurriculumModule {
  id: string;
  category: string;
  title: string;
  description: string;
  cardCount: string;
  icon: React.ReactNode;
  actionHref: string;
}

const MODULES: CurriculumModule[] = [
  {
    id: "mod-cs",
    category: "COMPUTER SCIENCE",
    title: "Graph Algorithms & Asymptotic Complexity",
    description: "Traversals (BFS/DFS), shortest path heuristics, balanced AVL search trees, and dynamic programming.",
    cardCount: "4 CARDS",
    icon: <Code size={20} className="text-blue-600" />,
    actionHref: "/study",
  },
  {
    id: "mod-neuro",
    category: "COGNITIVE SCIENCE",
    title: "Memory Systems & Long-Term Potentiation",
    description: "Hippocampal encoding, synaptic plasticity, forgetting curves, and evidence-based desirable difficulties.",
    cardCount: "3 CARDS",
    icon: <Brain size={20} className="text-indigo-600" />,
    actionHref: "/study",
  },
  {
    id: "mod-history",
    category: "MODERN HISTORY",
    title: "International Law & Westphalian Sovereignty",
    description: "Postwar institutions, Bretton Woods monetary policy, collective defense accords, and diplomatic frameworks.",
    cardCount: "3 CARDS",
    icon: <Globe size={20} className="text-amber-600" />,
    actionHref: "/study",
  },
  {
    id: "mod-bio",
    category: "MOLECULAR BIOLOGY",
    title: "Epigenetics & CRISPR-Cas9 Endonucleases",
    description: "Chromatin remodeling, CpG island methylation, PAM recognition motifs, and precision genome editing.",
    cardCount: "2 CARDS",
    icon: <Dna size={20} className="text-emerald-600" />,
    actionHref: "/study",
  },
];

export default function EditorialFeatureGrid() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8 bg-[#f4f4f5] text-[#121316]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e4e4e7]">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#6b7280] block mb-2">
              CURATED DOMAINS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#121316]">
              Structured Study Libraries
            </h2>
          </div>

          <Link
            href="/study"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-600 hover:text-blue-700 transition"
          >
            <span>View All Decks</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MODULES.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-[#e4e4e7] p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#f4f4f5] flex items-center justify-center">
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#f4f4f5] text-[#6b7280]">
                    {m.cardCount}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#6b7280] block mb-1">
                    {m.category}
                  </span>
                  <h3 className="text-base font-bold text-[#121316] leading-snug group-hover:text-blue-600 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-[#4b5563] mt-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#f4f4f5]">
                <Link
                  href={m.actionHref}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#121316] hover:text-blue-600 transition"
                >
                  <span>Start Review</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
