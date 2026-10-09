import Link from "next/link";
import { Stethoscope, CheckCircle2 } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import Footer from "@/components/landing/Footer";

const CAPABILITIES = [
  "In-browser medical PDF note extraction with zero external uploads",
  "NCLEX-RN Next-Gen clinical judgment & EAT delegation rules",
  "High-alert pharmacology protocols (Digoxin, Heparin, Insulin)",
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fefaf3]">
      <div className="flex-1 flex">
        {/* Left Side: Editorial Dark Panel (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#18251a] overflow-hidden flex-col min-h-[640px] text-white">
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          {/* Top Logo */}
          <div className="relative z-10 pt-12 px-12 xl:px-16">
            <Link href="/" className="inline-flex items-center gap-3 hover:opacity-85 transition-opacity">
              <div className="w-12 h-12 rounded-2xl bg-[#84a282] text-white flex items-center justify-center shadow-lg shadow-[#84a282]/30 ring-1 ring-[#b8cfb3]/40">
                <Stethoscope size={24} strokeWidth={2.4} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-white leading-none">ANOWLA</span>
                <span className="text-[10px] font-semibold text-[#b8cfb3] uppercase tracking-wider mt-1">Clinical Care</span>
              </div>
            </Link>
          </div>

          {/* Headline */}
          <div className="relative z-10 px-12 xl:px-16 pt-16 xl:pt-20">
            <h1 className="font-bold text-white leading-[1.05] tracking-[-0.035em] text-5xl xl:text-6xl">
              Master where <br />
              your <span className="text-[#84a282]">patients need you.</span>
            </h1>

            <div className="mt-8 h-px w-24 bg-white/20" />

            <p className="mt-8 max-w-md text-base text-[#fefaf3]/70 leading-[1.7]">
              Sign in to access your clinical decks, review due flashcards on rotations, and maintain your board exam retention streak.
            </p>
          </div>

          {/* Bottom Capabilities */}
          <div className="relative z-10 mt-auto pt-14 px-12 xl:px-16 pb-12">
            <div className="max-w-md border-t border-white/10 pt-6 space-y-3">
              {CAPABILITIES.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-[#b8cfb3]/85">
                  <CheckCircle2 size={15} className="text-[#84a282] shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <LoginForm />
        </div>
      </div>

      <Footer compact />
    </div>
  );
}
