'use client';

import React, { useState } from 'react';
import { Flame, BookOpen, LogOut, User as UserIcon, LogIn, Sparkles } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export type ThemeColor = 'slate' | 'mocha' | 'sage' | 'charcoal';

interface NavbarProps {
  streak: number;
  xp: number;
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
  onOpenCreate: () => void;
  onOpenScanPdf: () => void;
  onGoHome: () => void;
  user: User | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onSignOut: () => void;
  onGoLanding?: () => void;
}

export default function Navbar({
  streak,
  xp,
  currentTheme,
  onThemeChange,
  onOpenCreate,
  onOpenScanPdf,
  onGoHome,
  user,
  onOpenAuth,
  onSignOut,
  onGoLanding,
}: NavbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const themes: { id: ThemeColor; label: string; color: string }[] = [
    { id: 'slate', label: 'Calm Slate', color: '#1a2230' },
    { id: 'mocha', label: 'Warm Mocha', color: '#272320' },
    { id: 'sage', label: 'Muted Sage', color: '#202922' },
    { id: 'charcoal', label: 'Soft Charcoal', color: '#1f2126' },
  ];

  const userDisplayName = 
    user?.user_metadata?.display_name || 
    user?.email?.split('@')[0] || 
    'Student';

  const userInitial = (userDisplayName[0] || 'U').toUpperCase();

  return (
    <header className="w-full px-4 pt-6 pb-4 sm:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 text-left transition hover:opacity-90 cursor-pointer"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm backdrop-blur-md border border-white/10">
              <BookOpen className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white/95 sm:text-3xl">
                Alwinyah
              </h1>
              <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                {user ? 'Cloud Synced' : 'Guest Study Mode'}
              </p>
            </div>
          </button>
        </div>

        {/* Right: Theme Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Soft Theme Color Selector */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-black/20 p-1.5 backdrop-blur-md border border-white/10">
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
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10 shadow-sm">
            <Flame className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            <span>{streak}d</span>
          </div>

          {/* XP Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10 shadow-sm">
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

          {/* User Account / Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/10 transition cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 font-bold text-zinc-950 text-xs">
                  {userInitial}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">
                  {userDisplayName}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#222c3d] p-2 border border-white/15 shadow-2xl backdrop-blur-xl z-50 text-white animate-in fade-in duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                    <p className="text-[11px] text-white/60 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-300 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Email Verified • Cloud Synced</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    {onGoLanding && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onGoLanding();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                        <span>Landing Page View</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 transition cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10 transition cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 rounded-full bg-white hover:bg-white/90 px-3.5 py-1.5 text-xs font-bold text-zinc-950 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Save Decks</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
