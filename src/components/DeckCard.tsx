'use client';

import React from 'react';
import { Deck } from '@/types';
import { Play, Clock, Layers, Trash2 } from 'lucide-react';

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
  onSelect,
  onStudy,
  onDelete,
  onInspect,
  folderName,
}: DeckCardProps) {
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
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#0d1c42] border border-[#22396f] hover:border-[#fcf1d0]/60 p-5 shadow-xs hover:shadow-lg transition-all duration-200">
      {/* Top Meta Row */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-[#010736] px-2.5 py-0.5 text-xs font-semibold text-[#fcf1d0] border border-[#22396f]">
              {deck.category || 'General'}
            </span>
            {folderName && (
              <span className="text-[11px] font-medium text-[#fcf1d0]/60">
                in {folderName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {dueCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#010736] px-2 py-0.5 text-[10px] font-semibold text-[#fcf1d0] border border-[#22396f]">
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
                className="p-1 rounded-lg text-[#fcf1d0]/60 hover:text-rose-400 hover:bg-white/5 transition cursor-pointer"
                title="Delete Deck"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Deck Title & Description */}
        <h3 className="mt-3 text-base font-bold text-[#fcf1d0] group-hover:text-white transition-colors line-clamp-1 leading-snug">
          {deck.title}
        </h3>
        <p className="mt-1 text-xs text-[#fcf1d0]/70 line-clamp-2 leading-relaxed">
          {deck.description || 'Active recall study questions and conceptual cards.'}
        </p>

        {/* Retention Progress */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#fcf1d0]/70">
            <span>Retention {masteryPercent}%</span>
            <span>{masteredCount}/{cardsCount} cards</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#010736] border border-[#22396f] overflow-hidden">
            <div
              className="h-full bg-[#fcf1d0] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, masteryPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info & Study Actions */}
      <div className="mt-4 pt-3.5 border-t border-[#22396f] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-[#fcf1d0]/60">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#fcf1d0]" />
            {estMinutes}m
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-[#fcf1d0]" />
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
              className="px-2.5 py-1 text-xs font-semibold text-[#fcf1d0]/70 hover:text-[#fcf1d0] hover:bg-white/5 rounded-lg transition cursor-pointer"
              title="Inspect cards"
            >
              Cards
            </button>
          )}

          <button
            type="button"
            onClick={handleStudy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fcf1d0] hover:bg-white text-[#010736] shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Study</span>
          </button>
        </div>
      </div>
    </div>
  );
}
