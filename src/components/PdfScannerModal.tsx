'use client';

import React, { useState, useRef } from 'react';
import { Deck, Card } from '@/types';
import { extractPdfHighlights, ExtractedItem, PdfScanResult } from '@/lib/pdfExtractor';
import { 
  X, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  Layers, 
  Trash2, 
  Highlighter, 
  StickyNote, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface PdfScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (deck: Deck) => void;
}

export default function PdfScannerModal({ isOpen, onClose, onDeckCreated }: PdfScannerModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState<PdfScanResult | null>(null);
  const [deckTitle, setDeckTitle] = useState('');
  const [deckCategory, setDeckCategory] = useState('PDF Notes');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
      // Auto-populate title from file name
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
    setProgress(0);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = await extractPdfHighlights(buffer, file.name, (p) => setProgress(p));

      if (result.items.length === 0) {
        setError('No highlights or clear definitions found in this PDF. Try a document with text or highlights.');
      } else {
        setScanResult(result);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to parse PDF file.');
    } finally {
      setScanning(false);
    }
  };

  const updateCardFront = (id: string, newFront: string) => {
    if (!scanResult) return;
    setScanResult({
      ...scanResult,
      items: scanResult.items.map((item) =>
        item.id === id && item.suggestedCard
          ? { ...item, suggestedCard: { ...item.suggestedCard, front: newFront } }
          : item
      ),
    });
  };

  const updateCardBack = (id: string, newBack: string) => {
    if (!scanResult) return;
    setScanResult({
      ...scanResult,
      items: scanResult.items.map((item) =>
        item.id === id && item.suggestedCard
          ? { ...item, suggestedCard: { ...item.suggestedCard, back: newBack } }
          : item
      ),
    });
  };

  const removeItem = (id: string) => {
    if (!scanResult) return;
    setScanResult({
      ...scanResult,
      items: scanResult.items.filter((item) => item.id !== id),
    });
  };

  const handleSaveDeck = () => {
    if (!scanResult || scanResult.items.length === 0) return;
    if (!deckTitle.trim()) {
      setError('Please provide a title for the deck.');
      return;
    }

    const deckId = `deck-${Date.now()}`;
    const cards: Card[] = scanResult.items.map((item, idx) => ({
      id: `card-${Date.now()}-${idx}`,
      deck_id: deckId,
      card_type: item.suggestedCard?.type || 'flashcard',
      front: item.suggestedCard?.front || item.text,
      back: item.suggestedCard?.back || item.text,
      explanation: `From PDF page ${item.pageNumber} (${item.type})`,
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    const newDeck: Deck = {
      id: deckId,
      title: deckTitle.trim(),
      description: `Scanned from "${scanResult.fileName}" (${cards.length} cards)`,
      category: deckCategory.trim() || 'PDF Notes',
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
    setProgress(0);
    setScanResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Highlighter className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Scan PDF & Highlights
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Extracts your yellow/green highlights and notes into flashcards
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
          {!scanResult ? (
            /* Upload & Scan Screen */
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-8 text-center transition hover:border-amber-400 hover:bg-amber-50/20 cursor-pointer dark:border-stone-800 dark:bg-stone-800/20"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  <FileText className="h-7 w-7 text-amber-500" />
                </div>

                <p className="mt-3 text-sm font-bold text-stone-800 dark:text-stone-200">
                  {file ? file.name : 'Click to select or drop your lecture PDF'}
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  Supports highlighted textbooks, PDFs from Adobe, Edge, Chrome, or lecture slides.
                </p>

                {file && (
                  <span className="mt-3 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB ready
                  </span>
                )}
              </div>

              {scanning && (
                <div className="space-y-2 rounded-2xl bg-stone-50 p-4 dark:bg-stone-800/40">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                      Scanning pages & extracting annotations...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                disabled={!file || scanning}
                onClick={startScan}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3 text-sm font-bold text-white shadow transition hover:bg-neutral-800 disabled:opacity-40 cursor-pointer dark:bg-white dark:text-stone-900"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Scanning Document...</span>
                  </>
                ) : (
                  <>
                    <Highlighter className="h-4 w-4 text-amber-400" />
                    <span>Scan PDF Highlights & Notes</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Results & Flashcard Editor Screen */
            <div className="space-y-4">
              
              {/* Deck Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              {/* Items List */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                  Extracted Cards ({scanResult.items.length})
                </span>
                <span className="text-[11px] font-medium text-stone-400">
                  Click text to edit before saving
                </span>
              </div>

              <div className="space-y-3">
                {scanResult.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-800/40 relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {item.type === 'highlight' && (
                          <span className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <Highlighter className="h-3 w-3" />
                            Highlight (p. {item.pageNumber})
                          </span>
                        )}
                        {item.type === 'sticky_note' && (
                          <span className="flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                            <StickyNote className="h-3 w-3" />
                            Sticky Note (p. {item.pageNumber})
                          </span>
                        )}
                        {item.type === 'key_definition' && (
                          <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <Sparkles className="h-3 w-3" />
                            Key Definition (p. {item.pageNumber})
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-rose-500 cursor-pointer p-1"
                        title="Remove card"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Question / Front */}
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Question / Front</label>
                        <input
                          type="text"
                          value={item.suggestedCard?.front || ''}
                          onChange={(e) => updateCardFront(item.id, e.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                        />
                      </div>

                      {/* Answer / Back */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Answer / Back</label>
                        <textarea
                          rows={2}
                          value={item.suggestedCard?.back || ''}
                          onChange={(e) => updateCardBack(item.id, e.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white pt-3 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScanResult(null)}
                  className="rounded-2xl border border-stone-200 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer dark:border-stone-700 dark:text-stone-300"
                >
                  Scan Another PDF
                </button>
                <button
                  type="button"
                  onClick={handleSaveDeck}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3 text-xs font-bold text-white shadow transition hover:bg-neutral-800 active:scale-95 cursor-pointer dark:bg-white dark:text-stone-900"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Save as Study Deck ({scanResult.items.length} Cards)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
