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
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  Search,
  ExternalLink,
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
import { Folder, StudyDocument, ClinicalNote, DocumentHighlight, DocumentPage, Deck, Card, CardType } from '@/types';

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
  { id: 'yellow', name: 'Clinical Finding', bg: 'bg-[#fef08a]', text: 'text-amber-950', hex: '#fef08a' },
  { id: 'green', name: 'Pharmacology / Normal Lab', bg: 'bg-[#b8cfb3]', text: 'text-[#19251a]', hex: '#b8cfb3' },
  { id: 'rose', name: 'High-Alert / Black-Box', bg: 'bg-[#f6e2e9]', text: 'text-rose-950', hex: '#f6e2e9' },
  { id: 'blue', name: 'NCLEX Priority / Rationale', bg: 'bg-[#bae6fd]', text: 'text-sky-950', hex: '#bae6fd' },
];

export default function WorkspacePage() {
  const router = useRouter();

  // Navigation State: 'folders' (Workspace Home) -> 'folder_detail' (PDF list) -> 'pdf_reader' (Normal PDF format)
  const [currentView, setCurrentView] = useState<'folders' | 'folder_detail' | 'pdf_reader'>('folders');

  // Folders & Documents State
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<StudyDocument | null>(null);

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isGenerateQuizOpen, setIsGenerateQuizOpen] = useState(false);
  const [isDirectUploadOpen, setIsDirectUploadOpen] = useState(false);

  // PDF Reader View Controls
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColor>('yellow');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [newStickyNote, setNewStickyNote] = useState<string>('');

  // Floating highlight toolbar trigger
  const [selectedText, setSelectedText] = useState<string>('');
  const [floatingToolbarPos, setFloatingToolbarPos] = useState<{ x: number; y: number } | null>(null);

  // Extraction & Quiz Generation States
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [targetCardCount, setTargetCardCount] = useState<number>(20);
  const [quizQuestionType, setQuizQuestionType] = useState<'all' | 'multiple_choice' | 'flashcard'>('all');
  const [clinicalSpecialty, setClinicalSpecialty] = useState<string>('Comprehensive Clinical');
  const [generatedCards, setGeneratedCards] = useState<GeneratedCardItem[]>([]);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderUploadInputRef = useRef<HTMLInputElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: Load Folders and Documents
  useEffect(() => {
    const loadedFolders = getLocalFolders();
    setFolders(loadedFolders);

    const loadedDocs = getLocalDocuments();
    setDocuments(loadedDocs);
  }, []);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3500);
  };

  // 2. Folder Handlers
  const handleCreateFolder = (folder: Folder) => {
    const updated = [...folders, folder];
    setFolders(updated);
    saveLocalFolders(updated);
    setSelectedFolder(folder);
    setCurrentView('folder_detail');
    showToast(`Folder "${folder.name}" created.`);
  };

  const handleOpenFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setCurrentView('folder_detail');
  };

  // Documents belonging to the currently opened folder
  const currentFolderDocs = selectedFolder
    ? documents.filter((d) => d.folder_id === selectedFolder.id)
    : [];

  // 3. Opening a PDF in Normal PDF Format
  const handleOpenPdfReader = (doc: StudyDocument) => {
    setSelectedDoc(doc);
    setCurrentPage(1);
    setCurrentView('pdf_reader');
  };

  // 4. Uploading a PDF into the current folder
  const handleUploadPdfToFolder = async (file: File) => {
    if (!selectedFolder) return;
    try {
      setIsExtractingPdf(true);
      setExtractProgress(20);

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const { text, totalPages } = await extractFullTextFromPdf(file, (p) => {
        setExtractProgress(p);
      });

      if (!text || text.trim().length < 30) {
        throw new Error('Could not extract text from this PDF.');
      }

      // Split text into pages for normal PDF page format
      const rawPageChunks = text.split(/--- Page \d+ ---/g).filter((chunk) => chunk.trim().length > 0);
      const parsedPages: DocumentPage[] = (rawPageChunks.length > 0 ? rawPageChunks : [text]).map((content, idx) => ({
        pageNumber: idx + 1,
        text: content.trim(),
      }));

      const newDoc: StudyDocument = {
        id: `doc-${Date.now()}`,
        title: cleanTitle,
        file_name: file.name,
        folder_id: selectedFolder.id,
        content: text,
        total_pages: parsedPages.length,
        pages: parsedPages,
        highlights: [],
        notes: [],
        created_at: new Date().toISOString(),
      };

      saveLocalDocument(newDoc);
      const updatedDocs = getLocalDocuments();
      setDocuments(updatedDocs);

      // Open immediately in PDF format
      setSelectedDoc(newDoc);
      setCurrentPage(1);
      setCurrentView('pdf_reader');
      showToast(`PDF "${file.name}" loaded in workspace.`);
    } catch (err: any) {
      alert(err.message || 'Error processing PDF.');
    } finally {
      setIsExtractingPdf(false);
      setExtractProgress(0);
    }
  };

  // 5. Text Selection on PDF Page Sheet -> Highlight
  const handlePageMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setFloatingToolbarPos(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 2) {
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setFloatingToolbarPos({
        x: Math.max(10, rect.left + rect.width / 2 - 80),
        y: Math.max(10, rect.top - 45),
      });
    } else {
      setFloatingToolbarPos(null);
    }
  };

  const handleApplyHighlight = (color: HighlightColor) => {
    if (!selectedDoc || !selectedText) return;

    const newHighlight: DocumentHighlight = {
      id: `hl-${Date.now()}`,
      pageNumber: currentPage,
      text: selectedText,
      color: color,
      created_at: new Date().toISOString(),
    };

    const updatedHighlights = [...(selectedDoc.highlights || []), newHighlight];
    const updatedDoc: StudyDocument = {
      ...selectedDoc,
      highlights: updatedHighlights,
      updated_at: new Date().toISOString(),
    };

    setSelectedDoc(updatedDoc);
    saveLocalDocument(updatedDoc);
    setDocuments(getLocalDocuments());
    setFloatingToolbarPos(null);
    setSelectedText('');
    showToast(`Highlight added to Page ${currentPage}.`);
  };

  // 6. Sticky Note on Current Page
  const handleAddStickyNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !newStickyNote.trim()) return;

    const note: ClinicalNote = {
      id: `note-${Date.now()}`,
      pageNumber: currentPage,
      text: newStickyNote.trim(),
      color: activeHighlightColor,
      created_at: new Date().toISOString(),
    };

    const updatedNotes = [...(selectedDoc.notes || []), note];
    const updatedDoc: StudyDocument = {
      ...selectedDoc,
      notes: updatedNotes,
      updated_at: new Date().toISOString(),
    };

    setSelectedDoc(updatedDoc);
    saveLocalDocument(updatedDoc);
    setDocuments(getLocalDocuments());
    setNewStickyNote('');
    showToast(`Clinical note pinned to Page ${currentPage}.`);
  };

  const handleDeleteStickyNote = (noteId: string) => {
    if (!selectedDoc) return;
    const updatedNotes = (selectedDoc.notes || []).filter((n) => n.id !== noteId);
    const updatedDoc: StudyDocument = { ...selectedDoc, notes: updatedNotes };
    setSelectedDoc(updatedDoc);
    saveLocalDocument(updatedDoc);
    setDocuments(getLocalDocuments());
  };

  const handleDeleteHighlight = (hlId: string) => {
    if (!selectedDoc) return;
    const updatedHighlights = (selectedDoc.highlights || []).filter((h) => h.id !== hlId);
    const updatedDoc: StudyDocument = { ...selectedDoc, highlights: updatedHighlights };
    setSelectedDoc(updatedDoc);
    saveLocalDocument(updatedDoc);
    setDocuments(getLocalDocuments());
  };

  // 7. Generate Quiz & Study Material from PDF
  const handleGenerateQuiz = async () => {
    if (!selectedDoc) return;

    setIsGeneratingQuiz(true);
    try {
      // Aggregate text from PDF pages and user highlights/notes
      const fullContent = selectedDoc.pages && selectedDoc.pages.length > 0
        ? selectedDoc.pages.map((p) => `[Page ${p.pageNumber}]\n${p.text}`).join('\n\n')
        : selectedDoc.content;

      const highlightsContext = (selectedDoc.highlights || [])
        .map((h) => `[High Priority Highlight Page ${h.pageNumber}]: ${h.text}`)
        .join('\n');

      const notesContext = (selectedDoc.notes || [])
        .map((n) => `[Clinical Note Page ${n.pageNumber}]: ${n.text}`)
        .join('\n');

      const synthesisPrompt = `${fullContent}\n\nSTUDENT HIGHLIGHTS & CLINICAL NOTES:\n${highlightsContext}\n${notesContext}`;

      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: synthesisPrompt,
          cardCount: targetCardCount,
          title: selectedDoc.title,
          clinicalFocus: 'comprehensive',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to synthesize quiz.');
      if (!data.cards || data.cards.length === 0) throw new Error('No quiz questions extracted.');

      const mapped: GeneratedCardItem[] = data.cards.map((c: any, idx: number) => ({
        id: `q-${Date.now()}-${idx}`,
        front: c.front,
        back: c.back,
        card_type: c.card_type || 'flashcard',
        distractors: Array.isArray(c.distractors) ? c.distractors : [],
        explanation: c.explanation || '',
      }));

      setGeneratedCards(mapped);

      // Auto-save generated deck into current folder
      const newDeckId = `deck-${Date.now()}`;
      const deckCards: Card[] = mapped.map((c) => ({
        id: c.id,
        deck_id: newDeckId,
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

      const newDeck: Deck = {
        id: newDeckId,
        title: `${selectedDoc.title} (Quiz & Cards)`,
        description: `Synthesized from ${selectedDoc.file_name || selectedDoc.title} (${deckCards.length} clinical questions).`,
        category: selectedFolder?.name || 'Clinical Mastery',
        folder_id: selectedFolder?.id,
        cards_count: deckCards.length,
        due_count: deckCards.length,
        created_at: new Date().toISOString(),
        cards: deckCards,
      };

      await saveUserDeck(newDeck);
      showToast(`Generated & saved ${deckCards.length} quiz cards to "${selectedFolder?.name}"!`);
    } catch (err: any) {
      alert(err.message || 'Error generating quiz material.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Render the current page content in Normal PDF Format
  const renderCurrentPdfPage = () => {
    if (!selectedDoc) return null;

    const pageCount = selectedDoc.pages?.length || selectedDoc.total_pages || 1;
    const activePageData = selectedDoc.pages?.find((p) => p.pageNumber === currentPage);
    const pageText = activePageData ? activePageData.text : selectedDoc.content;

    const pageHighlights = (selectedDoc.highlights || []).filter((h) => h.pageNumber === currentPage);
    const pageNotes = (selectedDoc.notes || []).filter((n) => n.pageNumber === currentPage);

    // Format paragraphs & apply visual highlights
    const paragraphs = pageText.split('\n');

    return (
      <div 
        ref={pageContainerRef}
        onMouseUp={handlePageMouseUp}
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        className="w-full max-w-[840px] min-h-[1100px] bg-white rounded-xl shadow-xl border border-[#dfe8dc] p-8 sm:p-14 transition-transform select-text relative text-[#19251a]"
      >
        {/* PDF Header Sheet Header */}
        <div className="flex items-center justify-between border-b border-[#dfe8dc] pb-4 mb-8 text-[11px] font-bold text-[#586c5a]">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-widest">{selectedDoc.file_name || selectedDoc.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-[#fefaf3] px-2 py-0.5 rounded border border-[#dfe8dc]">
              Page {currentPage} of {pageCount}
            </span>
          </div>
        </div>

        {/* PDF Content Area with Styled Paragraphs */}
        <div className="space-y-4 font-serif text-[15px] leading-relaxed text-[#19251a]">
          {paragraphs.map((para, idx) => {
            if (!para.trim()) return <div key={idx} className="h-3" />;

            const isTitle = para === para.toUpperCase() && para.length < 80;
            if (isTitle) {
              return (
                <h3 key={idx} className="font-sans text-base font-extrabold tracking-tight text-[#19251a] uppercase pt-2 pb-1 border-b border-[#dfe8dc]/60">
                  {para}
                </h3>
              );
            }

            // Check if this paragraph contains any of the page's highlights
            let renderedPara: React.ReactNode = para;
            for (const hl of pageHighlights) {
              if (para.includes(hl.text)) {
                const colorDef = HIGHLIGHT_COLORS.find((c) => c.id === hl.color) || HIGHLIGHT_COLORS[0];
                const parts = para.split(hl.text);
                renderedPara = (
                  <>
                    {parts[0]}
                    <mark className={`rounded px-1 py-0.5 font-sans font-semibold mx-0.5 ${colorDef.bg} ${colorDef.text} border border-black/5`}>
                      {hl.text}
                    </mark>
                    {parts.slice(1).join(hl.text)}
                  </>
                );
              }
            }

            return (
              <p key={idx} className="leading-[1.75]">
                {renderedPara}
              </p>
            );
          })}
        </div>

        {/* Pinned Sticky Notes on This Page */}
        {pageNotes.length > 0 && (
          <div className="mt-12 pt-6 border-t-2 border-dashed border-[#b8cfb3]/70 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#84a282] uppercase tracking-wider">
              <StickyNote size={14} />
              <span>Clinical Priority Notes Pinned to Page {currentPage}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pageNotes.map((note) => {
                const colorDef = HIGHLIGHT_COLORS.find((c) => c.id === note.color) || HIGHLIGHT_COLORS[0];
                return (
                  <div
                    key={note.id}
                    className={`p-3 rounded-xl border border-black/5 shadow-xs text-xs font-sans space-y-1 ${colorDef.bg} ${colorDef.text}`}
                  >
                    <div className="flex items-center justify-between font-bold text-[10px]">
                      <span>{colorDef.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteStickyNote(note.id)}
                        className="opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <p className="leading-snug">{note.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PDF Page Footer */}
        <div className="absolute bottom-6 inset-x-8 sm:inset-x-14 flex items-center justify-between text-[11px] text-[#586c5a] border-t border-[#dfe8dc] pt-3">
          <span>Clinical Study Material • ANOWLA Studio</span>
          <span className="font-bold">Page {currentPage} of {pageCount}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fefaf3] bg-grid-clinical text-[#19251a] font-sans flex flex-col">
      
      {/* 1. TOP GLOBAL NAVIGATION & BREADCRUMB HEADER */}
      <header className="sticky top-0 z-40 bg-[#fefaf3]/95 backdrop-blur-md border-b border-[#dfe8dc] px-4 sm:px-8 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand & Hierarchical Breadcrumbs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#19251a] hover:opacity-85"
            >
              <div className="w-8 h-8 rounded-xl bg-[#84a282] text-white flex items-center justify-center shadow-md shadow-[#84a282]/25">
                <Stethoscope size={16} strokeWidth={2.4} />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#19251a] hidden sm:inline">ANOWLA</span>
            </Link>

            <span className="text-[#586c5a] text-xs">/</span>

            {/* Breadcrumb 1: Workspace Folders Root */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('folders');
                setSelectedDoc(null);
              }}
              className={`text-xs font-bold transition cursor-pointer ${
                currentView === 'folders' ? 'text-[#19251a]' : 'text-[#586c5a] hover:text-[#19251a]'
              }`}
            >
              Workspace Folders
            </button>

            {/* Breadcrumb 2: Folder Detail */}
            {selectedFolder && (
              <>
                <span className="text-[#586c5a] text-xs">/</span>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('folder_detail');
                    setSelectedDoc(null);
                  }}
                  className={`text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    currentView === 'folder_detail' ? 'text-[#19251a]' : 'text-[#586c5a] hover:text-[#19251a]'
                  }`}
                >
                  <FolderIcon size={13} className="text-[#84a282]" />
                  <span>{selectedFolder.name}</span>
                </button>
              </>
            )}

            {/* Breadcrumb 3: Active PDF Reader */}
            {selectedDoc && currentView === 'pdf_reader' && (
              <>
                <span className="text-[#586c5a] text-xs">/</span>
                <span className="text-xs font-bold text-[#84a282] flex items-center gap-1 max-w-[200px] truncate">
                  <FileText size={13} />
                  <span className="truncate">{selectedDoc.file_name || selectedDoc.title}</span>
                </span>
              </>
            )}
          </div>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3 justify-end flex-wrap">
            {/* View Study Decks Link */}
            <Link
              href="/study"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#dfe8dc] text-[#586c5a] hover:text-[#19251a] hover:bg-[#ebf2e9] transition shadow-xs"
            >
              <Layers size={13} className="text-[#84a282]" />
              <span>Study Decks</span>
            </Link>

            {/* + Create Folder Button */}
            <button
              type="button"
              onClick={() => setIsFolderModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-[#dfe8dc] text-[#19251a] hover:bg-[#ebf2e9] transition shadow-xs cursor-pointer"
            >
              <FolderPlus size={14} className="text-[#84a282]" />
              <span>+ New Folder</span>
            </button>

            {/* Generate Quiz & Material Button (Prominent when in PDF Reader) */}
            {currentView === 'pdf_reader' && (
              <button
                type="button"
                onClick={() => setIsGenerateQuizOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/25 transition cursor-pointer active:scale-95 animate-pulse-glow"
              >
                <Zap size={14} className="fill-amber-300 text-amber-300" />
                <span>⚡ Generate Quiz & Cards</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* STATUS TOAST NOTIFICATION */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#19251a] text-[#fefaf3] px-4 py-2.5 rounded-2xl shadow-xl border border-[#84a282]/40 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: WORKSPACE HOME - CLINICAL FOLDERS GRID (FIRST THING DISPLAYED!)    */}
      {/* ========================================================================= */}
      {currentView === 'folders' && (
        <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-1">
          {/* Welcome Banner */}
          <div className="p-6 rounded-3xl bg-white border border-[#dfe8dc] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">📁</span>
                <h1 className="text-lg sm:text-xl font-extrabold text-[#19251a] tracking-tight">
                  Clinical Workspace Folders
                </h1>
              </div>
              <p className="text-xs text-[#586c5a] max-w-2xl leading-relaxed">
                Choose a clinical specialty folder to view, read, and mark your medical PDFs. Inside each folder you can highlight clinical findings, pin notes, and generate active recall quizzes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFolderModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/25 transition cursor-pointer"
            >
              <FolderPlus size={15} />
              <span>Create New Folder</span>
            </button>
          </div>

          {/* Folders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {folders.map((folder) => {
              const docCount = documents.filter((d) => d.folder_id === folder.id).length;
              return (
                <div
                  key={folder.id}
                  onClick={() => handleOpenFolder(folder)}
                  className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white border border-[#dfe8dc] hover:border-[#84a282] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#ebf2e9] text-[#84a282] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FolderIcon size={24} className="fill-[#84a282]/20 text-[#84a282]" />
                      </div>
                      <span className="rounded-full bg-[#fefaf3] px-2.5 py-1 text-[11px] font-bold text-[#586c5a] border border-[#dfe8dc]">
                        {docCount} {docCount === 1 ? 'PDF' : 'PDFs'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#19251a] group-hover:text-[#84a282] transition-colors">
                        {folder.name}
                      </h3>
                      <p className="text-xs text-[#586c5a] mt-0.5">
                        Clinical documents & PDF markup library
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#dfe8dc] flex items-center justify-between text-xs font-bold text-[#84a282]">
                    <span>Open Folder</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}

            {/* "+ Create New Folder" Action Card */}
            <div
              onClick={() => setIsFolderModalOpen(true)}
              className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-[#b8cfb3] hover:border-[#84a282] bg-white/60 hover:bg-[#ebf2e9]/50 transition-all cursor-pointer min-h-[190px] text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ebf2e9] text-[#84a282] flex items-center justify-center mb-3">
                <Plus size={22} />
              </div>
              <h4 className="text-sm font-bold text-[#19251a]">Create New Folder</h4>
              <p className="text-[11px] text-[#586c5a] mt-0.5 max-w-[180px]">
                Organize by clinical rotation, pharmacology, or NCLEX prep
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: INSIDE A FOLDER - ALL PDFS DISPLAYED WITH UPLOAD DROPZONE         */}
      {/* ========================================================================= */}
      {currentView === 'folder_detail' && selectedFolder && (
        <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-1">
          {/* Folder Header */}
          <div className="p-6 rounded-3xl bg-white border border-[#dfe8dc] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#84a282] text-white flex items-center justify-center shadow-md shadow-[#84a282]/25">
                <FolderIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-[#19251a]">
                    {selectedFolder.name}
                  </h1>
                  <span className="rounded-full bg-[#ebf2e9] px-2.5 py-0.5 text-[10px] font-bold text-[#84a282]">
                    Folder
                  </span>
                </div>
                <p className="text-xs text-[#586c5a] mt-0.5">
                  {currentFolderDocs.length} {currentFolderDocs.length === 1 ? 'PDF document' : 'PDF documents'} saved in this folder
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                ref={folderUploadInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadPdfToFolder(f);
                }}
              />
              <button
                type="button"
                onClick={() => folderUploadInputRef.current?.click()}
                disabled={isExtractingPdf}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/25 transition cursor-pointer"
              >
                {isExtractingPdf ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>{isExtractingPdf ? `Loading PDF (${extractProgress}%)...` : 'Upload New PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('folders')}
                className="px-3.5 py-2.5 rounded-full text-xs font-semibold bg-[#ebf2e9] text-[#19251a] hover:bg-[#dfe8dc] transition cursor-pointer"
              >
                All Folders
              </button>
            </div>
          </div>

          {/* PDF Documents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentFolderDocs.map((doc) => {
              const pagesCount = doc.pages?.length || doc.total_pages || 1;
              const highlightsCount = doc.highlights?.length || 0;
              const notesCount = doc.notes?.length || 0;

              return (
                <div
                  key={doc.id}
                  onClick={() => handleOpenPdfReader(doc)}
                  className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white border border-[#dfe8dc] hover:border-[#84a282] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                        <FileText size={22} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fefaf3] text-[#586c5a] border border-[#dfe8dc]">
                        {pagesCount} {pagesCount === 1 ? 'Page' : 'Pages'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#19251a] group-hover:text-[#84a282] transition-colors line-clamp-2">
                        {doc.title}
                      </h3>
                      <p className="text-[11px] text-[#586c5a] font-mono mt-0.5 truncate">
                        {doc.file_name || `${doc.title}.pdf`}
                      </p>
                    </div>

                    {/* Highlights & Notes Badges */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {highlightsCount > 0 && (
                        <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                          🖍️ {highlightsCount} Highlights
                        </span>
                      )}
                      {notesCount > 0 && (
                        <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                          📌 {notesCount} Notes
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#dfe8dc] flex items-center justify-between text-xs font-bold text-[#84a282]">
                    <span>Open & Read Normal PDF</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}

            {/* Upload PDF Box in this folder */}
            <div
              onClick={() => folderUploadInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-[#b8cfb3] hover:border-[#84a282] bg-white/60 hover:bg-[#ebf2e9]/50 transition-all cursor-pointer min-h-[190px] text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ebf2e9] text-[#84a282] flex items-center justify-center mb-3">
                <Upload size={20} />
              </div>
              <h4 className="text-sm font-bold text-[#19251a]">Upload New PDF to {selectedFolder.name}</h4>
              <p className="text-[11px] text-[#586c5a] mt-0.5 max-w-[200px]">
                Drop any medical lecture slides or clinical PDF here
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: NORMAL PDF FORMAT VIEW - REAL PDF SHEET, HIGHLIGHT, EDIT & NOTES  */}
      {/* ========================================================================= */}
      {currentView === 'pdf_reader' && selectedDoc && (
        <div className="flex-1 flex flex-col bg-[#e9eee6] relative">
          
          {/* PDF CONTROL & HIGHLIGHT TOOLBAR */}
          <div className="sticky top-[57px] z-30 bg-white border-b border-[#dfe8dc] px-4 py-2.5 shadow-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
              
              {/* Left: Page Navigator */}
              <div className="flex items-center gap-1.5 bg-[#fefaf3] border border-[#dfe8dc] rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 rounded hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-[#19251a] px-2 whitespace-nowrap">
                  Page {currentPage} of {selectedDoc.pages?.length || selectedDoc.total_pages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(selectedDoc.pages?.length || 1, p + 1))}
                  disabled={currentPage >= (selectedDoc.pages?.length || 1)}
                  className="p-1 rounded hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Center: Highlighter Color Palette */}
              <div className="flex items-center gap-1.5 bg-[#fefaf3] p-1 rounded-xl border border-[#dfe8dc]">
                <span className="text-[10px] font-bold text-[#586c5a] uppercase px-1.5 flex items-center gap-1">
                  <Highlighter size={12} />
                  <span>Highlight:</span>
                </span>
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveHighlightColor(c.id);
                      if (selectedText) handleApplyHighlight(c.id);
                    }}
                    className={`h-6 w-6 rounded-lg transition-transform cursor-pointer border flex items-center justify-center ${
                      activeHighlightColor === c.id ? 'scale-110 border-[#19251a] shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`Highlight in ${c.name}`}
                  >
                    {activeHighlightColor === c.id && <Check size={11} className="text-[#19251a]" />}
                  </button>
                ))}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-[#fefaf3] border border-[#dfe8dc] rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                  className="p-1 hover:bg-black/5 rounded cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-bold text-[#19251a] px-1">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  className="p-1 hover:bg-black/5 rounded cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Right: Generate Quiz Trigger & Sidebar Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateQuizOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/25 transition cursor-pointer"
                >
                  <Zap size={13} className="fill-amber-300 text-amber-300" />
                  <span>Generate Quiz</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((o) => !o)}
                  className="p-2 rounded-xl border border-[#dfe8dc] bg-white text-[#586c5a] hover:text-[#19251a] cursor-pointer"
                  title="Toggle Notes & Highlights Sidebar"
                >
                  <StickyNote size={14} />
                </button>
              </div>

            </div>
          </div>

          {/* FLOATING HIGHLIGHT PILL WHEN USER SELECTS TEXT */}
          {floatingToolbarPos && selectedText && (
            <div
              style={{ top: floatingToolbarPos.y, left: floatingToolbarPos.x }}
              className="fixed z-50 bg-[#19251a] text-white rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-2 animate-pop-in"
            >
              <span className="text-[10px] font-bold uppercase text-[#b8cfb3]">Highlight:</span>
              <div className="flex items-center gap-1">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleApplyHighlight(c.id)}
                    className="h-5 w-5 rounded-full cursor-pointer hover:scale-125 transition-transform"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* PDF READER CANVAS & SIDEBAR */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* CENTER: SCROLLABLE NORMAL PDF SHEET CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-10 flex flex-col items-center">
              {renderCurrentPdfPage()}
            </div>

            {/* RIGHT SIDEBAR: STICKY NOTES & HIGHLIGHTS INDEX */}
            {isSidebarOpen && (
              <aside className="w-80 border-l border-[#dfe8dc] bg-white p-5 overflow-y-auto space-y-5 hidden md:block">
                
                {/* PDF Details Header */}
                <div className="pb-3 border-b border-[#dfe8dc]">
                  <h3 className="text-sm font-bold text-[#19251a] line-clamp-1">{selectedDoc.title}</h3>
                  <p className="text-[11px] text-[#586c5a]">
                    Folder: <span className="text-[#84a282] font-bold">{selectedFolder?.name}</span>
                  </p>
                </div>

                {/* Add Sticky Note Pinned to this Page */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#19251a]">
                    <StickyNote size={14} className="text-[#84a282]" />
                    <span>Pin Note to Page {currentPage}</span>
                  </div>
                  <form onSubmit={handleAddStickyNote} className="space-y-2">
                    <textarea
                      value={newStickyNote}
                      onChange={(e) => setNewStickyNote(e.target.value)}
                      placeholder="e.g. NCLEX alert: check potassium prior to giving this dose..."
                      rows={3}
                      className="w-full rounded-xl border border-[#dfe8dc] bg-[#fefaf3] p-2.5 text-xs text-[#19251a] outline-none focus:border-[#84a282]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {HIGHLIGHT_COLORS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setActiveHighlightColor(c.id)}
                            className={`h-4 w-4 rounded-full ${activeHighlightColor === c.id ? 'scale-125 ring-1 ring-black' : ''}`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                      <button
                        type="submit"
                        disabled={!newStickyNote.trim()}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-[#84a282] text-white hover:bg-[#6e8c6c] disabled:opacity-40 cursor-pointer"
                      >
                        Pin Note
                      </button>
                    </div>
                  </form>
                </div>

                {/* Highlights Index on this Document */}
                <div className="space-y-2.5 pt-2 border-t border-[#dfe8dc]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#19251a]">
                    <span>Highlights ({selectedDoc.highlights?.length || 0})</span>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {(selectedDoc.highlights || []).length === 0 ? (
                      <p className="text-[11px] text-[#586c5a] italic text-center py-2">
                        Select text on the PDF sheet to highlight concepts.
                      </p>
                    ) : (
                      selectedDoc.highlights?.map((hl) => {
                        const colorDef = HIGHLIGHT_COLORS.find((c) => c.id === hl.color) || HIGHLIGHT_COLORS[0];
                        return (
                          <div
                            key={hl.id}
                            className={`p-2.5 rounded-xl border border-black/5 text-xs font-medium space-y-1 ${colorDef.bg} ${colorDef.text}`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span>Page {hl.pageNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteHighlight(hl.id)}
                                className="opacity-60 hover:opacity-100 cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                            <p className="line-clamp-2 leading-snug">{hl.text}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Generate Quiz Card in Sidebar */}
                <div className="p-4 rounded-2xl bg-[#fefaf3] border border-[#b8cfb3] space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-[#84a282]" />
                    <span className="text-xs font-bold text-[#19251a]">Ready to Test Yourself?</span>
                  </div>
                  <p className="text-[11px] text-[#586c5a] leading-relaxed">
                    Convert this PDF and your highlights into NCLEX flashcards and multiple-choice questions.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsGenerateQuizOpen(true)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition cursor-pointer"
                  >
                    Generate Quiz & Material
                  </button>
                </div>

              </aside>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GENERATE QUIZ & STUDY MATERIAL FROM PDF                            */}
      {/* ========================================================================= */}
      {isGenerateQuizOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141d16]/75 p-4 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-[#fefaf3] p-6 shadow-2xl border border-[#dfe8dc] text-[#19251a]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#dfe8dc] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#84a282] text-white flex items-center justify-center shadow-md shadow-[#84a282]/30">
                  <Zap size={18} className="fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#19251a]">Generate Quiz & Study Material</h3>
                  <p className="text-xs text-[#586c5a]">Synthesize {selectedDoc.title} into test questions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateQuizOpen(false)}
                className="p-1 rounded-full text-[#586c5a] hover:bg-black/5 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Generator Settings Form */}
            <div className="mt-5 space-y-4">
              
              {/* Question Count Target */}
              <div>
                <label className="text-xs font-bold text-[#19251a] uppercase tracking-wider block mb-1.5">
                  Number of Questions: {targetCardCount}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setTargetCardCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        targetCardCount === cnt
                          ? 'bg-[#84a282] text-white border-[#84a282]'
                          : 'bg-white text-[#586c5a] border-[#dfe8dc] hover:bg-[#ebf2e9]'
                      }`}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Material Type */}
              <div>
                <label className="text-xs font-bold text-[#19251a] uppercase tracking-wider block mb-1.5">
                  Material Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuizQuestionType('all')}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                      quizQuestionType === 'all'
                        ? 'bg-[#84a282] text-white border-[#84a282]'
                        : 'bg-white text-[#19251a] border-[#dfe8dc] hover:bg-[#ebf2e9]'
                    }`}
                  >
                    <span className="block text-xs font-bold">Quiz + Flashcards</span>
                    <span className={`text-[10px] block mt-0.5 ${quizQuestionType === 'all' ? 'text-white/80' : 'text-[#586c5a]'}`}>
                      Multiple-choice + recall cards
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizQuestionType('multiple_choice')}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                      quizQuestionType === 'multiple_choice'
                        ? 'bg-[#84a282] text-white border-[#84a282]'
                        : 'bg-white text-[#19251a] border-[#dfe8dc] hover:bg-[#ebf2e9]'
                    }`}
                  >
                    <span className="block text-xs font-bold">NCLEX Exam Quiz Only</span>
                    <span className={`text-[10px] block mt-0.5 ${quizQuestionType === 'multiple_choice' ? 'text-white/80' : 'text-[#586c5a]'}`}>
                      Clinical scenarios with 4 options
                    </span>
                  </button>
                </div>
              </div>

              {/* Destination Folder */}
              <div className="p-3 rounded-xl bg-white border border-[#dfe8dc] flex items-center justify-between text-xs">
                <span className="text-[#586c5a]">Target Study Folder:</span>
                <span className="font-bold text-[#84a282]">{selectedFolder?.name}</span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="w-full py-3.5 rounded-2xl bg-[#84a282] hover:bg-[#6e8c6c] text-white font-bold text-xs shadow-md shadow-[#84a282]/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Synthesizing Clinical Concepts...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      <span>Generate & Save to {selectedFolder?.name}</span>
                    </>
                  )}
                </button>
              </div>

              {/* If cards already generated */}
              {generatedCards.length > 0 && (
                <div className="pt-2 border-t border-[#dfe8dc] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#19251a]">
                    {generatedCards.length} Cards Generated!
                  </span>
                  <Link
                    href="/study"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#19251a] text-white hover:bg-black transition cursor-pointer"
                  >
                    <Play size={12} className="fill-current" />
                    <span>Start Study Session Now</span>
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CLINICAL FOLDER */}
      {isFolderModalOpen && (
        <CreateFolderModal
          isOpen={isFolderModalOpen}
          onClose={() => setIsFolderModalOpen(false)}
          onCreateFolder={handleCreateFolder}
        />
      )}

    </div>
  );
}
