'use client';

import React, { useState } from 'react';
import { Deck, Card, CardType, Folder } from '@/types';
import { X, Plus, Trash2, Layers, CheckCircle2, Folder as FolderIcon } from 'lucide-react';

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
  const [category, setCategory] = useState('Pharmacology');
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
      setError('Please fill in at least one card question and answer.');
      return;
    }

    const newDeck: Deck = {
      id: newDeckId,
      title: title.trim(),
      category: category.trim() || 'General',
      folder_id: selectedFolderId || undefined,
      description: description.trim() || 'Custom Clinical Deck',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141d16]/75 p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="relative my-8 w-full max-w-2xl rounded-3xl border border-[#dfe8dc] bg-[#fefaf3] p-6 shadow-2xl text-[#19251a] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dfe8dc] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#84a282] text-white shadow-md shadow-[#84a282]/25">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#19251a]">Create Study Deck</h2>
              <p className="text-xs text-[#586c5a]">Author custom flashcards, multiple-choice questions, and conceptual notes</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-full p-1.5 text-[#586c5a] hover:bg-black/5 hover:text-[#19251a] cursor-pointer transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col overflow-y-auto pr-1 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Deck Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#19251a] uppercase tracking-wider mb-1">
                Deck Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Data Structures: Graph Traversals & Complexity"
                className="w-full rounded-xl border border-[#dfe8dc] bg-white px-3.5 py-2.5 text-xs text-[#19251a] outline-none focus:border-[#84a282] focus:ring-1 focus:ring-[#84a282]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#19251a] uppercase tracking-wider mb-1">
                Folder
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full rounded-xl border border-[#dfe8dc] bg-white px-3 py-2.5 text-xs text-[#19251a] outline-none focus:border-[#84a282] cursor-pointer"
              >
                <option value="">No Folder (General)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#19251a] uppercase tracking-wider mb-1">
              Description / Learning Goals
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. High-alert administration rules, vital sign thresholds, and nursing considerations"
              className="w-full rounded-xl border border-[#dfe8dc] bg-white px-3.5 py-2 text-xs text-[#19251a] outline-none focus:border-[#84a282]"
            />
          </div>

          {/* Cards List Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-[#19251a] uppercase tracking-wider">
                Cards ({cards.length})
              </label>
              <button
                type="button"
                onClick={addCardRow}
                className="flex items-center gap-1 text-xs font-bold text-[#84a282] hover:text-[#6e8c6c] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Card</span>
              </button>
            </div>

            <div className="space-y-3">
              {cards.map((card, idx) => (
                <div 
                  key={card.id} 
                  className="rounded-2xl border border-[#dfe8dc] bg-white p-4 shadow-xs relative space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#586c5a]">Card #{idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={card.card_type}
                        onChange={(e) => updateCardField(idx, 'card_type', e.target.value)}
                        className="rounded-lg border border-[#dfe8dc] bg-[#fefaf3] px-2 py-1 text-xs font-semibold text-[#19251a] outline-none cursor-pointer"
                      >
                        <option value="flashcard">Flip Card</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="fill_blank">Fill in Blank</option>
                      </select>
                      {cards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCardRow(idx)}
                          className="text-[#586c5a] hover:text-rose-600 cursor-pointer p-1 rounded hover:bg-black/5"
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
                      placeholder="Prompt / Clinical Question..."
                      className="w-full rounded-xl border border-[#dfe8dc] bg-[#fefaf3] px-3 py-2 text-xs text-[#19251a] font-medium outline-none focus:border-[#84a282]"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={card.back}
                      onChange={(e) => updateCardField(idx, 'back', e.target.value)}
                      placeholder="Correct Answer / Action..."
                      className="w-full rounded-xl border border-[#dfe8dc] bg-[#fefaf3] px-3 py-2 text-xs text-[#19251a] font-medium outline-none focus:border-[#84a282]"
                      required
                    />
                  </div>

                  {card.card_type === 'multiple_choice' && (
                    <div className="mt-2 pt-2 border-t border-[#dfe8dc]">
                      <span className="text-[10px] font-bold text-[#586c5a] uppercase tracking-wider block mb-1.5">
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
                            className="rounded-lg border border-[#dfe8dc] bg-[#fefaf3] px-2.5 py-1.5 text-xs text-[#19251a] outline-none focus:border-[#84a282]"
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
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#b8cfb3] py-2.5 text-xs font-bold text-[#84a282] hover:bg-[#ebf2e9] cursor-pointer transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Card</span>
            </button>
          </div>

          {/* Submit */}
          <div className="sticky bottom-0 bg-[#fefaf3] pt-3 pb-1 border-t border-[#dfe8dc]">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#84a282] hover:bg-[#6e8c6c] py-3 text-xs font-bold text-white shadow-md shadow-[#84a282]/25 transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save Clinical Deck</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
