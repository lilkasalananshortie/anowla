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

    const systemPrompt = `You are a master academic study tutor for a high-yield study platform like Gizmo.
Analyze the following text extracted from a study document/module ("${title}").
Extract exactly ${cardCount} high-yield, conceptual, and clinical/academic study flashcards.

CRITICAL INSTRUCTIONS:
1. STRICTLY IGNORE document titles, module names, chapter numbers, slide headers, table of contents, author/instructor names, dates, course codes, and administrative metadata.
2. Focus ONLY on core definitions, mechanisms, pathophysiology, clinical criteria, management/treatment steps, formulas, and key facts that could appear on an exam.
3. Mix question formats:
   - 'multiple_choice' with 3 plausible distractors
   - 'flashcard' with direct conceptual question and clear answer
   - 'fill_blank' where a key technical term is replaced with '________'

Return ONLY a valid JSON array matching this exact schema:
[
  {
    "card_type": "flashcard" | "multiple_choice" | "fill_blank",
    "front": "string",
    "back": "string",
    "distractors": ["string", "string", "string"], // required only if multiple_choice
    "explanation": "string (brief rationale)"
  }
]`;

    const userPrompt = `DOCUMENT CONTENT:\n${text.slice(0, 35000)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
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

    if (!response.ok) {
      const errData = await response.json();
      console.error('Gemini API Error:', errData);
      return NextResponse.json(
        { error: errData?.error?.message || 'Gemini API call failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawOutput) {
      return NextResponse.json(
        { error: 'AI did not return content' },
        { status: 500 }
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
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error generating AI flashcards:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error generating flashcards' },
      { status: 500 }
    );
  }
}
