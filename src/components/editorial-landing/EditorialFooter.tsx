"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function EditorialFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-[#121316] text-[#e4e4e7] pt-20 pb-12 px-5 sm:px-8 border-t border-[#27272a]">
      <div className="max-w-6xl mx-auto space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Brand & Dispatch */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 block">
              ACADEMIC RETENTION STUDIO
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              ANOWLA
            </h2>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Native PDF markup, active recall question synthesis, and spaced repetition scheduling for serious learners.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 pt-4 text-xs font-semibold text-emerald-400">
                <CheckCircle2 size={16} />
                <span>Subscribed to academic release notes.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-2 flex items-center max-w-md gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-[#1f2024] border border-[#32343a] px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#121316] text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}
          </div>

          {/* Right Columns: Links */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-300 block">
                LEARNING
              </span>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/study" className="hover:text-white transition">Computer Science</Link></li>
                <li><Link href="/study" className="hover:text-white transition">Cognitive Science</Link></li>
                <li><Link href="/study" className="hover:text-white transition">Modern History</Link></li>
                <li><Link href="/study" className="hover:text-white transition">Molecular Biology</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-300 block">
                PLATFORM
              </span>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/workspace" className="hover:text-white transition">PDF Workspace</Link></li>
                <li><Link href="/study" className="hover:text-white transition">Study Decks</Link></li>
                <li><a href="#method" className="hover:text-white transition">SM-2 Algorithm</a></li>
                <li><a href="#features" className="hover:text-white transition">Curriculum</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-300 block">
                RESOURCES
              </span>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Use</a></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>© 2026 ANOWLA Academic Study Studio. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 transition cursor-pointer">Privacy</span>
            <span className="hover:text-gray-400 transition cursor-pointer">Security</span>
            <span className="hover:text-gray-400 transition cursor-pointer">Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
