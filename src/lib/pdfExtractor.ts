/**
 * Smart Client-Side PDF Highlight & Annotation Extractor
 * Uses Mozilla's pdfjs-dist with intelligent heuristic filtration to eliminate
 * titles, metadata, boilerplates, and generate high-yield study flashcards.
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
 * Common non-concept noise keywords, structural labels, and metadata prefixes to blacklist
 */
const JUNK_LABELS = new Set([
  'chapter', 'ch', 'lecture', 'lec', 'unit', 'module', 'section', 'part', 'lesson',
  'table of contents', 'contents', 'content', 'index', 'syllabus', 'outline',
  'agenda', 'objective', 'objectives', 'summary', 'overview', 'introduction', 'intro',
  'instructor', 'professor', 'prof', 'teacher', 'author', 'speaker', 'faculty',
  'course title', 'course', 'subject', 'class', 'school', 'university', 'college', 'dept', 'department',
  'copyright', 'all rights reserved', 'published by', 'publisher', 'edition', 'version',
  'page', 'slide', 'figure', 'fig', 'table', 'diagram', 'chart', 'source', 'reference',
  'note', 'notes', 'notice', 'warning', 'tip', 'caution', 'hint', 'reminder',
  'example', 'examples', 'ex', 'case study', 'q&a', 'faq', 'assignment', 'homework',
  'date', 'time', 'duration', 'name', 'email', 'url', 'http', 'https', 'www',
  'step', 'phase', 'key takeaway', 'takeaways', 'conclusion', 'references', 'bibliography',
  'thank you', 'questions', 'discussion', 'prerequisites', 'review', 'announcements'
]);

const STOP_WORDS = new Set([
  'the', 'this', 'that', 'these', 'those', 'when', 'where', 'which', 'what', 'there',
  'here', 'some', 'many', 'each', 'every', 'other', 'another', 'such', 'their', 'your',
  'they', 'them', 'then', 'also', 'furthermore', 'however', 'moreover', 'therefore',
  'thus', 'hence', 'first', 'second', 'third', 'finally', 'next', 'last', 'shown', 'above',
  'below', 'following', 'given', 'based', 'using', 'according', 'between', 'among'
]);

/**
 * Verifies if a string is noise or a structural title/metadata line
 */
function isJunkOrTitle(str: string): boolean {
  const clean = str.trim().toLowerCase();

  if (clean.length < 18) return true; // Too short to be an informative concept
  if (clean.split(/\s+/).length < 4) return true; // Fewer than 4 words

  // Check if it's a chapter heading, numbered section, or slide label (e.g. "1.1 Introduction", "Chapter 3")
  if (/^(\d+(\.\d+)*\s+[A-Za-z]|(chapter|lecture|unit|module|section|slide|figure|fig|table|page|topic|part)\b)/i.test(clean)) {
    return true;
  }

  // Check against blacklisted prefixes (e.g., "Chapter 1: ...", "Figure 2.1: ...")
  for (const label of JUNK_LABELS) {
    const regex = new RegExp(`^${label}\\b[:\\s\\d\\.\\-–—]`, 'i');
    if (regex.test(clean)) return true;
  }

  // Check if it's a URL, copyright, or email
  if (/^(https?:\/\/|www\.|copyright|©|\(c\)|page\s+\d+|slide\s+\d+|email)/i.test(clean)) {
    return true;
  }

  // Check if it's purely a question
  if (/^(why|how|what|did you know|can you|let's|do you)\b.*\?$/i.test(clean)) {
    return true;
  }

  // Check if it's ALL CAPS (likely a slide title like "COMPUTER NETWORKS OVERVIEW")
  const lettersOnly = str.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length > 5 && lettersOnly === lettersOnly.toUpperCase()) {
    return true;
  }

  // Must contain at least one verb predicate to be an informative concept
  const hasVerb = /\b(is|are|was|were|has|have|refers|defined|means|consists|contains|describes|performs|provides|manages|handles|regulates|generates|converts|transfers|functions|serves|enables|allows|causes|occurs|includes|operates|maintains|stores|transmits|executes|acts)\b/i.test(clean);
  if (!hasVerb) {
    return true;
  }

  return false;
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
 * Checks if a point (x, y) is inside a rect [minX, minY, maxX, maxY]
 */
function isPointInRect(x: number, y: number, rect: number[]): boolean {
  const [rx1, ry1, rx2, ry2] = rect;
  const minX = Math.min(rx1, rx2);
  const maxX = Math.max(rx1, rx2);
  const minY = Math.min(ry1, ry2);
  const maxY = Math.max(ry1, ry2);
  return x >= minX - 4 && x <= maxX + 4 && y >= minY - 4 && y <= maxY + 4;
}

/**
 * Intelligent Concept Formulator
 * Converts genuine academic concepts into clean Question & Answer flashcards
 */
function formatSmartCard(rawText: string, userComment?: string): {
  front: string;
  back: string;
  type: 'flashcard' | 'fill_blank';
} | null {
  // Strip bullet markers (•, -, *, 1., 2.), excessive spaces
  const clean = rawText
    .replace(/^[\s•\-\*\d\.\(\)]+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (isJunkOrTitle(clean)) return null;

  // 1. If user wrote their own sticky note/comment (e.g. "Quiz topic: What is TCP?")
  if (userComment && userComment.trim().length > 3) {
    return {
      front: userComment.trim(),
      back: clean,
      type: 'flashcard',
    };
  }

  // 2. High-Yield Definition Pattern: "Term : Definition"
  const colonMatch = clean.match(/^([A-Za-z0-9\s\/\(\)\-]{2,30})\s*[:–—\-]\s*(.+)$/);
  if (colonMatch) {
    const term = colonMatch[1].trim();
    const definition = colonMatch[2].trim();
    const termLower = term.toLowerCase();

    // Verify term is NOT a junk label (e.g., "Chapter 1", "Note", "Instructor")
    if (
      !JUNK_LABELS.has(termLower) &&
      !/^(figure|table|slide|page|step|part|unit)\s*\d+/i.test(termLower) &&
      definition.split(/\s+/).length >= 4 // Definition must have substance
    ) {
      return {
        front: `What is ${term}?`,
        back: definition,
        type: 'flashcard',
      };
    }
  }

  // 3. Definition Verbs: "X is defined as Y" or "X refers to Y"
  const defVerbMatch = clean.match(
    /^([A-Za-z0-9\s]{2,30})\s+(is defined as|refers to|is described as|is known as)\s+(.+)$/i
  );
  if (defVerbMatch) {
    const term = defVerbMatch[1].trim();
    const explanation = defVerbMatch[3].trim();
    if (!STOP_WORDS.has(term.toLowerCase()) && !JUNK_LABELS.has(term.toLowerCase())) {
      return {
        front: `What is ${term}?`,
        back: `${defVerbMatch[2]} ${explanation}`,
        type: 'flashcard',
      };
    }
  }

  // 4. Role & Purpose: "X is responsible for Y" or "The primary function of X is Y"
  const roleMatch = clean.match(
    /^([A-Za-z0-9\s]{2,30})\s+(is responsible for|functions to|is used to|serves as|allows users to)\s+(.+)$/i
  );
  if (roleMatch) {
    const term = roleMatch[1].trim();
    const role = roleMatch[3].trim();
    if (!STOP_WORDS.has(term.toLowerCase()) && !JUNK_LABELS.has(term.toLowerCase())) {
      return {
        front: `What is the function of ${term}?`,
        back: `${roleMatch[2]} ${role}`,
        type: 'flashcard',
      };
    }
  }

  // 5. Intelligent Cloze / Fill-in-the-blank for general factual statements
  const words = clean.split(' ');
  if (words.length >= 6 && words.length <= 40) {
    // Find the primary technical noun/term to blank out
    const candidate = words.find(
      (w) => w.length >= 5 && !STOP_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))
    );

    if (candidate) {
      const cleanCandidate = candidate.replace(/[^a-zA-Z0-9\-]/g, '');
      const regex = new RegExp(`\\b${cleanCandidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      return {
        front: clean.replace(regex, '________'),
        back: cleanCandidate,
        type: 'fill_blank',
      };
    }
  }

  return {
    front: `Recall concept:`,
    back: clean,
    type: 'flashcard',
  };
}

/**
 * Extracts and filters high-yield highlights and notes from a PDF
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
  const seenConcepts = new Set<string>();

  // Pass 1: Scan all pages specifically for user Highlights and Sticky Notes
  let totalHighlightsFound = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) {
      onProgress(Math.round((pageNum / totalPages) * 70));
    }

    const page = await pdf.getPage(pageNum);
    const annotations = await page.getAnnotations();
    const textContent = await page.getTextContent();
    const textItems = textContent.items as any[];

    const highlightAnnotations = annotations.filter(
      (a: any) => a.subtype === 'Highlight' || a.subtype === 'Underline'
    );
    const stickyNoteAnnotations = annotations.filter(
      (a: any) => a.subtype === 'Text'
    );

    // Process sticky notes
    for (const note of stickyNoteAnnotations) {
      if (note.contents && note.contents.trim().length > 3) {
        const text = note.contents.trim();
        const card = formatSmartCard(text);
        if (card && !seenConcepts.has(card.front.toLowerCase())) {
          seenConcepts.add(card.front.toLowerCase());
          items.push({
            id: `note-${pageNum}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'sticky_note',
            pageNumber: pageNum,
            text,
            suggestedCard: card,
          });
          totalHighlightsFound++;
        }
      }
    }

    // Process highlights
    for (const hl of highlightAnnotations) {
      let extractedText = '';

      if (hl.contents && hl.contents.trim().length > 0) {
        extractedText = hl.contents.trim();
      } else if (hl.rect) {
        const matchingWords = textItems.filter((item: any) => {
          if (!item.transform) return false;
          return isPointInRect(item.transform[4], item.transform[5], hl.rect);
        });
        extractedText = matchingWords.map((item: any) => item.str).join(' ').trim();
      }

      if (extractedText && extractedText.length > 5) {
        const card = formatSmartCard(extractedText, hl.contents !== extractedText ? hl.contents : undefined);
        if (card && !seenConcepts.has(card.front.toLowerCase())) {
          seenConcepts.add(card.front.toLowerCase());
          items.push({
            id: `hl-${pageNum}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'highlight',
            pageNumber: pageNum,
            text: extractedText,
            userComment: hl.contents !== extractedText ? hl.contents : undefined,
            suggestedCard: card,
          });
          totalHighlightsFound++;
        }
      }
    }
  }

  // Pass 2: ONLY if the document has ZERO user highlights/notes,
  // run the smart definition scanner so unhighlighted PDFs still generate useful cards.
  if (totalHighlightsFound === 0) {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (onProgress) {
        onProgress(70 + Math.round((pageNum / totalPages) * 30));
      }

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const textItems = textContent.items as any[];
      const fullPageText = textItems.map((item: any) => item.str).join(' ');

      // Split into clean sentence units
      const sentences = fullPageText
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 25 && s.length <= 250);

      for (const sentence of sentences) {
        // High-precision definition check
        if (
          sentence.includes(':') ||
          sentence.toLowerCase().includes('is defined as') ||
          sentence.toLowerCase().includes('refers to') ||
          sentence.toLowerCase().includes('is responsible for') ||
          sentence.toLowerCase().includes('the primary function')
        ) {
          const card = formatSmartCard(sentence);
          if (card && !seenConcepts.has(card.front.toLowerCase())) {
            seenConcepts.add(card.front.toLowerCase());
            items.push({
              id: `def-${pageNum}-${Math.random().toString(36).substring(2, 7)}`,
              type: 'key_definition',
              pageNumber: pageNum,
              text: sentence,
              suggestedCard: card,
            });

            // Cap at 15 high-quality concept cards to avoid overwhelming the deck
            if (items.length >= 15) break;
          }
        }
      }

      if (items.length >= 15) break;
    }
  }

  if (onProgress) onProgress(100);

  return {
    fileName,
    totalPages,
    items,
  };
}

/**
 * Extracts all raw text from a PDF document across all pages for the interactive editor.
 */
export async function extractFullTextFromPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ text: string; totalPages: number }> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) {
      onProgress(Math.round((pageNum / totalPages) * 100));
    }
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];
    const pageString = items.map((i: any) => i.str).join(' ');
    if (pageString.trim().length > 0) {
      pageTexts.push(`--- Page ${pageNum} ---\n${pageString.trim()}`);
    }
  }

  return {
    text: pageTexts.join('\n\n'),
    totalPages,
  };
}

