'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  FolderPlus, 
  Folder as FolderIcon, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Layers, 
  Play, 
  StickyNote, 
  ChevronRight, 
  ArrowLeft, 
  BookOpen, 
  Loader2, 
  Download, 
  X,
  CheckCircle2,
  Zap,
  ChevronLeft,
  FileDown
} from 'lucide-react';
import CreateFolderModal from '@/components/CreateFolderModal';
import PdfMarkupViewer from '@/components/PdfMarkupViewer';
import { extractFullTextFromPdf } from '@/lib/pdfExtractor';
import { storePdfBlob, getPdfBlob, deletePdfBlob } from '@/lib/pdfStorage';
import { createValidPdfBlob } from '@/lib/samplePdfGenerator';
import { 
  getLocalFolders, 
  saveLocalFolders, 
  getLocalDocuments, 
  saveLocalDocument, 
  deleteLocalDocument,
  saveUserDeck,
  getLocalDecks 
} from '@/lib/deckService';
import { Folder, StudyDocument, StudyNote, Deck, Card, CardType } from '@/types';

interface GeneratedCardItem {
  id: string;
  front: string;
  back: string;
  card_type: CardType;
  distractors?: string[];
  explanation?: string;
}

export default function WorkspacePage() {
  const router = useRouter();

  // Navigation State: 'folders' -> 'folder_detail' -> 'pdf_reader'
  const [currentView, setCurrentView] = useState<'folders' | 'folder_detail' | 'pdf_reader'>('folders');

  // Folders & Documents State
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<StudyDocument | null>(null);

  // PDF Viewer Blob URL
  const [activePdfBlobUrl, setActivePdfBlobUrl] = useState<string | null>(null);

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isGenerateQuizOpen, setIsGenerateQuizOpen] = useState(false);

  // Active Document Notes
  const [activeDocNotes, setActiveDocNotes] = useState<StudyNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(true);

  // Extraction & Quiz Generation States
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(20);
  const [quizFormat, setQuizFormat] = useState<'all' | 'multiple_choice'>('all');
  const [generatedCards, setGeneratedCards] = useState<GeneratedCardItem[]>([]);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load: Load Folders & Documents from Local Storage
  useEffect(() => {
    const loadedFolders = getLocalFolders();
    setFolders(loadedFolders);

    const loadedDocs = getLocalDocuments();
    setDocuments(loadedDocs);
  }, []);

  // Cleanup Blob URL when document changes
  useEffect(() => {
    return () => {
      if (activePdfBlobUrl) {
        URL.revokeObjectURL(activePdfBlobUrl);
      }
    };
  }, [activePdfBlobUrl]);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3000);
  };

  // 2. Folder Navigation
  const handleOpenFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setCurrentView('folder_detail');
  };

  const handleCreateFolder = (folder: Folder) => {
    const updated = [...folders, folder];
    setFolders(updated);
    saveLocalFolders(updated);
    setSelectedFolder(folder);
    setCurrentView('folder_detail');
    showToast(`Folder "${folder.name}" created.`);
  };

  // Documents inside the currently opened folder
  const currentFolderDocs = selectedFolder
    ? documents.filter((d) => d.folder_id === selectedFolder.id)
    : [];

  // 3. Opening a PDF in Normal PDF Format
  const handleOpenPdf = async (doc: StudyDocument) => {
    setSelectedDoc(doc);
    setActiveDocNotes(doc.notes || []);

    try {
      // 1. Check if the PDF binary file exists in IndexedDB
      let blob = await getPdfBlob(doc.id);

      // 2. If not in IndexedDB (e.g. preloaded sample protocol), generate an authentic PDF blob
      if (!blob) {
        const pagesText = doc.pages && doc.pages.length > 0
          ? doc.pages.map((p) => p.text)
          : [doc.content || doc.title];

        blob = createValidPdfBlob(doc.title, pagesText);
        await storePdfBlob(doc.id, blob);
      }

      // 3. Create Blob URL for browser's native PDF viewer
      if (activePdfBlobUrl) {
        URL.revokeObjectURL(activePdfBlobUrl);
      }
      const url = URL.createObjectURL(blob);
      setActivePdfBlobUrl(url);

      setCurrentView('pdf_reader');
    } catch (err) {
      console.error('Error opening PDF viewer:', err);
      setCurrentView('pdf_reader');
    }
  };

  // 4. Uploading a New PDF File (Preserves ALL Previous Documents & Notes)
  const handleUploadPdf = async (file: File) => {
    if (!selectedFolder) return;

    try {
      setIsUploadingPdf(true);
      setUploadProgress(20);

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      // Extract text content for quiz synthesis
      const { text, totalPages } = await extractFullTextFromPdf(file, (p) => {
        setUploadProgress(p);
      });

      const newDocId = `doc-${Date.now()}`;

      // Store the authentic PDF file in IndexedDB
      await storePdfBlob(newDocId, file);

      // Create new document record with its OWN notes array
      const newDoc: StudyDocument = {
        id: newDocId,
        title: cleanTitle,
        file_name: file.name,
        folder_id: selectedFolder.id,
        content: text,
        total_pages: totalPages || 1,
        notes: [], // Independent notes list, previous documents remain untouched
        created_at: new Date().toISOString(),
      };

      // Save document metadata
      saveLocalDocument(newDoc);
      const updatedDocs = getLocalDocuments();
      setDocuments(updatedDocs);

      // Open immediately in native PDF viewer
      setSelectedDoc(newDoc);
      setActiveDocNotes([]);

      if (activePdfBlobUrl) {
        URL.revokeObjectURL(activePdfBlobUrl);
      }
      const url = URL.createObjectURL(file);
      setActivePdfBlobUrl(url);

      setCurrentView('pdf_reader');
      showToast(`Uploaded "${file.name}" to ${selectedFolder.name}.`);
    } catch (err: any) {
      alert(err.message || 'Error processing uploaded PDF.');
    } finally {
      setIsUploadingPdf(false);
      setUploadProgress(0);
    }
  };

  // 5. Delete a PDF Document
  const handleDeleteDocument = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (confirm('Delete this PDF from the folder?')) {
      deleteLocalDocument(docId);
      await deletePdfBlob(docId);
      setDocuments(getLocalDocuments());
      showToast('Document deleted.');
    }
  };

  // 6. Save PDF Markups & Drawings
  const handleSaveMarkups = (updatedMarkups: Record<number, string>) => {
    if (!selectedDoc) return;
    const updatedDoc: StudyDocument = {
      ...selectedDoc,
      markups: updatedMarkups,
      updated_at: new Date().toISOString(),
    };
    setSelectedDoc(updatedDoc);
    saveLocalDocument(updatedDoc);
    setDocuments(getLocalDocuments());
  };

  // Add Note to Current PDF
  const handleAddNoteDirect = (noteText: string) => {
    if (!selectedDoc || !noteText.trim()) return;

    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      text: noteText.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...(selectedDoc.notes || [])];
    const updatedDoc: StudyDocument = {
      ...selectedDoc,
      notes: updatedNotes,
      updated_at: new Date().toISOString(),
    };

    setSelectedDoc(updatedDoc);
    setActiveDocNotes(updatedNotes);
    saveLocalDocument(updatedDoc);
    setDocuments(getLocalDocuments());
    showToast('Note saved.');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    handleAddNoteDirect(newNoteText);
    setNewNoteText('');
  };

  // Delete a Note from Current PDF
  const handleDeleteNote = (noteId: string) => {
    if (!selectedDoc) return;
    const updatedNotes = (selectedDoc.notes || []).filter((n) => n.id !== noteId);
    const updatedDoc: StudyDocument = {
      ...selectedDoc,
      notes: updatedNotes,
    };
    setSelectedDoc(updatedDoc);
    setActiveDocNotes(updatedNotes);
    saveLocalDocument(updatedDoc);
    setDocuments(getLocalDocuments());
  };

  // 7. Generate Quiz & Material from Current PDF
  const handleGenerateQuiz = async () => {
    if (!selectedDoc) return;

    setIsGeneratingQuiz(true);
    try {
      const fullText = selectedDoc.content || selectedDoc.title;
      const notesContext = (selectedDoc.notes || []).map((n) => n.text).join('\n');
      const promptText = `${fullText}\n\nSTUDY NOTES:\n${notesContext}`;

      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: promptText,
          cardCount: targetQuestionCount,
          title: selectedDoc.title,
          focus: 'comprehensive',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz.');
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

      // Save generated deck directly into current folder
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
        title: `${selectedDoc.title} (Practice Quiz)`,
        description: `Generated from ${selectedDoc.file_name || selectedDoc.title} (${deckCards.length} questions).`,
        category: selectedFolder?.name || 'Clinical Practice',
        folder_id: selectedFolder?.id,
        cards_count: deckCards.length,
        due_count: deckCards.length,
        created_at: new Date().toISOString(),
        cards: deckCards,
      };

      await saveUserDeck(newDeck);
      showToast(`Generated & saved ${deckCards.length} questions to "${selectedFolder?.name}".`);
    } catch (err: any) {
      alert(err.message || 'Error generating quiz.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fefaf3] bg-grid-clinical text-[#19251a] font-sans flex flex-col">
      
      {/* 1. CLEAN TOP STUDY NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#fefaf3]/90 backdrop-blur-md border-b border-[#dfe8dc] px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[#19251a] hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-[#84a282] text-white flex items-center justify-center shadow-xs">
              <BookOpen size={16} strokeWidth={2.4} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#19251a] leading-none">ANOWLA</span>
              <span className="text-[10px] font-semibold text-[#84a282] uppercase tracking-wider mt-0.5">Study Studio</span>
            </div>
          </Link>

          {/* Central Workspace Switcher */}
          <nav className="flex items-center p-1 rounded-xl bg-[#ebf2e9] border border-[#dfe8dc]/60">
            <span className="px-3.5 py-1 rounded-lg text-xs font-bold bg-white text-[#19251a] shadow-xs">
              Workspace
            </span>
            <Link
              href="/study"
              className="px-3.5 py-1 rounded-lg text-xs font-semibold text-[#586c5a] hover:text-[#19251a] transition"
            >
              Decks & Study
            </Link>
          </nav>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2">
            {currentView === 'pdf_reader' && (
              <button
                type="button"
                onClick={() => setIsGenerateQuizOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Zap size={13} />
                <span>Generate Quiz</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFolderModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#dfe8dc] text-[#19251a] hover:bg-[#ebf2e9] transition shadow-xs cursor-pointer"
            >
              <FolderPlus size={14} className="text-[#84a282]" />
              <span className="hidden sm:inline">New Folder</span>
            </button>
          </div>
        </div>
      </header>

      {/* STATUS TOAST */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#19251a] text-[#fefaf3] px-4 py-2.5 rounded-2xl shadow-xl border border-[#84a282]/40 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SCREEN 1: FOLDERS ARE DISPLAYED FIRST                                  */}
      {/* ========================================================================= */}
      {currentView === 'folders' && (
        <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-1">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#dfe8dc]">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#19251a]">
                Study Document Folders
              </h1>
              <p className="text-xs text-[#586c5a] mt-0.5">
                Organize lecture PDFs, syllabus slides, and study notes by course or subject.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFolderModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-xs transition cursor-pointer"
            >
              <FolderPlus size={14} />
              <span>Create Folder</span>
            </button>
          </div>

          {/* Folders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => {
              const docCount = documents.filter((d) => d.folder_id === folder.id).length;
              return (
                <div
                  key={folder.id}
                  onClick={() => handleOpenFolder(folder)}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#dfe8dc] hover:border-[#84a282] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#ebf2e9] text-[#84a282] flex items-center justify-center">
                        <FolderIcon size={20} className="fill-[#84a282]/20 text-[#84a282]" />
                      </div>
                      <span className="rounded-full bg-[#fefaf3] px-2 py-0.5 text-[11px] font-semibold text-[#586c5a] border border-[#dfe8dc]">
                        {docCount} {docCount === 1 ? 'PDF' : 'PDFs'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#19251a] group-hover:text-[#84a282] transition-colors">
                        {folder.name}
                      </h3>
                      <p className="text-xs text-[#586c5a] mt-0.5">
                        Clinical documents & PDF files
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#dfe8dc] flex items-center justify-between text-xs font-semibold text-[#84a282]">
                    <span>Open Folder</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}

            {/* "+ Create New Folder" Action Card */}
            <div
              onClick={() => setIsFolderModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-[#b8cfb3] hover:border-[#84a282] bg-white/40 hover:bg-[#ebf2e9]/40 transition-all cursor-pointer min-h-[160px] text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ebf2e9] text-[#84a282] flex items-center justify-center mb-2.5">
                <Plus size={18} />
              </div>
              <h4 className="text-xs font-bold text-[#19251a]">Create New Folder</h4>
              <p className="text-[11px] text-[#586c5a] mt-0.5">
                Add specialty or rotation
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. SCREEN 2: ALL OF THE PDFS IN THE SELECTED FOLDER                       */}
      {/* ========================================================================= */}
      {currentView === 'folder_detail' && selectedFolder && (
        <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-1">
          {/* Folder Details Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#dfe8dc]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('folders')}
                className="p-2 rounded-xl bg-white border border-[#dfe8dc] text-[#586c5a] hover:text-[#19251a] hover:bg-[#ebf2e9] transition cursor-pointer"
                title="Back to All Folders"
              >
                <ChevronLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-[#19251a]">
                    {selectedFolder.name}
                  </h1>
                  <span className="rounded-full bg-[#ebf2e9] px-2.5 py-0.5 text-[11px] font-semibold text-[#84a282]">
                    {currentFolderDocs.length} {currentFolderDocs.length === 1 ? 'PDF' : 'PDFs'}
                  </span>
                </div>
                <p className="text-xs text-[#586c5a] mt-0.5">
                  Study documents and lecture slides saved in this folder.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadPdf(f);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isUploadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>{isUploadingPdf ? `Uploading (${uploadProgress}%)...` : 'Upload PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('folders')}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#dfe8dc] text-[#586c5a] hover:text-[#19251a] hover:bg-[#ebf2e9] transition cursor-pointer"
              >
                All Folders
              </button>
            </div>
          </div>

          {/* Grid of PDF Documents in this folder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFolderDocs.map((doc) => {
              const notesCount = doc.notes?.length || 0;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleOpenPdf(doc)}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#dfe8dc] hover:border-[#84a282] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#fefaf3] text-[#586c5a] border border-[#dfe8dc]">
                          PDF
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDocument(e, doc.id)}
                          className="p-1 rounded-lg text-[#586c5a] hover:text-rose-600 hover:bg-black/5 transition cursor-pointer"
                          title="Delete PDF"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#19251a] group-hover:text-[#84a282] transition-colors line-clamp-1 leading-snug">
                        {doc.title}
                      </h3>
                      <p className="text-[11px] text-[#586c5a] font-mono mt-0.5 truncate">
                        {doc.file_name || `${doc.title}.pdf`}
                      </p>
                    </div>

                    {notesCount > 0 && (
                      <div className="pt-0.5">
                        <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 text-[10px] font-semibold">
                          📝 {notesCount} {notesCount === 1 ? 'note' : 'notes'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#dfe8dc] flex items-center justify-between text-xs font-semibold text-[#84a282]">
                    <span>Open PDF View</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}

            {/* Upload PDF Box in this folder */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-[#b8cfb3] hover:border-[#84a282] bg-white/40 hover:bg-[#ebf2e9]/40 transition-all cursor-pointer min-h-[160px] text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ebf2e9] text-[#84a282] flex items-center justify-center mb-2.5">
                <Upload size={18} />
              </div>
              <h4 className="text-xs font-bold text-[#19251a]">Upload PDF to {selectedFolder.name}</h4>
              <p className="text-[11px] text-[#586c5a] mt-0.5">
                Drop or browse study materials and lecture slides
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. SCREEN 3: AUTHENTIC PDF MARKUP & ANNOTATION VIEWER (REFERENCE SPEC)    */}
      {/* ========================================================================= */}
      {currentView === 'pdf_reader' && selectedDoc && (
        <PdfMarkupViewer
          document={selectedDoc}
          pdfBlobUrl={activePdfBlobUrl}
          onBack={() => setCurrentView('folder_detail')}
          onSaveMarkups={handleSaveMarkups}
          onGenerateQuiz={() => setIsGenerateQuizOpen(true)}
          notes={activeDocNotes}
          onAddNote={handleAddNoteDirect}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: GENERATE PRACTICE QUIZ FROM PDF                                 */}
      {/* ========================================================================= */}
      {isGenerateQuizOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141d16]/75 p-4 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-[#fefaf3] p-6 shadow-2xl border border-[#dfe8dc] text-[#19251a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#dfe8dc] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#84a282] text-white flex items-center justify-center shadow-md shadow-[#84a282]/30">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#19251a]">Generate Practice Quiz</h3>
                  <p className="text-xs text-[#586c5a]">Synthesize questions from {selectedDoc.title}</p>
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

            <div className="mt-5 space-y-4">
              {/* Question Count Target */}
              <div>
                <label className="text-xs font-bold text-[#19251a] uppercase tracking-wider block mb-1.5">
                  Question Quantity: {targetQuestionCount}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setTargetQuestionCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        targetQuestionCount === cnt
                          ? 'bg-[#84a282] text-white border-[#84a282]'
                          : 'bg-white text-[#586c5a] border-[#dfe8dc] hover:bg-[#ebf2e9]'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Format */}
              <div>
                <label className="text-xs font-bold text-[#19251a] uppercase tracking-wider block mb-1.5">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuizFormat('all')}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                      quizFormat === 'all'
                        ? 'bg-[#84a282] text-white border-[#84a282]'
                        : 'bg-white text-[#19251a] border-[#dfe8dc] hover:bg-[#ebf2e9]'
                    }`}
                  >
                    <span className="block text-xs font-bold">Quiz + Flashcards</span>
                    <span className={`text-[10px] block mt-0.5 ${quizFormat === 'all' ? 'text-white/80' : 'text-[#586c5a]'}`}>
                      Multiple-choice and recall cards
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizFormat('multiple_choice')}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                      quizFormat === 'multiple_choice'
                        ? 'bg-[#84a282] text-white border-[#84a282]'
                        : 'bg-white text-[#19251a] border-[#dfe8dc] hover:bg-[#ebf2e9]'
                    }`}
                  >
                    <span className="block text-xs font-bold">Multiple-Choice Only</span>
                    <span className={`text-[10px] block mt-0.5 ${quizFormat === 'multiple_choice' ? 'text-white/80' : 'text-[#586c5a]'}`}>
                      Clinical scenarios with 4 choices
                    </span>
                  </button>
                </div>
              </div>

              {/* Destination Folder */}
              <div className="p-3 rounded-xl bg-white border border-[#dfe8dc] flex items-center justify-between text-xs">
                <span className="text-[#586c5a]">Saving into folder:</span>
                <span className="font-bold text-[#84a282]">{selectedFolder?.name}</span>
              </div>

              {/* Submit */}
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
                      <span>Generating Practice Questions...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      <span>Generate Quiz & Save to {selectedFolder?.name}</span>
                    </>
                  )}
                </button>
              </div>

              {/* When questions are generated */}
              {generatedCards.length > 0 && (
                <div className="pt-2 border-t border-[#dfe8dc] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#19251a]">
                    {generatedCards.length} Questions Saved!
                  </span>
                  <Link
                    href="/study"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#19251a] text-white hover:bg-black transition cursor-pointer"
                  >
                    <Play size={12} className="fill-current" />
                    <span>Start Practice Session</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: CREATE CLINICAL FOLDER */}
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
