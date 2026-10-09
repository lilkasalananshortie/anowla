"use client";

import Link from "next/link";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import Footer from "@/components/landing/Footer";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fefaf3]">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#dfe8dc] shadow-xl text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#84a282]/15 text-[#84a282] flex items-center justify-center mx-auto mb-6 ring-8 ring-[#b8cfb3]/20">
            <Mail size={32} />
          </div>

          <h1 className="text-2xl font-bold text-[#19251a] tracking-tight">
            Account Verification Sent
          </h1>

          <p className="mt-3 text-sm text-[#586c5a] leading-relaxed">
            We have sent a confirmation email to verify your clinical account. Please check your inbox and click the verification link to proceed.
          </p>

          <div className="mt-8 p-4 rounded-2xl bg-[#fefaf3] border border-[#dfe8dc] text-left text-xs space-y-2 text-[#586c5a]">
            <p className="font-bold text-[#19251a]">Next steps:</p>
            <p>1. Open your school or institutional email app.</p>
            <p>2. Locate the message from <strong>ANOWLA Clinical Verification</strong>.</p>
            <p>3. Tap <strong>Verify Clinical Credential</strong> to activate your workspace.</p>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/study"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition-all shadow-md shadow-[#84a282]/25"
            >
              <span>Continue to Clinical Studio</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center py-3 text-xs font-semibold text-[#586c5a] hover:text-[#19251a]"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <Footer compact />
    </div>
  );
}
