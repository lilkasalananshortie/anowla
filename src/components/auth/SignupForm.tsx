"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Nursing Student (BSN)");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 700);
  };

  const handleCodeChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/study");
    }, 600);
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {step === 1 ? (
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#19251a] tracking-tight">
              Create Clinical Account
            </h2>
            <p className="mt-2 text-sm text-[#586c5a]">
              Start turning medical PDFs into active-recall flashcards.
            </p>
          </div>

          <form onSubmit={handleInitialSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nurse Bea Santiago"
                className="w-full px-4 py-3 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-1.5">
                Clinical Focus / Specialty
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282]"
              >
                <option value="Nursing Student (BSN)">Nursing Student (BSN / ADN)</option>
                <option value="NCLEX-RN Prep">NCLEX-RN Candidate</option>
                <option value="Registered Nurse">Registered Nurse (Staff RN)</option>
                <option value="Pharmacology">Pharmacology & Med-Surg Student</option>
                <option value="Medical Student">Medical Student / Resident</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-1.5">
                Institutional or Personal Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bea.santiago@nursing.edu"
                className="w-full px-4 py-3 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-1.5">
                Create Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-full text-sm font-semibold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition-all shadow-md shadow-[#84a282]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Verification Email...</span>
              ) : (
                <>
                  <span>Create Account & Send Verification</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-[#586c5a]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#84a282] hover:underline">
              Log in
            </Link>
          </div>
        </div>
      ) : (
        /* Step 2: User Account Creation Verification Sent in Email */
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#84a282]/15 text-[#84a282] flex items-center justify-center mx-auto mb-6 ring-8 ring-[#b8cfb3]/20">
            <Mail size={32} />
          </div>

          <h2 className="text-2xl font-bold text-[#19251a] tracking-tight">
            Check Your Email
          </h2>
          <p className="mt-2 text-sm text-[#586c5a] leading-relaxed">
            We sent a verification confirmation code to <br />
            <strong className="text-[#19251a]">{email || "your registered email address"}</strong>.
          </p>

          <form onSubmit={handleVerifySubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-3">
                Enter 6-Digit Verification Token
              </label>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`code-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    className="w-11 sm:w-12 h-13 text-center text-lg font-bold rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-[#19251a] focus:outline-none focus:border-[#84a282] focus:ring-2 focus:ring-[#84a282]/20"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full text-sm font-semibold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition-all shadow-md shadow-[#84a282]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Confirming Clinical Credential...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Verify Email & Enter Studio</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-[#586c5a]">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 font-semibold text-[#84a282] hover:underline cursor-pointer"
              >
                <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
                <span>{resending ? "Sending token..." : "Resend email"}</span>
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:underline"
              >
                Change email address
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
