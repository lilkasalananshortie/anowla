"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Folder, Edit3, Repeat } from "lucide-react";

export default function EditorialMethod() {
  const steps = [
    {
      icon: <Folder size={20} className="text-blue-600" />,
      title: "Organize Original Documents",
      desc: "Import course syllabi, lecture slides, and research PDFs into structured folders. Files maintain authentic page formatting without text deformation.",
    },
    {
      icon: <Edit3 size={20} className="text-indigo-600" />,
      title: "Direct Canvas Markup & Note Taking",
      desc: "Highlight passages with semi-transparent markers, draw freehand diagrams, and jot down permanent notes tied directly to specific document pages.",
    },
    {
      icon: <Repeat size={20} className="text-emerald-600" />,
      title: "SM-2 Interval Scheduling",
      desc: "Extract question-and-answer pairs and review them using the evidence-based SuperMemo-2 algorithm to guarantee 90%+ long-term retention.",
    },
  ];

  return (
    <section id="method" className="py-24 px-5 sm:px-8 bg-white text-[#121316]">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Heading */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#6b7280] block">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#121316]">
            From passive reading to permanent recall.
          </h2>
          <p className="text-sm text-[#4b5563] leading-relaxed">
            Most students reread notes and highlight passively. ANOWLA turns every PDF page into an active retrieval engine.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-[#fafafa] border border-[#e5e7eb] flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#e5e7eb] flex items-center justify-center shadow-xs">
                  {step.icon}
                </div>
                <h3 className="text-base font-bold text-[#121316]">
                  {step.title}
                </h3>
                <p className="text-xs text-[#4b5563] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-8 rounded-2xl bg-[#121316] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Ready to master your coursework?</h3>
            <p className="text-xs text-gray-400">Open your folders and begin reviewing in seconds.</p>
          </div>
          <Link
            href="/workspace"
            className="px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#121316] text-xs font-bold uppercase tracking-wider transition shrink-0"
          >
            Open PDF Workspace
          </Link>
        </div>

      </div>
    </section>
  );
}
