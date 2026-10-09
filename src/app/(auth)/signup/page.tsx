import Link from "next/link";
import { Stethoscope, CheckCircle2 } from "lucide-react";
import SignupForm from "@/components/auth/SignupForm";
import Footer from "@/components/landing/Footer";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fefaf3]">
      <div className="flex-1 flex">
        {/* Left Side: Registration Branding (Desktop only) */}
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

          {/* Center Section: Hero Text */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-12 xl:px-16 py-12">
            <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight text-white">
              Start Studying <br />
              <span className="text-[#84a282]">Clinically.</span>
            </h1>
            <p className="mt-6 text-base text-[#fefaf3]/70 max-w-lg leading-relaxed">
              Create your account to unlock browser-native PDF extraction, clinical specialty folders, and active-recall queues built strictly for nursing care.
            </p>

            <div className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-[#b8cfb3]">
              <span>Zero Mathematics</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#84a282]" />
              <span>Zero Code</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#84a282]" />
              <span>100% Healthcare</span>
            </div>
          </div>
        </div>

        {/* Right Side: Signup & Verification Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <SignupForm />
        </div>
      </div>

      <Footer compact />
    </div>
  );
}
