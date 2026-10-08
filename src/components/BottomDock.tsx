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
      <nav className="flex items-center gap-4 sm:gap-6 rounded-full bg-black/40 px-6 py-3 shadow-2xl backdrop-blur-xl border border-white/15 text-white">
        
        {/* Home */}
        <button
          onClick={onGoHome}
          className="flex flex-col items-center justify-center p-1.5 text-white/90 hover:text-white transition cursor-pointer"
          title="Home"
        >
          <Home className="h-5 w-5" />
          <span className="h-1 w-1 mt-1 rounded-full bg-lime-400" />
        </button>

        {/* Stats / Achievements */}
        <button
          className="flex flex-col items-center justify-center p-1.5 text-white/60 hover:text-white transition cursor-pointer"
          title="Mastery"
        >
          <Trophy className="h-5 w-5" />
        </button>

        {/* Big Center "+" Action Button (Matches the oversized pastel button in screenshot) */}
        <button
          onClick={onOpenCreate}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dccaff] text-zinc-950 shadow-lg shadow-black/30 transition-transform hover:scale-110 active:scale-95 cursor-pointer -mt-1"
          title="Create New Deck"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        {/* Discover / Explore */}
        <button
          className="flex flex-col items-center justify-center p-1.5 text-white/60 hover:text-white transition cursor-pointer"
          title="Explore Decks"
        >
          <Compass className="h-5 w-5" />
        </button>

        {/* Profile */}
        <button
          className="flex flex-col items-center justify-center p-1.5 text-white/60 hover:text-white transition cursor-pointer"
          title="Profile"
        >
          <User className="h-5 w-5" />
        </button>
      </nav>
    </div>
  );
}
