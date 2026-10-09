import { NextResponse } from 'next/server';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
];

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
              temperature: 0.3,
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
3. UNSLOP CONTRACT: Direct, natural, academic clinical language. No throat-clearing clichés (never say "delve into", "cornerstone", "tapestry", "in conclusion").
4. Mix formats:
   - 'multiple_choice': Real clinical question + correct answer + 3 plausible medical distractors (e.g. similar drug suffixes, inverse lab findings).
   - 'flashcard': High-yield prompt with comprehensive structured answer.
   - 'fill_blank': Medical sentence where a key clinical drug, number, or condition is replaced with '________'.
5. Include a clear 'explanation' for EVERY card explaining the physiological mechanism or clinical rationale.

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

    // Multi-pass or Chunking strategy to ensure large card amounts from long documents
    const cleanText = text.trim();
    let aggregatedCards: any[] = [];

    if (targetNum <= 25 && cleanText.length <= 35000) {
      // Single Pass
      const prompt = `${baseSystemPrompt}
Extract exactly ${targetNum} high-yield clinical cards.

DOCUMENT CONTENT:
${cleanText.slice(0, 35000)}`;

      const raw = await callGeminiJson(apiKey, prompt);
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        aggregatedCards = parsed;
      }
    } else {
      // Multi-Section Chunking: Split text into 2 or 3 segments to thoroughly cover whole document
      const numChunks = targetNum > 50 || cleanText.length > 50000 ? 3 : 2;
      const chunkSize = Math.ceil(cleanText.length / numChunks);
      const cardsPerChunk = Math.ceil(targetNum / numChunks);

      const chunkPrompts: string[] = [];

      for (let i = 0; i < numChunks; i++) {
        const start = Math.max(0, i * chunkSize - 1000); // 1000 chars overlap
        const end = Math.min(cleanText.length, (i + 1) * chunkSize + 1000);
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
          try {
            const parsed = JSON.parse(res.value);
            if (Array.isArray(parsed)) {
              aggregatedCards.push(...parsed);
            }
          } catch (e) {
            console.warn('Failed to parse chunk JSON:', e);
          }
        }
      }

      // Fallback if chunks returned too few: if aggregated is less than half target, do a safety pass
      if (aggregatedCards.length < Math.floor(targetNum * 0.6)) {
        const fallbackPrompt = `${baseSystemPrompt}
Extract ${targetNum} comprehensive clinical cards covering the entire study module.

DOCUMENT CONTENT:
${cleanText.slice(0, 40000)}`;
        try {
          const raw = await callGeminiJson(apiKey, fallbackPrompt);
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            aggregatedCards = [...aggregatedCards, ...parsed];
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

    // Deduplicate cards by front prompt similarity
    const seen = new Set<string>();
    const deduplicated = aggregatedCards.filter((c) => {
      if (!c.front || !c.back) return false;
      const key = c.front.trim().toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const formattedCards = deduplicated.slice(0, targetNum).map((c: any, idx: number) => ({
      id: `ai-card-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      card_type: c.card_type === 'multiple_choice' || c.card_type === 'fill_blank' ? c.card_type : 'flashcard',
      front: c.front.trim(),
      back: c.back.trim(),
      distractors: Array.isArray(c.distractors) ? c.distractors : [],
      explanation: c.explanation ? c.explanation.trim() : '',
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
