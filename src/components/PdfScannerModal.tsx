'use client';

import React, { useState, useRef } from 'react';
import { Deck, Card, Folder } from '@/types';
import { extractPdfHighlights } from '@/lib/pdfExtractor';
import { 
  X, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  Layers, 
  Trash2, 
  Highlighter, 
  Sparkles,
  Zap,
  HelpCircle,
  Folder as FolderIcon
} from 'lucide-react';

interface PdfScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (deck: Deck) => void;
  folders?: Folder[];
  defaultFolderId?: string;
}

interface ScannedCard {
  id: string;
  front: string;
  back: string;
  card_type: 'flashcard' | 'multiple_choice' | 'fill_blank';
  distractors?: string[];
  explanation?: string;
}

export default function PdfScannerModal({
  isOpen,
  onClose,
  onDeckCreated,
  folders = [],
  defaultFolderId,
}: PdfScannerModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanMode, setScanMode] = useState<'ai' | 'offline'>('ai');
  const [targetCount, setTargetCount] = useState<number>(15);
  const [scannedCards, setScannedCards] = useState<ScannedCard[]>([]);
  const [deckTitle, setDeckTitle] = useState('');
  const [deckCategory, setDeckCategory] = useState('Pharmacology & Nursing');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultFolderId || folders[0]?.id || ''
  );
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
      const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDeckTitle(cleanName);
    } else if (selected) {
      setError('Please select a valid .pdf file.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setError(null);
      const cleanName = dropped.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDeckTitle(cleanName);
    } else if (dropped) {
      setError('Please drop a valid .pdf file.');
    }
  };

  const startScan = async () => {
    if (!file) return;

    setScanning(true);
    setError(null);
    setScanStatus('Reading PDF pages and extracting text...');

    try {
      const buffer = await file.arrayBuffer();

      if (scanMode === 'ai') {
        // Step 1: Extract raw text from all pages using pdfjs-dist
        const pdfjs = await import('pdfjs-dist');
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }
        const loadingTask = pdfjs.getDocument({ data: buffer });
        const doc = await loadingTask.promise;

        let fullText = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          const pageStr = content.items.map((it: any) => it.str).join(' ');
          fullText += `\n--- Page ${i} ---\n` + pageStr;
        }

        // Step 2: Call the smart AI scan API
        setScanStatus(`Analyzing with Gemini 3.8 Flash to extract ${targetCount} high-yield cards...`);
        const res = await fetch('/api/ai-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: fullText,
            cardCount: targetCount,
            title: deckTitle || file.name,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate cards with AI');
        }

        if (!data.cards || data.cards.length === 0) {
          throw new Error('AI could not extract cards from this document.');
        }

        setScannedCards(data.cards);
      } else {
        // Offline heuristic mode
        const result = await extractPdfHighlights(buffer, file.name);
        if (result.items.length === 0) {
          throw new Error('No clear definitions found in offline mode. Try AI Smart Scan.');
        }
        setScannedCards(
          result.items.map((item) => ({
            id: item.id,
            front: item.suggestedCard?.front || item.text,
            back: item.suggestedCard?.back || item.text,
            card_type: item.suggestedCard?.type || 'flashcard',
          }))
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to process PDF.');
    } finally {
      setScanning(false);
      setScanStatus('');
    }
  };

  const updateCard = (id: string, field: 'front' | 'back', val: string) => {
    setScannedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const removeCard = (id: string) => {
    setScannedCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveDeck = () => {
    if (scannedCards.length === 0) return;
    if (!deckTitle.trim()) {
      setError('Please provide a title for the deck.');
      return;
    }

    const deckId = `deck-${Date.now()}`;
    const cards: Card[] = scannedCards.map((c, idx) => ({
      id: `card-${Date.now()}-${idx}`,
      deck_id: deckId,
      card_type: c.card_type,
      front: c.front.trim(),
      back: c.back.trim(),
      distractors: c.distractors,
      explanation: c.explanation,
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    const newDeck: Deck = {
      id: deckId,
      title: deckTitle.trim(),
      description: `Generated from "${file?.name || 'PDF'}" (${cards.length} cards)`,
      category: deckCategory.trim() || 'General',
      folder_id: selectedFolderId || undefined,
      cards_count: cards.length,
      due_count: cards.length,
      created_at: new Date().toISOString(),
      cards,
    };

    onDeckCreated(newDeck);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setScanning(false);
    setScannedCards([]);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Scan PDF into Study Cards
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Extract definitions and mechanisms into flashcards, excluding slide titles and boilerplate.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Content Body */}
        <div className="mt-4 flex flex-1 flex-col overflow-y-auto pr-1">
          {scannedCards.length === 0 ? (
            /* Upload Screen */
            <div className="space-y-4">
              
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-8 text-center transition hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer dark:border-stone-800 dark:bg-stone-800/20"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  <FileText className="h-7 w-7 text-teal-600" />
                </div>

                <p className="mt-3 text-sm font-bold text-stone-800 dark:text-stone-200">
                  {file ? file.name : 'Click to select or drop your lecture PDF'}
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  Works with textbooks, medical modules, lecture slides, and research notes.
                </p>

                {file && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-[11px] font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB ready
                    </span>
                    {!scanning && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 transition cursor-pointer dark:bg-rose-950/40 dark:text-rose-400"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Mode and Card Count Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Scan Engine
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setScanMode('ai')}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer ${
                        scanMode === 'ai'
                          ? 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300'
                          : 'border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                      <span>AI Smart (Gemini)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanMode('offline')}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer ${
                        scanMode === 'offline'
                          ? 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300'
                          : 'border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Offline Heuristic</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Target Card Count
                  </label>
                  <select
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-teal-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white cursor-pointer"
                  >
                    <option value={10}>10 Cards (Quick Overview)</option>
                    <option value={15}>15 Cards (Standard Module)</option>
                    <option value={20}>20 Cards (Deep Exam Prep)</option>
                  </select>
                </div>
              </div>

              {/* Progress State */}
              {scanning && (
                <div className="space-y-2 rounded-2xl bg-teal-50/50 p-4 border border-teal-100 dark:bg-teal-950/30 dark:border-teal-900/40">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200">
                    <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                    <span>{scanStatus}</span>
                  </div>
                </div>
              )}

              {/* Submit Scan Button */}
              <button
                disabled={!file || scanning}
                onClick={startScan}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3 text-sm font-bold text-white shadow transition hover:bg-neutral-800 disabled:opacity-40 cursor-pointer dark:bg-white dark:text-stone-900"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <span>Scan with Gemini AI ({targetCount} Cards)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Results & Flashcard Editor Screen */
            <div className="space-y-4">
              
              {/* Deck Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Deck Title</label>
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Category</label>
                  <input
                    type="text"
                    value={deckCategory}
                    onChange={(e) => setDeckCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Clinical Folder</label>
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white cursor-pointer"
                  >
                    <option value="">No Folder (Root)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cards Count Banner */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Generated Cards ({scannedCards.length})
                </span>
                <span className="text-[11px] font-medium text-stone-400">
                  Review and edit before saving
                </span>
              </div>

              {/* Card List */}
              <div className="space-y-3">
                {scannedCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-800/40 relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                        {card.card_type === 'multiple_choice'
                          ? 'Multiple Choice'
                          : card.card_type === 'fill_blank'
                          ? 'Fill in Blank'
                          : 'Flashcard'} #{idx + 1}
                      </span>

                      <button
                        onClick={() => removeCard(card.id)}
                        className="text-stone-400 hover:text-rose-500 cursor-pointer p-1"
                        title="Remove card"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Question / Prompt</label>
                        <input
                          type="text"
                          value={card.front}
                          onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Answer</label>
                        <textarea
                          rows={2}
                          value={card.back}
                          onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                        />
                      </div>

                      {card.explanation && (
                        <p className="text-[11px] text-stone-500 italic">
                          💡 {card.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white pt-3 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScannedCards([])}
                  className="rounded-2xl border border-stone-200 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer dark:border-stone-700 dark:text-stone-300"
                >
                  Scan Another PDF
                </button>
                <button
                  type="button"
                  onClick={handleSaveDeck}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3 text-xs font-bold text-white shadow transition hover:bg-neutral-800 active:scale-95 cursor-pointer dark:bg-white dark:text-stone-900"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Save as Study Deck ({scannedCards.length} Cards)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
