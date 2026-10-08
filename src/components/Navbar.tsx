'use client';

import React from 'react';
import { Flame, Bell, Settings, BookOpen } from 'lucide-react';

export type ThemeColor = 'slate' | 'mocha' | 'sage' | 'charcoal';

interface NavbarProps {
  streak: number;
  xp: number;
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
  onOpenCreate: () => void;
  onOpenScanPdf: () => void;
  onGoHome: () => void;
}

export default function Navbar({
  streak,
  xp,
  currentTheme,
  onThemeChange,
  onOpenCreate,
  onOpenScanPdf,
  onGoHome,
}: NavbarProps) {
  const themes: { id: ThemeColor; label: string; color: string }[] = [
    { id: 'slate', label: 'Calm Slate', color: '#1a2230' },
    { id: 'mocha', label: 'Warm Mocha', color: '#272320' },
    { id: 'sage', label: 'Muted Sage', color: '#202922' },
    { id: 'charcoal', label: 'Soft Charcoal', color: '#1f2126' },
  ];

  return (
    <header className="w-full px-4 pt-6 pb-4 sm:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        
        {/* Left: Brand / Title */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left transition hover:opacity-90 cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm backdrop-blur-md border border-white/10">
            <BookOpen className="h-5 w-5 text-white/90" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white/95 sm:text-3xl">
              Insights
            </h1>
            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
              Alwinyah Study Hub
            </p>
          </div>
        </button>

        {/* Right: Theme Switcher & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Soft Theme Color Selector */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-black/20 p-1.5 backdrop-blur-md border border-white/10">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                title={t.label}
                className={`h-5 w-5 rounded-full transition-transform cursor-pointer ${
                  currentTheme === t.id
                    ? 'ring-2 ring-white/90 scale-110 shadow-sm'
                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: t.color }}
              />
            ))}
          </div>

          {/* Streak Pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10 shadow-sm">
            <Flame className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            <span>{streak}d</span>
          </div>

          {/* XP Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10 shadow-sm">
            <span className="text-amber-200 text-xs">⭐</span>
            <span>{xp} XP</span>
          </div>

          {/* Scan PDF Pill */}
          <button
            onClick={onOpenScanPdf}
            className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3.5 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-md border border-amber-400/30 shadow-sm transition hover:bg-amber-500/30 cursor-pointer"
            title="Scan PDF & Highlights"
          >
            <span>📄</span>
            <span className="hidden sm:inline">Scan PDF</span>
          </button>

          {/* Quick Icons */}
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md border border-white/10 transition hover:bg-white/15 hover:text-white cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md border border-white/10 transition hover:bg-white/15 hover:text-white cursor-pointer"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
