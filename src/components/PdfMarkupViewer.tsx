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
  FileText, 
  X, 
  Check,
  Minus 
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
  { id: 1, label: 'Fine', penWidth: 2, highlightWidth: 16, eraserWidth: 14, svgWidth: 1.5 },
  { id: 2, label: 'Medium-Fine', penWidth: 3.5, highlightWidth: 22, eraserWidth: 20, svgWidth: 2.5 },
  { id: 3, label: 'Medium', penWidth: 5, highlightWidth: 30, eraserWidth: 28, svgWidth: 4 },
  { id: 4, label: 'Bold', penWidth: 8, highlightWidth: 40, eraserWidth: 38, svgWidth: 6 },
  { id: 5, label: 'Heavy', penWidth: 12, highlightWidth: 52, eraserWidth: 50, svgWidth: 9 },
];

// Color palette from reference screenshot (optimized for both pen ink and vibrant translucent highlighting)
const COLOR_PALETTE: string[][] = [
  ['#000000', '#52525b', '#9ca3af', '#e4e4e7', '#ffffff'],
  ['#f87171', '#fde047', '#86efac', '#93c5fd', '#fed7aa'],
  ['#dc2626', '#f59e0b', '#16a34a', '#2563eb', '#d97706'],
  ['#991b1b', '#b45309', '#15803d', '#1e40af', '#78350f'],
];

export default function PdfMarkupViewer({
  document,
  pdfBlobUrl,
  onBack,
  onSaveMarkups,
  onGenerateQuiz,
  notes,
  onAddNote,
  onDeleteNote,
}: PdfMarkupViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, document.total_pages || document.pages?.length || 1);
  const [zoom, setZoom] = useState(1.0);

  // Tools
  const [toolMode, setToolMode] = useState<ToolMode>('pen');
  const [straightLineMode, setStraightLineMode] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(2);
  const [selectedColor, setSelectedColor] = useState('#000000');

  // Markups stored per page in state and in ref (to avoid unnecessary effect loops)
  const [markups, setMarkups] = useState<Record<number, string>>(document.markups || {});
  const markupsRef = useRef<Record<number, string>>(document.markups || {});
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentSnapshotRef = useRef<ImageData | null>(null);

  // Drawer & status
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [newNoteInput, setNewNoteInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Canvases
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfJsDocRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const currentSize = STROKE_SIZES[selectedSizeIndex] || STROKE_SIZES[2];

  // 1. Load PDF document
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
        renderFallbackPage(currentPage);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfBlobUrl]);

  // 2. Render Page
  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfJsDocRef.current;
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    if (pdf && pageNum <= pdf.numPages) {
      try {
        const page = await pdf.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1.0 });
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
        console.error('PDF.js render error:', e);
      }
    }

    renderFallbackPage(pageNum);
  }, [zoom]);

  // 3. Fallback High-Fidelity Canvas
  const renderFallbackPage = useCallback((pageNum: number) => {
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    const baseWidth = 800 * zoom;
    const baseHeight = 1050 * zoom;
    canvas.width = baseWidth;
    canvas.height = baseHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clean paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    // Subtle header line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40 * zoom, 70 * zoom);
    ctx.lineTo(baseWidth - 40 * zoom, 70 * zoom);
    ctx.stroke();

    // Document header
    ctx.fillStyle = '#010736';
    ctx.font = `bold ${Math.round(18 * zoom)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(document.title, 40 * zoom, 50 * zoom);

    ctx.fillStyle = '#6b7280';
    ctx.font = `${Math.round(11 * zoom)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`Page ${pageNum} of ${totalPages}`, 40 * zoom, 95 * zoom);

    // Document content
    const pageData = document.pages?.find((p) => p.pageNumber === pageNum);
    const bodyText = pageData?.text || document.content || '';
    const lines = bodyText.split('\n');

    let y = 135 * zoom;
    const lineHeight = 22 * zoom;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        y += 12 * zoom;
        return;
      }

      if (trimmed.startsWith('#') || (trimmed.toUpperCase() === trimmed && trimmed.length > 5)) {
        ctx.fillStyle = '#010736';
        ctx.font = `bold ${Math.round(14 * zoom)}px system-ui, -apple-system, sans-serif`;
        y += 8 * zoom;
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        ctx.fillStyle = '#0d1c42';
        ctx.font = `${Math.round(12 * zoom)}px system-ui, -apple-system, sans-serif`;
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.font = `${Math.round(12 * zoom)}px system-ui, -apple-system, sans-serif`;
      }

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
    ctx.fillStyle = '#9ca3af';
    ctx.font = `${Math.round(10 * zoom)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`ANOWLA — Page ${pageNum}`, 40 * zoom, baseHeight - 25 * zoom);

    syncDrawingCanvas(baseWidth, baseHeight, pageNum);
  }, [document.title, document.pages, document.content, zoom, totalPages]);

  // 4. Synchronize Drawing Canvas & Restore Page Markups
  const syncDrawingCanvas = (width: number, height: number, pageNum: number) => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;

    drawCanvas.width = width;
    drawCanvas.height = height;

    const ctx = drawCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const existing = markupsRef.current[pageNum];
    if (existing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = existing;
    }

    setStrokeHistory([]);
  };

  useEffect(() => {
    renderPage(currentPage);
  }, [currentPage, zoom, renderPage]);

  // 5. Drawing Handlers
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
    startPointRef.current = coords;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Snapshot for undo and live straight-line ruler preview
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    currentSnapshotRef.current = snapshot;
    setStrokeHistory((prev) => [...prev.slice(-15), snapshot]);
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
      setLastPoint(coords);
    } else if (straightLineMode || e.shiftKey) {
      // Live straight line / horizontal ruler preview
      if (currentSnapshotRef.current) {
        ctx.putImageData(currentSnapshotRef.current, 0, 0);
      }
      const startX = startPointRef.current?.x ?? lastPoint.x;
      const startY = startPointRef.current?.y ?? lastPoint.y;

      ctx.beginPath();
      applyToolStyle(ctx);
      ctx.moveTo(startX, startY);
      // Clean horizontal ruler highlight snap
      ctx.lineTo(coords.x, startY);
      ctx.stroke();
    } else {
      // Freehand drawing: segment-by-segment stroke for smooth, authentic ink
      ctx.beginPath();
      applyToolStyle(ctx);
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setLastPoint(coords);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPoint(null);
    startPointRef.current = null;
    currentSnapshotRef.current = null;

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    // Store in ref immediately without triggering parent state loops
    markupsRef.current[currentPage] = dataUrl;
    setMarkups((prev) => ({ ...prev, [currentPage]: dataUrl }));

    // Inform parent safely without causing re-render loop
    if (onSaveMarkups) {
      onSaveMarkups(markupsRef.current);
    }
  };

  /**
   * Highlighting Magic:
   * By combining mix-blend-mode: multiply on the overlay canvas with solid pigments,
   * text underneath remains 100% black and crisp, exactly like an authentic PDF highlighter!
   */
  const applyToolStyle = (ctx: CanvasRenderingContext2D) => {
    if (toolMode === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = currentSize.penWidth * zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (toolMode === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      const highlightColor = selectedColor === '#000000' ? '#fde047' : selectedColor;
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = currentSize.highlightWidth * zoom;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
    }
  };

  // 6. Undo, Clear & Save
  const handleUndo = () => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || strokeHistory.length === 0) return;

    const previousState = strokeHistory[strokeHistory.length - 1];
    setStrokeHistory((prev) => prev.slice(0, -1));

    ctx.putImageData(previousState, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    markupsRef.current[currentPage] = dataUrl;
    setMarkups((prev) => ({ ...prev, [currentPage]: dataUrl }));

    if (onSaveMarkups) {
      onSaveMarkups(markupsRef.current);
    }
  };

  const handleClearPage = () => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeHistory([]);

    delete markupsRef.current[currentPage];
    setMarkups((prev) => {
      const updated = { ...prev };
      delete updated[currentPage];
      return updated;
    });

    if (onSaveMarkups) {
      onSaveMarkups(markupsRef.current);
    }

    showToast('Page cleared');
  };

  const handleManualSave = () => {
    if (onSaveMarkups) {
      onSaveMarkups(markupsRef.current);
    }
    showToast('Markups saved');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    onAddNote(newNoteInput.trim());
    setNewNoteInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#010736] text-[#fcf1d0] overflow-hidden select-none font-sans">
      
      {/* 1. TOP BAR */}
      <header className="h-13 bg-[#0d1c42] border-b border-[#22396f] px-4 flex items-center justify-between shrink-0 z-30">
        
        {/* Left: Back & Document Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22396f] hover:bg-[#2d4a8e] text-[#fcf1d0] transition cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-md bg-[#22396f] text-[#fcf1d0] flex items-center justify-center shrink-0">
              <FileText size={13} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#fcf1d0] truncate max-w-xs sm:max-w-md">
              {document.title}
            </span>
          </div>
        </div>

        {/* Center: Page Navigation & Zoom */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#010736] rounded-lg border border-[#22396f] px-1 py-0.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded text-[#fcf1d0]/70 hover:text-[#fcf1d0] disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-medium text-[#fcf1d0] min-w-[70px] text-center font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded text-[#fcf1d0]/70 hover:text-[#fcf1d0] disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="hidden md:flex items-center bg-[#010736] rounded-lg border border-[#22396f] px-1 py-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
              className="p-1 rounded text-[#fcf1d0]/70 hover:text-[#fcf1d0] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="px-2 text-xs font-mono text-[#fcf1d0] min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
              className="p-1 rounded text-[#fcf1d0]/70 hover:text-[#fcf1d0] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokeHistory.length === 0}
            className="p-1.5 rounded-lg text-[#fcf1d0]/70 hover:text-[#fcf1d0] hover:bg-[#22396f] disabled:opacity-30 transition cursor-pointer"
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={handleClearPage}
            className="p-1.5 rounded-lg text-[#fcf1d0]/70 hover:text-rose-400 hover:bg-[#22396f] transition cursor-pointer"
            title="Clear marks"
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={handleManualSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22396f] hover:bg-[#2d4a8e] text-[#fcf1d0] transition cursor-pointer"
          >
            <Save size={14} />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNotesOpen((o) => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isNotesOpen
                ? 'bg-[#fcf1d0] text-[#010736]'
                : 'bg-[#22396f] hover:bg-[#2d4a8e] text-[#fcf1d0]'
            }`}
          >
            <StickyNote size={14} />
            <span className="hidden sm:inline">Notes</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
              {notes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={onGenerateQuiz}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#fcf1d0] hover:bg-white text-[#010736] shadow-sm transition cursor-pointer"
          >
            <Zap size={14} />
            <span className="hidden sm:inline">Generate Quiz</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* PDF Canvas Viewport */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto p-6 sm:p-10 flex justify-center items-start bg-[#010736]"
        >
          {/* Centered Document Paper */}
          <div 
            className="relative bg-white shadow-2xl overflow-hidden border border-[#0d1c42]"
            style={{
              cursor: toolMode === 'eraser' ? 'crosshair' : 'crosshair',
            }}
          >
            {/* Background PDF Content Canvas */}
            <canvas ref={pdfCanvasRef} className="block" />

            {/* Interactive Drawing Canvas Overlay with Native Multiply Blending for Highlighting */}
            <canvas
              ref={drawCanvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="absolute inset-0 z-10 touch-none"
              style={{
                mixBlendMode: 'multiply',
              }}
            />
          </div>
        </div>

        {/* 3. RIGHT FLOATING TOOLBAR DOCK */}
        <aside className="w-56 sm:w-60 bg-[#0d1c42] border-l border-[#22396f] flex flex-col justify-between shrink-0 p-4 space-y-6 overflow-y-auto">
          
          <div className="space-y-6">
            {/* Tool Mode Selectors: Pen, Highlighter, Eraser */}
            <div className="flex items-center justify-around pb-3 border-b border-[#22396f]">
              <button
                type="button"
                onClick={() => setToolMode('pen')}
                className={`p-2.5 rounded-full transition cursor-pointer ${
                  toolMode === 'pen'
                    ? 'bg-[#22396f] text-[#fcf1d0] ring-2 ring-[#fcf1d0] shadow-md'
                    : 'text-[#fcf1d0]/60 hover:text-[#fcf1d0] hover:bg-white/5'
                }`}
                title="Pen"
              >
                <Pen size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setToolMode('highlighter');
                  if (selectedColor === '#000000') setSelectedColor('#fde047');
                }}
                className={`p-2.5 rounded-full transition cursor-pointer ${
                  toolMode === 'highlighter'
                    ? 'bg-[#22396f] text-[#fcf1d0] ring-2 ring-[#fcf1d0] shadow-md'
                    : 'text-[#fcf1d0]/60 hover:text-[#fcf1d0] hover:bg-white/5'
                }`}
                title="Highlighter (Hold Shift for straight line)"
              >
                <Highlighter size={18} />
              </button>

              <button
                type="button"
                onClick={() => setToolMode('eraser')}
                className={`p-2.5 rounded-full transition cursor-pointer ${
                  toolMode === 'eraser'
                    ? 'bg-[#22396f] text-[#fcf1d0] ring-2 ring-[#fcf1d0] shadow-md'
                    : 'text-[#fcf1d0]/60 hover:text-[#fcf1d0] hover:bg-white/5'
                }`}
                title="Eraser"
              >
                <Eraser size={18} />
              </button>
            </div>

            {/* Straight Line Snap Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setStraightLineMode(!straightLineMode)}
                className={`w-full py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-between text-xs font-semibold ${
                  straightLineMode
                    ? 'bg-[#22396f] text-[#fcf1d0] ring-1 ring-[#fcf1d0] shadow-xs'
                    : 'text-[#fcf1d0]/70 hover:text-[#fcf1d0] bg-white/5 hover:bg-white/10'
                }`}
                title="Snap straight line (or hold Shift during drawing)"
              >
                <div className="flex items-center gap-2">
                  <Minus size={15} className="stroke-[3]" />
                  <span>Ruler Snap</span>
                </div>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  straightLineMode ? 'bg-[#fcf1d0] text-[#010736]' : 'bg-white/10 text-[#fcf1d0]/60'
                }`}>
                  {straightLineMode ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Stroke Size Section */}
            <div className="space-y-2.5">
              <span className="text-xs text-[#fcf1d0]/80 font-medium tracking-wide block">
                Size
              </span>

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
                          ? 'bg-[#22396f] ring-2 ring-[#fcf1d0]' 
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
                          stroke={isSelected ? '#fcf1d0' : '#8da4d0'}
                          strokeWidth={size.svgWidth}
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Swatches Grid (4 rows x 5 columns) */}
            <div className="space-y-2.5">
              <span className="text-xs text-[#fcf1d0]/80 font-medium tracking-wide block">
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
                            ? 'scale-110 ring-2 ring-[#fcf1d0] ring-offset-2 ring-offset-[#0d1c42]'
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
                                ? 'bg-[#010736]' 
                                : 'bg-[#fcf1d0]'
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

          {/* Quick Actions */}
          <div className="pt-4 border-t border-[#22396f] space-y-2">
            <button
              type="button"
              onClick={handleClearPage}
              className="w-full py-2 rounded-lg text-xs font-semibold text-[#fcf1d0]/70 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Clear Page</span>
            </button>
            <button
              type="button"
              onClick={handleManualSave}
              className="w-full py-2 rounded-lg text-xs font-bold text-[#010736] bg-[#fcf1d0] hover:bg-white transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save size={13} />
              <span>Save Markups</span>
            </button>
          </div>

        </aside>

        {/* 4. STUDY NOTES DRAWER */}
        {isNotesOpen && (
          <aside className="w-80 sm:w-96 bg-[#0d1c42] border-l border-[#22396f] flex flex-col justify-between shrink-0 z-20 shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-[#22396f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote size={15} className="text-[#fcf1d0]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#fcf1d0]">
                  Notes ({notes.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="p-1 rounded-md text-[#fcf1d0]/70 hover:text-[#fcf1d0] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Note Input */}
            <form onSubmit={handleAddNoteSubmit} className="p-4 border-b border-[#22396f] space-y-2">
              <textarea
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                placeholder="Add document note..."
                rows={3}
                className="w-full rounded-xl border border-[#22396f] bg-[#010736] p-3 text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 outline-none focus:border-[#fcf1d0]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteInput.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#fcf1d0] hover:bg-white text-[#010736] transition disabled:opacity-40 cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notes.length === 0 ? (
                <div className="py-12 text-center text-[#fcf1d0]/50 text-xs">
                  <p>No notes recorded.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl border border-[#22396f] bg-[#010736] space-y-1.5 relative group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#fcf1d0]/60">
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 transition text-[#fcf1d0]/60 hover:text-rose-400 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-[#fcf1d0] leading-relaxed font-normal">
                      {note.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer Quiz Action */}
            <div className="p-4 border-t border-[#22396f]">
              <button
                type="button"
                onClick={onGenerateQuiz}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#fcf1d0] hover:bg-white text-[#010736] transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Zap size={14} />
                <span>Generate Quiz</span>
              </button>
            </div>
          </aside>
        )}

      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#0d1c42] border border-[#22396f] text-xs font-semibold text-[#fcf1d0] shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-[#fcf1d0]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
