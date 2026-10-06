'use client';

import React from 'react';
import { Flame, Sparkles, Plus, BookOpen } from 'lucide-react';

interface NavbarProps {
  streak: number;
  xp: number;
  onOpenCreate: () => void;
  onGoHome: () => void;
}

export default function Navbar({ streak, xp, onOpenCreate, onGoHome }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button 
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left transition hover:opacity-80 cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Alwinyah
            </span>
            <span className="ml-1.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              AI Study
            </span>
          </div>
        </button>

        {/* Gamification Stats & Action */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Streak Badge */}
          <div 
            title="Study Streak"
            className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:border-amber-900/40 dark:text-amber-400"
          >
            <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak}d</span>
          </div>

          {/* XP Badge */}
          <div 
            title="Total XP"
            className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700 border border-violet-200/60 dark:bg-violet-950/40 dark:border-violet-900/40 dark:text-violet-400"
          >
            <span className="text-xs">⭐</span>
            <span>{xp} XP</span>
          </div>

          {/* Create Button */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Deck</span>
          </button>
        </div>
      </div>
    </header>
  );
}
