'use client';

import React from 'react';
import { Flame, Bell, Settings, Plus, Sparkles, BookOpen } from 'lucide-react';

export type ThemeColor = 'indigo' | 'plum' | 'violet' | 'sage';

interface NavbarProps {
  streak: number;
  xp: number;
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
  onOpenCreate: () => void;
  onGoHome: () => void;
}

export default function Navbar({
  streak,
  xp,
  currentTheme,
  onThemeChange,
  onOpenCreate,
  onGoHome,
}: NavbarProps) {
  const themes: { id: ThemeColor; label: string; color: string }[] = [
    { id: 'indigo', label: 'Midnight Indigo', color: '#1a125e' },
    { id: 'plum', label: 'Plum Wine', color: '#541539' },
    { id: 'violet', label: 'Royal Violet', color: '#5b3cb5' },
    { id: 'sage', label: 'Sage Olive', color: '#506a54' },
  ];

  return (
    <header className="w-full px-4 pt-6 pb-4 sm:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        
        {/* Left: Brand / Title */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left transition hover:opacity-90 cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner backdrop-blur-md border border-white/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm sm:text-3xl">
              Insights
            </h1>
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest">
              Alwinyah Study Hub
            </p>
          </div>
        </button>

        {/* Right: Theme Switcher & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Theme Color Selector Dots (Matches screenshot's colorways) */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-black/25 p-1.5 backdrop-blur-md border border-white/10">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                title={t.label}
                className={`h-5 w-5 rounded-full transition-transform cursor-pointer ${
                  currentTheme === t.id
                    ? 'ring-2 ring-white scale-110 shadow-md'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: t.color }}
              />
            ))}
          </div>

          {/* Streak Pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/15 shadow-sm">
            <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{streak}d</span>
          </div>

          {/* XP Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/15 shadow-sm">
            <span className="text-amber-300">⭐</span>
            <span>{xp} XP</span>
          </div>

          {/* Quick Icons */}
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md border border-white/15 transition hover:bg-white/25 cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md border border-white/15 transition hover:bg-white/25 cursor-pointer"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
