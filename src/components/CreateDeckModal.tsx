'use client';

import React, { useState } from 'react';
import { Deck, Card, CardType, Folder } from '@/types';
import { X, Plus, Trash2, Layers, CheckCircle2, Folder as FolderIcon, Tag } from 'lucide-react';

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

const DEFAULT_CATEGORIES = [
  'Computer Science',
  'Cognitive Science',
  'Modern History',
  'Molecular Biology',
  'Mathematics & Logic',
  'Philosophy & Ethics',
  'Literature & Languages',
  'General',
];

export default function CreateDeckModal({
  isOpen,
  onClose,
  onDeckCreated,
  onSave,
  folders = [],
  defaultFolderId,
}: CreateDeckModalProps) {
  const [title, setTitle] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultFolderId || folders[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState('Computer Science');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<NewCardItem[]>([
    { id: '1', card_type: 'flashcard', front: '', back: '', distractors: ['', '', ''] },
    { id: '2', card_type: 'multiple_choice', front: '', back: '', distractors: ['', '', ''] },
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addCardRow = () => {
    setCards((prev) => [
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
    setCards((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateCardField = (index: number, field: 'front' | 'back' | 'card_type', value: string) => {
    setCards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateDistractor = (cardIndex: number, distIndex: number, value: string) => {
    setCards((prev) => {
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

    const finalCategory = isCustomCategory
      ? (customCategoryName.trim() || 'General')
      : (selectedCategory.trim() || 'General');

    const newDeckId = `deck-${Date.now()}`;
    const validCards: Card[] = [];
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (!c.front.trim() || !c.back.trim()) continue;

      validCards.push({
        id: `card-${newDeckId}-${i}`,
        deck_id: newDeckId,
        card_type: c.card_type,
        front: c.front.trim(),
        back: c.back.trim(),
        distractors:
          c.card_type === 'multiple_choice'
            ? c.distractors.filter((d) => d.trim().length > 0)
            : undefined,
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }

    if (validCards.length === 0) {
      setError('Please fill in at least one card question and answer.');
      return;
    }

    const newDeck: Deck = {
      id: newDeckId,
      title: title.trim(),
      category: finalCategory,
      folder_id: selectedFolderId || undefined,
      description: description.trim() || 'Active recall study deck.',
      cards_count: validCards.length,
      due_count: validCards.length,
      created_at: new Date().toISOString(),
      cards: validCards,
    };

    if (onSave) {
      onSave(newDeck);
    } else if (onDeckCreated) {
      onDeckCreated(newDeck);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010736]/80 p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative my-8 w-full max-w-2xl rounded-3xl border border-[#22396f] bg-[#0d1c42] p-6 shadow-2xl text-[#fcf1d0] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#22396f] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#22396f] text-[#fcf1d0] shadow-md">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#fcf1d0]">Create Study Deck</h2>
              <p className="text-xs text-[#fcf1d0]/70">Author custom flashcards, multiple-choice, and recall items</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#fcf1d0]/70 hover:text-[#fcf1d0] hover:bg-white/5 cursor-pointer transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col overflow-y-auto pr-1 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-800/60 p-3 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          {/* Deck Title & Folder */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#fcf1d0] uppercase tracking-wider mb-1">
                Deck Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Systems & Consensus Algorithms"
                className="w-full rounded-xl border border-[#22396f] bg-[#010736] px-3.5 py-2.5 text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 outline-none focus:border-[#fcf1d0]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#fcf1d0] uppercase tracking-wider mb-1">
                Folder
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full rounded-xl border border-[#22396f] bg-[#010736] px-3 py-2.5 text-xs text-[#fcf1d0] outline-none focus:border-[#fcf1d0] cursor-pointer"
              >
                <option value="">No Folder (General)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Selector with Custom Creation Option */}
          <div className="p-3.5 rounded-2xl bg-[#010736]/60 border border-[#22396f] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#fcf1d0] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={13} className="text-[#fcf1d0]/70" />
                <span>Deck Category</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(!isCustomCategory);
                  if (!isCustomCategory) {
                    setCustomCategoryName('');
                  }
                }}
                className="text-[11px] font-bold text-[#fcf1d0] hover:underline cursor-pointer flex items-center gap-1"
              >
                {isCustomCategory ? 'Choose Existing Category' : '+ Create New Category'}
              </button>
            </div>

            {isCustomCategory ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="Type new category name (e.g. Quantum Computing, Macroeconomics)..."
                  autoFocus
                  className="w-full rounded-xl border border-[#22396f] bg-[#010736] px-3.5 py-2 text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 outline-none focus:border-[#fcf1d0]"
                  required={isCustomCategory}
                />
                <span className="text-[10px] text-[#fcf1d0]/60 block">
                  New category will be created and tagged to this study deck.
                </span>
              </div>
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomCategory(true);
                  } else {
                    setSelectedCategory(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-[#22396f] bg-[#010736] px-3 py-2 text-xs text-[#fcf1d0] outline-none focus:border-[#fcf1d0] cursor-pointer"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">+ Create New Category...</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#fcf1d0] uppercase tracking-wider mb-1">
              Description / Learning Goal
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Core concepts, asymptotic complexities, and review questions"
              className="w-full rounded-xl border border-[#22396f] bg-[#010736] px-3.5 py-2 text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 outline-none focus:border-[#fcf1d0]"
            />
          </div>

          {/* Cards List Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-[#fcf1d0] uppercase tracking-wider">
                Cards ({cards.length})
              </label>
              <button
                type="button"
                onClick={addCardRow}
                className="flex items-center gap-1 text-xs font-bold text-[#fcf1d0] hover:text-white cursor-pointer px-2.5 py-1 rounded-lg bg-[#22396f] transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Card</span>
              </button>
            </div>

            <div className="space-y-3">
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-[#22396f] bg-[#010736] p-4 shadow-xs relative space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#fcf1d0]/80">Card #{idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={card.card_type}
                        onChange={(e) => updateCardField(idx, 'card_type', e.target.value)}
                        className="rounded-lg border border-[#22396f] bg-[#0d1c42] px-2 py-1 text-xs font-semibold text-[#fcf1d0] outline-none cursor-pointer"
                      >
                        <option value="flashcard">Flip Card</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="fill_blank">Fill in Blank</option>
                      </select>
                      {cards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCardRow(idx)}
                          className="text-[#fcf1d0]/60 hover:text-rose-400 cursor-pointer p-1 rounded hover:bg-white/5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={card.front}
                      onChange={(e) => updateCardField(idx, 'front', e.target.value)}
                      placeholder="Question / Prompt..."
                      className="w-full rounded-xl border border-[#22396f] bg-[#0d1c42] px-3 py-2 text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 font-medium outline-none focus:border-[#fcf1d0]"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={card.back}
                      onChange={(e) => updateCardField(idx, 'back', e.target.value)}
                      placeholder="Answer / Key Definition..."
                      className="w-full rounded-xl border border-[#22396f] bg-[#0d1c42] px-3 py-2 text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 font-medium outline-none focus:border-[#fcf1d0]"
                      required
                    />
                  </div>

                  {card.card_type === 'multiple_choice' && (
                    <div className="mt-2 pt-2 border-t border-[#22396f]">
                      <span className="text-[10px] font-bold text-[#fcf1d0]/70 uppercase tracking-wider block mb-1.5">
                        Incorrect Distractor Options
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[0, 1, 2].map((dIdx) => (
                          <input
                            key={dIdx}
                            type="text"
                            value={card.distractors[dIdx] || ''}
                            onChange={(e) => updateDistractor(idx, dIdx, e.target.value)}
                            placeholder={`Distractor ${dIdx + 1}`}
                            className="rounded-lg border border-[#22396f] bg-[#0d1c42] px-2.5 py-1.5 text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 outline-none focus:border-[#fcf1d0]"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCardRow}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#22396f] py-2.5 text-xs font-bold text-[#fcf1d0] hover:bg-white/5 cursor-pointer transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Card</span>
            </button>
          </div>

          {/* Submit */}
          <div className="sticky bottom-0 bg-[#0d1c42] pt-3 pb-1 border-t border-[#22396f]">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#fcf1d0] hover:bg-white text-[#010736] py-3 text-xs font-bold shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save Study Deck</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
