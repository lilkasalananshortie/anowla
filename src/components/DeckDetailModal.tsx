'use client';

import React, { useState } from 'react';
import { Deck, Card, CardType } from '@/types';
import { 
  X, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Play, 
  Check, 
  Sparkles, 
  Layers, 
  BookOpen, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { deleteCardFromDeck } from '@/lib/deckService';

interface DeckDetailModalProps {
  isOpen: boolean;
  deck: Deck | null;
  onClose: () => void;
  onUpdateDeck: (updatedDeck: Deck) => void;
  onStartStudy: (deck: Deck) => void;
}

export default function DeckDetailModal({
  isOpen,
  deck,
  onClose,
  onUpdateDeck,
  onStartStudy,
}: DeckDetailModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // New card form state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newType, setNewType] = useState<CardType>('flashcard');
  const [newExplanation, setNewExplanation] = useState('');
  const [newDistractor1, setNewDistractor1] = useState('');
  const [newDistractor2, setNewDistractor2] = useState('');
  const [newDistractor3, setNewDistractor3] = useState('');

  // Edit card form state
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editType, setEditType] = useState<CardType>('flashcard');
  const [editExplanation, setEditExplanation] = useState('');
  const [editDistractors, setEditDistractors] = useState<string[]>([]);

  if (!isOpen || !deck) return null;

  const cards: Card[] = deck.cards || [];

  const filteredCards = cards.filter((c) =>
    c.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.explanation && c.explanation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStartEdit = (card: Card) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditType(card.card_type);
    setEditExplanation(card.explanation || '');
    setEditDistractors(card.distractors || []);
  };

  const handleSaveEdit = (cardId: string) => {
    if (!editFront.trim() || !editBack.trim()) return;

    const updatedCards = cards.map((c) => {
      if (c.id === cardId) {
        return {
          ...c,
          front: editFront.trim(),
          back: editBack.trim(),
          card_type: editType,
          explanation: editExplanation.trim(),
          distractors: editType === 'multiple_choice' ? editDistractors.filter(Boolean) : [],
        };
      }
      return c;
    });

    const updatedDeck: Deck = {
      ...deck,
      cards: updatedCards,
      cards_count: updatedCards.length,
    };

    onUpdateDeck(updatedDeck);
    setEditingCardId(null);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    const updatedCards = cards.filter((c) => c.id !== cardId);
    const updatedDeck: Deck = {
      ...deck,
      cards: updatedCards,
      cards_count: updatedCards.length,
    };

    onUpdateDeck(updatedDeck);
    await deleteCardFromDeck(cardId);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const distractors = [newDistractor1, newDistractor2, newDistractor3]
      .map((d) => d.trim())
      .filter(Boolean);

    const createdCard: Card = {
      id: crypto.randomUUID ? crypto.randomUUID() : `card_${Date.now()}`,
      deck_id: deck.id,
      card_type: newType,
      front: newFront.trim(),
      back: newBack.trim(),
      distractors: newType === 'multiple_choice' ? distractors : [],
      explanation: newExplanation.trim(),
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const updatedCards = [createdCard, ...cards];
    const updatedDeck: Deck = {
      ...deck,
      cards: updatedCards,
      cards_count: updatedCards.length,
      due_count: (deck.due_count || 0) + 1,
    };

    onUpdateDeck(updatedDeck);

    // Reset form
    setNewFront('');
    setNewBack('');
    setNewExplanation('');
    setNewDistractor1('');
    setNewDistractor2('');
    setNewDistractor3('');
    setIsAddingCard(false);
  };

  // Export to CSV (Anki friendly)
  const handleExportCSV = () => {
    const header = 'Front,Back,Type,Explanation\n';
    const rows = cards.map((c) => {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      return `${escape(c.front)},${escape(c.back)},${escape(c.card_type)},${escape(c.explanation || '')}`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cards.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deck, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.setAttribute('download', `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deck.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#18202d] border border-white/10 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1c2534]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">{deck.title}</h3>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-200">
                  {deck.category || 'General'}
                </span>
              </div>
              <p className="text-xs text-white/60">
                {cards.length} Total Cards • {deck.due_count || 0} Due for Review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onStartStudy(deck);
              }}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-950 shadow-md hover:bg-white/90 transition cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Study Deck</span>
            </button>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 px-6 border-b border-white/10 bg-[#192230]">
          
          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cards..."
              className="w-full rounded-full bg-white/5 py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingCard(!isAddingCard)}
              className="flex items-center gap-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 px-3.5 py-2 text-xs font-semibold text-amber-200 border border-amber-400/30 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingCard ? 'Cancel Add' : 'Add New Card'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              title="Export as CSV (Anki friendly)"
              className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-semibold text-white transition border border-white/10 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              title="Export as JSON"
              className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-semibold text-white transition border border-white/10 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-blue-300" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </div>

        {/* Content Body: Scrollable Cards List & Add Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Add New Card Collapsible Form */}
          {isAddingCard && (
            <form onSubmit={handleAddCard} className="rounded-2xl bg-[#222c3d] p-5 border border-amber-400/30 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  New Flashcard
                </span>
                
                {/* Card Type Selector */}
                <div className="flex gap-1">
                  {(['flashcard', 'multiple_choice', 'fill_blank'] as CardType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                        newType === t ? 'bg-white text-zinc-950 font-bold' : 'bg-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {t === 'multiple_choice' ? 'Multiple Choice' : t === 'fill_blank' ? 'Fill Blank' : 'Flip Card'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-white/70 uppercase">Question / Prompt *</label>
                <textarea
                  required
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the mechanism of action of Albuterol?"
                  className="mt-1 w-full rounded-xl bg-white/5 p-2.5 text-xs text-white border border-white/10 focus:border-amber-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-white/70 uppercase">Correct Answer *</label>
                <input
                  type="text"
                  required
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Short-acting Beta-2 adrenergic receptor agonist"
                  className="mt-1 w-full rounded-xl bg-white/5 p-2.5 text-xs text-white border border-white/10 focus:border-amber-400/50 focus:outline-none"
                />
              </div>

              {newType === 'multiple_choice' && (
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-semibold text-white/70 uppercase">Incorrect Options (Distractors)</label>
                  <input
                    type="text"
                    value={newDistractor1}
                    onChange={(e) => setNewDistractor1(e.target.value)}
                    placeholder="Distractor 1 (e.g. Muscarinic antagonist)"
                    className="w-full rounded-xl bg-white/5 p-2 text-xs text-white border border-white/10"
                  />
                  <input
                    type="text"
                    value={newDistractor2}
                    onChange={(e) => setNewDistractor2(e.target.value)}
                    placeholder="Distractor 2 (e.g. Inhaled corticosteroid)"
                    className="w-full rounded-xl bg-white/5 p-2 text-xs text-white border border-white/10"
                  />
                  <input
                    type="text"
                    value={newDistractor3}
                    onChange={(e) => setNewDistractor3(e.target.value)}
                    placeholder="Distractor 3 (e.g. Leukotriene modifier)"
                    className="w-full rounded-xl bg-white/5 p-2 text-xs text-white border border-white/10"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-white/70 uppercase">Explanation / Clinical Note</label>
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Brief rationale or clinical pearl..."
                  className="mt-1 w-full rounded-xl bg-white/5 p-2.5 text-xs text-white border border-white/10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-white/60 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2 text-xs font-bold text-zinc-950 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Save Card to Deck</span>
                </button>
              </div>
            </form>
          )}

          {/* Cards List */}
          {filteredCards.length > 0 ? (
            filteredCards.map((card, idx) => {
              const isEditing = editingCardId === card.id;

              if (isEditing) {
                return (
                  <div key={card.id} className="rounded-2xl bg-[#222c3d] p-5 border border-amber-400/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">Editing Card #{idx + 1}</span>
                      <div className="flex gap-1">
                        {(['flashcard', 'multiple_choice', 'fill_blank'] as CardType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEditType(t)}
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition cursor-pointer ${
                              editType === t ? 'bg-white text-zinc-950 font-bold' : 'bg-white/10 text-white/70'
                            }`}
                          >
                            {t === 'multiple_choice' ? 'Multiple Choice' : t === 'fill_blank' ? 'Fill Blank' : 'Flip'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/60">Question</label>
                      <textarea
                        rows={2}
                        value={editFront}
                        onChange={(e) => setEditFront(e.target.value)}
                        className="w-full rounded-xl bg-white/5 p-2 text-xs text-white border border-white/10"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/60">Answer</label>
                      <input
                        type="text"
                        value={editBack}
                        onChange={(e) => setEditBack(e.target.value)}
                        className="w-full rounded-xl bg-white/5 p-2 text-xs text-white border border-white/10"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/60">Explanation</label>
                      <input
                        type="text"
                        value={editExplanation}
                        onChange={(e) => setEditExplanation(e.target.value)}
                        className="w-full rounded-xl bg-white/5 p-2 text-xs text-white border border-white/10"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingCardId(null)}
                        className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(card.id)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 text-xs font-bold text-white cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={card.id}
                  className="group rounded-2xl bg-[#20293a] p-4.5 border border-white/10 hover:border-white/20 transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-[10px] font-bold text-white/60">
                        {idx + 1}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                        {card.card_type === 'multiple_choice'
                          ? 'Multiple Choice'
                          : card.card_type === 'fill_blank'
                          ? 'Fill Blank'
                          : 'Flashcard'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleStartEdit(card)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                        title="Edit Card"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {card.front}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-emerald-300 leading-relaxed">
                      ✓ {card.back}
                    </p>
                  </div>

                  {card.explanation && (
                    <p className="text-[11px] text-white/50 italic">
                      Note: {card.explanation}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-white/50">
              <BookOpen className="mx-auto h-8 w-8 opacity-40 mb-2" />
              <p className="text-xs">No cards matching your search.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
