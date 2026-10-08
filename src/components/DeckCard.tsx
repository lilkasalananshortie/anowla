'use client';

import React from 'react';
import { Deck } from '@/types';
import { Play, Heart, Clock, Layers, Trash2 } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  accentIndex?: number;
  onSelect: (deck: Deck) => void;
  onDelete?: (deckId: string) => void;
}

export default function DeckCard({ deck, accentIndex = 0, onSelect, onDelete }: DeckCardProps) {
  const [liked, setLiked] = React.useState(false);

  // Soft, muted, calm header palettes (easy on the eyes)
  const mutedStyles = [
    {
      bg: 'bg-[#dbe7dc]', // Soft muted sage
      text: 'text-stone-900',
      tag: 'bg-black/10 text-stone-800',
    },
    {
      bg: 'bg-[#d5e2ed]', // Dusty soft blue
      text: 'text-stone-900',
      tag: 'bg-black/10 text-stone-800',
    },
    {
      bg: 'bg-[#ebe4d8]', // Warm sand / linen
      text: 'text-stone-900',
      tag: 'bg-black/10 text-stone-800',
    },
    {
      bg: 'bg-[#e2dbe6]', // Muted soft lilac
      text: 'text-stone-900',
      tag: 'bg-black/10 text-stone-800',
    },
  ];

  const currentAccent = mutedStyles[accentIndex % mutedStyles.length];
  const cardsCount = deck.cards?.length || deck.cards_count || 0;
  const dueCount = deck.cards
    ? deck.cards.filter((c) => !c.due_date || new Date(c.due_date) <= new Date()).length
    : deck.due_count;

  const estMinutes = Math.max(2, Math.round(cardsCount * 0.8));

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white shadow-md shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-stone-100">
      
      {/* Top Banner */}
      <div className={`relative flex flex-col justify-between p-6 ${currentAccent.bg} min-h-[135px]`}>
        
        {/* Top Badges & Delete Action */}
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${currentAccent.tag}`}>
            {deck.category || 'General'}
          </span>
          
          <div className="flex items-center gap-1.5">
            {dueCount > 0 && (
              <span className="rounded-full bg-stone-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white">
                {dueCount} due
              </span>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete the deck "${deck.title}"?`)) {
                    onDelete(deck.id);
                  }
                }}
                className="p-1 rounded-full text-stone-400 hover:text-rose-600 hover:bg-black/5 transition cursor-pointer"
                title="Delete Deck"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Clean Headline */}
        <h3 className={`mt-3 text-lg font-bold tracking-tight leading-snug ${currentAccent.text} line-clamp-2`}>
          {deck.title}
        </h3>
      </div>

      {/* Card Details & Actions */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <p className="text-xs font-normal text-stone-500 line-clamp-2 leading-relaxed">
          {deck.description || 'Active recall flashcards for deep memorization.'}
        </p>

        {/* Footer info: time, cards, study button, heart */}
        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3.5">
          <div className="flex items-center gap-3 text-[11px] font-medium text-stone-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {estMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {cardsCount} cards
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className="p-1 text-stone-300 hover:text-rose-400 transition cursor-pointer"
              title="Save to favorites"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  liked ? 'fill-rose-400 text-rose-400' : 'text-stone-300'
                }`}
              />
            </button>

            <button
              onClick={() => onSelect(deck)}
              className="flex items-center gap-1.5 rounded-full bg-neutral-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-700 active:scale-95 cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Study</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
