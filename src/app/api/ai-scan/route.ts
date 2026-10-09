import { NextResponse } from 'next/server';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
];

/**
 * Resilient JSON parser for LLM-generated flashcards.
 * Recovers all completed cards even if the LLM output is truncated or contains syntax quirks.
 */
function safeParseCardJson(raw: string): any[] {
  if (!raw || typeof raw !== 'string') return [];

  // 1. Strip markdown fences if present
  let clean = raw.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  clean = clean.trim();

  // 2. Direct JSON.parse
  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.cards)) return parsed.cards;
  } catch (e) {
    // Truncation or syntax error, proceed to recovery
  }

  // 3. Array truncation recovery (e.g. cut off midway through the last card)
  const lastBraceIndex = clean.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    let truncatedCandidate = clean.slice(0, lastBraceIndex + 1).trim();
    if (truncatedCandidate.endsWith(',')) {
      truncatedCandidate = truncatedCandidate.slice(0, -1).trim();
    }
    const firstBracket = truncatedCandidate.indexOf('[');
    if (firstBracket !== -1) {
      truncatedCandidate = truncatedCandidate.slice(firstBracket) + ']';
    } else {
      truncatedCandidate = '[' + truncatedCandidate + ']';
    }

    try {
      const recovered = JSON.parse(truncatedCandidate);
      if (Array.isArray(recovered) && recovered.length > 0) {
        return recovered;
      }
    } catch (e) {
      // Still failed, proceed to granular object scanner
    }
  }

  // 4. Granular Object-by-Object Extractor using depth scanning
  const extractedCards: any[] = [];
  let depth = 0;
  let inString = false;
  let escape = false;
  let objStart = -1;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      if (depth === 0) {
        objStart = i;
      }
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        const objStr = clean.slice(objStart, i + 1);
        try {
          const cardObj = JSON.parse(objStr);
          if (cardObj && typeof cardObj === 'object' && cardObj.front && cardObj.back) {
            extractedCards.push(cardObj);
          }
        } catch (err) {
          // Attempt sanitizing unescaped newlines inside string values
          try {
            const sanitized = objStr.replace(/(?<!\\)\n/g, '\\n');
            const cardObj = JSON.parse(sanitized);
            if (cardObj && typeof cardObj === 'object' && cardObj.front && cardObj.back) {
              extractedCards.push(cardObj);
            }
          } catch (err2) {}
        }
        objStart = -1;
      }
    }
  }

  if (extractedCards.length > 0) {
    return extractedCards;
  }

  // 5. Regex Pair Fallback
  const regex = /"front"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*,\s*"back"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/gi;
  let match;
  while ((match = regex.exec(clean)) !== null) {
    try {
      const front = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
      const back = match[2].replace(/\\"/g, '"').replace(/\\n/g, '\n');
      if (front && back) {
        extractedCards.push({
          card_type: 'flashcard',
          front,
          back,
          explanation: '',
        });
      }
    } catch (e) {}
  }

  return extractedCards;
}

async function callGeminiJson(apiKey: string, prompt: string): Promise<string> {
  let lastError: string | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              maxOutputTokens: 8192,
              temperature: 0.25,
            }
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawOutput) {
          return rawOutput;
        }
      } else {
        const errData = await response.json();
        console.warn(`Model ${model} returned ${response.status}:`, errData?.error?.message);
        lastError = errData?.error?.message || `Status ${response.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Network error';
    }
  }

  throw new Error(lastError || 'All Gemini models are busy. Please try again.');
}

export async function POST(request: Request) {
  try {
    const { 
      text, 
      cardCount = 30, 
      title = 'Clinical Study Notes',
      clinicalFocus = 'comprehensive' 
    } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Insufficient text found in document to generate flashcards.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in .env.local' },
        { status: 500 }
      );
    }

    // Determine focus direction
    let focusInstructions = '';
    if (clinicalFocus === 'pharmacology') {
      focusInstructions = 'CRITICAL FOCUS: Strongly emphasize pharmacology — mechanisms of action, adverse effects, black box warnings, therapeutic lab ranges, antidotes, and high-alert nursing precautions.';
    } else if (clinicalFocus === 'pathophysiology') {
      focusInstructions = 'CRITICAL FOCUS: Strongly emphasize disease mechanisms — cellular pathophysiology, etiology, hallmark signs & symptoms, diagnostic criteria, and clinical stages.';
    } else if (clinicalFocus === 'nclex_priorities') {
      focusInstructions = 'CRITICAL FOCUS: Strongly emphasize NCLEX-RN clinical decision making — ABCs (Airway, Breathing, Circulation), triage prioritization, acute vs chronic complications, and immediate nursing interventions.';
    } else {
      focusInstructions = 'CRITICAL FOCUS: Provide a balanced clinical master deck covering pathophysiology, clinical manifestations, pharmacology, and nursing priorities.';
    }

    const baseSystemPrompt = `You are an elite clinical nursing and medical education tutor specializing in NCLEX-RN and board exam preparation.
Analyze the provided medical study material ("${title}").
${focusInstructions}

CRITICAL RULES:
1. STRICTLY IGNORE course codes, instructor names, dates, slide numbers, boilerplate disclaimers, and chapter headings.
2. Focus ONLY on actionable clinical knowledge, disease processes, drug protocols, vital sign thresholds, and nursing interventions.
3. Keep rationales and answers concise (1-2 sentences) to guarantee complete, uninterrupted JSON output.
4. DO NOT use unescaped double quotes inside JSON string values. Use single quotes if quoting phrases.
5. Mix formats:
   - 'multiple_choice': Real clinical question + correct answer + 3 plausible medical distractors.
   - 'flashcard': High-yield prompt with comprehensive structured answer.
   - 'fill_blank': Medical sentence where a key clinical drug, number, or condition is replaced with '________'.
6. Include a clear 'explanation' for EVERY card explaining the physiological mechanism or clinical rationale.

Schema:
[
  {
    "card_type": "flashcard" | "multiple_choice" | "fill_blank",
    "front": "string",
    "back": "string",
    "distractors": ["string", "string", "string"],
    "explanation": "string"
  }
]`;

    const targetNum = Math.max(10, Math.min(100, Number(cardCount) || 30));
    const cleanText = text.trim();
    let aggregatedCards: any[] = [];

    // Keep individual chunk sizes at <= 15 cards to avoid token truncation
    const maxCardsPerChunk = 15;
    const numChunks = Math.max(1, Math.ceil(targetNum / maxCardsPerChunk));
    const cardsPerChunk = Math.ceil(targetNum / numChunks);

    if (numChunks === 1 && cleanText.length <= 30000) {
      // Single chunk for small card counts
      const prompt = `${baseSystemPrompt}
Extract exactly ${targetNum} high-yield clinical cards.

DOCUMENT CONTENT:
${cleanText.slice(0, 30000)}`;

      const raw = await callGeminiJson(apiKey, prompt);
      aggregatedCards = safeParseCardJson(raw);
    } else {
      // Multi-section chunking: Balanced partitions across document text
      const chunkSize = Math.ceil(cleanText.length / numChunks);
      const chunkPrompts: string[] = [];

      for (let i = 0; i < numChunks; i++) {
        const start = Math.max(0, i * chunkSize - 800);
        const end = Math.min(cleanText.length, (i + 1) * chunkSize + 800);
        const segmentText = cleanText.slice(start, end);

        chunkPrompts.push(`${baseSystemPrompt}
Extract exactly ${cardsPerChunk} distinct, high-yield clinical cards specifically from Section ${i + 1} of ${numChunks} of this module.
Ensure high density and no repetition.

SECTION ${i + 1} CONTENT:
${segmentText}`);
      }

      // Execute chunks in parallel
      const chunkResults = await Promise.allSettled(
        chunkPrompts.map((p) => callGeminiJson(apiKey, p))
      );

      for (const res of chunkResults) {
        if (res.status === 'fulfilled') {
          const parsed = safeParseCardJson(res.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            aggregatedCards.push(...parsed);
          }
        } else {
          console.warn('Chunk call failed:', res.reason);
        }
      }

      // Safety fallback pass if chunks returned too few
      if (aggregatedCards.length < Math.floor(targetNum * 0.5)) {
        const fallbackPrompt = `${baseSystemPrompt}
Extract ${cardsPerChunk} high-yield clinical cards covering key points of this module.

DOCUMENT CONTENT:
${cleanText.slice(0, 25000)}`;
        try {
          const raw = await callGeminiJson(apiKey, fallbackPrompt);
          const parsed = safeParseCardJson(raw);
          if (Array.isArray(parsed)) {
            aggregatedCards.push(...parsed);
          }
        } catch (e) {
          console.warn('Fallback pass error:', e);
        }
      }
    }

    if (aggregatedCards.length === 0) {
      return NextResponse.json(
        { error: 'AI was unable to extract flashcards from this document. Please check the PDF content.' },
        { status: 500 }
      );
    }

    // Deduplicate cards by question prompt similarity
    const seen = new Set<string>();
    const deduplicated = aggregatedCards.filter((c) => {
      if (!c.front || !c.back) return false;
      const key = String(c.front).trim().toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const formattedCards = deduplicated.slice(0, targetNum).map((c: any, idx: number) => ({
      id: `ai-card-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      card_type: c.card_type === 'multiple_choice' || c.card_type === 'fill_blank' ? c.card_type : 'flashcard',
      front: String(c.front).trim(),
      back: String(c.back).trim(),
      distractors: Array.isArray(c.distractors) ? c.distractors.map((d: any) => String(d).trim()) : [],
      explanation: c.explanation ? String(c.explanation).trim() : '',
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      cards: formattedCards,
      count: formattedCards.length,
      requestedCount: targetNum,
      title,
    });
  } catch (error: any) {
    console.error('Error in AI scan route:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process document with AI' },
      { status: 500 }
    );
  }
}
