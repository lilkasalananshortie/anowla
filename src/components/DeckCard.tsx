'use client';

import React from 'react';
import { Deck } from '@/types';
import { Play, Sparkles, Layers, Clock } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  onSelect: (deck: Deck) => void;
}

export default function DeckCard({ deck, onSelect }: DeckCardProps) {
  const cardsCount = deck.cards?.length || deck.cards_count || 0;
  const dueCount = deck.cards ? deck.cards.filter(c => !c.due_date || new Date(c.due_date) <= new Date()).length : deck.due_count;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-500/50">
      <div>
        {/* Category & Badge */}
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {deck.category || 'General'}
          </span>
          {dueCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Clock className="h-3 w-3" />
              {dueCount} due
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="mt-4 text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors dark:text-zinc-100 dark:group-hover:text-indigo-400">
          {deck.title}
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 line-clamp-2 dark:text-zinc-400">
          {deck.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Layers className="h-3.5 w-3.5" />
          <span>{cardsCount} cards</span>
        </div>

        <button
          onClick={() => onSelect(deck)}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-indigo-600 active:scale-95 cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-indigo-500 dark:hover:text-white"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Study</span>
        </button>
      </div>
    </div>
  );
}
