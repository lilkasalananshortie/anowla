'use client';

import React, { useState } from 'react';
import { Flame, BookOpen, LogOut, LogIn, Sparkles, Video, Bell, Settings } from 'lucide-react';
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
  onOpenMastery?: () => void;
  onOpenUrlScanner?: () => void;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
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
  onOpenMastery,
  onOpenUrlScanner,
  onOpenSettings,
  onOpenNotifications,
}: NavbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const themes: { id: ThemeColor; label: string; color: string }[] = [
    { id: 'slate', label: 'Navy & Cream', color: '#010736' },
    { id: 'mocha', label: 'Royal Navy', color: '#0d1c42' },
    { id: 'sage', label: 'Cobalt Slate', color: '#22396f' },
    { id: 'charcoal', label: 'Warm Cream', color: '#fcf1d0' },
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d1c42] text-[#fcf1d0] shadow-sm backdrop-blur-md border border-[#22396f]">
              <BookOpen className="h-5 w-5 text-[#fcf1d0]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#fcf1d0] sm:text-3xl">
                Alwinyah
              </h1>
              <p className="text-[11px] font-semibold text-[#fcf1d0]/60 uppercase tracking-wider">
                {user ? 'Cloud Synced' : 'Guest Study Mode'}
              </p>
            </div>
          </button>
        </div>

        {/* Right: Actions & Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Streak Pill */}
          <button
            onClick={onOpenMastery}
            className="flex items-center gap-1.5 rounded-full bg-[#0d1c42] hover:bg-[#22396f] px-3 py-1.5 text-xs font-semibold text-[#fcf1d0] backdrop-blur-md border border-[#22396f] shadow-sm transition cursor-pointer"
            title="View Streak & Mastery"
          >
            <Flame className="h-3.5 w-3.5 fill-[#fcf1d0] text-[#fcf1d0]" />
            <span>{streak}d</span>
          </button>

          {/* XP Pill */}
          <button
            onClick={onOpenMastery}
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#0d1c42] hover:bg-[#22396f] px-3 py-1.5 text-xs font-semibold text-[#fcf1d0] backdrop-blur-md border border-[#22396f] shadow-sm transition cursor-pointer"
            title="View XP & Analytics"
          >
            <span className="text-[#fcf1d0] text-xs">⭐</span>
            <span>{xp} XP</span>
          </button>

          {/* Scan PDF Pill */}
          <button
            onClick={onOpenScanPdf}
            className="flex items-center gap-1.5 rounded-full bg-[#0d1c42] hover:bg-[#22396f] px-3.5 py-1.5 text-xs font-semibold text-[#fcf1d0] backdrop-blur-md border border-[#22396f] shadow-sm transition cursor-pointer"
            title="Scan PDF & Notes"
          >
            <span>📄</span>
            <span className="hidden sm:inline">Scan PDF</span>
          </button>

          {/* Import YouTube / Web URL Pill */}
          {onOpenUrlScanner && (
            <button
              onClick={onOpenUrlScanner}
              className="flex items-center gap-1.5 rounded-full bg-[#0d1c42] hover:bg-[#22396f] px-3.5 py-1.5 text-xs font-semibold text-[#fcf1d0] backdrop-blur-md border border-[#22396f] shadow-sm transition cursor-pointer"
              title="Import Video Lecture or Web URL"
            >
              <Video className="h-3.5 w-3.5 text-rose-400" />
              <span className="hidden sm:inline">URL / Video</span>
            </button>
          )}

          {/* Notifications Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d1c42] text-[#fcf1d0]/80 backdrop-blur-md border border-[#22396f] transition hover:bg-[#22396f] hover:text-[#fcf1d0] cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d1c42] text-[#fcf1d0]/80 backdrop-blur-md border border-[#22396f] transition hover:bg-[#22396f] hover:text-[#fcf1d0] cursor-pointer"
              title="Settings & Audio"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          )}

          {/* User Account / Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 rounded-full bg-[#0d1c42] hover:bg-[#22396f] px-3 py-1.5 text-xs font-medium text-[#fcf1d0] backdrop-blur-md border border-[#22396f] transition cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fcf1d0] font-bold text-[#010736] text-xs">
                  {userInitial}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">
                  {userDisplayName}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0d1c42] p-2 border border-[#22396f] shadow-2xl backdrop-blur-xl z-50 text-[#fcf1d0] animate-in fade-in duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 border-b border-[#22396f]">
                    <p className="text-xs font-bold text-[#fcf1d0] truncate">{userDisplayName}</p>
                    <p className="text-[11px] text-[#fcf1d0]/60 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#fcf1d0]/80 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#fcf1d0]" />
                      <span>Cloud Synced</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    {onGoLanding && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onGoLanding();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#fcf1d0]/80 hover:bg-[#22396f] hover:text-[#fcf1d0] transition cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-[#fcf1d0]" />
                        <span>Landing Page View</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/60 transition cursor-pointer"
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
                className="hidden sm:flex items-center gap-1 rounded-full bg-[#0d1c42] hover:bg-[#22396f] px-3 py-1.5 text-xs font-semibold text-[#fcf1d0] backdrop-blur-md border border-[#22396f] transition cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 rounded-full bg-[#fcf1d0] hover:bg-[#fcf1d0]/90 px-3.5 py-1.5 text-xs font-bold text-[#010736] shadow-md transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Save Decks</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
