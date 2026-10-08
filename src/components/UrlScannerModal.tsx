'use client';

import React, { useState } from 'react';
import { Deck, Card } from '@/types';
import { 
  X, 
  Video, 
  Globe, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Layers, 
  Trash2, 
  ArrowRight,
  Play,
  FileText,
  AlertCircle
} from 'lucide-react';

interface UrlScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (deck: Deck) => void;
}

export default function UrlScannerModal({
  isOpen,
  onClose,
  onDeckCreated,
}: UrlScannerModalProps) {
  const [url, setUrl] = useState('');
  const [cardCount, setCardCount] = useState<number>(10);
  const [category, setCategory] = useState('Medicine');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated deck state
  const [extractedTitle, setExtractedTitle] = useState('');
  const [generatedCards, setGeneratedCards] = useState<Card[]>([]);

  if (!isOpen) return null;

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/url-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          cardCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract flashcards from URL');
      }

      if (!data.cards || data.cards.length === 0) {
        throw new Error('No flashcards could be generated from this link.');
      }

      setExtractedTitle(data.title || 'Web / Video Study Deck');
      setGeneratedCards(data.cards);
    } catch (err: any) {
      setError(err.message || 'Error processing URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDeck = () => {
    if (generatedCards.length === 0) return;

    const newDeck: Deck = {
      id: crypto.randomUUID ? crypto.randomUUID() : `deck_${Date.now()}`,
      title: extractedTitle.slice(0, 50),
      description: `Extracted from: ${url.slice(0, 45)}...`,
      category: category.trim() || 'General',
      cards_count: generatedCards.length,
      due_count: generatedCards.length,
      created_at: new Date().toISOString(),
      cards: generatedCards,
    };

    onDeckCreated(newDeck);
    handleReset();
    onClose();
  };

  const handleDeleteCard = (cardId: string) => {
    setGeneratedCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleReset = () => {
    setUrl('');
    setGeneratedCards([]);
    setExtractedTitle('');
    setError(null);
  };

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#18202d] border border-white/10 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1c2534]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/20">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Video & Web to Flashcards
                </h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                  Transcript Parser
                </span>
              </div>
              <p className="text-xs text-white/60">
                Convert YouTube video transcripts or web articles into study flashcards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {generatedCards.length === 0 ? (
            <form onSubmit={handleScan} className="space-y-4">
              
              {/* URL Input */}
              <div>
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wide block mb-1">
                  YouTube Video or Web Article URL
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-white/40">
                    {isYouTube ? (
                      <Video className="h-4 w-4 text-red-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://en.wikipedia.org/..."
                    className="w-full rounded-2xl bg-white/5 py-3 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-amber-400/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Sample Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-white/50">Try a sample link:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUrl('https://www.youtube.com/watch?v=8qT6tC5VwV4');
                      setCategory('Medicine');
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 px-3 py-1 text-[11px] text-white/80 border border-white/10 transition cursor-pointer"
                  >
                    <Video className="h-3 w-3 text-red-400" />
                    <span>Status Asthmaticus Lecture (YouTube)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUrl('https://en.wikipedia.org/wiki/Acute_severe_asthma');
                      setCategory('Medicine');
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 px-3 py-1 text-[11px] text-white/80 border border-white/10 transition cursor-pointer"
                  >
                    <Globe className="h-3 w-3 text-blue-400" />
                    <span>Asthma Overview (Wikipedia)</span>
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-white/70 uppercase">Cards to Extract</label>
                  <select
                    value={cardCount}
                    onChange={(e) => setCardCount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-white/5 py-2.5 px-3 text-xs text-white border border-white/10 focus:border-amber-400/50 focus:outline-none"
                  >
                    <option value={5} className="bg-[#1c2432]">5 High-Yield Cards</option>
                    <option value={10} className="bg-[#1c2432]">10 High-Yield Cards</option>
                    <option value={15} className="bg-[#1c2432]">15 Comprehensive Cards</option>
                    <option value={20} className="bg-[#1c2432]">20 In-Depth Cards</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-white/70 uppercase">Subject Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Medicine, Tech, Law"
                    className="mt-1 w-full rounded-xl bg-white/5 py-2.5 px-3 text-xs text-white border border-white/10 focus:border-amber-400/50 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-500/20 border border-red-500/30 p-3 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-xs font-bold text-zinc-950 shadow-lg hover:bg-white/90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                    <span>Extracting transcript & analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Generate Flashcard Deck</span>
                  </>
                )}
              </button>

            </form>
          ) : (
            /* Review & Save View */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl bg-[#222c3d] p-4 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Generated Deck Preview
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    {generatedCards.length} Cards Extracted
                  </span>
                </div>
                <input
                  type="text"
                  value={extractedTitle}
                  onChange={(e) => setExtractedTitle(e.target.value)}
                  className="w-full bg-transparent font-bold text-base text-white border-b border-white/20 focus:border-amber-300 focus:outline-none py-1"
                />
              </div>

              {/* Cards List Preview */}
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {generatedCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="rounded-2xl bg-[#20293a] p-3.5 border border-white/10 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 font-bold">#{idx + 1}</span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                          {card.card_type}
                        </span>
                      </div>
                      <p className="font-bold text-white">{card.front}</p>
                      <p className="text-emerald-300 font-semibold">✓ {card.back}</p>
                      {card.explanation && (
                        <p className="text-[10px] text-white/50 italic">{card.explanation}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                      title="Remove card"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-white/60 hover:text-white cursor-pointer"
                >
                  Scan Another URL
                </button>

                <button
                  type="button"
                  onClick={handleSaveDeck}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-6 py-2.5 text-xs font-bold text-zinc-950 transition cursor-pointer shadow-lg"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Save Deck to Library ({generatedCards.length})</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
