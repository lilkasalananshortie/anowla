'use client';

import React, { useState, useEffect } from 'react';
import Navbar, { ThemeColor } from '@/components/Navbar';
import DeckCard from '@/components/DeckCard';
import StudySession from '@/components/StudySession';
import CreateDeckModal from '@/components/CreateDeckModal';
import PdfScannerModal from '@/components/PdfScannerModal';
import StreakWidget from '@/components/StreakWidget';
import BadgesWidget from '@/components/BadgesWidget';
import BottomDock from '@/components/BottomDock';
import LandingPage from '@/components/LandingPage';
import AuthModal from '@/components/AuthModal';
import DeckDetailModal from '@/components/DeckDetailModal';
import MasteryAnalyticsModal from '@/components/MasteryAnalyticsModal';
import UrlScannerModal from '@/components/UrlScannerModal';
import ExploreModal from '@/components/ExploreModal';
import SettingsModal from '@/components/SettingsModal';
import NotificationsModal from '@/components/NotificationsModal';
import { INITIAL_DECKS } from '@/lib/mockData';
import { Deck, UserStats } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  fetchUserDecks, 
  saveUserDeck, 
  deleteUserDeck, 
  syncUserProfileStats,
  getLocalDecks 
} from '@/lib/deckService';
import { User } from '@supabase/supabase-js';
import { Search, BookOpen, Layers, Highlighter, Sparkles, CloudCheck, Info, X } from 'lucide-react';

export default function Home() {
  const [theme, setTheme] = useState<ThemeColor>('slate');
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPdfScannerOpen, setIsPdfScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Deck inspection and Mastery analytics states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [inspectingDeck, setInspectingDeck] = useState<Deck | null>(null);
  const [isMasteryOpen, setIsMasteryOpen] = useState(false);

  // URL Scanner, Community Explore, Settings, Notifications states
  const [isUrlScannerOpen, setIsUrlScannerOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Authentication & View States
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [dismissGuestBanner, setDismissGuestBanner] = useState(false);

  const [stats, setStats] = useState<UserStats>({
    streak: 3,
    last_study_date: null,
    xp: 420,
    cards_studied_today: 8,
    daily_goal: 10,
  });

  // Soft muted theme background palettes
  const themeStyles: Record<ThemeColor, { bg: string; secondary: string }> = {
    slate: { bg: 'bg-[#18202d]', secondary: 'bg-[#222c3d]' },
    mocha: { bg: 'bg-[#25201e]', secondary: 'bg-[#332c2a]' },
    sage: { bg: 'bg-[#1e2620]', secondary: 'bg-[#2a342d]' },
    charcoal: { bg: 'bg-[#1c1d22]', secondary: 'bg-[#26282f]' },
  };

  const currentThemeStyle = themeStyles[theme] || themeStyles.slate;

  // 1. Initial auth check & session subscription
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted) {
            if (session?.user) {
              setUser(session.user);
              setIsGuestMode(false);
            } else {
              // Check if guest mode was previously toggled in this browser session
              const guestStored = sessionStorage.getItem('alwinyah_guest_mode');
              if (guestStored === 'true') {
                setIsGuestMode(true);
              }
            }
          }
        } catch (e) {
          console.warn('Supabase getSession error:', e);
        }
      }

      if (mounted) {
        setAuthChecking(false);
      }
    }

    initAuth();

    // Listen for auth state changes (sign in, sign out, email verification redirect)
    if (isSupabaseConfigured && supabase) {
      const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          setIsGuestMode(false);
          // Load cloud decks for the user
          loadDecks(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          sessionStorage.removeItem('alwinyah_guest_mode');
          setIsGuestMode(false);
          setDecks(INITIAL_DECKS);
        }
      });

      return () => {
        mounted = false;
        authSubscription?.subscription.unsubscribe();
      };
    }
  }, []);

  // 2. Load persisted stats and theme
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('alwinyah_stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
      const savedTheme = localStorage.getItem('alwinyah_theme') as ThemeColor;
      if (savedTheme && themeStyles[savedTheme]) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, []);

  // 3. Load user decks (Cloud or Local)
  const loadDecks = async (userId?: string | null) => {
    try {
      const loadedDecks = await fetchUserDecks(userId);
      setDecks(loadedDecks);
    } catch (e) {
      console.warn('Error loading decks:', e);
      setDecks(getLocalDecks());
    }
  };

  useEffect(() => {
    if (!authChecking) {
      loadDecks(user?.id);
    }
  }, [user, authChecking]);

  const handleThemeChange = (newTheme: ThemeColor) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('alwinyah_theme', newTheme);
    } catch (e) {}
  };

  const handleDeckCreated = async (newDeck: Deck) => {
    const updated = [newDeck, ...decks];
    setDecks(updated);
    // Sync to Supabase if logged in, and update localStorage cache
    await saveUserDeck(newDeck, user?.id);
  };

  const handleDeleteDeck = async (deckId: string) => {
    const updated = decks.filter((d) => d.id !== deckId);
    setDecks(updated);
    // Delete from Supabase if logged in, and update localStorage cache
    await deleteUserDeck(deckId, user?.id);
  };

  const handleDeckUpdated = async (updatedDeck: Deck) => {
    const updated = decks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d));
    setDecks(updated);
    if (inspectingDeck?.id === updatedDeck.id) {
      setInspectingDeck(updatedDeck);
    }
    await saveUserDeck(updatedDeck, user?.id);
  };

  const handleResetDecks = async () => {
    setDecks(INITIAL_DECKS);
    try {
      localStorage.setItem('alwinyah_decks', JSON.stringify(INITIAL_DECKS));
    } catch (e) {}
  };

  const handleCloneCommunityDeck = async (clonedDeck: Deck) => {
    const updated = [clonedDeck, ...decks];
    setDecks(updated);
    await saveUserDeck(clonedDeck, user?.id);
  };

  const handleSessionComplete = async (xpGained: number, cardsStudied: number) => {
    const newStats: UserStats = {
      ...stats,
      xp: stats.xp + xpGained,
      cards_studied_today: stats.cards_studied_today + cardsStudied,
      last_study_date: new Date().toISOString(),
    };
    setStats(newStats);
    await syncUserProfileStats(newStats, user?.id);
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleEnterGuestMode = () => {
    setIsGuestMode(true);
    try {
      sessionStorage.setItem('alwinyah_guest_mode', 'true');
    } catch (e) {}
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsGuestMode(false);
    sessionStorage.removeItem('alwinyah_guest_mode');
    setSelectedDeck(null);
  };

  const categories = ['All', ...Array.from(new Set(decks.map((d) => d.category || 'General')))];

  const filteredDecks = decks.filter((deck) => {
    const matchesSearch =
      deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || deck.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // If user is NOT logged in and has NOT toggled guest mode -> Show high-converting Landing Page
  if (!user && !isGuestMode) {
    return (
      <>
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onEnterGuestMode={handleEnterGuestMode}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultMode={authModalMode}
          onAuthSuccess={() => {
            setIsAuthModalOpen(false);
          }}
        />
      </>
    );
  }

  // If user IS logged in or is exploring in Guest Mode -> Show Study Hub Dashboard
  return (
    <div
      className={`min-h-screen text-zinc-900 transition-colors duration-500 pb-28 ${currentThemeStyle.bg}`}
    >
      {/* Top Header */}
      <Navbar
        streak={stats.streak}
        xp={stats.xp}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenScanPdf={() => setIsPdfScannerOpen(true)}
        onGoHome={() => setSelectedDeck(null)}
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onOpenMastery={() => setIsMasteryOpen(true)}
        onOpenUrlScanner={() => setIsUrlScannerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onGoLanding={() => {
          setIsGuestMode(false);
          sessionStorage.removeItem('alwinyah_guest_mode');
        }}
      />

      {/* Guest Mode Notification Banner */}
      {!user && !dismissGuestBanner && (
        <div className="mx-auto max-w-5xl px-4 sm:px-8 pt-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-500/15 border border-amber-400/25 px-4 py-2.5 text-xs text-amber-200 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
              <span>
                <strong>Guest Mode:</strong> Your decks are saved locally in this browser.{' '}
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="font-bold underline text-white hover:text-amber-100 cursor-pointer ml-1"
                >
                  Create a free verified account
                </button>{' '}
                to sync decks with Supabase Cloud.
              </span>
            </div>
            <button
              onClick={() => setDismissGuestBanner(true)}
              className="text-amber-300/70 hover:text-amber-100 cursor-pointer"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 sm:px-8 space-y-7 pt-4">
        {selectedDeck ? (
          <StudySession
            deck={selectedDeck}
            onExit={() => setSelectedDeck(null)}
            onSessionComplete={handleSessionComplete}
          />
        ) : (
          <>
            {/* 1. Badges Section */}
            <BadgesWidget stats={stats} />

            {/* 2. Donut & Weekly Activity Metrics */}
            <StreakWidget stats={stats} />

            {/* 3. Study Decks Section */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div>
                  <h2 className="text-sm font-extrabold tracking-wide text-white/90 uppercase">
                    Study Decks
                  </h2>
                  <p className="text-xs text-white/60">
                    Active recall flashcards for deep memorization
                  </p>
                </div>

                {/* Search and Scan PDF Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsPdfScannerOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-amber-500/25 px-3.5 py-2 text-xs font-bold text-amber-200 backdrop-blur-md border border-amber-400/30 shadow-sm transition hover:bg-amber-500/35 active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                    <span>Scan PDF</span>
                  </button>

                  <button
                    onClick={() => setIsUrlScannerOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3.5 py-2 text-xs font-bold text-red-200 backdrop-blur-md border border-red-400/30 shadow-sm transition hover:bg-red-500/30 active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <span>▶️</span>
                    <span>Video / URL</span>
                  </button>

                  <div className="relative flex-1 sm:w-60">
                    <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search decks..."
                      className="w-full rounded-full bg-white/95 py-2 pl-9 pr-4 text-xs font-semibold text-zinc-900 outline-none placeholder:text-zinc-400 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-white text-zinc-950 shadow-md'
                        : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-md'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Bento Grid Decks */}
              {filteredDecks.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDecks.map((deck, idx) => (
                    <DeckCard
                      key={deck.id}
                      deck={deck}
                      accentIndex={idx}
                      onSelect={(d) => setSelectedDeck(d)}
                      onDelete={handleDeleteDeck}
                      onInspect={(d) => {
                        setInspectingDeck(d);
                        setIsDetailModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-white/10 p-12 text-center backdrop-blur-md border border-white/10">
                  <BookOpen className="mx-auto h-8 w-8 text-white/40" />
                  <h3 className="mt-3 text-base font-bold text-white">No decks found</h3>
                  <p className="mt-1 text-xs text-white/60">
                    Try adjusting your search or create a new deck.
                  </p>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-bold text-zinc-950 shadow-md transition hover:scale-105 cursor-pointer"
                  >
                    Create Deck
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Floating Bottom Navigation Dock */}
      <BottomDock
        onOpenCreate={() => setIsCreateOpen(true)}
        onGoHome={() => setSelectedDeck(null)}
        onOpenMastery={() => setIsMasteryOpen(true)}
        onOpenExplore={() => setIsExploreOpen(true)}
        onOpenProfile={() => {
          if (!user) {
            handleOpenAuth('login');
          }
        }}
      />

      {/* Modals */}
      <CreateDeckModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onDeckCreated={handleDeckCreated}
      />

      <PdfScannerModal
        isOpen={isPdfScannerOpen}
        onClose={() => setIsPdfScannerOpen(false)}
        onDeckCreated={handleDeckCreated}
      />

      <UrlScannerModal
        isOpen={isUrlScannerOpen}
        onClose={() => setIsUrlScannerOpen(false)}
        onDeckCreated={handleDeckCreated}
      />

      <ExploreModal
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        onCloneDeck={handleCloneCommunityDeck}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        stats={stats}
        onUpdateStats={(s) => {
          setStats(s);
          syncUserProfileStats(s, user?.id);
        }}
        decks={decks}
        onResetDecks={handleResetDecks}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        stats={stats}
        decks={decks}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        onAuthSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />

      {/* Deck Detail & Card Manager Modal */}
      <DeckDetailModal
        isOpen={isDetailModalOpen}
        deck={inspectingDeck}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateDeck={handleDeckUpdated}
        onStartStudy={(d) => {
          setSelectedDeck(d);
          setIsDetailModalOpen(false);
        }}
      />

      {/* Mastery & Memory Analytics Modal */}
      <MasteryAnalyticsModal
        isOpen={isMasteryOpen}
        onClose={() => setIsMasteryOpen(false)}
        decks={decks}
        stats={stats}
      />
    </div>
  );
}
