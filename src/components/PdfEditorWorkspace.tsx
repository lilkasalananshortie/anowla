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
  Stethoscope,
  Highlighter,
  Scissors,
  Bookmark,
  CheckCircle2,
  Play
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
  const [documentTitle, setDocumentTitle] = useState('Clinical Lecture Notes');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultFolderId || folders[0]?.id || ''
  );
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Parsing & AI Generation states
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [cardCountTarget, setCardCountTarget] = useState(25);
  const [medicalFocus, setMedicalFocus] = useState<'comprehensive' | 'pharmacology' | 'pathophysiology' | 'nclex_priorities'>('comprehensive');
  const [generatedCards, setGeneratedCards] = useState<EditableCard[]>([]);

  // Active view tab for mobile/tablet screens
  const [activeTab, setActiveTab] = useState<'editor' | 'cards'>('editor');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      setExtractProgress(15);

      const cleanTitle = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocumentTitle(cleanTitle);

      const { text } = await extractFullTextFromPdf(selectedFile, (progress) => {
        setExtractProgress(progress);
      });

      if (!text || text.trim().length < 40) {
        throw new Error('Could not extract readable text from this PDF. Please verify it contains text and is not an image-only scan.');
      }

      setDocumentText(text);
      setActiveTab('editor');
    } catch (err: any) {
      setError(err.message || 'Failed to read PDF document.');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  // Markup & Annotation Actions
  const handleHighlightSelection = (colorName: string = 'yellow') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) {
      setError('Highlight a passage of text in the document first.');
      return;
    }

    const selected = documentText.substring(start, end);
    const before = documentText.substring(0, start);
    const after = documentText.substring(end);

    const marked = `==${selected}==`;
    setDocumentText(`${before}${marked}${after}`);
  };

  const handleInsertStudyNote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = documentText.substring(0, start);
    const after = documentText.substring(start);

    const noteTag = `\n[STUDY NOTE: Key concept or takeaway]\n`;
    setDocumentText(`${before}${noteTag}${after}`);
  };

  const handleStripBoilerplate = () => {
    if (!documentText) return;
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
      setError('Please enter or extract at least 50 characters of study notes.');
      return;
    }

    setIsGeneratingCards(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: documentText,
          cardCount: cardCountTarget,
          title: documentTitle,
          focus: medicalFocus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract cards from notes.');
      }

      if (!data.cards || data.cards.length === 0) {
        throw new Error('No cards were generated. Try adding more specific concepts.');
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
      setError(err.message || 'Error communicating with card generation service.');
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleAddNewBlankCard = () => {
    const newCard: EditableCard = {
      id: `manual-card-${Date.now()}`,
      front: 'New question or concept prompt:',
      back: 'Core answer and explanatory mechanism.',
      card_type: 'flashcard',
      distractors: [],
      explanation: 'Key takeaway for active recall.',
    };
    setGeneratedCards([newCard, ...generatedCards]);
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
      setError('Please generate or add at least one card before saving.');
      return;
    }

    const currentFolder = folders.find((f) => f.id === selectedFolderId);

    const deckCards: Card[] = generatedCards.map((c, idx) => ({
      id: `card_${Date.now()}_${idx}`,
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
      id: `deck_${Date.now()}`,
      title: documentTitle.trim() || 'Clinical Study Deck',
      description: `Annotated and extracted from "${file ? file.name : 'Clinical Notes'}" (${deckCards.length} cards)`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#141d16]/85 backdrop-blur-md animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-6xl h-[94vh] flex flex-col rounded-3xl bg-[#fefaf3] border border-[#dfe8dc] shadow-2xl text-[#19251a] overflow-hidden bg-grid-clinical"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. TOP HEADER & WORKSPACE TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 border-b border-[#dfe8dc] bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#84a282] text-white shadow-md shadow-[#84a282]/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="bg-transparent text-sm sm:text-base font-bold text-[#19251a] border-b border-transparent hover:border-[#84a282]/40 focus:border-[#84a282] focus:outline-none transition max-w-[200px] sm:max-w-md"
                  placeholder="Document Title..."
                />
              </div>
              <p className="text-[11px] text-[#586c5a]">
                PDF Reader, Document Markup & Card Creator
              </p>
            </div>
          </div>

          {/* Folder Selection & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Folder Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#fefaf3] border border-[#dfe8dc] rounded-2xl px-3 py-1.5 text-xs font-semibold">
              <FolderIcon className="h-3.5 w-3.5 text-[#84a282]" />
              {isCreatingNewFolder ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="New Folder..."
                    className="bg-white rounded px-2 py-0.5 text-xs text-[#19251a] border border-[#b8cfb3] focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolderInline}
                    className="p-1 rounded bg-[#84a282] text-white font-bold hover:bg-[#6e8c6c] cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setIsCreatingNewFolder(false)}
                    className="p-1 text-[#586c5a] hover:text-[#19251a] cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="bg-transparent text-xs text-[#19251a] font-bold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="">No Folder (Root)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsCreatingNewFolder(true)}
                    className="p-0.5 text-[#586c5a] hover:text-[#84a282] rounded transition cursor-pointer"
                    title="Create New Folder"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Link to Full Workspace */}
            <a
              href="/workspace"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#ebf2e9] text-[#19251a] hover:bg-[#dfe8dc] transition"
              title="Open full page workspace"
            >
              <span>Full Page Workspace ↗</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#586c5a] hover:bg-black/5 hover:text-[#19251a] transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Tab Switcher */}
        <div className="flex lg:hidden border-b border-[#dfe8dc] bg-white px-4 py-2 gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'editor'
                ? 'bg-[#84a282] text-white shadow-xs'
                : 'text-[#586c5a] hover:bg-[#ebf2e9]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Document Notes ({wordCount} words)</span>
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'cards'
                ? 'bg-[#84a282] text-white shadow-xs'
                : 'text-[#586c5a] hover:bg-[#ebf2e9]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Flashcards ({generatedCards.length})</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-3 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 2. MAIN WORKSPACE BODY (Split Screen Desktop, Tabbed on Mobile/Tablet) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#dfe8dc]">
          
          {/* LEFT PANE: Document Markup & Live Reader */}
          <div className={`lg:col-span-6 flex flex-col h-full overflow-hidden bg-white/60 ${
            activeTab === 'editor' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            {/* Markup Action Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#dfe8dc] bg-white text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#ebf2e9] hover:bg-[#dfe8dc] text-[#19251a] px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-[#84a282]" />
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
                  <>
                    <button
                      type="button"
                      onClick={() => handleHighlightSelection('yellow')}
                      className="flex items-center gap-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                      title="Select text and click to highlight"
                    >
                      <Highlighter className="h-3 w-3 text-amber-600" />
                      <span>Highlight</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInsertStudyNote}
                      className="flex items-center gap-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                      title="Insert study memo at cursor"
                    >
                      <Bookmark className="h-3 w-3 text-teal-600" />
                      <span>Add Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStripBoilerplate}
                      className="flex items-center gap-1 rounded-xl bg-stone-50 hover:bg-stone-100 text-[#586c5a] border border-[#dfe8dc] px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer"
                      title="Remove Slide Numbers and Headers"
                    >
                      <Scissors className="h-3 w-3" />
                      <span>Clean Headers</span>
                    </button>
                  </>
                )}
              </div>

              <div className="text-[11px] font-semibold text-[#586c5a]">
                {wordCount} words
              </div>
            </div>

            {/* Document Body Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {isExtractingPdf ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#84a282]" />
                  <p className="text-sm font-bold text-[#19251a]">Extracting text from PDF pages...</p>
                  <div className="w-48 bg-[#ebf2e9] h-2 rounded-full overflow-hidden border border-[#dfe8dc]">
                    <div className="bg-[#84a282] h-full transition-all duration-300 rounded-full" style={{ width: `${extractProgress}%` }} />
                  </div>
                </div>
              ) : !documentText && !file ? (
                /* Empty Dropzone */
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#b8cfb3] bg-white p-8 text-center hover:border-[#84a282] hover:bg-[#ebf2e9]/30 transition cursor-pointer"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ebf2e9] text-[#84a282] mb-3">
                    <Upload className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-bold text-[#19251a]">Upload Medical or Nursing PDF</h4>
                  <p className="mt-1 text-xs text-[#586c5a] max-w-sm leading-relaxed">
                    Upload course slides, pharmacology monographs, NCLEX modules, or clinical guidelines to read and markup.
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-full bg-[#84a282] text-white px-5 py-2 text-xs font-bold shadow-md hover:bg-[#6e8c6c]"
                  >
                    Select PDF File
                  </button>
                </div>
              ) : (
                /* Editable Document Content */
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#586c5a] pb-1">
                    <span>Document Content: You can edit text, highlight key terms, or paste notes before extracting cards.</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="Extracted PDF text appears here. You can highlight, type, or edit freely..."
                    className="flex-1 w-full rounded-2xl bg-white border border-[#dfe8dc] p-4 text-xs text-[#19251a] leading-relaxed font-sans focus:border-[#84a282] focus:outline-none resize-none shadow-xs"
                  />
                </div>
              )}
            </div>

            {/* Generator Controls Footer */}
            <div className="p-4 border-t border-[#dfe8dc] bg-white space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Focus Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-[#19251a] mb-1">
                    Clinical Focus
                  </label>
                  <select
                    value={medicalFocus}
                    onChange={(e: any) => setMedicalFocus(e.target.value)}
                    className="w-full rounded-xl bg-[#fefaf3] border border-[#dfe8dc] px-3 py-2 text-xs font-semibold text-[#19251a] focus:outline-none focus:border-[#84a282] cursor-pointer"
                  >
                    <option value="comprehensive">Comprehensive Clinical Overview</option>
                    <option value="pharmacology">Pharmacology & High-Alert Meds</option>
                    <option value="pathophysiology">Pathophysiology & Disease Process</option>
                    <option value="nclex_priorities">NCLEX-RN Priorities & Triage</option>
                  </select>
                </div>

                {/* Target Count */}
                <div>
                  <label className="block text-[11px] font-bold text-[#19251a] mb-1">
                    Card Volume ({cardCountTarget} Cards)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[15, 25, 40, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCardCountTarget(num)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          cardCountTarget === num
                            ? 'bg-[#84a282] text-white shadow-xs'
                            : 'bg-[#fefaf3] border border-[#dfe8dc] text-[#586c5a] hover:border-[#84a282]'
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
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#19251a] hover:bg-[#283e2c] text-white font-bold py-3 text-xs shadow-md transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingCards ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Extracting Flashcards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Generate Flashcards from Document Notes</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT PANE: Flashcard Review & Deck Finalizer */}
          <div className={`lg:col-span-6 flex flex-col h-full overflow-hidden bg-white/60 ${
            activeTab === 'cards' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            {/* Cards Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#dfe8dc] bg-white text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#19251a]">
                  Flashcards ({generatedCards.length})
                </span>
                <span className="text-[11px] text-[#586c5a]">
                  Review & edit before saving
                </span>
              </div>

              <button
                onClick={handleAddNewBlankCard}
                className="flex items-center gap-1 rounded-xl bg-[#ebf2e9] hover:bg-[#dfe8dc] text-[#19251a] px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[#84a282]" />
                <span>Add Card</span>
              </button>
            </div>

            {/* Cards List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {generatedCards.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center h-full space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebf2e9] text-[#84a282]">
                    <Layers className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#19251a]">No Flashcards Yet</h4>
                  <p className="text-xs text-[#586c5a] max-w-xs leading-relaxed">
                    Upload a medical PDF on the left and click &quot;Generate Flashcards&quot;, or click &quot;Add Card&quot; to author manually.
                  </p>
                </div>
              ) : (
                generatedCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-[#dfe8dc] bg-white p-4 shadow-xs space-y-2 transition hover:border-[#84a282]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ebf2e9] text-[#19251a]">
                        Card #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-[#586c5a] hover:text-rose-600 p-1 cursor-pointer transition"
                        title="Delete card"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-[#586c5a]">Question / Prompt</label>
                      <input
                        type="text"
                        value={card.front}
                        onChange={(e) => handleUpdateCard(card.id, { front: e.target.value })}
                        className="w-full rounded-lg border border-[#dfe8dc] bg-[#fefaf3] px-2.5 py-1.5 text-xs text-[#19251a] font-medium focus:border-[#84a282] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-[#586c5a]">Answer / Findings</label>
                      <textarea
                        rows={2}
                        value={card.back}
                        onChange={(e) => handleUpdateCard(card.id, { back: e.target.value })}
                        className="w-full rounded-lg border border-[#dfe8dc] bg-[#fefaf3] px-2.5 py-1.5 text-xs text-[#19251a] font-medium focus:border-[#84a282] focus:outline-none"
                      />
                    </div>

                    {card.explanation && (
                      <div className="text-[11px] text-[#586c5a] italic pt-1 border-t border-[#dfe8dc]/60">
                        💡 {card.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Right Footer: Save Deck & Study */}
            <div className="p-4 border-t border-[#dfe8dc] bg-white flex items-center gap-2">
              <button
                onClick={() => handleSaveDeckToLibrary(false)}
                disabled={generatedCards.length === 0}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-[#ebf2e9] hover:bg-[#dfe8dc] text-[#19251a] font-bold py-3 text-xs transition disabled:opacity-40 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-[#84a282]" />
                <span>Save to Library</span>
              </button>

              <button
                onClick={() => handleSaveDeckToLibrary(true)}
                disabled={generatedCards.length === 0}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-[#84a282] hover:bg-[#6e8c6c] text-white font-bold py-3 text-xs shadow-md transition disabled:opacity-40 cursor-pointer active:scale-98"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Save & Study Now</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
