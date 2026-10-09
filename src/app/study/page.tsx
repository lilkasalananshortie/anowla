'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DeckCard from '@/components/DeckCard';
import StudySession from '@/components/StudySession';
import CreateDeckModal from '@/components/CreateDeckModal';
import CreateFolderModal from '@/components/CreateFolderModal';
import PdfScannerModal from '@/components/PdfScannerModal';
import PdfEditorWorkspace from '@/components/PdfEditorWorkspace';
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
  const [isPdfEditorOpen, setIsPdfEditorOpen] = useState(false);
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
      title: 'Rapid Review: Due Clinical Cards',
      description: `Consolidated session of ${allDueCards.length} high-yield cards ready for active recall.`,
      category: 'Clinical Mastery',
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
    <div className="min-h-screen bg-[#fefaf3] bg-grid-clinical text-[#19251a] font-sans pb-24 md:pb-16 relative">
      {/* 1. TOP CLINICAL HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#fefaf3]/95 backdrop-blur-md border-b border-[#dfe8dc] px-4 sm:px-8 py-3.5 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[#19251a] hover:opacity-85 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-[#84a282] text-white flex items-center justify-center shadow-md shadow-[#84a282]/25 ring-1 ring-[#b8cfb3]/40">
                <Stethoscope size={18} strokeWidth={2.4} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[#19251a] leading-none">ANOWLA</span>
                <span className="text-[10px] font-semibold text-[#84a282] uppercase tracking-wider mt-0.5">Clinical Studio</span>
              </div>
            </Link>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* PROMINENT PDF MARKUP & EDITOR (ALWAYS VISIBLE ON MOBILE, TABLET & DESKTOP) */}
            <Link
              href="/workspace"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition-all shadow-md shadow-[#84a282]/25 cursor-pointer whitespace-nowrap active:scale-95"
              title="Open interactive PDF reader, highlighter & markup workspace"
            >
              <Highlighter size={14} />
              <span>PDF Workspace & Editor</span>
            </Link>

            {/* CREATE FOLDER BUTTON */}
            <button
              type="button"
              onClick={() => setIsFolderModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-white border border-[#dfe8dc] text-[#19251a] hover:bg-[#ebf2e9] transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              title="Create new clinical folder"
            >
              <FolderPlus size={14} className="text-[#84a282]" />
              <span>+ New Folder</span>
            </button>

            {/* AUTO-SCAN PDF EXTRACTOR */}
            <button
              type="button"
              onClick={() => setIsPdfScannerOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-white border border-[#dfe8dc] text-[#19251a] hover:bg-[#ebf2e9] transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              title="Auto-extract flashcard decks from clinical PDFs"
            >
              <FileText size={13} className="text-[#84a282]" />
              <span>Auto-Scan PDF</span>
            </button>

            {/* VIDEO / URL SCANNER */}
            <button
              type="button"
              onClick={() => setIsUrlScannerOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer whitespace-nowrap"
              title="YouTube / Web URL to flashcards"
            >
              <Video size={13} className="text-rose-600" />
              <span>Video / URL</span>
            </button>

            {/* MANUAL DECK CREATOR */}
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-white border border-[#dfe8dc] text-[#19251a] hover:bg-[#ebf2e9] transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={14} className="text-[#84a282]" />
              <span className="hidden sm:inline">New Deck</span>
            </button>

            {/* EXPLORE COMMUNITY / CURATED */}
            <button
              type="button"
              onClick={() => setIsExploreOpen(true)}
              className="p-2 rounded-full bg-white border border-[#dfe8dc] text-[#586c5a] hover:text-[#19251a] hover:bg-[#ebf2e9] transition-colors cursor-pointer shadow-xs"
              title="Explore Medical Decks"
            >
              <Compass size={17} />
            </button>

            {/* MASTERY ANALYTICS */}
            <button
              type="button"
              onClick={() => setIsMasteryOpen(true)}
              className="p-2 rounded-full bg-white border border-[#dfe8dc] text-[#586c5a] hover:text-[#19251a] hover:bg-[#ebf2e9] transition-colors cursor-pointer shadow-xs"
              title="Mastery & Memory Analytics"
            >
              <Brain size={17} />
            </button>

            {/* NOTIFICATIONS */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded-full bg-white border border-[#dfe8dc] text-[#586c5a] hover:text-[#19251a] hover:bg-[#ebf2e9] transition-colors cursor-pointer shadow-xs"
              title="Daily Notifications"
            >
              <Bell size={17} />
            </button>

            {/* SETTINGS */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-white border border-[#dfe8dc] text-[#586c5a] hover:text-[#19251a] hover:bg-[#ebf2e9] transition-colors cursor-pointer shadow-xs"
              title="Settings & Decks Management"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* Serene Clinical Practice Banner & Rapid Review */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#19251a] via-[#1f3022] to-[#283e2c] text-white shadow-xl border border-[#84a282]/30 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">🩺</span>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Clinical Mastery Workspace
              </h1>
              {stats.streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-black text-amber-300 border border-amber-400/30 animate-fire">
                  🔥 {stats.streak}-day streak
                </span>
              )}
            </div>
            <p className="text-xs text-[#b8cfb3]">
              {totalDueCards > 0 
                ? `You have ${totalDueCards} high-yield clinical cards due today for spaced repetition review.` 
                : 'All decks are currently up to date! Great job staying on top of your clinical exam schedule.'}
            </p>
          </div>

          {totalDueCards > 0 && (
            <button
              type="button"
              onClick={handleStartDueReview}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap animate-pulse-glow"
            >
              <Zap size={14} className="fill-amber-300 text-amber-300" />
              <span>Rapid Review ({totalDueCards} Due)</span>
            </button>
          )}
        </div>

        {/* CLINICAL PDF MARKUP SPOTLIGHT BANNER */}
        <div className="rounded-3xl border border-[#b8cfb3]/80 bg-white/90 backdrop-blur-sm p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all hover:border-[#84a282]">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#84a282] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#84a282]/25">
              <Highlighter size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#19251a]">
                  PDF Reader & Clinical Markup Workspace
                </h2>
                <span className="rounded-full bg-[#84a282]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#19251a]">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-[#586c5a] max-w-2xl leading-relaxed">
                Upload medical PDFs or paste lecture slides. Highlight essential concepts (<code className="bg-[#ebf2e9] px-1 py-0.5 rounded text-[#19251a]">==highlight==</code>), insert clinical priority notes, strip slide boilerplate, and generate active recall decks directly into your clinical folders.
              </p>
            </div>
          </div>
          <Link
            href="/workspace"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/25 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Highlighter size={14} />
            <span>Open PDF Markup Workspace</span>
          </Link>
        </div>

        {/* Streak & Weekly Progress Widgets */}
        <StreakWidget stats={stats} />
        
        {/* Badges / Milestones Widget */}
        <BadgesWidget stats={stats} />

        <div className="flex flex-col lg:flex-row gap-8 items-start pt-2">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-24 space-y-6">
            {/* Quick Study Metrics */}
            <div className="p-4 rounded-2xl bg-white border border-[#dfe8dc] shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#19251a] mb-2">
                <span>Daily Quota</span>
                <span className="text-[#84a282]">{stats.cards_studied_today} / {stats.daily_goal} cards</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#fefaf3] overflow-hidden border border-[#dfe8dc]">
                <div
                  className="h-full bg-[#84a282] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (stats.cards_studied_today / stats.daily_goal) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[#586c5a]">
                {totalDueCards > 0 ? `${totalDueCards} cards due for clinical review today` : 'All caught up for today!'}
              </p>
            </div>

            {/* Folder Manager */}
            <div className="p-4 rounded-2xl bg-white border border-[#dfe8dc] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#dfe8dc]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#19251a]">
                  Clinical Folders
                </span>
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(true)}
                  className="p-1 rounded-lg hover:bg-[#ebf2e9] text-[#84a282] transition-colors cursor-pointer flex items-center gap-1"
                  title="Create New Folder"
                >
                  <FolderPlus size={16} />
                </button>
              </div>

              {/* Inline Folder Creator */}
              {isCreatingFolderInline && (
                <form onSubmit={handleCreateFolderInline} className="p-2.5 rounded-xl bg-[#fefaf3] border border-[#b8cfb3] space-y-2">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Critical Care ICU"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#dfe8dc] text-xs text-[#19251a] focus:outline-none focus:border-[#84a282]"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCreatingFolderInline(false)}
                      className="px-2.5 py-1 rounded text-[11px] text-[#586c5a] hover:bg-black/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#84a282] text-white hover:bg-[#6e8c6c] cursor-pointer"
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
                      ? 'bg-[#84a282] text-white shadow-xs'
                      : 'text-[#19251a] hover:bg-[#ebf2e9]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers size={14} />
                    <span>All Clinical Decks</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeFolderId === 'all' ? 'bg-white/20 text-white' : 'bg-[#fefaf3] text-[#586c5a]'
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
                          ? 'bg-[#84a282] text-white shadow-xs'
                          : 'text-[#19251a] hover:bg-[#ebf2e9]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <FolderIcon size={14} className={isSelected ? 'text-white' : 'text-[#84a282]'} />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#fefaf3] text-[#586c5a]'
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
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[#b8cfb3] text-xs font-bold text-[#84a282] hover:bg-[#ebf2e9] cursor-pointer transition"
              >
                <FolderPlus size={14} />
                <span>+ New Folder</span>
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
                    ? 'bg-[#84a282] text-white'
                    : 'bg-white text-[#19251a] border border-[#dfe8dc]'
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
                      ? 'bg-[#84a282] text-white'
                      : 'bg-white text-[#19251a] border border-[#dfe8dc]'
                  }`}
                >
                  {f.name} ({folderCounts[f.id] || 0})
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsFolderModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#ebf2e9] text-[#84a282] border border-[#b8cfb3] whitespace-nowrap flex items-center gap-1 cursor-pointer hover:bg-[#dfe8dc]"
              >
                <Plus size={13} />
                <span>Folder</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#dfe8dc] shadow-xs">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586c5a]" />
                <input
                  type="text"
                  placeholder="Search clinical topics, drug names, mnemonics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#fefaf3] border border-[#dfe8dc] text-xs text-[#19251a] focus:outline-none focus:border-[#84a282]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-[#84a282] text-white'
                      : 'bg-[#fefaf3] text-[#586c5a] hover:bg-[#ebf2e9]'
                  }`}
                >
                  All ({decks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('due')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    filterMode === 'due'
                      ? 'bg-[#84a282] text-white'
                      : 'bg-[#fefaf3] text-[#586c5a] hover:bg-[#ebf2e9]'
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
              <div className="py-16 text-center rounded-3xl bg-white border border-[#dfe8dc] p-8 shadow-xs">
                <BookOpen size={36} className="mx-auto text-[#84a282] mb-3 opacity-60" />
                <h3 className="text-base font-bold text-[#19251a]">No Clinical Decks Found</h3>
                <p className="text-xs text-[#586c5a] mt-1 max-w-sm mx-auto">
                  {decks.length === 0 
                    ? 'Your study library is currently clear. Use the PDF Markup Workspace or create a new custom deck.' 
                    : 'No flashcard decks match your search in this folder.'}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/workspace"
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>📄 Open PDF Markup Workspace</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsFolderModalOpen(true)}
                    className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#ebf2e9] text-[#19251a] hover:bg-[#dfe8dc] transition-colors cursor-pointer"
                  >
                    📁 + New Folder
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-[#dfe8dc] text-[#19251a] hover:bg-[#ebf2e9] transition-colors cursor-pointer"
                  >
                    ➕ Create Manually
                  </button>
                </div>

                {decks.length === 0 && (
                  <div className="mt-4 pt-3 border-t border-[#dfe8dc] max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={handleResetDefaultDecks}
                      className="text-[11px] font-semibold text-[#586c5a] hover:text-[#19251a] inline-flex items-center gap-1 cursor-pointer"
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

      {/* 3. FULLSCREEN ACTIVE STUDY SESSION OVERLAY (QUIZ, MNEMONIC, FLIP, SM-2) */}
      {selectedDeck && (
        <div className="fixed inset-0 z-50 bg-[#141d16]/95 backdrop-blur-xl overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center animate-fade-in">
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

      {/* 5. INTERACTIVE PDF NOTE & MARKUP WORKSPACE */}
      {isPdfEditorOpen && (
        <PdfEditorWorkspace
          isOpen={isPdfEditorOpen}
          folders={folders}
          onCreateFolder={(name) => {
            const folder: Folder = {
              id: `folder-${Date.now()}`,
              name,
              icon: 'Folder',
              color: '#84a282',
              created_at: new Date().toISOString(),
            };
            handleCreateNewFolder(folder);
            return folder;
          }}
          defaultFolderId={activeFolderId !== 'all' ? activeFolderId : undefined}
          onClose={() => setIsPdfEditorOpen(false)}
          onSaveDeck={handleSaveDeck}
        />
      )}

      {/* 6. AUTO-SCAN PDF SCANNER MODAL */}
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
