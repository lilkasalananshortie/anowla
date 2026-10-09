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
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white border border-[#dfe8dc] hover:border-[#84a282] p-5 shadow-xs hover:shadow-md transition-all duration-200">
      {/* Top Meta Row */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-[#ebf2e9] px-2.5 py-0.5 text-xs font-semibold text-[#19251a]">
              {deck.category || 'General'}
            </span>
            {folderName && (
              <span className="text-[11px] font-medium text-[#586c5a]">
                in {folderName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {dueCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#19251a] px-2 py-0.5 text-[10px] font-semibold text-[#fefaf3]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>{dueCount} due</span>
              </span>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete deck "${deck.title}"?`)) {
                    onDelete(deck.id);
                  }
                }}
                className="p-1 rounded-lg text-[#586c5a] hover:text-rose-600 hover:bg-black/5 transition cursor-pointer"
                title="Delete Deck"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Deck Title & Description */}
        <h3 className="mt-3 text-base font-bold text-[#19251a] group-hover:text-[#84a282] transition-colors line-clamp-1 leading-snug">
          {deck.title}
        </h3>
        <p className="mt-1 text-xs text-[#586c5a] line-clamp-2 leading-relaxed">
          {deck.description || 'Clinical active recall questions and rationales.'}
        </p>

        {/* Retention Progress */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#586c5a]">
            <span>Retention {masteryPercent}%</span>
            <span>{masteredCount}/{cardsCount} cards</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#ebf2e9] overflow-hidden">
            <div
              className="h-full bg-[#84a282] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, masteryPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info & Study Actions */}
      <div className="mt-4 pt-3.5 border-t border-[#dfe8dc] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-[#586c5a]">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#84a282]" />
            {estMinutes}m
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-[#84a282]" />
            {cardsCount} Qs
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onInspect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInspect(deck);
              }}
              className="px-2.5 py-1 text-xs font-semibold text-[#586c5a] hover:text-[#19251a] hover:bg-[#ebf2e9] rounded-lg transition cursor-pointer"
              title="Inspect cards"
            >
              Cards
            </button>
          )}

          <button
            type="button"
            onClick={handleStudy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Study</span>
          </button>
        </div>
      </div>
    </div>
  );
}
