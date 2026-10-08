'use client';

import React from 'react';
import { Deck } from '@/types';
import { Play, Heart, Clock, Layers } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  accentIndex?: number;
  onSelect: (deck: Deck) => void;
}

export default function DeckCard({ deck, accentIndex = 0, onSelect }: DeckCardProps) {
  const [liked, setLiked] = React.useState(false);

  // Pastel header colors inspired by the reference screens
  const pastelStyles = [
    {
      bg: 'bg-[#d8f967]', // Volt Lime
      text: 'text-zinc-900',
      tag: 'bg-black/10 text-zinc-900',
    },
    {
      bg: 'bg-[#b6effe]', // Sky Blue
      text: 'text-zinc-900',
      tag: 'bg-black/10 text-zinc-900',
    },
    {
      bg: 'bg-[#dccaff]', // Soft Lilac
      text: 'text-zinc-900',
      tag: 'bg-black/10 text-zinc-900',
    },
    {
      bg: 'bg-[#ffc5d8]', // Blush Pink
      text: 'text-zinc-900',
      tag: 'bg-black/10 text-zinc-900',
    },
  ];

  const currentAccent = pastelStyles[accentIndex % pastelStyles.length];
  const cardsCount = deck.cards?.length || deck.cards_count || 0;
  const dueCount = deck.cards
    ? deck.cards.filter((c) => !c.due_date || new Date(c.due_date) <= new Date()).length
    : deck.due_count;

  // Approximate study time: ~1 min per 2 cards
  const estMinutes = Math.max(2, Math.round(cardsCount * 0.8));

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white shadow-lg shadow-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
      
      {/* Top Banner (Pastel Graphic Style from Reference) */}
      <div className={`relative flex flex-col justify-between p-6 ${currentAccent.bg} min-h-[140px]`}>
        
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${currentAccent.tag}`}>
            {deck.category || 'General'}
          </span>
          {dueCount > 0 && (
            <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
              {dueCount} due
            </span>
          )}
        </div>

        {/* Big Bold Headline */}
        <h3 className={`mt-3 text-xl font-black tracking-tight leading-tight ${currentAccent.text} line-clamp-2`}>
          {deck.title}
        </h3>
      </div>

      {/* Card Details & Actions */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <p className="text-xs font-medium text-zinc-500 line-clamp-2 leading-relaxed">
          {deck.description || 'Active recall flashcards for deep memorization.'}
        </p>

        {/* Footer info: time, cards, study button, heart */}
        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5">
          <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400">
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
              className="p-1 text-zinc-300 hover:text-rose-500 transition cursor-pointer"
              title="Save to favorites"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  liked ? 'fill-rose-500 text-rose-500' : 'text-zinc-300'
                }`}
              />
            </button>

            <button
              onClick={() => onSelect(deck)}
              className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:bg-indigo-600 active:scale-95 cursor-pointer"
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
