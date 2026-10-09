"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simple client authentication simulation for clinical workspace
    setTimeout(() => {
      setLoading(false);
      router.push("/study");
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#19251a] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-[#586c5a]">
          Sign in to access your clinical folders and active-recall queues.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#19251a] mb-1.5">
            Email or Student ID
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nurse@hospital.edu"
              className="w-full px-4 py-3 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282] transition-colors"
            />
            <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#586c5a]" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#19251a]">
              Password
            </label>
            <a href="#" className="text-xs font-semibold text-[#84a282] hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-sm text-[#19251a] focus:outline-none focus:border-[#84a282] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#586c5a] hover:text-[#19251a]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 rounded-full text-sm font-semibold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition-all shadow-md shadow-[#84a282]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In to Clinical Studio</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-[#586c5a]">
        Don't have an account yet?{" "}
        <Link href="/signup" className="font-bold text-[#84a282] hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
