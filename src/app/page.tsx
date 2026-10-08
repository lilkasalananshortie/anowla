'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DeckCard from '@/components/DeckCard';
import StudySession from '@/components/StudySession';
import CreateDeckModal from '@/components/CreateDeckModal';
import StreakWidget from '@/components/StreakWidget';
import { INITIAL_DECKS } from '@/lib/mockData';
import { Deck, UserStats } from '@/types';
import { Plus, Search, BookOpen, Database } from 'lucide-react';

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [stats, setStats] = useState<UserStats>({
    streak: 3,
    last_study_date: null,
    xp: 420,
    cards_studied_today: 9,
    daily_goal: 15,
  });

  // Load persisted decks and stats from localStorage on client mount
  useEffect(() => {
    try {
      const savedDecks = localStorage.getItem('alwinyah_decks');
      if (savedDecks) {
        setDecks(JSON.parse(savedDecks));
      }

      const savedStats = localStorage.getItem('alwinyah_stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.warn('LocalStorage load error', e);
    }
  }, []);

  // Save to localStorage when decks change
  const handleDeckCreated = (newDeck: Deck) => {
    const updated = [newDeck, ...decks];
    setDecks(updated);
    try {
      localStorage.setItem('alwinyah_decks', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSessionComplete = (xpGained: number, cardsStudied: number) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        xp: prev.xp + xpGained,
        cards_studied_today: prev.cards_studied_today + cardsStudied,
      };
      try {
        localStorage.setItem('alwinyah_stats', JSON.stringify(newStats));
      } catch (e) {}
      return newStats;
    });
  };

  const categories = ['All', ...Array.from(new Set(decks.map(d => d.category || 'General')))];

  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || deck.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar
        streak={stats.streak}
        xp={stats.xp}
        onOpenCreate={() => setIsCreateOpen(true)}
        onGoHome={() => setSelectedDeck(null)}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {selectedDeck ? (
          <StudySession
            deck={selectedDeck}
            onExit={() => setSelectedDeck(null)}
            onSessionComplete={handleSessionComplete}
          />
        ) : (
          <div className="space-y-8">
            {/* Gamification Streak & Stats Banner */}
            <StreakWidget stats={stats} />

            {/* Header & Quick Action */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                  Study Decks
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Active recall and spaced repetition flashcards for efficient memorization.
                </p>
              </div>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>New Deck</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search decks..."
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Decks Grid */}
            {filteredDecks.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDecks.map(deck => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    onSelect={(d) => setSelectedDeck(d)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
                <BookOpen className="mx-auto h-8 w-8 text-zinc-400" />
                <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-white">No decks found</h3>
                <p className="mt-1 text-xs text-zinc-500">Try adjusting your search or create a new deck.</p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Create Deck
                </button>
              </div>
            )}

            {/* Supabase Integration Helper Card */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 dark:border-indigo-950 dark:bg-indigo-950/20">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-indigo-950 dark:text-indigo-200">
                    <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Supabase Free Database Ready
                  </h4>
                  <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed max-w-2xl">
                    Alwinyah persists your decks and stats locally in your browser. Whenever you want to sync your decks to cloud storage across devices, add your free <strong>Supabase</strong> credentials to <code className="rounded bg-indigo-100/80 px-1 py-0.5 dark:bg-indigo-900/60 font-mono">.env.local</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <CreateDeckModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onDeckCreated={handleDeckCreated}
      />
    </div>
  );
}
