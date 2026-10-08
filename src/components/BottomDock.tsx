'use client';

import React from 'react';
import { Home, Trophy, Plus, Compass, User } from 'lucide-react';

interface BottomDockProps {
  onOpenCreate: () => void;
  onGoHome: () => void;
}

export default function BottomDock({ onOpenCreate, onGoHome }: BottomDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <nav className="flex items-center gap-4 sm:gap-6 rounded-full bg-stone-900/60 px-6 py-2.5 shadow-xl backdrop-blur-xl border border-white/10 text-white">
        
        {/* Home */}
        <button
          onClick={onGoHome}
          className="flex flex-col items-center justify-center p-1.5 text-white/90 hover:text-white transition cursor-pointer"
          title="Home"
        >
          <Home className="h-5 w-5" />
          <span className="h-1 w-1 mt-1 rounded-full bg-teal-400" />
        </button>

        {/* Stats / Achievements */}
        <button
          className="flex flex-col items-center justify-center p-1.5 text-white/50 hover:text-white transition cursor-pointer"
          title="Mastery"
        >
          <Trophy className="h-5 w-5" />
        </button>

        {/* Big Center "+" Action Button (Soft muted white/stone pill) */}
        <button
          onClick={onOpenCreate}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-900 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer -mt-0.5"
          title="Create New Deck"
        >
          <Plus className="h-5 w-5 stroke-[2.2]" />
        </button>

        {/* Discover / Explore */}
        <button
          className="flex flex-col items-center justify-center p-1.5 text-white/50 hover:text-white transition cursor-pointer"
          title="Explore Decks"
        >
          <Compass className="h-5 w-5" />
        </button>

        {/* Profile */}
        <button
          className="flex flex-col items-center justify-center p-1.5 text-white/50 hover:text-white transition cursor-pointer"
          title="Profile"
        >
          <User className="h-5 w-5" />
        </button>
      </nav>
    </div>
  );
}
