"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "./Reveal";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Nursing Student", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Section id="contact" className="bg-[#fefaf3]">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#84a282]">
              Clinical Advisory & Support
            </p>
            <h2 className="mt-3 font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#19251a]">
              Have a question about <br />
              curriculums or decks?
            </h2>
            <p className="mt-4 text-base text-[#586c5a] leading-relaxed">
              Whether you are an educator requesting batch deck uploads for a cohort or a student preparing for NCLEX-RN, our clinical advisory team is here to assist.
            </p>

            <div className="mt-8 space-y-4 text-sm text-[#19251a]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#84a282]/15 text-[#84a282] flex items-center justify-center">
                  <Mail size={16} />
                </span>
                <span>support@anowla.health</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#84a282]/15 text-[#84a282] flex items-center justify-center">
                  <MessageSquare size={16} />
                </span>
                <span>Live Clinical Q&A in lower-right assistant</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="rounded-3xl bg-white border border-[#dfe8dc] p-7 sm:p-9 shadow-lg shadow-black/5">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-[#84a282]/20 text-[#84a282] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-xl font-bold text-[#19251a]">Message Sent</h3>
                <p className="text-sm text-[#586c5a] mt-2">
                  Thank you! Our clinical advisory team will review your inquiry shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-5 py-2 rounded-full text-xs font-semibold bg-[#84a282] text-white hover:bg-[#6e8c6c]"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nurse Alex Reyes"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="alex@nursing.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-1.5">
                    Role / Specialty
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282]"
                  >
                    <option value="Nursing Student">Nursing Student (BSN / ADN)</option>
                    <option value="NCLEX-RN Candidate">NCLEX-RN Candidate</option>
                    <option value="Registered Nurse">Registered Nurse (RN)</option>
                    <option value="Nurse Educator">Nurse Educator / Faculty</option>
                    <option value="Medical Student">Medical Student / Resident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-1.5">
                    Message or Curriculum Request
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what clinical topics or PDF syllabi you are studying..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full text-sm font-semibold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition-all shadow-md shadow-[#84a282]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={15} />
                  <span>Send Clinical Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
