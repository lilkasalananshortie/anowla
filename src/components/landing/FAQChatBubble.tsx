"use client";

import { useState } from "react";
import {
  MessageSquare,
  X,
  Stethoscope,
  ChevronRight,
  RotateCcw,
  BookOpen,
  FileText,
  HeartPulse,
  FolderTree,
  Send,
} from "lucide-react";

interface QA {
  q: string;
  a: string;
}

interface Category {
  id: string;
  label: string;
  questions: QA[];
}

const CATEGORIES: Category[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    questions: [
      {
        q: "How does ANOWLA generate flashcards from medical PDFs?",
        a: "You upload your clinical guidelines or syllabus chapter in the PDF Studio. Text is extracted securely in your browser. You can freely edit or trim the notes before our unslop clinical generator extracts high-yield questions, distractors, and rationales.",
      },
      {
        q: "Is there any math or programming content here?",
        a: "No. ANOWLA is 100% strictly dedicated to nursing and medicine: pharmacology, pathophysiology, medical-surgical nursing, pediatrics, and NCLEX-RN clinical judgment. No math, no coding.",
      },
    ],
  },
  {
    id: "pdf-studio",
    label: "PDF Uploads",
    questions: [
      {
        q: "Are my PDF lecture slides uploaded to an external server?",
        a: "No! Extraction runs entirely client-side inside your browser via pdfjs-dist. Your school syllabi and hospital guidelines stay confidential on your own machine.",
      },
      {
        q: "Can I edit extracted clinical text before generating cards?",
        a: "Yes! The PDF Studio features a full clinical note editor. You can fix formatting, remove unnecessary page numbers, or highlight key drug dosages before creating cards.",
      },
    ],
  },
  {
    id: "pharmacology",
    label: "Pharmacology & NCLEX",
    questions: [
      {
        q: "Does ANOWLA cover high-alert drugs like Digoxin and Heparin?",
        a: "Yes! High-alert medication safety is a core focus. Cards cover therapeutic windows, toxicity symptoms (e.g. yellow-green halos for digoxin), antidotes (DigiFab, Protamine sulfate), and lab triggers.",
      },
      {
        q: "How does the EAT prioritization rule work in cards?",
        a: "The EAT framework reinforces what an RN cannot delegate: Evaluation, Assessment, and Teaching. Flashcards present realistic hospital floor scenarios to train triage decisions.",
      },
    ],
  },
  {
    id: "folders",
    label: "Folders & Decks",
    questions: [
      {
        q: "How do I create and organize medical folders?",
        a: "In the Clinical Studio sidebar, click '+ New Folder'. Choose a clinical name (e.g., 'Critical Care ICU') and icon. You can assign any deck to a folder and filter in one click.",
      },
      {
        q: "How does the SM-2 spaced repetition engine work?",
        a: "After answering a card, rate your recall (Again, Hard, Good, Easy). Easy cards are scheduled days or weeks out, while cards you struggle with return on your next study round.",
      },
    ],
  },
];

interface ChatMsg {
  sender: "bot" | "user";
  text: string;
}

export default function FAQChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("getting-started");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      sender: "bot",
      text: "Hello Nurse! Welcome to ANOWLA Clinical Care. Tap a topic below or select a question to review our clinical study guidelines.",
    },
  ]);

  const selectQuestion = (qa: QA) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: qa.q },
      { sender: "bot", text: qa.a },
    ]);
  };

  const currentCategory = CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Circle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#84a282] text-white shadow-xl shadow-[#84a282]/35 flex items-center justify-center hover:bg-[#6e8c6c] hover:scale-105 transition-all cursor-pointer ring-4 ring-[#b8cfb3]/40"
          aria-label="Open Clinical Q&A"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[520px] rounded-3xl bg-[#fefaf3] border border-[#dfe8dc] shadow-2xl flex flex-col overflow-hidden text-[#19251a]">
          {/* Header */}
          <div className="bg-[#18251a] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#84a282] flex items-center justify-center text-white">
                <Stethoscope size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">ANOWLA Clinical Q&A</h4>
                <p className="text-[10px] text-[#b8cfb3]">Evidence-Based Guide</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="p-2 border-b border-[#dfe8dc] bg-white flex gap-1.5 overflow-x-auto scrollbar-hide text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCat(cat.id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-colors cursor-pointer ${
                  activeCat === cat.id
                    ? "bg-[#84a282] text-white"
                    : "bg-[#fefaf3] text-[#586c5a] hover:bg-[#dfe8dc]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#84a282] text-white rounded-br-xs"
                      : "bg-white text-[#19251a] border border-[#dfe8dc] rounded-bl-xs shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions Menu */}
          <div className="p-3 bg-white border-t border-[#dfe8dc] space-y-1.5 max-h-[140px] overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#586c5a] mb-1">
              Select Question:
            </p>
            {currentCategory.questions.map((qa, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectQuestion(qa)}
                className="w-full text-left p-2 rounded-xl text-[11px] font-medium bg-[#fefaf3] hover:bg-[#ebf2e9] text-[#19251a] border border-[#dfe8dc] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="line-clamp-1">{qa.q}</span>
                <ChevronRight size={12} className="text-[#84a282] shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
