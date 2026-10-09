'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DeckCard from '@/components/DeckCard';
import StudySession from '@/components/StudySession';
import CreateDeckModal from '@/components/CreateDeckModal';
import CreateFolderModal from '@/components/CreateFolderModal';
import PdfScannerModal from '@/components/PdfScannerModal';
import UrlScannerModal from '@/components/UrlScannerModal';
import DeckDetailModal from '@/components/DeckDetailModal';
import MasteryAnalyticsModal from '@/components/MasteryAnalyticsModal';
import ExploreModal from '@/components/ExploreModal';
import SettingsModal from '@/components/SettingsModal';
import NotificationsModal from '@/components/NotificationsModal';
import BadgesWidget from '@/components/BadgesWidget';
import StreakWidget from '@/components/StreakWidget';
import { INITIAL_DECKS, INITIAL_FOLDERS } from '@/lib/mockData';
import { Deck, UserStats, Folder } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  fetchUserDecks, 
  saveUserDeck, 
  deleteUserDeck, 
  getLocalDecks,
  getLocalFolders,
  saveLocalFolders,
  clearAllLocalDecks,
  resetDefaultDecks
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
  Award, 
  Video, 
  Highlighter, 
  Brain, 
  Zap,
  RotateCcw
} from 'lucide-react';

export default function StudyPage() {
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'due'>('all');

  // Currently active study deck (opens full screen StudySession)
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isPdfScannerOpen, setIsPdfScannerOpen] = useState(false);
  const [isUrlScannerOpen, setIsUrlScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Inline folder creation in sidebar
  const [isCreatingFolderInline, setIsCreatingFolderInline] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Deck inspection and Mastery analytics states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [inspectingDeck, setInspectingDeck] = useState<Deck | null>(null);
  const [isMasteryOpen, setIsMasteryOpen] = useState(false);

  // Community Explore, Settings, Notifications states
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<UserStats>({
    streak: 3,
    last_study_date: null,
    xp: 420,
    cards_studied_today: 8,
    daily_goal: 10,
  });

  // 1. Initial Load & Persistence
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const localFolders = getLocalFolders();
        if (localFolders && localFolders.length > 0 && mounted) {
          setFolders(localFolders);
        }
        const savedStats = localStorage.getItem('alwinyah_stats');
        if (savedStats && mounted) {
          setStats(JSON.parse(savedStats));
        }
      } catch (e) {}

      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user && mounted) {
            setUser(data.session.user);
            const userDecks = await fetchUserDecks(data.session.user.id);
            if (mounted) {
              setDecks(userDecks);
            }
          }
        } catch (e) {}
      } else {
        const local = getLocalDecks();
        if (mounted) {
          setDecks(local);
        }
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateNewFolder = (folder: Folder) => {
    const updated = [...folders, folder];
    setFolders(updated);
    saveLocalFolders(updated);
    setActiveFolderId(folder.id);
  };

  const handleCreateFolderInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const folder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      icon: 'Folder',
      color: '#84a282',
      created_at: new Date().toISOString(),
    };

    handleCreateNewFolder(folder);
    setNewFolderName('');
    setIsCreatingFolderInline(false);
  };

  const handleSaveDeck = async (newDeck: Deck) => {
    const updated = [newDeck, ...decks.filter((d) => d.id !== newDeck.id)];
    setDecks(updated);
    if (user && isSupabaseConfigured) {
      await saveUserDeck(newDeck, user.id);
    } else {
      localStorage.setItem('alwinyah_decks', JSON.stringify(updated));
    }
  };

  const handleDeleteDeck = async (id: string) => {
    const updated = decks.filter((d) => d.id !== id);
    setDecks(updated);
    if (user && isSupabaseConfigured) {
      await deleteUserDeck(id);
    } else {
      localStorage.setItem('alwinyah_decks', JSON.stringify(updated));
    }
  };

  const handleClearAllSampleDecks = () => {
    setDecks([]);
    clearAllLocalDecks();
  };

  const handleResetDefaultDecks = () => {
    const defaults = resetDefaultDecks();
    setDecks(defaults);
  };

  const handleStartDueReview = () => {
    const now = new Date();
    const allDueCards = decks.flatMap((d) => 
      (d.cards || []).filter((c) => !c.due_date || new Date(c.due_date) <= now)
    );

    if (allDueCards.length === 0) return;

    const consolidatedDeck: Deck = {
      id: `rapid-due-${Date.now()}`,
      title: 'Rapid Review: Due Cards',
      description: `Consolidated session of ${allDueCards.length} high-yield cards ready for active recall.`,
      category: 'Active Recall',
      cards_count: allDueCards.length,
      due_count: allDueCards.length,
      created_at: new Date().toISOString(),
      cards: allDueCards,
    };

    setSelectedDeck(consolidatedDeck);
  };

  // Metrics
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

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: decks.length };
    folders.forEach((f) => {
      counts[f.id] = decks.filter((d) => d.folder_id === f.id).length;
    });
    return counts;
  }, [decks, folders]);

  const filteredDecks = useMemo(() => {
    const now = new Date();
    return decks.filter((d) => {
      if (activeFolderId !== 'all' && d.folder_id !== activeFolderId) {
        return false;
      }
      if (filterMode === 'due') {
        const isDue = d.cards && d.cards.length > 0
          ? d.cards.some((c) => !c.due_date || new Date(c.due_date) <= now)
          : (d.due_count || 0) > 0;
        if (!isDue) return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = d.title.toLowerCase().includes(query);
        const descMatch = d.description?.toLowerCase().includes(query);
        const catMatch = d.category?.toLowerCase().includes(query);
        return titleMatch || descMatch || catMatch;
      }
      return true;
    });
  }, [decks, activeFolderId, filterMode, searchTerm]);

  return (
    <div className="min-h-screen bg-[#010736] text-[#fcf1d0] font-sans pb-24 md:pb-16 relative">
      {/* 1. CLEAN TOP STUDY NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#0d1c42]/95 backdrop-blur-md border-b border-[#22396f] px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[#fcf1d0] hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-[#22396f] text-[#fcf1d0] flex items-center justify-center shadow-xs">
              <BookOpen size={16} strokeWidth={2.4} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#fcf1d0] leading-none">ANOWLA</span>
              <span className="text-[10px] font-semibold text-[#fcf1d0]/60 uppercase tracking-wider mt-0.5">Study Studio</span>
            </div>
          </Link>

          {/* Central Workspace Switcher */}
          <nav className="flex items-center p-1 rounded-xl bg-[#010736] border border-[#22396f]">
            <Link
              href="/workspace"
              className="px-3.5 py-1 rounded-lg text-xs font-semibold text-[#fcf1d0]/70 hover:text-[#fcf1d0] transition"
            >
              Workspace
            </Link>
            <span className="px-3.5 py-1 rounded-lg text-xs font-bold bg-[#22396f] text-[#fcf1d0] shadow-xs">
              Decks & Study
            </span>
          </nav>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#fcf1d0] hover:bg-white text-[#010736] shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Deck</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMasteryOpen(true)}
              className="p-2 rounded-xl text-[#fcf1d0]/70 hover:text-[#fcf1d0] hover:bg-white/5 transition cursor-pointer"
              title="Mastery & Memory Analytics"
            >
              <Brain size={16} />
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-[#fcf1d0]/70 hover:text-[#fcf1d0] hover:bg-white/5 transition cursor-pointer"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* Overview Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#22396f]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#fcf1d0]">
              Study Library
            </h1>
            <p className="text-xs text-[#fcf1d0]/70 mt-0.5">
              {totalDueCards > 0 
                ? `${totalDueCards} high-yield cards scheduled for spaced repetition review.` 
                : 'All decks are currently up to date. Excellent consistency on your review schedule.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {stats.streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1c42] border border-[#22396f] text-xs font-semibold text-[#fcf1d0]">
                <span>🔥 {stats.streak} day streak</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1c42] border border-[#22396f] text-xs font-semibold text-[#fcf1d0]/80">
              <span>🎯 {stats.cards_studied_today}/{stats.daily_goal} today</span>
            </div>

            {totalDueCards > 0 && (
              <button
                type="button"
                onClick={handleStartDueReview}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fcf1d0] hover:bg-white text-[#010736] shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Zap size={13} />
                <span>Review Due ({totalDueCards})</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start pt-1">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 space-y-5">
            {/* Folder Manager */}
            <div className="p-4 rounded-2xl bg-[#0d1c42] border border-[#22396f] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#22396f]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#fcf1d0]">
                  Folders
                </span>
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(true)}
                  className="p-1 rounded-lg hover:bg-white/5 text-[#fcf1d0] transition-colors cursor-pointer flex items-center gap-1"
                  title="Create New Folder"
                >
                  <FolderPlus size={15} />
                </button>
              </div>

              {/* Inline Folder Creator */}
              {isCreatingFolderInline && (
                <form onSubmit={handleCreateFolderInline} className="p-2.5 rounded-xl bg-[#010736] border border-[#22396f] space-y-2">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Distributed Systems"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d1c42] border border-[#22396f] text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 focus:outline-none focus:border-[#fcf1d0]"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCreatingFolderInline(false)}
                      className="px-2.5 py-1 rounded text-[11px] text-[#fcf1d0]/70 hover:bg-white/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#fcf1d0] text-[#010736] hover:bg-white cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* Folders List */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveFolderId('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeFolderId === 'all'
                      ? 'bg-[#22396f] text-[#fcf1d0] shadow-xs'
                      : 'text-[#fcf1d0]/80 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers size={14} />
                    <span>All Study Decks</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeFolderId === 'all' ? 'bg-[#fcf1d0] text-[#010736]' : 'bg-[#010736] text-[#fcf1d0]/70'
                  }`}>
                    {folderCounts.all}
                  </span>
                </button>

                {folders.map((folder) => {
                  const isSelected = activeFolderId === folder.id;
                  const count = folderCounts[folder.id] || 0;
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setActiveFolderId(folder.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#22396f] text-[#fcf1d0] shadow-xs'
                          : 'text-[#fcf1d0]/80 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <FolderIcon size={14} className={isSelected ? 'text-[#fcf1d0]' : 'text-[#fcf1d0]/60'} />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-[#fcf1d0] text-[#010736]' : 'bg-[#010736] text-[#fcf1d0]/70'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Add folder CTA */}
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[#22396f] text-xs font-bold text-[#fcf1d0] hover:bg-white/5 cursor-pointer transition"
              >
                <FolderPlus size={14} />
                <span>+ New Folder</span>
              </button>
            </div>

            {/* Quick Study Tools */}
            <div className="p-4 rounded-2xl bg-[#0d1c42] border border-[#22396f] shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#fcf1d0] block pb-1 border-b border-[#22396f]">
                Study Tools
              </span>
              <button
                type="button"
                onClick={() => setIsPdfScannerOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#fcf1d0] hover:bg-white/5 transition text-left cursor-pointer"
              >
                <FileText size={14} className="text-[#fcf1d0]" />
                <span>Auto-Scan PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUrlScannerOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#fcf1d0] hover:bg-white/5 transition text-left cursor-pointer"
              >
                <Video size={14} className="text-[#fcf1d0]" />
                <span>Video / URL To Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExploreOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#fcf1d0] hover:bg-white/5 transition text-left cursor-pointer"
              >
                <Compass size={14} className="text-[#fcf1d0]" />
                <span>Explore Community Decks</span>
              </button>
            </div>
          </aside>

          {/* MAIN DECK EXPLORER SECTION */}
          <section className="flex-1 w-full space-y-6">
            {/* MOBILE & TABLET HORIZONTAL FOLDER TABS */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button
                type="button"
                onClick={() => setActiveFolderId('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFolderId === 'all'
                    ? 'bg-[#22396f] text-[#fcf1d0]'
                    : 'bg-[#0d1c42] text-[#fcf1d0]/80 border border-[#22396f]'
                }`}
              >
                All Decks ({folderCounts.all})
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFolderId(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeFolderId === f.id
                      ? 'bg-[#22396f] text-[#fcf1d0]'
                      : 'bg-[#0d1c42] text-[#fcf1d0]/80 border border-[#22396f]'
                  }`}
                >
                  {f.name} ({folderCounts[f.id] || 0})
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsFolderModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#010736] text-[#fcf1d0] border border-[#22396f] whitespace-nowrap flex items-center gap-1 cursor-pointer hover:bg-white/5"
              >
                <Plus size={13} />
                <span>Folder</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0d1c42] border border-[#22396f] shadow-xs">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#fcf1d0]/50" />
                <input
                  type="text"
                  placeholder="Search study topics, categories, concepts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#010736] border border-[#22396f] text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 focus:outline-none focus:border-[#fcf1d0]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-[#22396f] text-[#fcf1d0]'
                      : 'bg-[#010736] text-[#fcf1d0]/70 hover:bg-white/5'
                  }`}
                >
                  All ({decks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('due')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    filterMode === 'due'
                      ? 'bg-[#22396f] text-[#fcf1d0]'
                      : 'bg-[#010736] text-[#fcf1d0]/70 hover:bg-white/5'
                  }`}
                >
                  Due Today ({totalDueCards})
                </button>
              </div>
            </div>

            {/* Decks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredDecks.map((deck) => {
                const folderName = folders.find((f) => f.id === deck.folder_id)?.name;
                return (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    folderName={folderName}
                    onStudy={() => setSelectedDeck(deck)}
                    onSelect={() => setSelectedDeck(deck)}
                    onInspect={() => {
                      setInspectingDeck(deck);
                      setIsDetailModalOpen(true);
                    }}
                    onDelete={() => handleDeleteDeck(deck.id)}
                  />
                );
              })}
            </div>

            {filteredDecks.length === 0 && (
              <div className="py-16 text-center rounded-3xl bg-[#0d1c42] border border-[#22396f] p-8 shadow-xs">
                <BookOpen size={36} className="mx-auto text-[#fcf1d0] mb-3 opacity-60" />
                <h3 className="text-base font-bold text-[#fcf1d0]">No Study Decks Found</h3>
                <p className="text-xs text-[#fcf1d0]/70 mt-1 max-w-sm mx-auto">
                  {decks.length === 0 
                    ? 'Your study library is currently clear. Use the PDF Markup Workspace or create a new custom deck.' 
                    : 'No flashcard decks match your search in this folder.'}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/workspace"
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#fcf1d0] text-[#010736] hover:bg-white transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>📄 Open PDF Markup Workspace</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsFolderModalOpen(true)}
                    className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#010736] text-[#fcf1d0] border border-[#22396f] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    📁 + New Folder
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#22396f] text-[#fcf1d0] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    ➕ Create Manually
                  </button>
                </div>

                {decks.length === 0 && (
                  <div className="mt-4 pt-3 border-t border-[#22396f] max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={handleResetDefaultDecks}
                      className="text-[11px] font-semibold text-[#fcf1d0]/70 hover:text-[#fcf1d0] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Restore Default Sample Decks</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 3. FULLSCREEN ACTIVE STUDY SESSION OVERLAY */}
      {selectedDeck && (
        <div className="fixed inset-0 z-50 bg-[#010736]/95 backdrop-blur-xl overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center animate-fade-in">
          <div className="w-full max-w-2xl my-auto">
            <StudySession
              deck={selectedDeck}
              onExit={() => setSelectedDeck(null)}
              onSessionComplete={(xpGained: number, cardsStudied: number) => {
                const updatedStats: UserStats = {
                  ...stats,
                  xp: stats.xp + xpGained,
                  cards_studied_today: stats.cards_studied_today + cardsStudied,
                };
                setStats(updatedStats);
                localStorage.setItem('alwinyah_stats', JSON.stringify(updatedStats));
                setSelectedDeck(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 4. CREATE CLINICAL FOLDER MODAL */}
      {isFolderModalOpen && (
        <CreateFolderModal
          isOpen={isFolderModalOpen}
          onClose={() => setIsFolderModalOpen(false)}
          onCreateFolder={handleCreateNewFolder}
        />
      )}

      {/* 5. AUTO-SCAN PDF SCANNER MODAL */}
      {isPdfScannerOpen && (
        <PdfScannerModal
          isOpen={isPdfScannerOpen}
          folders={folders}
          defaultFolderId={activeFolderId !== 'all' ? activeFolderId : undefined}
          onClose={() => setIsPdfScannerOpen(false)}
          onDeckCreated={handleSaveDeck}
        />
      )}

      {/* 7. VIDEO / URL TO CARDS SCANNER */}
      {isUrlScannerOpen && (
        <UrlScannerModal
          isOpen={isUrlScannerOpen}
          onClose={() => setIsUrlScannerOpen(false)}
          onDeckCreated={handleSaveDeck}
        />
      )}

      {/* 8. MANUAL DECK CREATOR */}
      {isCreateOpen && (
        <CreateDeckModal
          isOpen={isCreateOpen}
          folders={folders}
          defaultFolderId={activeFolderId !== 'all' ? activeFolderId : undefined}
          onClose={() => setIsCreateOpen(false)}
          onSave={handleSaveDeck}
        />
      )}

      {/* 9. COMMUNITY & CURATED DECKS EXPLORER */}
      {isExploreOpen && (
        <ExploreModal
          isOpen={isExploreOpen}
          onClose={() => setIsExploreOpen(false)}
          onCloneDeck={handleSaveDeck}
        />
      )}

      {/* 10. DECK DETAIL & CARD INSPECTOR */}
      {isDetailModalOpen && inspectingDeck && (
        <DeckDetailModal
          isOpen={isDetailModalOpen}
          deck={inspectingDeck}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateDeck={handleSaveDeck}
          onStartStudy={(deck) => {
            setIsDetailModalOpen(false);
            setSelectedDeck(deck);
          }}
        />
      )}

      {/* 11. MASTERY ANALYTICS MODAL */}
      {isMasteryOpen && (
        <MasteryAnalyticsModal
          isOpen={isMasteryOpen}
          onClose={() => setIsMasteryOpen(false)}
          decks={decks}
          stats={stats}
        />
      )}

      {/* 12. SETTINGS MODAL */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          stats={stats}
          onUpdateStats={(newStats) => {
            setStats(newStats);
            localStorage.setItem('alwinyah_stats', JSON.stringify(newStats));
          }}
          decks={decks}
          onResetDecks={handleResetDefaultDecks}
          onClearDecks={handleClearAllSampleDecks}
        />
      )}

      {/* 13. NOTIFICATIONS MODAL */}
      {isNotificationsOpen && (
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          stats={stats}
          decks={decks}
        />
      )}
    </div>
  );
}
