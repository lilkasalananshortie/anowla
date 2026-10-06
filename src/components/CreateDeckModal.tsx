'use client';

import React, { useState } from 'react';
import { Deck, Card } from '@/types';
import { X, Sparkles, Loader2, BookOpen } from 'lucide-react';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (deck: Deck) => void;
}

export default function CreateDeckModal({ isOpen, onClose, onDeckCreated }: CreateDeckModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [prompt, setPrompt] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) {
      setError('Please provide a title and study content/notes.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          count: cardCount,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate cards');
      }

      const newDeckId = `deck-${Date.now()}`;
      const cards: Card[] = data.cards.map((c: any) => ({
        ...c,
        deck_id: newDeckId,
      }));

      const newDeck: Deck = {
        id: newDeckId,
        title,
        description: `Generated from: "${prompt.slice(0, 70)}..."`,
        category,
        cards_count: cards.length,
        due_count: cards.length,
        created_at: new Date().toISOString(),
        cards,
      };

      onDeckCreated(newDeck);
      onClose();
      // Reset form
      setTitle('');
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Error creating deck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Create Deck with AI</h2>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Deck Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Organic Chemistry: Alkanes & Alkenes"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Chemistry"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Card Count</label>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white cursor-pointer"
              >
                <option value={3}>3 Cards (Quick)</option>
                <option value={5}>5 Cards (Standard)</option>
                <option value={8}>8 Cards (Deep)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Paste Notes, Text, or Topic
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste your lecture notes, textbook summary, or specific topics here. Alwinyah AI will extract key concepts and formulate multiple choice, flashcards, and fill-in-the-blank questions automatically."
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Cards with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Deck</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
