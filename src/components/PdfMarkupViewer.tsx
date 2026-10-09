'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pen, 
  Highlighter, 
  Eraser, 
  RotateCcw, 
  Trash2, 
  Save, 
  ZoomIn, 
  ZoomOut, 
  StickyNote, 
  Zap, 
  Sparkles,
  FileText,
  X,
  Plus,
  Check,
  Download
} from 'lucide-react';
import { StudyDocument, StudyNote } from '@/types';

interface PdfMarkupViewerProps {
  document: StudyDocument;
  pdfBlobUrl?: string | null;
  onBack: () => void;
  onSaveMarkups?: (markups: Record<number, string>) => void;
  onGenerateQuiz?: () => void;
  onGenerateDeck?: () => void;
  notes: StudyNote[];
  onAddNote: (text: string) => void;
  onDeleteNote: (noteId: string) => void;
}

type ToolMode = 'pen' | 'highlighter' | 'eraser';

interface StrokeSize {
  id: number;
  label: string;
  penWidth: number;
  highlightWidth: number;
  eraserWidth: number;
  svgWidth: number;
}

const STROKE_SIZES: StrokeSize[] = [
  { id: 1, label: 'Extra Fine', penWidth: 1.5, highlightWidth: 12, eraserWidth: 12, svgWidth: 1.5 },
  { id: 2, label: 'Fine', penWidth: 3, highlightWidth: 18, eraserWidth: 18, svgWidth: 2.5 },
  { id: 3, label: 'Medium', penWidth: 5, highlightWidth: 26, eraserWidth: 26, svgWidth: 4 },
  { id: 4, label: 'Bold', penWidth: 8, highlightWidth: 36, eraserWidth: 36, svgWidth: 6 },
  { id: 5, label: 'Heavy', penWidth: 12, highlightWidth: 48, eraserWidth: 48, svgWidth: 9 },
];

// The exact 4x5 color palette from the reference screenshot
const COLOR_PALETTE: string[][] = [
  // Row 1: Monochrome & Neutrals
  ['#000000', '#52525b', '#9ca3af', '#e4e4e7', '#ffffff'],
  // Row 2: Soft Pastels
  ['#f87171', '#fde047', '#86efac', '#93c5fd', '#fed7aa'],
  // Row 3: Vibrant Primaries
  ['#dc2626', '#f59e0b', '#16a34a', '#2563eb', '#d97706'],
  // Row 4: Deep Earth & Jewel Tones
  ['#991b1b', '#b45309', '#15803d', '#1e40af', '#78350f'],
];

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function PdfMarkupViewer({
  document,
  pdfBlobUrl,
  onBack,
  onSaveMarkups,
  onGenerateQuiz,
  onGenerateDeck,
  notes,
  onAddNote,
  onDeleteNote,
}: PdfMarkupViewerProps) {
  // Page & Viewport State
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, document.total_pages || document.pages?.length || 1);
  const [zoom, setZoom] = useState(1.0);

  // Tool State (Defaults matching reference screenshot)
  const [toolMode, setToolMode] = useState<ToolMode>('pen');
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(2); // Medium (index 2)
  const [selectedColor, setSelectedColor] = useState('#000000'); // Black default

  // Drawings storage: pageNumber -> dataURL
  const [markups, setMarkups] = useState<Record<number, string>>(document.markups || {});
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Side panels & UI status
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [newNoteInput, setNewNoteInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Canvases
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // PDF.js instance holder
  const pdfJsDocRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const currentSize = STROKE_SIZES[selectedSizeIndex] || STROKE_SIZES[2];

  // 1. Load PDF document via pdfjs-dist if blob URL exists
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!pdfBlobUrl) return;

      try {
        const pdfjs = await import('pdfjs-dist');
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }

        const res = await fetch(pdfBlobUrl);
        const arrayBuffer = await res.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;

        if (!isCancelled) {
          pdfJsDocRef.current = pdf;
          renderPage(currentPage);
        }
      } catch (err) {
        console.warn('PDF.js rendering fallback to high-fidelity document layout:', err);
        renderFallbackPage(currentPage);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfBlobUrl]);

  // 2. Render Page (Either PDF.js or High-Fidelity Canvas Layout)
  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfJsDocRef.current;
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    if (pdf && pageNum <= pdf.numPages) {
      try {
        const page = await pdf.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1.0 });
        
        // Target width ~800px scaled by zoom
        const targetScale = (800 / baseViewport.width) * zoom;
        const viewport = page.getViewport({ scale: targetScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
        }

        syncDrawingCanvas(viewport.width, viewport.height, pageNum);
        return;
      } catch (e) {
        console.error('Error rendering page with PDF.js:', e);
      }
    }

    renderFallbackPage(pageNum);
  }, [zoom]);

  // 3. Fallback High-Fidelity Canvas Layout (For preloaded or custom study material)
  const renderFallbackPage = useCallback((pageNum: number) => {
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    const baseWidth = 800 * zoom;
    const baseHeight = 1050 * zoom;
    canvas.width = baseWidth;
    canvas.height = baseHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp white sheet with realistic margin
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    // Subtle header rule
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40 * zoom, 70 * zoom);
    ctx.lineTo(baseWidth - 40 * zoom, 70 * zoom);
    ctx.stroke();

    // Document header text
    ctx.fillStyle = '#1e293b';
    ctx.font = `bold ${Math.round(18 * zoom)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(document.title, 40 * zoom, 50 * zoom);

    ctx.fillStyle = '#64748b';
    ctx.font = `${Math.round(11 * zoom)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(`Page ${pageNum} of ${totalPages} — Academic Learning Material`, 40 * zoom, 95 * zoom);

    // Page text body
    const pageData = document.pages?.find((p) => p.pageNumber === pageNum);
    const bodyText = pageData?.text || document.content || 'No text content available on this page.';
    const lines = bodyText.split('\n');

    let y = 135 * zoom;
    const lineHeight = 22 * zoom;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        y += 12 * zoom;
        return;
      }

      // Check if heading or bullet
      if (trimmed.startsWith('#') || trimmed.toUpperCase() === trimmed && trimmed.length > 5) {
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.round(14 * zoom)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        y += 8 * zoom;
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        ctx.fillStyle = '#1e293b';
        ctx.font = `${Math.round(12 * zoom)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      } else {
        ctx.fillStyle = '#334155';
        ctx.font = `${Math.round(12 * zoom)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      }

      // Word wrapping
      const words = trimmed.split(' ');
      let currentLine = '';
      const maxWidth = baseWidth - 80 * zoom;

      words.forEach((w) => {
        const testLine = currentLine ? currentLine + ' ' + w : w;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          if (y < baseHeight - 50 * zoom) {
            ctx.fillText(currentLine, 45 * zoom, y);
            y += lineHeight;
          }
          currentLine = w;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine && y < baseHeight - 50 * zoom) {
        ctx.fillText(currentLine, 45 * zoom, y);
        y += lineHeight;
      }
    });

    // Page footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = `${Math.round(10 * zoom)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(`ANOWLA Academic Study Studio — Page ${pageNum}`, 40 * zoom, baseHeight - 25 * zoom);

    syncDrawingCanvas(baseWidth, baseHeight, pageNum);
  }, [document, zoom, totalPages]);

  // 4. Sync Drawing Canvas Size & Restore Existing Markups
  const syncDrawingCanvas = (width: number, height: number, pageNum: number) => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;

    drawCanvas.width = width;
    drawCanvas.height = height;

    const ctx = drawCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // If there are existing saved markups for this page, draw them
    const existing = markups[pageNum];
    if (existing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = existing;
    }

    setStrokeHistory([]);
  };

  // Re-render when page or zoom changes
  useEffect(() => {
    renderPage(currentPage);
  }, [currentPage, zoom, renderPage]);

  // 5. Drawing Pointer Handlers
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const coords = getCoordinates(e);
    setLastPoint(coords);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save state for undo
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev.slice(-15), snapshot]);

    ctx.beginPath();
    applyToolStyle(ctx);
    ctx.moveTo(coords.x, coords.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coords = getCoordinates(e);

    if (toolMode === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, currentSize.eraserWidth, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }

    setLastPoint(coords);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPoint(null);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    // Save page drawing data URL
    const dataUrl = canvas.toDataURL('image/png');
    setMarkups((prev) => {
      const updated = { ...prev, [currentPage]: dataUrl };
      if (onSaveMarkups) onSaveMarkups(updated);
      return updated;
    });
  };

  const applyToolStyle = (ctx: CanvasRenderingContext2D) => {
    if (toolMode === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = currentSize.penWidth * zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (toolMode === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = hexToRgba(selectedColor, 0.35);
      ctx.lineWidth = currentSize.highlightWidth * zoom;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
    }
  };

  // 6. Undo, Clear & Save Markups
  const handleUndo = () => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || strokeHistory.length === 0) return;

    const previousState = strokeHistory[strokeHistory.length - 1];
    setStrokeHistory((prev) => prev.slice(0, -1));

    ctx.putImageData(previousState, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setMarkups((prev) => {
      const updated = { ...prev, [currentPage]: dataUrl };
      if (onSaveMarkups) onSaveMarkups(updated);
      return updated;
    });
  };

  const handleClearPage = () => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeHistory([]);

    setMarkups((prev) => {
      const updated = { ...prev };
      delete updated[currentPage];
      if (onSaveMarkups) onSaveMarkups(updated);
      return updated;
    });

    showToast('Page markups cleared.');
  };

  const handleSaveAll = () => {
    if (onSaveMarkups) {
      onSaveMarkups(markups);
    }
    showToast('All annotations saved.');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    onAddNote(newNoteInput.trim());
    setNewNoteInput('');
    showToast('Note added.');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#1c1d1f] text-gray-100 overflow-hidden select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP CONTROL BAR                                                        */}
      {/* ========================================================================= */}
      <header className="h-13 bg-[#18191b] border-b border-[#2e3035] px-4 flex items-center justify-between shrink-0 z-30">
        
        {/* Left: Back & Document Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#26282d] hover:bg-[#32343a] text-gray-200 transition cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-md bg-rose-950/60 text-rose-400 border border-rose-800/40 flex items-center justify-center shrink-0">
              <FileText size={13} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-200 truncate max-w-xs sm:max-w-md">
              {document.title}
            </span>
          </div>
        </div>

        {/* Center: Page Navigation & Zoom */}
        <div className="flex items-center gap-3">
          {/* Page Controls */}
          <div className="flex items-center bg-[#24262b] rounded-lg border border-[#32343a] px-1 py-0.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-medium text-gray-300 min-w-[70px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden md:flex items-center bg-[#24262b] rounded-lg border border-[#32343a] px-1 py-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
              className="p-1 rounded text-gray-400 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="px-2 text-xs font-mono text-gray-300 min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
              className="p-1 rounded text-gray-400 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        {/* Right: Actions, Notes Drawer & Quiz Generation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokeHistory.length === 0}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#26282d] disabled:opacity-30 transition cursor-pointer"
            title="Undo stroke"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={handleClearPage}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-[#26282d] transition cursor-pointer"
            title="Clear current page markups"
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#26282d] hover:bg-[#32343a] text-gray-200 transition cursor-pointer"
            title="Save annotations"
          >
            <Save size={14} />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Notes Toggle */}
          <button
            type="button"
            onClick={() => setIsNotesOpen((o) => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isNotesOpen
                ? 'bg-blue-600 text-white'
                : 'bg-[#26282d] hover:bg-[#32343a] text-gray-200'
            }`}
          >
            <StickyNote size={14} />
            <span className="hidden sm:inline">Notes</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
              {notes.length}
            </span>
          </button>

          {/* Generate Study Deck / Quiz */}
          <button
            type="button"
            onClick={onGenerateQuiz}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 transition cursor-pointer"
          >
            <Zap size={14} />
            <span className="hidden sm:inline">Generate Quiz</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE VIEWPORT                                                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Document Canvas Scrollable Area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto p-6 sm:p-10 flex justify-center items-start bg-[#1c1d1f]"
        >
          {/* Centered Document Paper Container */}
          <div 
            className="relative bg-white rounded-sm shadow-2xl overflow-hidden border border-black/30"
            style={{
              cursor: toolMode === 'eraser' ? 'crosshair' : 'crosshair',
            }}
          >
            {/* Background PDF Content Canvas */}
            <canvas ref={pdfCanvasRef} className="block" />

            {/* Interactive Drawing Canvas Overlay */}
            <canvas
              ref={drawCanvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="absolute inset-0 z-10 touch-none"
            />
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. RIGHT FLOATING TOOLBAR DOCK (MATCHING THE SCREENSHOT EXACTLY)       */}
        {/* ===================================================================== */}
        <aside className="w-56 sm:w-60 bg-[#1f2023] border-l border-[#2e3035] flex flex-col justify-between shrink-0 p-4 space-y-6 overflow-y-auto">
          
          <div className="space-y-6">
            {/* Tool Mode Selectors: Pen, Highlighter, Eraser */}
            <div className="flex items-center justify-around pb-3 border-b border-[#2e3035]">
              {/* Pen Tool */}
              <button
                type="button"
                onClick={() => setToolMode('pen')}
                className={`p-2.5 rounded-full transition cursor-pointer ${
                  toolMode === 'pen'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
                title="Pen (Draw)"
              >
                <Pen size={18} />
              </button>

              {/* Highlighter Tool */}
              <button
                type="button"
                onClick={() => setToolMode('highlighter')}
                className={`p-2.5 rounded-full transition cursor-pointer ${
                  toolMode === 'highlighter'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
                title="Highlighter"
              >
                <Highlighter size={18} />
              </button>

              {/* Eraser Tool */}
              <button
                type="button"
                onClick={() => setToolMode('eraser')}
                className={`p-2.5 rounded-full transition cursor-pointer ${
                  toolMode === 'eraser'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
                title="Eraser"
              >
                <Eraser size={18} />
              </button>
            </div>

            {/* Stroke Size Section */}
            <div className="space-y-2.5">
              <span className="text-xs text-gray-400 font-medium tracking-wide block">
                Size
              </span>

              {/* 5 Stroke Thickness Line Icons */}
              <div className="flex items-center justify-between px-1">
                {STROKE_SIZES.map((size, idx) => {
                  const isSelected = selectedSizeIndex === idx;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600/25 ring-2 ring-blue-500' 
                          : 'hover:bg-white/5'
                      }`}
                      title={`${size.label} (${size.penWidth}px)`}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" className="overflow-visible">
                        <line
                          x1="5"
                          y1="19"
                          x2="19"
                          y2="5"
                          stroke={isSelected ? '#60a5fa' : '#9ca3af'}
                          strokeWidth={size.svgWidth}
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Swatch Grid (4 rows x 5 columns) */}
            <div className="space-y-2.5">
              <span className="text-xs text-gray-400 font-medium tracking-wide block">
                Color
              </span>

              <div className="grid grid-cols-5 gap-2.5">
                {COLOR_PALETTE.map((row, rowIdx) =>
                  row.map((hex) => {
                    const isSelected = selectedColor.toLowerCase() === hex.toLowerCase();
                    return (
                      <button
                        key={`${rowIdx}-${hex}`}
                        type="button"
                        onClick={() => {
                          setSelectedColor(hex);
                          if (toolMode === 'eraser') setToolMode('pen');
                        }}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                          isSelected
                            ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#1f2023]'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: hex,
                          border: hex === '#ffffff' ? '1px solid #4b5563' : 'none',
                        }}
                        title={hex}
                      >
                        {isSelected && (
                          <span 
                            className={`w-1.5 h-1.5 rounded-full ${
                              hex === '#ffffff' || hex === '#fde047' || hex === '#fed7aa' || hex === '#e4e4e7'
                                ? 'bg-black' 
                                : 'bg-white'
                            }`} 
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Quick Clear & Save Section at Bottom of Toolbar */}
          <div className="pt-4 border-t border-[#2e3035] space-y-2">
            <button
              type="button"
              onClick={handleClearPage}
              className="w-full py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Clear Page Marks</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full py-2 rounded-lg text-xs font-bold text-gray-200 bg-[#2b2d32] hover:bg-[#34363c] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save size={13} />
              <span>Save Annotations</span>
            </button>
          </div>

        </aside>

        {/* ===================================================================== */}
        {/* 4. SLIDE-OUT STUDY NOTES DRAWER                                        */}
        {/* ===================================================================== */}
        {isNotesOpen && (
          <aside className="w-80 sm:w-96 bg-[#18191b] border-l border-[#2e3035] flex flex-col justify-between shrink-0 z-20 shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-[#2e3035] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote size={15} className="text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  Document Notes ({notes.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Note Input */}
            <form onSubmit={handleAddNoteSubmit} className="p-4 border-b border-[#2e3035] space-y-2">
              <textarea
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                placeholder="Write a study note, key definition, or recall hook for this document..."
                rows={3}
                className="w-full rounded-xl border border-[#32343a] bg-[#222429] p-3 text-xs text-gray-100 placeholder:text-gray-500 outline-none focus:border-blue-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteInput.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-40 cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notes.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  <p className="font-semibold">No notes yet for this PDF.</p>
                  <p className="text-[11px] mt-1 text-gray-600">Your notes are saved permanently with this document.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl border border-[#2e3035] bg-[#222429] space-y-1.5 relative group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-rose-400 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed font-normal">
                      {note.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer Quiz Action */}
            <div className="p-4 border-t border-[#2e3035]">
              <button
                type="button"
                onClick={onGenerateQuiz}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-950/40"
              >
                <Zap size={14} />
                <span>Generate Quiz from Notes & PDF</span>
              </button>
            </div>
          </aside>
        )}

      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#18191b] border border-[#3b3d45] text-xs font-semibold text-gray-100 shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
