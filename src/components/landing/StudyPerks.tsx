"use client";

import { Folder, Flame, Layers, Award, Clock, ArrowRight } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "./Reveal";
import Link from "next/link";

const PERKS = [
  {
    icon: Folder,
    title: "Clinical Specialty Folders",
    desc: "Organize decks by clinical rotation, semester, or board topic. Keep pharmacology separate from obstetrics and surgical care.",
    stat: "Unlimited Folders",
  },
  {
    icon: Flame,
    title: "Shift Streak & Retention",
    desc: "Maintain your daily review habit. The SM-2 algorithm queues due cards so you stay sharp without spending hours re-reading notes.",
    stat: "94% Board Pass Rate",
  },
  {
    icon: Layers,
    title: "Curated Clinical Library",
    desc: "Instantly access pre-built, verified medical flashcards covering cardiac pharmacology, fluid electrolytes, and emergency triage.",
    stat: "4 Pre-Loaded Decks",
  },
  {
    icon: Clock,
    title: "15-Minute Micro-Sessions",
    desc: "Designed for nurses with hectic schedules. Complete a 20-card active recall queue between patient assessments or on lunch breaks.",
    stat: "Mobile & Tablet Ready",
  },
];

export default function StudyPerks() {
  return (
    <Section id="folders" className="bg-[#fefaf3]">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#84a282]">
          Study Architecture
        </p>
        <h2 className="mt-3 font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#19251a]">
          Organized for demanding <br />
          hospital rotations.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#586c5a] leading-relaxed">
          Create custom clinical folders, filter by department, and study anywhere from your clinic tablet to your phone.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PERKS.map((p, i) => {
          const Icon = p.icon;
          return (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="rounded-3xl bg-white border border-[#dfe8dc] p-7 h-full flex flex-col justify-between hover:border-[#84a282] hover:shadow-lg hover:shadow-[#84a282]/10 transition-all duration-300">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#b8cfb3]/25 text-[#84a282] flex items-center justify-center mb-6">
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <h3 className="text-lg font-bold text-[#19251a] mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#586c5a] leading-relaxed mb-6">
                    {p.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#dfe8dc] flex items-center justify-between text-xs font-bold text-[#84a282]">
                  <span>{p.stat}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
