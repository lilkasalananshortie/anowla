'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar, { ThemeColor } from '@/components/Navbar';
import DeckCard from '@/components/DeckCard';
import StudySession from '@/components/StudySession';
import CreateDeckModal from '@/components/CreateDeckModal';
import PdfScannerModal from '@/components/PdfScannerModal';
import PdfEditorWorkspace from '@/components/PdfEditorWorkspace';
import BottomDock from '@/components/BottomDock';
import LandingPage from '@/components/LandingPage';
import AuthModal from '@/components/AuthModal';
import DeckDetailModal from '@/components/DeckDetailModal';
import MasteryAnalyticsModal from '@/components/MasteryAnalyticsModal';
import UrlScannerModal from '@/components/UrlScannerModal';
import ExploreModal from '@/components/ExploreModal';
import SettingsModal from '@/components/SettingsModal';
import NotificationsModal from '@/components/NotificationsModal';
import { INITIAL_DECKS, INITIAL_FOLDERS } from '@/lib/mockData';
import { Deck, UserStats, Folder } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  fetchUserDecks, 
  saveUserDeck, 
  deleteUserDeck, 
  syncUserProfileStats,
  getLocalDecks,
  getLocalFolders,
  saveLocalFolders
} from '@/lib/deckService';
import { User } from '@supabase/supabase-js';
import { 
  Search, 
  BookOpen, 
  Layers, 
  Plus, 
  Folder as FolderIcon, 
  FolderPlus, 
  Stethoscope, 
  Sparkles, 
  X, 
  Filter, 
  Flame, 
  Clock, 
  Play, 
  FileText, 
  Compass, 
  Settings, 
  Bell, 
  Upload, 
  Trash2, 
  Check,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function Home() {
  const [theme, setTheme] = useState<ThemeColor>('slate');
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'due'>('all');

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPdfScannerOpen, setIsPdfScannerOpen] = useState(false);
  const [isPdfEditorOpen, setIsPdfEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Inline folder creation
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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
    slate: { bg: 'bg-[#121824]', secondary: 'bg-[#182130]' },
    mocha: { bg: 'bg-[#1f1a18]', secondary: 'bg-[#292220]' },
    sage: { bg: 'bg-[#17201a]', secondary: 'bg-[#202c24]' },
    charcoal: { bg: 'bg-[#141519]', secondary: 'bg-[#1c1d23]' },
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

    if (isSupabaseConfigured && supabase) {
      const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          setIsGuestMode(false);
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

  // 2. Load persisted stats, theme, and folders
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
      const localFolders = getLocalFolders();
      if (localFolders && localFolders.length > 0) {
        setFolders(localFolders);
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

  const handleCreateFolder = (name: string): Folder => {
    const trimmed = name.trim();
    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name: trimmed,
      color: 'teal',
      created_at: new Date().toISOString(),
    };
    const updated = [...folders, newFolder];
    setFolders(updated);
    saveLocalFolders(updated);
    setActiveFolderId(newFolder.id);
    setNewFolderName('');
    setIsCreatingFolder(false);
    return newFolder;
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('Delete this folder? (Decks in this folder will remain in All Decks)')) {
      const updatedFolders = folders.filter((f) => f.id !== folderId);
      setFolders(updatedFolders);
      saveLocalFolders(updatedFolders);
      if (activeFolderId === folderId) {
        setActiveFolderId('all');
      }
    }
  };

  const handleDeckCreated = async (newDeck: Deck) => {
    const updated = [newDeck, ...decks];
    setDecks(updated);
    await saveUserDeck(newDeck, user?.id);
  };

  const handleDeleteDeck = async (deckId: string) => {
    const updated = decks.filter((d) => d.id !== deckId);
    setDecks(updated);
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

  // Metrics calculations
  const totalCardsCount = useMemo(() => {
    return decks.reduce((acc, d) => acc + (d.cards?.length || d.cards_count || 0), 0);
  }, [decks]);

  const totalDueCards = useMemo(() => {
    const now = new Date();
    return decks.reduce((acc, d) => {
      if (d.cards && d.cards.length > 0) {
        return acc + d.cards.filter((c) => !c.due_date || new Date(c.due_date) <= now).length;
      }
      return acc + (d.due_count || 0);
    }, 0);
  }, [decks]);

  // Folder counts mapping
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    decks.forEach((d) => {
      const fid = d.folder_id || 'unassigned';
      counts[fid] = (counts[fid] || 0) + 1;
    });
    return counts;
  }, [decks]);

  // Filtered decks list
  const filteredDecks = useMemo(() => {
    const now = new Date();
    return decks.filter((deck) => {
      // 1. Folder check
      const matchesFolder = activeFolderId === 'all' || deck.folder_id === activeFolderId;
      // 2. Search check
      const matchesSearch =
        deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deck.category && deck.category.toLowerCase().includes(searchTerm.toLowerCase()));
      // 3. Due filter
      const deckDue = deck.cards
        ? deck.cards.filter((c) => !c.due_date || new Date(c.due_date) <= now).length
        : deck.due_count;
      const matchesDue = filterMode === 'all' || deckDue > 0;

      return matchesFolder && matchesSearch && matchesDue;
    });
  }, [decks, activeFolderId, searchTerm, filterMode]);

  const currentFolderObject = folders.find((f) => f.id === activeFolderId);
  const activeFolderTitle = activeFolderId === 'all' ? 'All Clinical Decks' : currentFolderObject?.name || 'Selected Folder';

  // Landing Page display for unauthenticated non-guests
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

  // Active Medical Study Hub Dashboard
  return (
    <div
      className={`min-h-screen text-zinc-100 transition-colors duration-500 pb-24 md:pb-16 font-poppins ${currentThemeStyle.bg}`}
    >
      {/* 1. TOP MEDICAL NAVBAR */}
      <Navbar
        streak={stats.streak}
        xp={stats.xp}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenScanPdf={() => setIsPdfEditorOpen(true)}
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-1">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-400/20 px-4 py-2 text-xs text-amber-200 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
              <span>
                <strong>Guest Mode:</strong> Decks are saved locally in this browser.{' '}
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="font-bold underline text-white hover:text-amber-100 cursor-pointer ml-1"
                >
                  Create a free verified account
                </button>{' '}
                to sync with cloud.
              </span>
            </div>
            <button
              onClick={() => setDismissGuestBanner(true)}
              className="text-amber-300/70 hover:text-white cursor-pointer"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN LAYOUT: DESKTOP SIDEBAR + RESPONSIVE DECK WORKSPACE */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        {selectedDeck ? (
          <StudySession
            deck={selectedDeck}
            onExit={() => setSelectedDeck(null)}
            onSessionComplete={handleSessionComplete}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* A. DESKTOP WORKSTATION SIDEBAR (Fixed/Sticky on large screens, hidden on mobile/tablet) */}
            <aside className="hidden lg:flex w-64 flex-col gap-5 shrink-0">
              
              {/* Primary Medical Action Button */}
              <button
                onClick={() => setIsPdfEditorOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-400 text-zinc-950 px-4 py-3 text-xs font-bold shadow-lg shadow-teal-500/10 hover:brightness-105 active:scale-98 transition cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Upload & Edit PDF</span>
              </button>

              {/* Folders Navigation Card */}
              <div className="rounded-3xl bg-[#161f2c] border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold uppercase tracking-wider text-white/50 text-[10px]">
                    Medical Folders
                  </span>
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-teal-300 hover:text-teal-200 cursor-pointer transition"
                    title="Create New Folder"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    <span>New</span>
                  </button>
                </div>

                {/* Inline Folder Creation Form */}
                {isCreatingFolder && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name..."
                      className="flex-1 bg-transparent px-2 py-1 text-xs text-white focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder(newFolderName);
                        if (e.key === 'Escape') setIsCreatingFolder(false);
                      }}
                    />
                    <button
                      onClick={() => handleCreateFolder(newFolderName)}
                      className="p-1 rounded bg-teal-400 text-zinc-950 font-bold hover:bg-teal-300 cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setIsCreatingFolder(false)}
                      className="p-1 text-white/40 hover:text-white cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Folder Links */}
                <div className="space-y-1">
                  {/* All Decks Item */}
                  <button
                    onClick={() => setActiveFolderId('all')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeFolderId === 'all'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-3.5 w-3.5" />
                      <span>All Decks</span>
                    </div>
                    <span className="text-[11px] rounded-full bg-white/10 px-2 py-0.5 text-white/60">
                      {decks.length}
                    </span>
                  </button>

                  {/* Individual Medical Folders */}
                  {folders.map((folder) => {
                    const count = folderCounts[folder.id] || 0;
                    const isActive = activeFolderId === folder.id;
                    return (
                      <div
                        key={folder.id}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <button
                          onClick={() => setActiveFolderId(folder.id)}
                          className="flex items-center gap-2.5 flex-1 text-left truncate cursor-pointer"
                        >
                          <FolderIcon className={`h-3.5 w-3.5 ${isActive ? 'text-teal-300' : 'text-amber-300/80'}`} />
                          <span className="truncate">{folder.name}</span>
                        </button>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] rounded-full bg-white/10 px-1.5 py-0.5 text-white/50">
                            {count}
                          </span>
                          <button
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-white/30 hover:text-rose-400 transition cursor-pointer"
                            title="Delete Folder"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Clinical Nav Links */}
              <div className="rounded-3xl bg-[#161f2c] border border-white/10 p-3 space-y-1 text-xs font-semibold text-white/70">
                <button
                  onClick={() => setIsExploreOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="h-4 w-4 text-teal-300" />
                    <span>Curated Decks</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/30" />
                </button>

                <button
                  onClick={() => setIsMasteryOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="h-4 w-4 text-amber-300" />
                    <span>Retention Analytics</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/30" />
                </button>

                <button
                  onClick={() => setIsUrlScannerOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 hover:text-white transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-rose-300" />
                    <span>URL / Video to Cards</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/30" />
                </button>
              </div>

              {/* Minimalist Clinical Review Status Widget */}
              <div className="rounded-3xl bg-[#161f2c] border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Today's Target</span>
                  <span className="text-[11px] text-teal-300 font-bold">{stats.cards_studied_today} / {stats.daily_goal}</span>
                </div>
                
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((stats.cards_studied_today / stats.daily_goal) * 100))}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-white/70">
                    <Flame className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    <span>{stats.streak}-day streak</span>
                  </span>
                  <span className="rounded-full bg-rose-500/20 text-rose-300 px-2 py-0.5 font-bold text-[10px]">
                    {totalDueCards} due
                  </span>
                </div>
              </div>

            </aside>

            {/* B. MAIN RESPONSIVE CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-5">
              
              {/* Tablet & Mobile Action Strip */}
              <div className="lg:hidden flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setIsPdfEditorOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-400 text-zinc-950 px-4 py-3 text-xs font-bold shadow-lg shadow-teal-500/10 active:scale-98 transition cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload & Edit PDF</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/15 px-4 py-3 text-xs font-bold text-white border border-white/10 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Deck</span>
                  </button>

                  <button
                    onClick={() => setIsExploreOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/15 px-4 py-3 text-xs font-bold text-teal-300 border border-white/10 transition cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Explore</span>
                  </button>
                </div>
              </div>

              {/* Tablet & Mobile Horizontal Folder Scrollbar */}
              <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveFolderId('all')}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeFolderId === 'all'
                      ? 'bg-teal-400 text-zinc-950 font-bold shadow-sm'
                      : 'bg-white/10 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  All ({decks.length})
                </button>

                {folders.map((f) => {
                  const count = folderCounts[f.id] || 0;
                  const isActive = activeFolderId === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveFolderId(f.id)}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-teal-400 text-zinc-950 font-bold shadow-sm'
                          : 'bg-white/10 text-white/70 hover:text-white border border-white/10'
                      }`}
                    >
                      <span>{f.name}</span>
                      <span className="opacity-70 text-[10px]">({count})</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    const name = prompt('Enter new folder name:');
                    if (name && name.trim()) handleCreateFolder(name);
                  }}
                  className="rounded-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 px-3 py-1.5 text-xs text-white/70 hover:text-white flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Folder</span>
                </button>
              </div>

              {/* Main Workspace Bar: Folder Header, Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-[#161f2c] border border-white/10 shadow-sm">
                
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {activeFolderTitle}
                    </h2>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white/70">
                      {filteredDecks.length} {filteredDecks.length === 1 ? 'deck' : 'decks'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    Spaced repetition active recall with SM-2 intervals
                  </p>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-white/40" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search clinical decks..."
                      className="w-full rounded-full bg-black/30 py-2 pl-9 pr-4 text-xs text-white border border-white/10 focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  {/* Due filter toggle */}
                  <button
                    onClick={() => setFilterMode(filterMode === 'all' ? 'due' : 'all')}
                    className={`rounded-full px-3 py-2 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      filterMode === 'due'
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>⚡ Due</span>
                  </button>

                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="hidden lg:flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-zinc-950 shadow-sm hover:bg-white/90 active:scale-95 transition cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Deck</span>
                  </button>
                </div>

              </div>

              {/* 3. RESPONSIVE DECK CARDS GRID */}
              {filteredDecks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filteredDecks.map((deck, idx) => {
                    const folderObj = folders.find((f) => f.id === deck.folder_id);
                    return (
                      <DeckCard
                        key={deck.id}
                        deck={deck}
                        accentIndex={idx}
                        folderName={folderObj?.name}
                        onSelect={(d) => setSelectedDeck(d)}
                        onDelete={handleDeleteDeck}
                        onInspect={(d) => {
                          setInspectingDeck(d);
                          setIsDetailModalOpen(true);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                /* Clean Empty State */
                <div className="rounded-3xl bg-[#161f2c] p-12 text-center border border-white/10 shadow-sm space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-300 mx-auto border border-teal-500/20">
                    <Stethoscope className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No clinical decks in this view</h3>
                    <p className="mt-1 text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                      Upload your lecture slides or clinical notes as a PDF, or create your first study deck manually.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => setIsPdfEditorOpen(true)}
                      className="rounded-xl bg-teal-500 text-zinc-950 px-5 py-2.5 text-xs font-bold shadow-md hover:bg-teal-400 transition cursor-pointer"
                    >
                      Upload & Edit PDF
                    </button>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="rounded-xl bg-white/10 text-white px-5 py-2.5 text-xs font-bold border border-white/10 hover:bg-white/15 transition cursor-pointer"
                    >
                      Create Blank Deck
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}
      </main>

      {/* Floating Bottom Dock for Mobile */}
      <div className="lg:hidden">
        <BottomDock
          onOpenCreate={() => setIsCreateOpen(true)}
          onGoHome={() => setSelectedDeck(null)}
          onOpenMastery={() => setIsMasteryOpen(true)}
          onOpenExplore={() => setIsExploreOpen(true)}
          onOpenProfile={() => {
            if (!user) {
              handleOpenAuth('login');
            } else {
              handleSignOut();
            }
          }}
        />
      </div>

      {/* 4. MODALS & WORKSPACES */}

      {/* Medical PDF Upload & Interactive Editor Workspace */}
      <PdfEditorWorkspace
        isOpen={isPdfEditorOpen}
        onClose={() => setIsPdfEditorOpen(false)}
        folders={folders}
        onCreateFolder={handleCreateFolder}
        onSaveDeck={handleDeckCreated}
        onStartStudy={(d) => setSelectedDeck(d)}
      />

      {/* Legacy Quick PDF Scanner Modal */}
      <PdfScannerModal
        isOpen={isPdfScannerOpen}
        onClose={() => setIsPdfScannerOpen(false)}
        onDeckCreated={handleDeckCreated}
      />

      {/* Manual Deck Creator Modal */}
      <CreateDeckModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onDeckCreated={handleDeckCreated}
        folders={folders}
      />

      {/* Deck Inspection and Card Editor Modal */}
      <DeckDetailModal
        isOpen={isDetailModalOpen}
        deck={inspectingDeck}
        onClose={() => {
          setIsDetailModalOpen(false);
          setInspectingDeck(null);
        }}
        onUpdateDeck={handleDeckUpdated}
        onStartStudy={(deck) => {
          setIsDetailModalOpen(false);
          setSelectedDeck(deck);
        }}
      />

      {/* Mastery & 7-Day Forecast Modal */}
      <MasteryAnalyticsModal
        isOpen={isMasteryOpen}
        onClose={() => setIsMasteryOpen(false)}
        decks={decks}
        stats={stats}
      />

      {/* Video & Web URL to Flashcard Modal */}
      <UrlScannerModal
        isOpen={isUrlScannerOpen}
        onClose={() => setIsUrlScannerOpen(false)}
        onDeckCreated={handleDeckCreated}
      />

      {/* Curated Clinical Decks Modal */}
      <ExploreModal
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        onCloneDeck={handleCloneCommunityDeck}
      />

      {/* Settings & Audio Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        stats={stats}
        onUpdateStats={(newStats) => {
          setStats(newStats);
          syncUserProfileStats(newStats, user?.id);
        }}
        decks={decks}
        onResetDecks={handleResetDecks}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        stats={stats}
        decks={decks}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
