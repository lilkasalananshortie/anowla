'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Stethoscope, 
  Upload, 
  FileText, 
  FolderPlus, 
  Folder as FolderIcon, 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Highlighter, 
  Layers, 
  Play, 
  Scissors, 
  StickyNote, 
  ChevronRight, 
  ArrowLeft, 
  BookOpen, 
  Loader2, 
  Download, 
  X,
  Eye,
  CheckCircle2,
  FileCheck,
  Zap,
  RotateCcw
} from 'lucide-react';
import CreateFolderModal from '@/components/CreateFolderModal';
import { extractFullTextFromPdf } from '@/lib/pdfExtractor';
import { 
  getLocalFolders, 
  saveLocalFolders, 
  getLocalDocuments, 
  saveLocalDocument, 
  deleteLocalDocument,
  saveUserDeck,
  getLocalDecks 
} from '@/lib/deckService';
import { Folder, StudyDocument, ClinicalNote, Deck, Card, CardType } from '@/types';

type HighlightColor = 'yellow' | 'green' | 'rose' | 'blue';

interface GeneratedCardItem {
  id: string;
  front: string;
  back: string;
  card_type: CardType;
  distractors?: string[];
  explanation?: string;
}

const HIGHLIGHT_COLORS: { id: HighlightColor; name: string; bg: string; text: string; hex: string }[] = [
  { id: 'yellow', name: 'Clinical Finding', bg: 'bg-amber-100/90', text: 'text-amber-900', hex: '#fef08a' },
  { id: 'green', name: 'Pharmacology / Normal Lab', bg: 'bg-[#b8cfb3]/70', text: 'text-[#19251a]', hex: '#b8cfb3' },
  { id: 'rose', name: 'High-Alert / Black-Box', bg: 'bg-[#f6e2e9]/90', text: 'text-rose-900', hex: '#f6e2e9' },
  { id: 'blue', name: 'NCLEX Priority / Rationale', bg: 'bg-sky-100/90', text: 'text-sky-900', hex: '#bae6fd' },
];

export default function WorkspacePage() {
  const router = useRouter();

  // Folders & Documents State
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [savedDocs, setSavedDocs] = useState<StudyDocument[]>([]);

  // Current Document State
  const [documentId, setDocumentId] = useState<string>(() => `doc-${Date.now()}`);
  const [documentTitle, setDocumentTitle] = useState('Critical Care & Pharmacology Notes');
  const [documentText, setDocumentText] = useState(
    `# Clinical Pharmacology & Critical Care Guide\n\n==[rose]Digoxin High-Alert Administration==\nMandatory nursing assessment: Auscultate apical pulse for 1 full minute prior to administration. Withhold dose and notify provider if HR < 60 bpm in adults or < 90 bpm in infants.\n\n==[yellow]Signs of Digoxin Toxicity==\nEarly signs: Anorexia, nausea, vomiting, malaise.\nLate / Visual signs: Xanthopsia (yellow-green halos around objects), blurred vision, cardiac arrhythmias.\nTherapeutic serum level: 0.5 - 2.0 ng/mL. Hypokalemia increases toxicity risk.\nAntidote: Digoxin Immune Fab (DigiFab).\n\n==[blue]ACE Inhibitor Airway Emergency==\nAngioedema (edema of face, lips, tongue, and larynx) secondary to bradykinin accumulation requires immediate drug discontinuation and airway support.\n\n==[green]Normal Serum Potassium==\nReference range: 3.5 - 5.0 mEq/L. Hyperkalemia (> 5.0 mEq/L) causes peaked T waves and ventricular dysrhythmias.`
  );
  const [notes, setNotes] = useState<ClinicalNote[]>([
    {
      id: 'note-1',
      text: 'NCLEX Alert: Always check serum potassium before giving Digoxin. Hypokalemia drastically potentiates toxicity even at normal Digoxin levels.',
      color: 'rose',
      created_at: new Date().toISOString(),
    },
    {
      id: 'note-2',
      text: 'Protamine sulfate is the antidote for Heparin; Phytonadione (Vitamin K) is the antidote for Warfarin.',
      color: 'green',
      created_at: new Date().toISOString(),
    }
  ]);

  // View & Tool States
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'cards'>('editor');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<HighlightColor>('yellow');
  const [newNoteInput, setNewNoteInput] = useState('');
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [hasSavedDoc, setHasSavedDoc] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // PDF Extraction States
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  // Direct Upload & Card Generator State
  const [isDirectUploadOpen, setIsDirectUploadOpen] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [cardTargetCount, setCardTargetCount] = useState<number>(25);
  const [clinicalFocus, setClinicalFocus] = useState<'comprehensive' | 'pharmacology' | 'pathophysiology' | 'nclex_priorities'>('comprehensive');
  const [generatedCards, setGeneratedCards] = useState<GeneratedCardItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const directPdfInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Initial Load: Folders & Saved Documents
  useEffect(() => {
    const loadedFolders = getLocalFolders();
    setFolders(loadedFolders);
    if (loadedFolders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(loadedFolders[0].id);
    }

    const loadedDocs = getLocalDocuments();
    setSavedDocs(loadedDocs);
  }, []);

  // 2. Folder Handlers
  const handleCreateNewFolder = (folder: Folder) => {
    const updated = [...folders, folder];
    setFolders(updated);
    saveLocalFolders(updated);
    setSelectedFolderId(folder.id);
    setStatusMessage(`Folder "${folder.name}" created.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 3. Document Save & Load
  const handleSaveDocument = () => {
    setIsSavingDoc(true);
    const docToSave: StudyDocument = {
      id: documentId,
      title: documentTitle.trim() || 'Untitled Clinical Notes',
      content: documentText,
      folder_id: selectedFolderId || undefined,
      notes: notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveLocalDocument(docToSave);
    const updatedDocs = getLocalDocuments();
    setSavedDocs(updatedDocs);

    setIsSavingDoc(false);
    setHasSavedDoc(true);
    setStatusMessage('Document & notes saved successfully.');
    setTimeout(() => {
      setHasSavedDoc(false);
      setStatusMessage(null);
    }, 3000);
  };

  const handleLoadDocument = (doc: StudyDocument) => {
    setDocumentId(doc.id);
    setDocumentTitle(doc.title);
    setDocumentText(doc.content);
    if (doc.folder_id) setSelectedFolderId(doc.folder_id);
    if (doc.notes) setNotes(doc.notes);
    setStatusMessage(`Loaded "${doc.title}"`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleStartNewBlankDoc = () => {
    setDocumentId(`doc-${Date.now()}`);
    setDocumentTitle('New Clinical Lecture Notes');
    setDocumentText('');
    setNotes([]);
    setGeneratedCards([]);
    setActiveTab('editor');
  };

  // 4. PDF File Upload & Extraction
  const handlePdfUpload = async (file: File) => {
    try {
      setIsExtractingPdf(true);
      setExtractProgress(15);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocumentTitle(cleanTitle);

      const { text } = await extractFullTextFromPdf(file, (progress) => {
        setExtractProgress(progress);
      });

      if (!text || text.trim().length < 30) {
        throw new Error('Unable to extract text from this PDF. Please ensure it contains readable text.');
      }

      setDocumentId(`doc-${Date.now()}`);
      setDocumentText(text);
      setActiveTab('editor');
      setStatusMessage(`Extracted ${file.name} successfully.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error extracting PDF text.');
    } finally {
      setIsExtractingPdf(false);
      setExtractProgress(0);
    }
  };

  // 5. Markup & Highlighting Logic
  const handleApplyHighlight = (color: HighlightColor) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      setStatusMessage('Highlight text with your cursor first, then click a highlight color.');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    const selectedText = documentText.substring(start, end);
    const before = documentText.substring(0, start);
    const after = documentText.substring(end);

    const highlighted = `==[${color}]${selectedText}==`;
    const newContent = `${before}${highlighted}${after}`;
    setDocumentText(newContent);

    // Maintain selection around updated highlight
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + highlighted.length);
    }, 10);
  };

  // 6. Clinical Sticky Notes
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;

    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      text: newNoteInput.trim(),
      color: selectedHighlightColor,
      created_at: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteInput('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  // 7. Cleanup Tools
  const handleCleanSlideBoilerplate = () => {
    if (!documentText) return;
    const cleaned = documentText
      .replace(/--- Page \d+ ---/gi, '')
      .replace(/Slide \d+ of \d+/gi, '')
      .replace(/Page \d+ of \d+/gi, '')
      .replace(/\bCopyright\s+©.*$/gim, '')
      .replace(/All rights reserved/gi, '')
      .replace(/^\s*[\r\n]/gm, '\n')
      .trim();

    setDocumentText(cleaned);
    setStatusMessage('Cleaned slide headers, footers & repeated page boilerplate.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 8. Flashcard Generation from Current Document
  const handleGenerateCardsFromDoc = async () => {
    if (!documentText || documentText.trim().length < 50) {
      alert('Please enter or extract at least 50 characters of medical notes to generate cards.');
      return;
    }

    setIsGeneratingCards(true);
    try {
      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: documentText,
          cardCount: cardTargetCount,
          title: documentTitle,
          clinicalFocus: clinicalFocus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate cards.');
      if (!data.cards || data.cards.length === 0) throw new Error('No cards were generated.');

      const mapped: GeneratedCardItem[] = data.cards.map((c: any, idx: number) => ({
        id: `card-${Date.now()}-${idx}`,
        front: c.front,
        back: c.back,
        card_type: c.card_type || 'flashcard',
        distractors: Array.isArray(c.distractors) ? c.distractors : [],
        explanation: c.explanation || '',
      }));

      setGeneratedCards(mapped);
      setActiveTab('cards');
      setStatusMessage(`Generated ${mapped.length} clinical cards.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error generating cards.');
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // 9. Direct PDF to Cards Upload
  const handleDirectPdfToCards = async (file: File) => {
    try {
      setIsGeneratingCards(true);
      setIsDirectUploadOpen(false);
      setStatusMessage(`Extracting & generating cards from ${file.name}...`);

      const { text } = await extractFullTextFromPdf(file);
      if (!text || text.trim().length < 40) {
        throw new Error('Could not read text from this PDF.');
      }

      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          cardCount: cardTargetCount,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          clinicalFocus: clinicalFocus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate cards.');
      if (!data.cards || data.cards.length === 0) throw new Error('No cards extracted.');

      const mapped: GeneratedCardItem[] = data.cards.map((c: any, idx: number) => ({
        id: `card-${Date.now()}-${idx}`,
        front: c.front,
        back: c.back,
        card_type: c.card_type || 'flashcard',
        distractors: Array.isArray(c.distractors) ? c.distractors : [],
        explanation: c.explanation || '',
      }));

      // Also set document text
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      setDocumentText(text);
      setGeneratedCards(mapped);
      setActiveTab('cards');
      setStatusMessage(`Direct upload complete: generated ${mapped.length} cards.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to process PDF directly.');
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // 10. Save Generated Deck to Library
  const handleSaveDeckToLibrary = (andStudy: boolean = false) => {
    if (generatedCards.length === 0) return;

    const deckId = `deck-${Date.now()}`;
    const cards: Card[] = generatedCards.map((c) => ({
      id: c.id,
      deck_id: deckId,
      front: c.front,
      back: c.back,
      card_type: c.card_type,
      distractors: c.distractors,
      explanation: c.explanation,
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    const targetFolder = folders.find((f) => f.id === selectedFolderId);

    const newDeck: Deck = {
      id: deckId,
      title: documentTitle.trim() || 'Clinical Study Deck',
      description: `Generated from "${documentTitle}" with ${cards.length} high-yield clinical cards.`,
      category: targetFolder?.name || 'Clinical Practice',
      folder_id: selectedFolderId || undefined,
      cards_count: cards.length,
      due_count: cards.length,
      created_at: new Date().toISOString(),
      cards,
    };

    saveUserDeck(newDeck);

    // Also auto-save the document
    handleSaveDocument();

    if (andStudy) {
      router.push('/study');
    } else {
      setStatusMessage(`Saved deck with ${cards.length} cards into "${targetFolder?.name || 'General'}"!`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // 11. Render Formatted Preview of Markdown + Highlights
  const renderFormattedPreview = () => {
    if (!documentText) {
      return (
        <div className="py-20 text-center text-[#586c5a]">
          <BookOpen className="mx-auto h-10 w-10 text-[#84a282] opacity-40 mb-3" />
          <p className="text-sm font-semibold">No text to preview.</p>
          <p className="text-xs mt-1">Upload a PDF or paste lecture notes in the editor tab.</p>
        </div>
      );
    }

    // Replace ==[color]text== with styled HTML spans
    const lines = documentText.split('\n');

    return (
      <div className="space-y-3 font-sans text-sm leading-relaxed text-[#19251a]">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-3" />;
          }

          if (line.startsWith('# ')) {
            return <h1 key={idx} className="text-xl font-extrabold text-[#19251a] border-b border-[#dfe8dc] pb-1.5 pt-2">{line.replace('# ', '')}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={idx} className="text-lg font-bold text-[#19251a] pt-2">{line.replace('## ', '')}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-base font-bold text-[#19251a] pt-1">{line.replace('### ', '')}</h3>;
          }

          // Parse highlights in the paragraph
          // Regex: ==(?:\[(yellow|green|rose|blue)\])?(.*?)==
          const parts: React.ReactNode[] = [];
          const regex = /==(?:\[(yellow|green|rose|blue)\])?(.*?)==/g;
          let lastIndex = 0;
          let match: RegExpExecArray | null;

          while ((match = regex.exec(line)) !== null) {
            const matchIndex = match.index;
            if (matchIndex > lastIndex) {
              parts.push(line.substring(lastIndex, matchIndex));
            }

            const colorKey = (match[1] as HighlightColor) || 'yellow';
            const content = match[2];

            const colorDef = HIGHLIGHT_COLORS.find((c) => c.id === colorKey) || HIGHLIGHT_COLORS[0];

            parts.push(
              <mark
                key={`hl-${idx}-${matchIndex}`}
                className={`rounded px-1.5 py-0.5 font-semibold mx-0.5 ${colorDef.bg} ${colorDef.text} border border-black/5 shadow-2xs`}
              >
                {content}
              </mark>
            );

            lastIndex = regex.lastIndex;
          }

          if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
          }

          return (
            <p key={idx} className="leading-relaxed">
              {parts.length > 0 ? parts : line}
            </p>
          );
        })}
      </div>
    );
  };

  const selectedFolderName = folders.find((f) => f.id === selectedFolderId)?.name || 'General';

  return (
    <div className="min-h-screen bg-[#fefaf3] bg-grid-clinical text-[#19251a] font-sans flex flex-col selection:bg-[#b8cfb3]/40">
      
      {/* 1. TOP CLINICAL WORKSPACE HEADER */}
      <header className="sticky top-0 z-30 bg-[#fefaf3]/95 backdrop-blur-md border-b border-[#dfe8dc] px-4 sm:px-8 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Left: Brand & Navigation */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <Link
              href="/study"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#586c5a] hover:text-[#19251a] transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Decks</span>
            </Link>

            <div className="h-4 w-px bg-[#dfe8dc] hidden md:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#84a282] text-white flex items-center justify-center shadow-md shadow-[#84a282]/25">
                <Highlighter size={16} strokeWidth={2.4} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-[#19251a] leading-none">PDF & Notes Workspace</span>
                <span className="text-[10px] font-semibold text-[#84a282] uppercase tracking-wider mt-0.5">Clinical Markup & Extraction</span>
              </div>
            </div>
          </div>

          {/* Center / Right: Folder Picker & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            
            {/* Folder Selection & Create Folder */}
            <div className="flex items-center gap-1.5 bg-white border border-[#dfe8dc] rounded-full px-3 py-1 shadow-xs">
              <FolderIcon size={13} className="text-[#84a282]" />
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#19251a] outline-none cursor-pointer pr-1 max-w-[140px] truncate"
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsFolderModalOpen(true)}
                className="p-1 rounded-full text-[#84a282] hover:bg-[#ebf2e9] transition cursor-pointer"
                title="Create New Folder"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Direct Upload to Generate Cards Button */}
            <button
              type="button"
              onClick={() => setIsDirectUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              title="Upload PDF directly to instantly generate cards"
            >
              <Zap size={13} className="text-rose-600 fill-rose-600" />
              <span>Direct Upload to Cards</span>
            </button>

            {/* Save Document Button */}
            <button
              type="button"
              onClick={handleSaveDocument}
              disabled={isSavingDoc}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-md ${
                hasSavedDoc
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-[#84a282]/25'
              }`}
            >
              {isSavingDoc ? (
                <Loader2 size={13} className="animate-spin" />
              ) : hasSavedDoc ? (
                <Check size={13} />
              ) : (
                <Save size={13} />
              )}
              <span>{hasSavedDoc ? 'Saved!' : 'Save Document'}</span>
            </button>

          </div>
        </div>
      </header>

      {/* STATUS TOAST NOTIFICATION */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#19251a] text-[#fefaf3] px-4 py-2.5 rounded-2xl shadow-xl border border-[#84a282]/40 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. SUB-BAR: DOCUMENT TITLE & MARKUP TOOLBAR */}
      <div className="bg-white border-b border-[#dfe8dc] px-4 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Editable Document Title */}
          <div className="flex items-center gap-2 flex-1">
            <FileText size={16} className="text-[#84a282] shrink-0" />
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Document Title (e.g. ICU Cardiac Pharmacology)"
              className="text-sm font-bold text-[#19251a] bg-transparent border-b border-transparent hover:border-[#dfe8dc] focus:border-[#84a282] focus:outline-none w-full max-w-md py-0.5 px-1 rounded transition"
            />
            <span className="text-[11px] font-semibold text-[#586c5a] shrink-0">
              in folder <span className="text-[#84a282] font-bold">"{selectedFolderName}"</span>
            </span>
          </div>

          {/* Markup & Formatting Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Highlighter Color Palette */}
            <div className="flex items-center gap-1 bg-[#fefaf3] p-1 rounded-xl border border-[#dfe8dc]">
              <span className="text-[10px] font-bold uppercase text-[#586c5a] px-1.5 flex items-center gap-1">
                <Highlighter size={12} />
                <span>Mark:</span>
              </span>
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedHighlightColor(c.id);
                    handleApplyHighlight(c.id);
                  }}
                  className={`h-6 w-6 rounded-lg transition-transform cursor-pointer border flex items-center justify-center ${
                    selectedHighlightColor === c.id ? 'scale-110 border-[#19251a] shadow-xs' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`Apply ${c.name} highlight`}
                >
                  {selectedHighlightColor === c.id && <Check size={11} className="text-[#19251a]" />}
                </button>
              ))}
            </div>

            {/* Slide Cleanup Tool */}
            <button
              type="button"
              onClick={handleCleanSlideBoilerplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#fefaf3] hover:bg-[#ebf2e9] text-[#19251a] border border-[#dfe8dc] transition cursor-pointer"
              title="Strip repetitive slide headers, page numbers & footers"
            >
              <Scissors size={12} className="text-[#84a282]" />
              <span>Clean Noise</span>
            </button>

            {/* Upload PDF to replace / load */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePdfUpload(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtractingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#ebf2e9] text-[#19251a] border border-[#dfe8dc] transition cursor-pointer"
              title="Load another PDF into workspace"
            >
              {isExtractingPdf ? <Loader2 size={12} className="animate-spin text-[#84a282]" /> : <Upload size={12} className="text-[#84a282]" />}
              <span>Upload PDF</span>
            </button>

            {/* New Blank Doc */}
            <button
              type="button"
              onClick={handleStartNewBlankDoc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#ebf2e9] text-[#19251a] border border-[#dfe8dc] transition cursor-pointer"
              title="Start a fresh blank clinical note"
            >
              <Plus size={12} className="text-[#84a282]" />
              <span>Blank Note</span>
            </button>

          </div>
        </div>
      </div>

      {/* 3. WORKSPACE CORE: SPLIT LAYOUT (LEFT: EDITOR/PREVIEW, RIGHT: NOTES & FLASHCARDS) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: DOCUMENT WORKSPACE (7 COLS ON DESKTOP) */}
        <section className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Tab Switcher: Editor vs Live Preview vs Cards */}
          <div className="flex items-center justify-between border-b border-[#dfe8dc] pb-2">
            <div className="flex items-center gap-1 bg-[#ebf2e9] p-1 rounded-2xl border border-[#dfe8dc]">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-white text-[#19251a] shadow-xs'
                    : 'text-[#586c5a] hover:text-[#19251a]'
                }`}
              >
                ✏️ Edit & Mark
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-[#19251a] shadow-xs'
                    : 'text-[#586c5a] hover:text-[#19251a]'
                }`}
              >
                👁️ Live Highlighting Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'cards'
                    ? 'bg-[#84a282] text-white shadow-xs'
                    : 'text-[#586c5a] hover:text-[#19251a]'
                }`}
              >
                <Layers size={13} />
                <span>Generated Cards ({generatedCards.length})</span>
              </button>
            </div>

            <span className="text-[11px] font-semibold text-[#586c5a] hidden sm:inline">
              {documentText.length} characters
            </span>
          </div>

          {/* Tab Content 1: Editor View */}
          {activeTab === 'editor' && (
            <div className="flex flex-col space-y-2">
              <div className="rounded-3xl border border-[#dfe8dc] bg-white p-4 sm:p-5 shadow-xs relative">
                <textarea
                  ref={textareaRef}
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Paste clinical lecture notes, or upload a medical PDF above. Highlight important terms using the colored mark buttons."
                  rows={20}
                  className="w-full font-mono text-xs sm:text-sm leading-relaxed text-[#19251a] bg-transparent resize-y focus:outline-none placeholder:text-[#586c5a]/50 min-h-[460px]"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#586c5a] px-2">
                <span>Tip: Highlight text with your mouse and click any colored box above to mark findings.</span>
                <span>Format: <code className="bg-[#ebf2e9] px-1 rounded">==[color]text==</code></span>
              </div>
            </div>
          )}

          {/* Tab Content 2: Live Highlight Preview */}
          {activeTab === 'preview' && (
            <div className="rounded-3xl border border-[#dfe8dc] bg-white p-6 sm:p-8 shadow-xs min-h-[480px] overflow-y-auto max-h-[75vh]">
              <div className="mb-4 pb-3 border-b border-[#dfe8dc] flex items-center justify-between">
                <h3 className="text-base font-bold text-[#19251a]">{documentTitle}</h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ebf2e9] text-[#84a282]">
                  {selectedFolderName}
                </span>
              </div>
              {renderFormattedPreview()}
            </div>
          )}

          {/* Tab Content 3: Generated Flashcards List */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#dfe8dc] shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-[#19251a]">
                    Flashcards Extracted ({generatedCards.length})
                  </h3>
                  <p className="text-xs text-[#586c5a]">
                    Saving to folder: <span className="font-bold text-[#84a282]">"{selectedFolderName}"</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveDeckToLibrary(false)}
                    disabled={generatedCards.length === 0}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#ebf2e9] hover:bg-[#dfe8dc] text-[#19251a] transition cursor-pointer"
                  >
                    Save to Folder
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveDeckToLibrary(true)}
                    disabled={generatedCards.length === 0}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/25 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Play size={13} className="fill-current" />
                    <span>Save & Study Now</span>
                  </button>
                </div>
              </div>

              {generatedCards.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-white border border-[#dfe8dc] p-8">
                  <Layers className="mx-auto h-10 w-10 text-[#84a282] opacity-40 mb-3" />
                  <h4 className="text-sm font-bold text-[#19251a]">No Cards Generated Yet</h4>
                  <p className="text-xs text-[#586c5a] mt-1 max-w-sm mx-auto">
                    Use the card generator on the right to extract high-yield clinical cards from this document.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateCardsFromDoc}
                    className="mt-4 px-4 py-2 rounded-full text-xs font-bold bg-[#84a282] text-white hover:bg-[#6e8c6c] cursor-pointer"
                  >
                    ⚡ Generate Cards Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedCards.map((card, idx) => (
                    <div
                      key={card.id}
                      className="rounded-2xl border border-[#dfe8dc] bg-white p-4 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#586c5a]">
                        <span>Card #{idx + 1} ({card.card_type})</span>
                        <button
                          type="button"
                          onClick={() => setGeneratedCards(generatedCards.filter((c) => c.id !== card.id))}
                          className="p-1 text-[#586c5a] hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#586c5a] block">Prompt / Question</span>
                        <p className="text-xs font-bold text-[#19251a] mt-0.5">{card.front}</p>
                      </div>

                      <div className="pt-1.5 border-t border-[#dfe8dc]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#84a282] block">Clinical Finding / Answer</span>
                        <p className="text-xs font-medium text-[#19251a] mt-0.5">{card.back}</p>
                      </div>

                      {card.explanation && (
                        <p className="text-[11px] text-[#586c5a] italic pt-1 border-t border-[#dfe8dc]/60">
                          💡 {card.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>

        {/* RIGHT COLUMN: CLINICAL NOTES & CARD EXTRACTION HUB (5 COLS ON DESKTOP) */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Card Extraction Panel */}
          <div className="rounded-3xl border border-[#dfe8dc] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfe8dc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-[#ebf2e9] text-[#84a282]">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#19251a] uppercase tracking-wider">
                    Generate Flashcards
                  </h3>
                  <p className="text-[11px] text-[#586c5a]">Extract active recall decks directly</p>
                </div>
              </div>
            </div>

            {/* Target Card Quantity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#19251a]">
                <span>Target Card Count:</span>
                <span className="text-[#84a282] font-black">{cardTargetCount} cards</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[15, 25, 50, 75].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setCardTargetCount(cnt)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      cardTargetCount === cnt
                        ? 'bg-[#84a282] text-white border-[#84a282]'
                        : 'bg-[#fefaf3] text-[#586c5a] border-[#dfe8dc] hover:bg-[#ebf2e9]'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Focus Preset */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#19251a] block">Medical Focus</label>
              <select
                value={clinicalFocus}
                onChange={(e) => setClinicalFocus(e.target.value as any)}
                className="w-full rounded-xl border border-[#dfe8dc] bg-[#fefaf3] p-2 text-xs font-semibold text-[#19251a] outline-none cursor-pointer"
              >
                <option value="comprehensive">Comprehensive Clinical Coverage</option>
                <option value="pharmacology">Pharmacology & High-Alert Meds</option>
                <option value="nclex_priorities">NCLEX-RN Priorities & Vital Signs</option>
                <option value="pathophysiology">Pathophysiology & Diagnostics</option>
              </select>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateCardsFromDoc}
              disabled={isGeneratingCards || !documentText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#84a282] hover:bg-[#6e8c6c] text-white font-bold text-xs shadow-md shadow-[#84a282]/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingCards ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Synthesizing Clinical Concepts...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Generate Flashcards from Notes</span>
                </>
              )}
            </button>
          </div>

          {/* Clinical Sticky Notes / Annotations Panel */}
          <div className="rounded-3xl border border-[#dfe8dc] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfe8dc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-[#ebf2e9] text-[#84a282]">
                  <StickyNote size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#19251a] uppercase tracking-wider">
                    Clinical Priority Notes ({notes.length})
                  </h3>
                  <p className="text-[11px] text-[#586c5a]">Sticky margins & key exam pearls</p>
                </div>
              </div>
            </div>

            {/* Note Creation Form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                placeholder="Type a clinical exam note (e.g. Always check apical pulse before Digoxin)..."
                rows={2}
                className="w-full rounded-xl border border-[#dfe8dc] bg-[#fefaf3] p-2.5 text-xs text-[#19251a] outline-none focus:border-[#84a282] placeholder:text-[#586c5a]/60"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedHighlightColor(c.id)}
                      className={`h-5 w-5 rounded-full border transition cursor-pointer ${
                        selectedHighlightColor === c.id ? 'scale-125 border-[#19251a]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!newNoteInput.trim()}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition disabled:opacity-40 cursor-pointer"
                >
                  Add Note
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <p className="text-xs text-[#586c5a] text-center py-4 italic">
                  No priority notes added yet. Use the box above to jot down key clinical alerts.
                </p>
              ) : (
                notes.map((note) => {
                  const colorDef = HIGHLIGHT_COLORS.find((c) => c.id === note.color) || HIGHLIGHT_COLORS[0];
                  return (
                    <div
                      key={note.id}
                      className="p-3 rounded-2xl border border-[#dfe8dc] bg-[#fefaf3] space-y-1.5 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colorDef.bg} ${colorDef.text}`}>
                          {colorDef.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 transition text-[#586c5a] hover:text-rose-600 p-0.5 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-[#19251a] leading-relaxed font-medium">
                        {note.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Saved Documents in this Folder */}
          <div className="rounded-3xl border border-[#dfe8dc] bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#dfe8dc]">
              <span className="text-xs font-bold text-[#19251a] uppercase tracking-wider">
                Saved Notes in Library ({savedDocs.length})
              </span>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
              {savedDocs.length === 0 ? (
                <p className="text-xs text-[#586c5a] text-center py-2 italic">
                  Click "Save Document" to store notes in your folders.
                </p>
              ) : (
                savedDocs.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleLoadDocument(doc)}
                    className={`w-full text-left p-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${
                      doc.id === documentId
                        ? 'bg-[#84a282] text-white font-bold'
                        : 'bg-[#fefaf3] hover:bg-[#ebf2e9] text-[#19251a]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="truncate block">{doc.title}</span>
                    </div>
                    <span className="text-[10px] shrink-0 opacity-70">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

        </section>

      </main>

      {/* MODAL 1: CREATE CLINICAL FOLDER */}
      {isFolderModalOpen && (
        <CreateFolderModal
          isOpen={isFolderModalOpen}
          onClose={() => setIsFolderModalOpen(false)}
          onCreateFolder={handleCreateNewFolder}
        />
      )}

      {/* MODAL 2: DIRECT UPLOAD PDF TO CARDS */}
      {isDirectUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141d16]/75 p-4 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-[#fefaf3] p-6 shadow-2xl border border-[#dfe8dc] text-[#19251a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#dfe8dc] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#84a282] text-white shadow-md shadow-[#84a282]/30">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#19251a]">Direct Upload to Generate Cards</h3>
                  <p className="text-xs text-[#586c5a]">Instantly synthesize PDF into flashcards & quizzes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDirectUploadOpen(false)}
                className="p-1 rounded-full text-[#586c5a] hover:bg-black/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Dropzone */}
              <input
                ref={directPdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleDirectPdfToCards(f);
                }}
              />
              <div
                onClick={() => directPdfInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#b8cfb3] bg-white p-7 text-center transition-all hover:border-[#84a282] hover:bg-[#ebf2e9]/50 cursor-pointer shadow-xs"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebf2e9] text-[#84a282] group-hover:scale-105 transition-transform mb-2">
                  <Upload size={22} />
                </div>
                <p className="text-xs font-bold text-[#19251a]">Click to select PDF or drop file here</p>
                <p className="text-[11px] text-[#586c5a] mt-0.5">Supports lecture slides, medical protocols, guidelines</p>
              </div>

              {/* Target folder */}
              <div>
                <label className="text-xs font-bold text-[#19251a] block mb-1">Target Clinical Folder</label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full rounded-xl border border-[#dfe8dc] bg-white p-2.5 text-xs text-[#19251a] outline-none"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Card count preset */}
              <div>
                <label className="text-xs font-bold text-[#19251a] block mb-1">Target Cards: {cardTargetCount}</label>
                <div className="flex items-center gap-2">
                  {[15, 25, 50, 75, 100].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCardTargetCount(c)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        cardTargetCount === c
                          ? 'bg-[#84a282] text-white border-[#84a282]'
                          : 'bg-white text-[#586c5a] border-[#dfe8dc]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
