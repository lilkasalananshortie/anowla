/**
 * Client-Side PDF Highlight & Annotation Extractor
 * Uses Mozilla's pdfjs-dist to parse annotations, highlights, sticky notes, and key text.
 */

export interface ExtractedItem {
  id: string;
  type: 'highlight' | 'sticky_note' | 'key_definition';
  pageNumber: number;
  text: string;
  userComment?: string;
  suggestedCard?: {
    front: string;
    back: string;
    type: 'flashcard' | 'fill_blank';
  };
}

export interface PdfScanResult {
  fileName: string;
  totalPages: number;
  items: ExtractedItem[];
}

/**
 * Ensures PDF.js worker is properly configured in browser
 */
async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

/**
 * Helper to determine if a point (x, y) is inside a rect [minX, minY, maxX, maxY]
 */
function isPointInRect(x: number, y: number, rect: number[]): boolean {
  const [rx1, ry1, rx2, ry2] = rect;
  const minX = Math.min(rx1, rx2);
  const maxX = Math.max(rx1, rx2);
  const minY = Math.min(ry1, ry2);
  const maxY = Math.max(ry1, ry2);

  // Allow a small padding for baseline font variance
  return x >= minX - 4 && x <= maxX + 4 && y >= minY - 4 && y <= maxY + 4;
}

/**
 * Automatically creates a suggested question/answer or fill-in-the-blank card from text
 */
function generateCardFromText(text: string, comment?: string): {
  front: string;
  back: string;
  type: 'flashcard' | 'fill_blank';
} {
  const clean = text.trim();

  // If student attached a sticky note/comment (e.g. "Exam question: What is TCP?")
  if (comment && comment.trim().length > 3) {
    return {
      front: comment.trim(),
      back: clean,
      type: 'flashcard',
    };
  }

  // Check for "Term - Definition" or "Term : Definition"
  const colonMatch = clean.match(/^([A-Za-z0-9\s]{3,35})\s*[:–—\-]\s*(.+)$/i);
  if (colonMatch) {
    return {
      front: `What is ${colonMatch[1].trim()}?`,
      back: colonMatch[2].trim(),
      type: 'flashcard',
    };
  }

  // Check for "X is defined as Y" or "X refers to Y"
  const definitionMatch = clean.match(/^(.+?)\s+(is defined as|refers to|is the process of|consists of)\s+(.+)$/i);
  if (definitionMatch) {
    const term = definitionMatch[1].trim();
    const explanation = `${definitionMatch[2]} ${definitionMatch[3]}`.trim();
    return {
      front: `What is ${term}?`,
      back: explanation,
      type: 'flashcard',
    };
  }

  // Cloze deletion / Fill-in-the-blank: Blank out the first capitalized or prominent noun
  const words = clean.split(' ');
  if (words.length >= 5) {
    // Pick the longest word or first capitalized keyword (ignoring common stopwords)
    const stopWords = new Set(['The', 'This', 'That', 'These', 'Those', 'When', 'Where', 'Which', 'What', 'There']);
    const candidate = words.find(w => w.length > 5 && !stopWords.has(w)) || words[0];
    
    if (candidate) {
      const regex = new RegExp(`\\b${candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return {
        front: clean.replace(regex, '________'),
        back: candidate.replace(/[^a-zA-Z0-9]/g, ''),
        type: 'fill_blank',
      };
    }
  }

  return {
    front: `Review core concept:`,
    back: clean,
    type: 'flashcard',
  };
}

/**
 * Extracts highlights, annotations, and key text from a PDF File or ArrayBuffer
 */
export async function extractPdfHighlights(
  fileData: ArrayBuffer,
  fileName: string,
  onProgress?: (progressPercent: number) => void
): Promise<PdfScanResult> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: fileData });
  const pdf = await loadingTask.promise;

  const totalPages = pdf.numPages;
  const items: ExtractedItem[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) {
      onProgress(Math.round((pageNum / totalPages) * 100));
    }

    const page = await pdf.getPage(pageNum);
    
    // 1. Get annotations (Highlights, Underlines, Sticky Notes)
    const annotations = await page.getAnnotations();
    
    // 2. Get text content on the page (letters, bounding boxes)
    const textContent = await page.getTextContent();
    const textItems = textContent.items as any[];

    // Extract Highlights
    const highlightAnnotations = annotations.filter(
      (a: any) => a.subtype === 'Highlight' || a.subtype === 'Underline'
    );

    const stickyNoteAnnotations = annotations.filter(
      (a: any) => a.subtype === 'Text'
    );

    // Process sticky notes
    for (const note of stickyNoteAnnotations) {
      if (note.contents && note.contents.trim()) {
        const text = note.contents.trim();
        items.push({
          id: `note-${pageNum}-${Math.random().toString(36).substring(2, 7)}`,
          type: 'sticky_note',
          pageNumber: pageNum,
          text,
          suggestedCard: generateCardFromText(text),
        });
      }
    }

    // Process highlights
    for (const hl of highlightAnnotations) {
      let extractedText = '';

      // Some PDF viewers save the selected text directly inside annotation.contents
      if (hl.contents && hl.contents.trim().length > 0) {
        extractedText = hl.contents.trim();
      } else if (hl.rect) {
        // Intersect highlight bounding rect with text items on the page
        const matchingWords = textItems.filter((item: any) => {
          if (!item.transform) return false;
          const x = item.transform[4];
          const y = item.transform[5];
          return isPointInRect(x, y, hl.rect);
        });

        extractedText = matchingWords.map((item: any) => item.str).join(' ').trim();
      }

      if (extractedText && extractedText.length > 3) {
        items.push({
          id: `hl-${pageNum}-${Math.random().toString(36).substring(2, 7)}`,
          type: 'highlight',
          pageNumber: pageNum,
          text: extractedText,
          userComment: hl.contents !== extractedText ? hl.contents : undefined,
          suggestedCard: generateCardFromText(extractedText, hl.contents),
        });
      }
    }

    // Fallback: If this page has NO annotations, scan for key definition sentences (like "X refers to Y")
    if (highlightAnnotations.length === 0 && stickyNoteAnnotations.length === 0) {
      const fullPageText = textItems.map((item: any) => item.str).join(' ');
      const sentences = fullPageText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);

      for (const sentence of sentences) {
        if (
          sentence.includes(':') ||
          sentence.toLowerCase().includes('is defined as') ||
          sentence.toLowerCase().includes('refers to') ||
          sentence.toLowerCase().includes('is known as')
        ) {
          if (items.length < 25) { // Avoid cluttering
            items.push({
              id: `def-${pageNum}-${Math.random().toString(36).substring(2, 7)}`,
              type: 'key_definition',
              pageNumber: pageNum,
              text: sentence,
              suggestedCard: generateCardFromText(sentence),
            });
          }
        }
      }
    }
  }

  return {
    fileName,
    totalPages,
    items,
  };
}
