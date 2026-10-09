'use client';

import React, { useState, useRef } from 'react';
import { Deck, Card, Folder } from '@/types';
import { extractPdfHighlights } from '@/lib/pdfExtractor';
import { 
  X, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Trash2, 
  Zap, 
  Folder as FolderIcon,
  Plus,
  Sliders,
  Stethoscope,
  Pill,
  Activity,
  Award,
  Filter
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

type ClinicalFocus = 'comprehensive' | 'pharmacology' | 'pathophysiology' | 'nclex_priorities';

const CARD_COUNT_PRESETS = [15, 30, 50, 75, 100];

export default function PdfScannerModal({
  isOpen,
  onClose,
  onDeckCreated,
  folders = [],
  defaultFolderId,
}: PdfScannerModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanMode, setScanMode] = useState<'ai' | 'offline'>('ai');
  const [targetCount, setTargetCount] = useState<number>(30);
  const [clinicalFocus, setClinicalFocus] = useState<ClinicalFocus>('comprehensive');
  const [scannedCards, setScannedCards] = useState<ScannedCard[]>([]);
  const [cardTypeFilter, setCardTypeFilter] = useState<'all' | 'multiple_choice' | 'flashcard' | 'fill_blank'>('all');
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
    setScanStep(1);
    setScanStatus('Reading PDF document pages...');

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
          setScanStatus(`Extracting clinical content: Page ${i} of ${doc.numPages}...`);
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          const pageStr = content.items.map((it: any) => it.str).join(' ');
          fullText += `\n--- Page ${i} ---\n` + pageStr;
        }

        // Step 2: Send to AI Scan Route with target card count and clinical focus
        setScanStep(2);
        setScanStatus(`Analyzing with Gemini Flash for ${targetCount} high-yield clinical cards...`);

        const res = await fetch('/api/ai-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: fullText,
            cardCount: targetCount,
            title: deckTitle || file.name,
            clinicalFocus,
          }),
        });

        setScanStep(3);
        setScanStatus('Formulating distractors, rationales, and NCLEX priorities...');

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate cards with AI');
        }

        if (!data.cards || data.cards.length === 0) {
          throw new Error('AI could not extract cards from this document. Ensure the PDF contains readable text.');
        }

        setScannedCards(data.cards);
      } else {
        // Offline heuristic mode with expanded capacity
        setScanStatus(`Extracting up to ${targetCount} clinical concepts offline...`);
        const result = await extractPdfHighlights(buffer, file.name, undefined, targetCount);
        if (result.items.length === 0) {
          throw new Error('No clear definitions found in offline mode. Try AI Smart Scan with Gemini.');
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
      setScanStep(0);
      setScanStatus('');
    }
  };

  const updateCard = (id: string, field: 'front' | 'back' | 'explanation', val: string) => {
    setScannedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const removeCard = (id: string) => {
    setScannedCards((prev) => prev.filter((c) => c.id !== id));
  };

  const addManualCard = () => {
    const newCard: ScannedCard = {
      id: `manual-card-${Date.now()}`,
      front: 'New clinical assessment or priority:',
      back: 'Clinical answer and nursing rationale.',
      card_type: 'flashcard',
      explanation: 'Key point for NCLEX review.',
    };
    setScannedCards((prev) => [newCard, ...prev]);
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
      front: c.front,
      back: c.back,
      card_type: c.card_type,
      distractors: c.distractors || [],
      explanation: c.explanation || '',
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    const newDeck: Deck = {
      id: deckId,
      title: deckTitle.trim(),
      description: `Generated from "${file?.name || 'PDF'}" (${cards.length} high-yield clinical cards)`,
      category: deckCategory.trim() || 'General',
      folder_id: selectedFolderId || undefined,
      cards_count: cards.length,
      due_count: cards.length,
      created_at: new Date().toISOString(),
      cards,
    };

    onDeckCreated(newDeck);
    onClose();
  };

  const filteredCards = scannedCards.filter((c) => {
    if (cardTypeFilter === 'all') return true;
    return c.card_type === cardTypeFilter;
  });

  const mcCount = scannedCards.filter((c) => c.card_type === 'multiple_choice').length;
  const fcCount = scannedCards.filter((c) => c.card_type === 'flashcard').length;
  const fbCount = scannedCards.filter((c) => c.card_type === 'fill_blank').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141d16]/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl bg-[#fefaf3] p-6 shadow-2xl border border-[#dfe8dc] overflow-hidden text-[#19251a]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dfe8dc] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#84a282] text-white shadow-md shadow-[#84a282]/30">
              <Sparkles className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#19251a] tracking-tight">
                AI Clinical PDF Scanner
              </h2>
              <p className="text-xs text-[#586c5a]">
                High-density NCLEX & pharmacology card generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#586c5a] hover:bg-black/5 hover:text-[#19251a] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 flex flex-1 flex-col overflow-y-auto pr-1">
          {scannedCards.length === 0 ? (
            /* Upload & Settings Screen */
            <div className="space-y-4">
              
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#b8cfb3] bg-white p-7 text-center transition-all hover:border-[#84a282] hover:bg-[#ebf2e9]/50 cursor-pointer shadow-xs"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ebf2e9] text-[#84a282] group-hover:scale-105 transition-transform">
                  <FileText className="h-7 w-7" />
                </div>

                <p className="mt-3 text-sm font-bold text-[#19251a]">
                  {file ? file.name : 'Click to upload or drag & drop lecture PDF'}
                </p>
                <p className="mt-1 text-xs text-[#586c5a]">
                  Medical textbooks, NCLEX modules, pharmacology slides, clinical protocols.
                </p>

                {file && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-[#b8cfb3]/40 px-3 py-1 text-[11px] font-bold text-[#19251a] border border-[#84a282]/30">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB loaded
                    </span>
                    {!scanning && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Engine Selection */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#dfe8dc] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#19251a]">Scan Engine</label>
                  <span className="text-[11px] text-[#586c5a]">Select intelligence level</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScanMode('ai')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                      scanMode === 'ai'
                        ? 'border-[#84a282] bg-[#84a282] text-white shadow-sm'
                        : 'border-[#dfe8dc] bg-[#fefaf3] text-[#586c5a] hover:bg-[#ebf2e9]'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>AI Smart (Gemini Flash)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode('offline')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                      scanMode === 'offline'
                        ? 'border-[#84a282] bg-[#84a282] text-white shadow-sm'
                        : 'border-[#dfe8dc] bg-[#fefaf3] text-[#586c5a] hover:bg-[#ebf2e9]'
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Offline Heuristic</span>
                  </button>
                </div>
              </div>

              {/* Card Count Selector (Up to 100 Cards!) */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#dfe8dc] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#19251a]">
                    Target Card Volume ({targetCount} Cards)
                  </label>
                  <span className="text-[11px] font-semibold text-[#84a282]">
                    High-Density Coverage
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {CARD_COUNT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetCount(preset)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        targetCount === preset
                          ? 'bg-[#84a282] text-white shadow-xs'
                          : 'bg-[#fefaf3] border border-[#dfe8dc] text-[#586c5a] hover:border-[#84a282]'
                      }`}
                    >
                      {preset} Cards
                    </button>
                  ))}
                </div>

                {/* Custom Card Amount Slider */}
                <div className="pt-1 flex items-center gap-3">
                  <span className="text-[11px] font-medium text-[#586c5a] whitespace-nowrap">Custom Count:</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                    className="flex-1 accent-[#84a282] cursor-pointer"
                  />
                  <span className="w-12 text-center text-xs font-bold px-2 py-1 rounded-lg bg-[#ebf2e9] text-[#19251a] border border-[#b8cfb3]">
                    {targetCount}
                  </span>
                </div>
              </div>

              {/* Clinical Focus Selector */}
              {scanMode === 'ai' && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#dfe8dc] space-y-2.5">
                  <label className="text-xs font-bold text-[#19251a] block">
                    Clinical Focus Domain
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'comprehensive', label: 'All Domains', icon: Stethoscope },
                      { id: 'pharmacology', label: 'Pharmacology', icon: Pill },
                      { id: 'pathophysiology', label: 'Pathophysiology', icon: Activity },
                      { id: 'nclex_priorities', label: 'NCLEX Priorities', icon: Award },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = clinicalFocus === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setClinicalFocus(item.id as ClinicalFocus)}
                          className={`flex items-center gap-1.5 p-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#84a282] text-white shadow-xs'
                              : 'bg-[#fefaf3] border border-[#dfe8dc] text-[#586c5a] hover:bg-[#ebf2e9]'
                          }`}
                        >
                          <Icon size={13} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Folder Assignment */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#dfe8dc] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FolderIcon size={16} className="text-[#84a282]" />
                  <span className="text-xs font-bold text-[#19251a]">Save to Clinical Folder:</span>
                </div>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="rounded-xl border border-[#dfe8dc] bg-[#fefaf3] px-3 py-1.5 text-xs font-bold text-[#19251a] focus:outline-none focus:border-[#84a282] cursor-pointer"
                >
                  <option value="">No Folder (Root)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Animated Live Scan Status */}
              {scanning && (
                <div className="space-y-2 rounded-2xl bg-[#ebf2e9] p-4 border border-[#b8cfb3]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#19251a]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#84a282]" />
                      <span>{scanStatus}</span>
                    </div>
                    <span className="text-[11px] text-[#586c5a]">Target: {targetCount} cards</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white overflow-hidden border border-[#b8cfb3]/40">
                    <div
                      className="h-full bg-[#84a282] transition-all duration-500 rounded-full"
                      style={{ width: `${scanStep === 1 ? '35%' : scanStep === 2 ? '70%' : '90%'}` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={!file || scanning}
                onClick={startScan}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#19251a] hover:bg-[#283e2c] py-3.5 text-sm font-bold text-[#fefaf3] shadow-lg transition disabled:opacity-40 cursor-pointer active:scale-98"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extracting {targetCount} High-Yield Cards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Generate {targetCount} Clinical Flashcards</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Results & Flashcard Review Screen */
            <div className="space-y-4">
              
              {/* Deck Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#19251a]">Deck Title</label>
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#dfe8dc] bg-white px-3 py-2 text-xs font-bold text-[#19251a] outline-none focus:border-[#84a282]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#19251a]">Category</label>
                  <input
                    type="text"
                    value={deckCategory}
                    onChange={(e) => setDeckCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#dfe8dc] bg-white px-3 py-2 text-xs font-bold text-[#19251a] outline-none focus:border-[#84a282]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#19251a]">Folder</label>
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#dfe8dc] bg-white px-3 py-2 text-xs font-bold text-[#19251a] outline-none focus:border-[#84a282] cursor-pointer"
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

              {/* Cards Count Banner & Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-2xl bg-white border border-[#dfe8dc]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#19251a]">
                    Generated Cards ({scannedCards.length})
                  </span>
                  <span className="rounded-full bg-[#b8cfb3]/40 px-2 py-0.5 text-[10px] font-bold text-[#19251a]">
                    Target Met: {scannedCards.length} / {targetCount}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCardTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      cardTypeFilter === 'all'
                        ? 'bg-[#84a282] text-white'
                        : 'bg-[#fefaf3] text-[#586c5a] hover:bg-[#ebf2e9]'
                    }`}
                  >
                    All ({scannedCards.length})
                  </button>
                  {mcCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setCardTypeFilter('multiple_choice')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        cardTypeFilter === 'multiple_choice'
                          ? 'bg-[#84a282] text-white'
                          : 'bg-[#fefaf3] text-[#586c5a] hover:bg-[#ebf2e9]'
                      }`}
                    >
                      Quiz ({mcCount})
                    </button>
                  )}
                  {fcCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setCardTypeFilter('flashcard')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        cardTypeFilter === 'flashcard'
                          ? 'bg-[#84a282] text-white'
                          : 'bg-[#fefaf3] text-[#586c5a] hover:bg-[#ebf2e9]'
                      }`}
                    >
                      Flashcards ({fcCount})
                    </button>
                  )}
                  {fbCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setCardTypeFilter('fill_blank')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        cardTypeFilter === 'fill_blank'
                          ? 'bg-[#84a282] text-white'
                          : 'bg-[#fefaf3] text-[#586c5a] hover:bg-[#ebf2e9]'
                      }`}
                    >
                      Fill-in ({fbCount})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addManualCard}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#f6e2e9] text-[#703348] hover:bg-[#f3d3de] transition cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Card</span>
                  </button>
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                {filteredCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-[#dfe8dc] bg-white p-4 shadow-xs relative space-y-2.5 transition hover:border-[#84a282]"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        card.card_type === 'multiple_choice'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : card.card_type === 'fill_blank'
                          ? 'bg-[#f6e2e9] text-[#703348] border border-[#e8c0cc]'
                          : 'bg-[#ebf2e9] text-[#19251a] border border-[#b8cfb3]'
                      }`}>
                        {card.card_type === 'multiple_choice'
                          ? 'Multiple Choice Quiz'
                          : card.card_type === 'fill_blank'
                          ? 'Fill-in-the-Blank'
                          : 'Concept Flashcard'} #{idx + 1}
                      </span>

                      <button
                        onClick={() => removeCard(card.id)}
                        className="text-[#586c5a] hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Remove card"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#586c5a]">
                          Clinical Prompt / Question
                        </label>
                        <input
                          type="text"
                          value={card.front}
                          onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                          className="w-full rounded-lg border border-[#dfe8dc] bg-[#fefaf3] px-2.5 py-1.5 text-xs text-[#19251a] font-medium outline-none focus:border-[#84a282]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#586c5a]">
                          Correct Answer / Key Findings
                        </label>
                        <textarea
                          rows={2}
                          value={card.back}
                          onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                          className="w-full rounded-lg border border-[#dfe8dc] bg-[#fefaf3] px-2.5 py-1.5 text-xs text-[#19251a] font-medium outline-none focus:border-[#84a282]"
                        />
                      </div>

                      {card.distractors && card.distractors.length > 0 && (
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#586c5a]">
                            Quiz Distractors
                          </label>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {card.distractors.map((d, dIdx) => (
                              <span key={dIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                                ❌ {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {card.explanation && (
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#84a282]">
                            Clinical Rationale
                          </label>
                          <input
                            type="text"
                            value={card.explanation}
                            onChange={(e) => updateCard(card.id, 'explanation', e.target.value)}
                            className="w-full rounded-lg border border-[#dfe8dc] bg-[#fefaf3] px-2.5 py-1 text-xs text-[#586c5a] italic outline-none focus:border-[#84a282]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#dfe8dc] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScannedCards([])}
                  className="rounded-2xl border border-[#dfe8dc] bg-white px-4 py-3 text-xs font-bold text-[#586c5a] hover:bg-[#ebf2e9] cursor-pointer transition"
                >
                  Scan Another PDF
                </button>
                <button
                  type="button"
                  onClick={handleSaveDeck}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#84a282] hover:bg-[#6e8c6c] py-3 text-xs font-bold text-white shadow-md transition active:scale-98 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Save Deck ({scannedCards.length} Clinical Cards)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
