import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, cardCount = 15, title = 'Study Material' } = await request.json();

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

    const systemPrompt = `You are an expert academic study tutor for a Gizmo-style flashcard platform.
Analyze the following study material/module ("${title}").
Extract exactly ${cardCount} high-yield, conceptual, clinical, or academic flashcards.

CRITICAL INSTRUCTIONS:
1. STRICTLY IGNORE document titles, module headers, slide labels, authors, dates, course codes, table of contents, and boilerplate metadata.
2. Focus ONLY on core definitions, pathophysiology, diagnosis, clinical manifestations, treatment protocols, key mechanisms, and formulas.
3. Mix card formats:
   - 'multiple_choice' with 3 plausible clinical/academic distractors
   - 'flashcard' with direct conceptual question and clear answer
   - 'fill_blank' where a key medical/technical term is replaced with '________'

UNSLOP NATURAL WRITING CONTRACT:
- NO AI CLICHÉS: Never use "delve", "tapestry", "cornerstone", "testament", "pivotal", "in today's world".
- NO THROAT-CLEARING: Never start questions or explanations with "Here's the thing:", "Let's dive into", "It turns out", "Certainly".
- NO ROBOTIC CADENCE: Write active, natural academic sentences. Explanations must be direct, explaining the exact mechanism or fact without fluff.
- PRESERVE PRECISION: Keep clinical, scientific, and technical terms accurate.

Return ONLY a valid JSON array matching this exact schema:
[
  {
    "card_type": "flashcard" | "multiple_choice" | "fill_blank",
    "front": "string",
    "back": "string",
    "distractors": ["string", "string", "string"], // only for multiple_choice
    "explanation": "string (brief rationale)"
  }
]`;

    const userPrompt = `DOCUMENT CONTENT:\n${text.slice(0, 35000)}`;

    // Automatic fallback cascade across models to prevent 503 "High Demand" errors
    const CANDIDATE_MODELS = [
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
    ];

    let rawOutput: string | null = null;
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
                  parts: [
                    { text: `${systemPrompt}\n\n${userPrompt}` }
                  ]
                }
              ],
              generationConfig: {
                responseMimeType: 'application/json'
              }
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawOutput) {
            break; // Success!
          }
        } else {
          const errData = await response.json();
          console.warn(`Model ${model} returned ${response.status}:`, errData?.error?.message);
          lastError = errData?.error?.message || `Status ${response.status}`;
          // Continue to next model in cascade
        }
      } catch (err: any) {
        lastError = err?.message || 'Network error';
      }
    }

    if (!rawOutput) {
      return NextResponse.json(
        { error: lastError || 'All models are busy. Please try again in a few moments.' },
        { status: 503 }
      );
    }

    const parsedCards = JSON.parse(rawOutput);

    const formattedCards = parsedCards.map((c: any, idx: number) => ({
      id: `ai-card-${Date.now()}-${idx}`,
      card_type: c.card_type || 'flashcard',
      front: c.front,
      back: c.back,
      distractors: c.distractors || [],
      explanation: c.explanation || '',
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      cards: formattedCards,
      count: formattedCards.length,
    });
  } catch (error: any) {
    console.error('Error in AI scan route:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process document with AI' },
      { status: 500 }
    );
  }
}
