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
import { Folder, StudyDocument, ClinicalNote, Deck, Card, CardType } from '@/types';

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
  const [activeDocNotes, setActiveDocNotes] = useState<ClinicalNote[]>([]);
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

  // 6. Add Clinical Note to Current PDF (Stored specifically for THIS document)
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !newNoteText.trim()) return;

    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
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
    setNewNoteText('');
    showToast('Clinical note saved.');
  };

  // Delete a Clinical Note from Current PDF
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
      const promptText = `${fullText}\n\nCLINICAL NOTES:\n${notesContext}`;

      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: promptText,
          cardCount: targetQuestionCount,
          title: selectedDoc.title,
          clinicalFocus: 'comprehensive',
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
      
      {/* 1. TOP CLINICAL HEADER & BREADCRUMBS */}
      <header className="sticky top-0 z-40 bg-[#fefaf3]/95 backdrop-blur-md border-b border-[#dfe8dc] px-4 sm:px-8 py-3.5 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand & Breadcrumbs */}
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
            {selectedFolder && currentView !== 'folders' && (
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

            {/* Breadcrumb 3: Active PDF */}
            {selectedDoc && currentView === 'pdf_reader' && (
              <>
                <span className="text-[#586c5a] text-xs">/</span>
                <span className="text-xs font-bold text-[#84a282] flex items-center gap-1 max-w-[220px] truncate">
                  <FileText size={13} />
                  <span className="truncate">{selectedDoc.file_name || selectedDoc.title}</span>
                </span>
              </>
            )}
          </div>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3 justify-end flex-wrap">
            <Link
              href="/study"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#dfe8dc] text-[#586c5a] hover:text-[#19251a] hover:bg-[#ebf2e9] transition shadow-xs"
            >
              <Layers size={13} className="text-[#84a282]" />
              <span>Study Decks</span>
            </Link>

            {/* + New Folder Trigger */}
            <button
              type="button"
              onClick={() => setIsFolderModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-[#dfe8dc] text-[#19251a] hover:bg-[#ebf2e9] transition shadow-xs cursor-pointer"
            >
              <FolderPlus size={14} className="text-[#84a282]" />
              <span>+ New Folder</span>
            </button>

            {/* Generate Quiz Button (Visible when inside PDF Reader) */}
            {currentView === 'pdf_reader' && (
              <button
                type="button"
                onClick={() => setIsGenerateQuizOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/25 transition cursor-pointer active:scale-95"
              >
                <Zap size={14} />
                <span>Generate Quiz</span>
              </button>
            )}
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
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-white border border-[#dfe8dc] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-extrabold text-[#19251a] tracking-tight">
                Clinical Workspace Folders
              </h1>
              <p className="text-xs text-[#586c5a] max-w-2xl leading-relaxed">
                Select a specialty folder to open and view your medical PDFs. Inside each folder, you can view the default PDF layout, add clinical notes, and generate practice quizzes.
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
                        Clinical documents & PDF files
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
                Organize by clinical specialty or rotation
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
          {/* Folder Details Banner */}
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
                  {currentFolderDocs.length} {currentFolderDocs.length === 1 ? 'PDF document' : 'PDF documents'} saved
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/25 transition cursor-pointer"
              >
                {isUploadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>{isUploadingPdf ? `Uploading (${uploadProgress}%)...` : 'Upload PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('folders')}
                className="px-4 py-2.5 rounded-full text-xs font-semibold bg-[#ebf2e9] text-[#19251a] hover:bg-[#dfe8dc] transition cursor-pointer"
              >
                All Folders
              </button>
            </div>
          </div>

          {/* Grid of PDF Documents in this folder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentFolderDocs.map((doc) => {
              const notesCount = doc.notes?.length || 0;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleOpenPdf(doc)}
                  className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white border border-[#dfe8dc] hover:border-[#84a282] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                        <FileText size={22} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fefaf3] text-[#586c5a] border border-[#dfe8dc]">
                          PDF Document
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDocument(e, doc.id)}
                          className="p-1 rounded-full text-[#586c5a] hover:text-rose-600 hover:bg-black/5 transition cursor-pointer"
                          title="Delete PDF"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#19251a] group-hover:text-[#84a282] transition-colors line-clamp-2">
                        {doc.title}
                      </h3>
                      <p className="text-[11px] text-[#586c5a] font-mono mt-0.5 truncate">
                        {doc.file_name || `${doc.title}.pdf`}
                      </p>
                    </div>

                    {notesCount > 0 && (
                      <div className="pt-1">
                        <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                          📝 {notesCount} Clinical Notes
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#dfe8dc] flex items-center justify-between text-xs font-bold text-[#84a282]">
                    <span>Open Default PDF View</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}

            {/* Upload PDF Box in this folder */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-[#b8cfb3] hover:border-[#84a282] bg-white/60 hover:bg-[#ebf2e9]/50 transition-all cursor-pointer min-h-[190px] text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ebf2e9] text-[#84a282] flex items-center justify-center mb-3">
                <Upload size={20} />
              </div>
              <h4 className="text-sm font-bold text-[#19251a]">Upload PDF to {selectedFolder.name}</h4>
              <p className="text-[11px] text-[#586c5a] mt-0.5 max-w-[200px]">
                Drop or browse clinical guidelines or lecture slides
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. SCREEN 3: NORMAL DEFAULT PDF FORMAT VIEW + CLINICAL NOTES              */}
      {/* ========================================================================= */}
      {currentView === 'pdf_reader' && selectedDoc && (
        <div className="flex-1 flex flex-col bg-[#dfe8dc]/30 relative overflow-hidden">
          
          {/* PDF Viewer Sub-Bar */}
          <div className="bg-white border-b border-[#dfe8dc] px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('folder_detail')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#ebf2e9] hover:bg-[#dfe8dc] text-[#19251a] transition cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Back to {selectedFolder?.name}</span>
              </button>

              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#84a282]" />
                <span className="text-xs sm:text-sm font-bold text-[#19251a] truncate max-w-sm">
                  {selectedDoc.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNotesSidebarOpen((o) => !o)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isNotesSidebarOpen
                    ? 'bg-[#84a282] text-white shadow-xs'
                    : 'bg-white border border-[#dfe8dc] text-[#19251a] hover:bg-[#ebf2e9]'
                }`}
              >
                <StickyNote size={14} />
                <span>Notes ({activeDocNotes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGenerateQuizOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white shadow-md shadow-[#84a282]/25 transition cursor-pointer"
              >
                <Zap size={14} />
                <span>Generate Quiz</span>
              </button>
            </div>
          </div>

          {/* MAIN PDF WORKSPACE BODY: NATIVE PDF VIEWER (DEFAULT LOOK) + NOTES */}
          <div className="flex-1 flex overflow-hidden p-3 sm:p-5 gap-4">
            
            {/* The Default Look of the PDF File (Native Browser PDF Viewer) */}
            <div className="flex-1 h-full min-h-[680px] bg-white rounded-2xl border border-[#dfe8dc] shadow-sm overflow-hidden flex flex-col">
              {activePdfBlobUrl ? (
                <iframe
                  src={`${activePdfBlobUrl}#toolbar=1`}
                  className="w-full h-full border-0 rounded-2xl"
                  title={selectedDoc.title}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#586c5a]">
                  <Loader2 size={28} className="animate-spin text-[#84a282] mb-3" />
                  <p className="text-xs font-bold">Rendering Default PDF View...</p>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: CLINICAL NOTES FOR THIS SPECIFIC PDF */}
            {isNotesSidebarOpen && (
              <aside className="w-80 lg:w-96 bg-white rounded-2xl border border-[#dfe8dc] shadow-sm p-4 flex flex-col justify-between overflow-hidden">
                <div className="flex flex-col h-full space-y-4">
                  
                  {/* Notes Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#dfe8dc]">
                    <div className="flex items-center gap-2">
                      <StickyNote size={15} className="text-[#84a282]" />
                      <h3 className="text-xs font-bold text-[#19251a] uppercase tracking-wider">
                        Document Notes ({activeDocNotes.length})
                      </h3>
                    </div>
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add a clinical pearl, dosage alert, or key NCLEX rationale for this PDF..."
                      rows={3}
                      className="w-full rounded-xl border border-[#dfe8dc] bg-[#fefaf3] p-2.5 text-xs text-[#19251a] outline-none focus:border-[#84a282] placeholder:text-[#586c5a]/60"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white transition disabled:opacity-40 cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>

                  {/* Notes List for this PDF (Never deleted when uploading other PDFs!) */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {activeDocNotes.length === 0 ? (
                      <div className="py-8 text-center text-[#586c5a]">
                        <p className="text-xs font-semibold">No notes yet for this document.</p>
                        <p className="text-[11px] mt-0.5">Your notes are saved permanently with this PDF.</p>
                      </div>
                    ) : (
                      activeDocNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-2xl border border-[#dfe8dc] bg-[#fefaf3] space-y-1 relative group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#586c5a]">
                            <span>{new Date(note.created_at).toLocaleDateString()}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="opacity-0 group-hover:opacity-100 transition text-[#586c5a] hover:text-rose-600 p-0.5 cursor-pointer"
                              title="Delete note"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="text-xs text-[#19251a] leading-relaxed font-medium">
                            {note.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Generate Quiz Action Card */}
                  <div className="p-3.5 rounded-2xl bg-[#fefaf3] border border-[#b8cfb3] space-y-2">
                    <span className="text-xs font-bold text-[#19251a] block">Ready to test your memory?</span>
                    <button
                      type="button"
                      onClick={() => setIsGenerateQuizOpen(true)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#84a282] hover:bg-[#6e8c6c] text-white transition cursor-pointer"
                    >
                      Generate Quiz from PDF
                    </button>
                  </div>

                </div>
              </aside>
            )}

          </div>

        </div>
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
