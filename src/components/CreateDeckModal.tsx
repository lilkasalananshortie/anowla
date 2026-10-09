'use client';

import React, { useState } from 'react';
import { Deck, Card, CardType, Folder } from '@/types';
import { X, Plus, Trash2, Layers, CheckCircle, Folder as FolderIcon } from 'lucide-react';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated?: (deck: Deck) => void;
  onSave?: (deck: Deck) => void;
  folders?: Folder[];
  defaultFolderId?: string;
}

interface NewCardItem {
  id: string;
  card_type: CardType;
  front: string;
  back: string;
  distractors: string[];
}

export default function CreateDeckModal({
  isOpen,
  onClose,
  onDeckCreated,
  onSave,
  folders = [],
  defaultFolderId,
}: CreateDeckModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultFolderId || folders[0]?.id || ''
  );
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<NewCardItem[]>([
    { id: '1', card_type: 'flashcard', front: '', back: '', distractors: ['', '', ''] },
    { id: '2', card_type: 'multiple_choice', front: '', back: '', distractors: ['', '', ''] },
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addCardRow = () => {
    setCards(prev => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        card_type: 'flashcard',
        front: '',
        back: '',
        distractors: ['', '', ''],
      },
    ]);
  };

  const removeCardRow = (index: number) => {
    if (cards.length <= 1) {
      setError('A deck needs at least one card.');
      return;
    }
    setCards(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateCardField = (index: number, field: 'front' | 'back' | 'card_type', value: string) => {
    setCards(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateDistractor = (cardIndex: number, distIndex: number, value: string) => {
    setCards(prev => {
      const updated = [...prev];
      const newDistractors = [...updated[cardIndex].distractors];
      newDistractors[distIndex] = value;
      updated[cardIndex] = { ...updated[cardIndex], distractors: newDistractors };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the deck.');
      return;
    }

    // Filter valid cards
    const validCards: Card[] = [];
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (!c.front.trim() || !c.back.trim()) {
        continue;
      }

      const deckId = `deck-${Date.now()}`;
      validCards.push({
        id: `card-${Date.now()}-${i}`,
        deck_id: deckId,
        card_type: c.card_type,
        front: c.front.trim(),
        back: c.back.trim(),
        distractors: c.card_type === 'multiple_choice' 
          ? c.distractors.filter(d => d.trim().length > 0)
          : undefined,
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }

    if (validCards.length === 0) {
      setError('Please fill in at least one card (question and answer).');
      return;
    }

    const newDeckId = `deck-${Date.now()}`;
    const newDeck: Deck = {
      id: newDeckId,
      title: title.trim(),
      description: description.trim() || `Created with ${validCards.length} cards`,
      category: category.trim() || 'General',
      folder_id: selectedFolderId || undefined,
      cards_count: validCards.length,
      due_count: validCards.length,
      created_at: new Date().toISOString(),
      cards: validCards.map(c => ({ ...c, deck_id: newDeckId })),
    };

    if (onSave) {
      onSave(newDeck);
    } else if (onDeckCreated) {
      onDeckCreated(newDeck);
    }
    onClose();

    // Reset fields
    setTitle('');
    setCategory('');
    setDescription('');
    setCards([
      { id: '1', card_type: 'flashcard', front: '', back: '', distractors: ['', '', ''] },
      { id: '2', card_type: 'multiple_choice', front: '', back: '', distractors: ['', '', ''] },
    ]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Create New Deck</h2>
              <p className="text-xs text-zinc-500">Add questions and answers for your study session</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col overflow-y-auto pr-1 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Deck Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Deck Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pharmacology: Beta Blockers & Digoxin"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-teal-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Folder</label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-teal-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white cursor-pointer"
              >
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Mechanisms of action, contraindications, and nursing considerations"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-teal-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Cards List Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-zinc-900 dark:text-white">
                Flashcards ({cards.length})
              </label>
              <button
                type="button"
                onClick={addCardRow}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Card</span>
              </button>
            </div>

            <div className="space-y-4">
              {cards.map((card, idx) => (
                <div 
                  key={card.id} 
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-500">Card #{idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={card.card_type}
                        onChange={(e) => updateCardField(idx, 'card_type', e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
                      >
                        <option value="flashcard">Flip Card</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="fill_blank">Fill in Blank</option>
                      </select>
                      {cards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCardRow(idx)}
                          className="text-zinc-400 hover:text-rose-500 cursor-pointer p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <input
                        type="text"
                        value={card.front}
                        onChange={(e) => updateCardField(idx, 'front', e.target.value)}
                        placeholder="Question or prompt..."
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={card.back}
                        onChange={(e) => updateCardField(idx, 'back', e.target.value)}
                        placeholder="Correct answer..."
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                        required
                      />
                    </div>

                    {card.card_type === 'multiple_choice' && (
                      <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        <span className="text-[11px] font-semibold text-zinc-500 block mb-1.5">
                          Incorrect Options (Distractors)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[0, 1, 2].map((dIdx) => (
                            <input
                              key={dIdx}
                              type="text"
                              value={card.distractors[dIdx] || ''}
                              onChange={(e) => updateDistractor(idx, dIdx, e.target.value)}
                              placeholder={`Option ${dIdx + 2}`}
                              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCardRow}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-3 text-xs font-semibold text-zinc-600 hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-indigo-400 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Card</span>
            </button>
          </div>

          {/* Submit */}
          <div className="sticky bottom-0 bg-white pt-4 pb-1 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Save Deck & Cards</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
