'use client';

import React, { useState, useRef } from 'react';
import { Deck, Card, CardType, Folder } from '@/types';
import { extractFullTextFromPdf } from '@/lib/pdfExtractor';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  Loader2, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  FolderPlus, 
  Layers, 
  ArrowRight,
  BookOpen,
  Folder as FolderIcon,
  HelpCircle,
  Stethoscope,
  RefreshCw,
  Copy,
  Sliders,
  ChevronDown
} from 'lucide-react';

interface PdfEditorWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onCreateFolder?: (name: string) => Folder;
  defaultFolderId?: string;
  onSaveDeck: (deck: Deck) => void;
  onStartStudy?: (deck: Deck) => void;
}

interface EditableCard {
  id: string;
  front: string;
  back: string;
  card_type: CardType;
  distractors: string[];
  explanation: string;
}

export default function PdfEditorWorkspace({
  isOpen,
  onClose,
  folders,
  onCreateFolder,
  defaultFolderId,
  onSaveDeck,
  onStartStudy,
}: PdfEditorWorkspaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Clinical Study Notes');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultFolderId || folders[0]?.id || ''
  );
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Parsing & AI Generation states
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [cardCountTarget, setCardCountTarget] = useState(10);
  const [medicalFocus, setMedicalFocus] = useState<'general' | 'pharma' | 'patho' | 'nclex'>('general');
  const [generatedCards, setGeneratedCards] = useState<EditableCard[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Active view tab for mobile/tablet screens
  const [activeTab, setActiveTab] = useState<'editor' | 'cards'>('editor');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      await processSelectedPdf(selected);
    } else if (selected) {
      setError('Please choose a valid .pdf document.');
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === 'application/pdf') {
      await processSelectedPdf(dropped);
    }
  };

  const processSelectedPdf = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      setError(null);
      setIsExtractingPdf(true);
      setExtractProgress(10);

      const cleanTitle = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocumentTitle(cleanTitle);

      const { text } = await extractFullTextFromPdf(selectedFile, (progress) => {
        setExtractProgress(progress);
      });

      if (!text || text.trim().length < 40) {
        throw new Error('Could not extract readable text from this PDF. Please verify it is not scanned images only.');
      }

      setDocumentText(text);
      setActiveTab('editor');
    } catch (err: any) {
      setError(err.message || 'Failed to read PDF document.');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleStripBoilerplate = () => {
    if (!documentText) return;
    // Clean common slide footers and page markers
    const cleaned = documentText
      .replace(/--- Page \d+ ---/gi, '')
      .replace(/Slide \d+ of \d+/gi, '')
      .replace(/Page \d+ of \d+/gi, '')
      .replace(/\bCopyright\s+©.*$/gim, '')
      .replace(/^\s*[\r\n]/gm, '\n')
      .trim();
    setDocumentText(cleaned);
  };

  const handleGenerateCards = async () => {
    if (!documentText || documentText.trim().length < 50) {
      setError('Please enter or extract at least 50 characters of medical notes.');
      return;
    }

    setIsGeneratingCards(true);
    setError(null);

    try {
      const focusInstruction = 
        medicalFocus === 'pharma'
          ? 'Focus heavily on drug classes, mechanisms of action, adverse effects, contraindications, and nursing considerations.'
          : medicalFocus === 'nclex'
          ? 'Focus on NCLEX-style clinical prioritization, unstable vs stable patient scenarios, and delegation rules.'
          : medicalFocus === 'patho'
          ? 'Focus on disease pathophysiology, hallmark diagnostic signs, lab values, and clinical manifestations.'
          : 'Focus on high-yield clinical definitions, nursing interventions, and pathophysiology.';

      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${focusInstruction}\n\n${documentText.slice(0, 35000)}`,
          cardCount: cardCountTarget,
          title: documentTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate flashcards.');
      }

      if (!data.cards || data.cards.length === 0) {
        throw new Error('No cards were generated. Try providing more specific clinical notes.');
      }

      const formatted: EditableCard[] = data.cards.map((c: any, idx: number) => ({
        id: `card-${Date.now()}-${idx}`,
        front: c.front,
        back: c.back,
        card_type: c.card_type || 'flashcard',
        distractors: Array.isArray(c.distractors) ? c.distractors : [],
        explanation: c.explanation || '',
      }));

      setGeneratedCards(formatted);
      setActiveTab('cards');
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI service.');
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleAddNewBlankCard = () => {
    const newCard: EditableCard = {
      id: `manual-card-${Date.now()}`,
      front: 'New Clinical Question / Prompt',
      back: 'Correct Medical Rationale / Answer',
      card_type: 'flashcard',
      distractors: [],
      explanation: 'High-yield clinical explanation',
    };
    setGeneratedCards([newCard, ...generatedCards]);
    setEditingCardId(newCard.id);
  };

  const handleUpdateCard = (id: string, updates: Partial<EditableCard>) => {
    setGeneratedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteCard = (id: string) => {
    setGeneratedCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreateFolderInline = () => {
    if (!newFolderName.trim()) return;
    if (onCreateFolder) {
      const created = onCreateFolder(newFolderName.trim());
      setSelectedFolderId(created.id);
    } else {
      const folderId = `folder-${Date.now()}`;
      setSelectedFolderId(folderId);
    }
    setNewFolderName('');
    setIsCreatingNewFolder(false);
  };

  const handleSaveDeckToLibrary = (startImmediately = false) => {
    if (generatedCards.length === 0) {
      setError('Please generate or create at least one flashcard before saving.');
      return;
    }

    const currentFolder = folders.find((f) => f.id === selectedFolderId);

    const deckCards: Card[] = generatedCards.map((c, idx) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `card_${Date.now()}_${idx}`,
      deck_id: '',
      card_type: c.card_type,
      front: c.front,
      back: c.back,
      distractors: c.distractors,
      explanation: c.explanation,
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    const newDeck: Deck = {
      id: crypto.randomUUID ? crypto.randomUUID() : `deck_${Date.now()}`,
      title: documentTitle.trim() || 'Clinical Study Deck',
      description: `Extracted from ${file ? file.name : 'Clinical Notes'} (${deckCards.length} cards)`,
      category: currentFolder ? currentFolder.name : 'General',
      folder_id: selectedFolderId || undefined,
      cards_count: deckCards.length,
      due_count: deckCards.length,
      created_at: new Date().toISOString(),
      cards: deckCards,
    };

    onSaveDeck(newDeck);

    if (startImmediately && onStartStudy) {
      onStartStudy(newDeck);
    }

    onClose();
  };

  const wordCount = documentText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl h-[94vh] flex flex-col rounded-2xl md:rounded-3xl bg-[#141b26] border border-white/10 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. TOP HEADER & WORKSPACE BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-white/10 bg-[#18212f]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="bg-transparent text-base sm:text-lg font-bold text-white border-b border-transparent hover:border-white/20 focus:border-teal-400 focus:outline-none transition max-w-[220px] sm:max-w-md"
                  placeholder="Deck Title..."
                />
              </div>
              <p className="text-[11px] text-white/50">
                Medical PDF Parser & Flashcard Editor
              </p>
            </div>
          </div>

          {/* Folder Selection & Workspace Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Folder Dropdown */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
              <FolderIcon className="h-3.5 w-3.5 text-amber-300" />
              {isCreatingNewFolder ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="New Folder..."
                    className="bg-black/40 rounded px-2 py-0.5 text-xs text-white border border-white/20 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolderInline}
                    className="p-1 rounded bg-teal-500 text-zinc-950 font-bold hover:bg-teal-400 cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setIsCreatingNewFolder(false)}
                    className="p-1 text-white/50 hover:text-white cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="bg-transparent text-xs text-white/90 font-medium focus:outline-none cursor-pointer pr-1"
                  >
                    {folders.map((f) => (
                      <option key={f.id} value={f.id} className="bg-[#18212f] text-white">
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsCreatingNewFolder(true)}
                    className="p-0.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
                    title="Add Folder"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Tab Switcher */}
        <div className="flex lg:hidden border-b border-white/10 bg-[#161e2b] px-4 py-2 gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'editor'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Document Notes ({wordCount} words)</span>
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'cards'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Flashcards ({generatedCards.length})</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-3 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs font-medium text-rose-200 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-300 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 2. MAIN WORKSPACE BODY (Split Screen Desktop, Tabbed on Mobile/Tablet) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          
          {/* LEFT PANE: Document Upload & Live Text Editor */}
          <div className={`lg:col-span-6 flex flex-col h-full overflow-hidden ${
            activeTab === 'editor' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            {/* Editor Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#161f2c] text-xs">
              <div className="flex items-center gap-3 text-white/60 text-[11px]">
                <span>{wordCount} words</span>
                {file && (
                  <span className="hidden sm:inline bg-white/10 px-2 py-0.5 rounded text-[10px] text-teal-200">
                    {file.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                >
                  <Upload className="h-3 w-3 text-teal-300" />
                  <span>{file ? 'Replace PDF' : 'Upload PDF'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {documentText && (
                  <button
                    onClick={handleStripBoilerplate}
                    className="rounded-lg bg-white/5 hover:bg-white/10 px-2.5 py-1 text-[11px] text-white/70 hover:text-white transition cursor-pointer"
                    title="Remove Slide Numbers and Headers"
                  >
                    Clean Headers
                  </button>
                )}
              </div>
            </div>

            {/* Document Body Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {isExtractingPdf ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                  <p className="text-sm font-bold text-white">Extracting text from PDF...</p>
                  <div className="w-48 bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-400 h-full transition-all duration-300" style={{ width: `${extractProgress}%` }} />
                  </div>
                </div>
              ) : !documentText && !file ? (
                /* Dropzone when empty */
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/5 p-8 text-center hover:border-teal-400/50 hover:bg-teal-500/5 transition cursor-pointer"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-300 mb-3 border border-teal-500/20">
                    <Upload className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Upload Medical / Nursing PDF</h4>
                  <p className="mt-1 text-xs text-white/50 max-w-sm leading-relaxed">
                    Drop course slides, clinical guidelines, drug monographs, or NCLEX review modules.
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-xl bg-teal-500 text-zinc-950 px-4 py-2 text-xs font-bold shadow-md hover:bg-teal-400"
                  >
                    Select PDF File
                  </button>
                </div>
              ) : (
                /* Editable Document Content */
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-white/40 pb-1">
                    <span>Editable Clinical Notes: You can modify, delete, or paste additional text below before generating cards.</span>
                  </div>
                  <textarea
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="Extracted PDF text will appear here. You can type or edit your notes freely..."
                    className="flex-1 w-full rounded-xl bg-black/30 border border-white/10 p-3.5 text-xs text-white/90 leading-relaxed font-mono focus:border-teal-400/50 focus:outline-none resize-none"
                  />
                </div>
              )}
            </div>

            {/* Left Footer Action: AI Generator Controls */}
            <div className="p-4 border-t border-white/10 bg-[#161f2c] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Medical Focus Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    Clinical Focus
                  </label>
                  <select
                    value={medicalFocus}
                    onChange={(e: any) => setMedicalFocus(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="general" className="bg-[#18212f]">General Nursing & Clinical</option>
                    <option value="pharma" className="bg-[#18212f]">Pharmacology & Dosing Safety</option>
                    <option value="patho" className="bg-[#18212f]">Pathophysiology & Diagnostics</option>
                    <option value="nclex" className="bg-[#18212f]">NCLEX Prioritization & Triage</option>
                  </select>
                </div>

                {/* Target Card Count */}
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    Card Count
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCardCountTarget(num)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          cardCountTarget === num
                            ? 'bg-teal-400 text-zinc-950'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateCards}
                disabled={isGeneratingCards || !documentText.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold py-3 text-xs shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingCards ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extracting Active Recall Flashcards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Active Recall Flashcards</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT PANE: Generated Flashcard Review & Inline Card Editor */}
          <div className={`lg:col-span-6 flex flex-col h-full overflow-hidden ${
            activeTab === 'cards' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            {/* Cards Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#161f2c] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  Flashcards ({generatedCards.length})
                </span>
                <span className="text-[11px] text-white/40">
                  Review & tweak before saving
                </span>
              </div>

              <button
                onClick={handleAddNewBlankCard}
                className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white transition cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add Card</span>
              </button>
            </div>

            {/* Cards List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {generatedCards.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-white/40 space-y-3 mt-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/40 border border-white/10">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <p className="text-xs max-w-xs leading-relaxed">
                    No flashcards generated yet. Upload a PDF on the left and click "Generate Active Recall Flashcards".
                  </p>
                </div>
              ) : (
                generatedCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="rounded-2xl bg-[#1c2635] border border-white/10 p-4 space-y-3 shadow-md hover:border-white/20 transition"
                  >
                    {/* Card Top Label & Actions */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                          Card {idx + 1} • {card.card_type.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingCardId(editingCardId === card.id ? null : card.id)}
                          className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
                          title="Edit Card"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 rounded text-white/40 hover:text-rose-400 hover:bg-white/10 transition cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Edit Form OR Read-Only Display */}
                    {editingCardId === card.id ? (
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-white/60 uppercase mb-1">
                            Prompt / Question
                          </label>
                          <textarea
                            value={card.front}
                            onChange={(e) => handleUpdateCard(card.id, { front: e.target.value })}
                            rows={2}
                            className="w-full rounded-xl bg-black/40 border border-white/15 p-2 text-xs text-white focus:border-teal-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-emerald-300 uppercase mb-1">
                            Answer
                          </label>
                          <textarea
                            value={card.back}
                            onChange={(e) => handleUpdateCard(card.id, { back: e.target.value })}
                            rows={2}
                            className="w-full rounded-xl bg-black/40 border border-emerald-400/30 p-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">
                            Clinical Rationale
                          </label>
                          <input
                            type="text"
                            value={card.explanation}
                            onChange={(e) => handleUpdateCard(card.id, { explanation: e.target.value })}
                            className="w-full rounded-xl bg-black/40 border border-white/10 p-2 text-xs text-white/80 focus:border-teal-400 focus:outline-none"
                            placeholder="Why this answer is correct..."
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => setEditingCardId(null)}
                            className="rounded-lg bg-teal-500 text-zinc-950 font-bold px-3 py-1 text-xs hover:bg-teal-400 transition"
                          >
                            Done Editing
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Prompt</span>
                          <p className="font-semibold text-white/90 mt-0.5 leading-snug">{card.front}</p>
                        </div>

                        <div className="pt-1 border-t border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Answer</span>
                          <p className="font-medium text-emerald-200 mt-0.5 leading-relaxed">{card.back}</p>
                        </div>

                        {card.explanation && (
                          <p className="text-[11px] text-white/50 italic pt-1 border-t border-white/5">
                            💡 {card.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Right Footer Action: Save Deck & Start Study */}
            <div className="p-4 border-t border-white/10 bg-[#161f2c] flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => handleSaveDeckToLibrary(false)}
                disabled={generatedCards.length === 0}
                className="w-full sm:flex-1 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold py-3 text-xs border border-white/10 transition disabled:opacity-40 cursor-pointer"
              >
                Save to Library
              </button>

              <button
                onClick={() => handleSaveDeckToLibrary(true)}
                disabled={generatedCards.length === 0}
                className="w-full sm:flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold py-3 text-xs shadow-lg transition active:scale-98 disabled:opacity-40 cursor-pointer"
              >
                <span>Save & Start Study</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
