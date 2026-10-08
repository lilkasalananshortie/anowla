'use client';

import React, { useState, useEffect } from 'react';
import Navbar, { ThemeColor } from '@/components/Navbar';
import DeckCard from '@/components/DeckCard';
import StudySession from '@/components/StudySession';
import CreateDeckModal from '@/components/CreateDeckModal';
import StreakWidget from '@/components/StreakWidget';
import BadgesWidget from '@/components/BadgesWidget';
import BottomDock from '@/components/BottomDock';
import { INITIAL_DECKS } from '@/lib/mockData';
import { Deck, UserStats } from '@/types';
import { Search, BookOpen, Layers } from 'lucide-react';

export default function Home() {
  const [theme, setTheme] = useState<ThemeColor>('indigo');
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [stats, setStats] = useState<UserStats>({
    streak: 3,
    last_study_date: null,
    xp: 420,
    cards_studied_today: 8,
    daily_goal: 10,
  });

  // Theme Background Map (Replicating the side-by-side screens in the inspiration image)
  const themeStyles: Record<ThemeColor, { bg: string; secondary: string }> = {
    indigo: { bg: 'bg-[#161152]', secondary: 'bg-[#221b6a]' },
    plum: { bg: 'bg-[#52163b]', secondary: 'bg-[#67214c]' },
    violet: { bg: 'bg-[#5c3db7]', secondary: 'bg-[#6c4cc9]' },
    sage: { bg: 'bg-[#4e6853]', secondary: 'bg-[#5c7a62]' },
  };

  const currentThemeStyle = themeStyles[theme];

  // Load persisted decks and stats from localStorage
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
      const savedTheme = localStorage.getItem('alwinyah_theme') as ThemeColor;
      if (savedTheme && themeStyles[savedTheme]) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, []);

  const handleThemeChange = (newTheme: ThemeColor) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('alwinyah_theme', newTheme);
    } catch (e) {}
  };

  const handleDeckCreated = (newDeck: Deck) => {
    const updated = [newDeck, ...decks];
    setDecks(updated);
    try {
      localStorage.setItem('alwinyah_decks', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSessionComplete = (xpGained: number, cardsStudied: number) => {
    setStats((prev) => {
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

  const categories = ['All', ...Array.from(new Set(decks.map((d) => d.category || 'General')))];

  const filteredDecks = decks.filter((deck) => {
    const matchesSearch =
      deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || deck.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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
        onGoHome={() => setSelectedDeck(null)}
      />

      <main className="mx-auto max-w-5xl px-4 sm:px-8 space-y-7">
        {selectedDeck ? (
          <StudySession
            deck={selectedDeck}
            onExit={() => setSelectedDeck(null)}
            onSessionComplete={handleSessionComplete}
          />
        ) : (
          <>
            {/* 1. Badges Section (Top of Reference Image) */}
            <BadgesWidget stats={stats} />

            {/* 2. Donut & Weekly Activity Metrics (Middle of Reference Image) */}
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

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
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
      />

      {/* Modal */}
      <CreateDeckModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onDeckCreated={handleDeckCreated}
      />
    </div>
  );
}
