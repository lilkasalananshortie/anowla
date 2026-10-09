'use client';

import React from 'react';
import { Deck } from '@/types';
import { Play, Heart, Clock, Layers, Trash2, Edit3, Sparkles } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  accentIndex?: number;
  onSelect?: (deck: Deck) => void;
  onStudy?: (deck: Deck) => void;
  onDelete?: (deckId: string) => void;
  onInspect?: (deckId: Deck) => void;
  folderName?: string;
}

export default function DeckCard({
  deck,
  accentIndex = 0,
  onSelect,
  onStudy,
  onDelete,
  onInspect,
  folderName,
}: DeckCardProps) {
  const [liked, setLiked] = React.useState(false);

  const handleStudy = () => {
    if (onStudy) onStudy(deck);
    else if (onSelect) onSelect(deck);
  };

  // Color Hunt Palette (#f6e2e9, #fefaf3, #b8cfb3, #84a282)
  const clinicalStyles = [
    {
      bg: 'bg-[#b8cfb3]/30', // Soft sage
      text: 'text-[#19251a]',
      tag: 'bg-[#84a282]/20 text-[#19251a]',
      accentBorder: 'hover:border-[#84a282]',
    },
    {
      bg: 'bg-[#f6e2e9]/50', // Blush rose
      text: 'text-[#19251a]',
      tag: 'bg-[#f6e2e9] text-[#703348]',
      accentBorder: 'hover:border-[#e2a8b8]',
    },
    {
      bg: 'bg-[#ebf2e9]', // Light tint sage
      text: 'text-[#19251a]',
      tag: 'bg-[#b8cfb3]/40 text-[#19251a]',
      accentBorder: 'hover:border-[#84a282]',
    },
    {
      bg: 'bg-[#fefaf3]', // Warm ivory cream
      text: 'text-[#19251a]',
      tag: 'bg-[#84a282]/15 text-[#19251a]',
      accentBorder: 'hover:border-[#84a282]',
    },
  ];

  const currentAccent = clinicalStyles[accentIndex % clinicalStyles.length];
  const cardsCount = deck.cards?.length || deck.cards_count || 0;
  const dueCount = deck.cards
    ? deck.cards.filter((c) => !c.due_date || new Date(c.due_date) <= new Date()).length
    : (deck.due_count || 0);

  // Compute mastery percentage based on SM-2 repetitions
  const masteredCount = deck.cards
    ? deck.cards.filter((c) => (c.repetitions || 0) >= 2).length
    : Math.round(cardsCount * 0.4);
  const masteryPercent = cardsCount > 0 ? Math.round((masteredCount / cardsCount) * 100) : 0;

  const estMinutes = Math.max(2, Math.round(cardsCount * 0.8));

  return (
    <div className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-[#dfe8dc] ${currentAccent.accentBorder}`}>
      {/* Top Banner */}
      <div className={`relative flex flex-col justify-between p-6 ${currentAccent.bg} min-h-[135px] border-b border-[#dfe8dc] transition-colors`}>
        {/* Top Badges & Delete Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${currentAccent.tag}`}>
              {deck.category || 'General'}
            </span>
            {folderName && (
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#19251a] border border-black/5">
                📁 {folderName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {dueCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#19251a] px-2.5 py-0.5 text-[10px] font-bold text-[#fefaf3] shadow-xs animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>{dueCount} due</span>
              </span>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete the clinical deck "${deck.title}"?`)) {
                    onDelete(deck.id);
                  }
                }}
                className="p-1 rounded-full text-[#586c5a] hover:text-rose-600 hover:bg-black/5 transition cursor-pointer"
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
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div>
          <p className="text-xs font-normal text-[#586c5a] line-clamp-2 leading-relaxed">
            {deck.description || 'Clinical active-recall deck with rationales.'}
          </p>

          {/* Mini Mastery Bar */}
          <div className="mt-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#586c5a]">
              <span className="flex items-center gap-1 text-[#84a282]">
                <Sparkles size={11} />
                <span>{masteryPercent}% Clinical Retention</span>
              </span>
              <span>{masteredCount}/{cardsCount} cards</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#fefaf3] overflow-hidden border border-[#dfe8dc]">
              <div
                className="h-full bg-gradient-to-r from-[#b8cfb3] to-[#84a282] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(8, masteryPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer info: time, cards, study button, heart */}
        <div className="flex items-center justify-between border-t border-[#dfe8dc] pt-3.5">
          <div className="flex items-center gap-3 text-[11px] font-medium text-[#586c5a]">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#84a282]" />
              {estMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-[#84a282]" />
              {cardsCount} cards
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className="p-1 text-[#586c5a]/50 hover:text-rose-400 transition cursor-pointer"
              title="Save to favorites"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  liked ? 'fill-rose-400 text-rose-400' : 'text-[#586c5a]/40'
                }`}
              />
            </button>

            {onInspect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect(deck);
                }}
                className="flex items-center gap-1 rounded-full bg-[#fefaf3] hover:bg-[#ebf2e9] border border-[#dfe8dc] px-3 py-1.5 text-xs font-semibold text-[#19251a] transition cursor-pointer"
                title="View & Edit Cards"
              >
                <Edit3 className="h-3 w-3 text-[#84a282]" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            )}

            <button
              onClick={handleStudy}
              className="flex items-center gap-1.5 rounded-full bg-[#84a282] hover:bg-[#6e8c6c] px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-[#84a282]/20 transition active:scale-95 cursor-pointer group-hover:shadow-lg"
            >
              <Play className="h-3 w-3 fill-current group-hover:translate-x-0.5 transition-transform" />
              <span>Study</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
