"use client";

import { Stethoscope, HeartPulse, ShieldAlert, Award } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "./Reveal";

const CHAPTERS = [
  {
    step: "01",
    title: "The Textbook Bottleneck",
    body: "Traditional medical textbooks and lecture slide decks are hundreds of pages long. Re-reading passive notes yields low retention when tested on rapid clinical triage and emergency drug calculations under pressure.",
  },
  {
    step: "02",
    title: "Clinical Rotation Realities",
    body: "Healthcare students and nurses work grueling 12-hour clinical shifts. Free study time is limited to 15-minute breaks between patient rounds. Generic study apps cluttered with math or programming trivia waste precious energy.",
  },
  {
    step: "03",
    title: "What ANOWLA Delivers",
    body: "Upload your exact clinical syllabus, clean and edit your notes client-side, and let our unslop synthesizer create high-yield active-recall decks with rationales, distractors, and spaced repetition intervals.",
  },
];

export default function About() {
  return (
    <Section id="about" className="bg-[#fefaf3]">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#84a282]">
          About ANOWLA Clinical
        </p>
        <h2 className="mt-3 font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#19251a]">
          Built by clinicians, for <br />
          high-stakes healthcare care.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#586c5a] leading-relaxed">
          We eliminated generic SaaS clutter, distracting arcade widgets, and math trivia to give healthcare students an uncompromising clinical mastery workstation.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {CHAPTERS.map((ch, idx) => (
          <Reveal key={ch.title} delay={idx * 0.12}>
            <div className="rounded-3xl bg-white border border-[#dfe8dc] p-8 h-full flex flex-col justify-between">
              <div>
                <span className="text-3xl font-extrabold text-[#84a282]/30 block mb-4">
                  {ch.step}
                </span>
                <h3 className="text-xl font-bold text-[#19251a] mb-3">
                  {ch.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#586c5a] leading-relaxed">
                  {ch.body}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#dfe8dc] text-xs font-semibold text-[#84a282]">
                Nursing Education Standard
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
