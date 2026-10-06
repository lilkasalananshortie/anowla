import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { prompt, count = 5, category = 'General' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Valid prompt or text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are an expert tutor creating study materials like the Gizmo app.
Based on the following user notes or topic, generate exactly ${count} high-yield study cards.
Mix question types:
- 'flashcard' (conceptual question & clear answer)
- 'multiple_choice' (question, correct answer, and exactly 3 plausible distractors)
- 'fill_blank' (a sentence with a key term replaced by '________', and the missing term as the answer)

Output ONLY valid JSON matching this structure:
[
  {
    "card_type": "multiple_choice" | "flashcard" | "fill_blank",
    "front": "string",
    "back": "string",
    "distractors": ["string", "string", "string"], // only for multiple_choice
    "explanation": "concise explanation of the concept"
  }
]`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nUser material / topic:\n${prompt}`,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '[]';
        const parsedCards = JSON.parse(rawText);

        const formattedCards = parsedCards.map((card: any, idx: number) => ({
          id: `card-${Date.now()}-${idx}`,
          card_type: card.card_type || 'flashcard',
          front: card.front,
          back: card.back,
          distractors: card.distractors || [],
          explanation: card.explanation || '',
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }));

        return NextResponse.json({ cards: formattedCards, source: 'gemini-ai' });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using smart fallback generator:', geminiError?.message);
      }
    }

    // Smart Demo Generator (Fallback when GEMINI_API_KEY is not yet added)
    const sentences = prompt
      .split(/[.!?\n]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 10);

    const generatedCards = [];
    const targetCount = Math.min(count, Math.max(3, sentences.length));

    for (let i = 0; i < targetCount; i++) {
      const sentence = sentences[i % sentences.length] || `Core concept in ${prompt}`;
      const words = sentence.split(' ');
      const keyWord = words.find((w: string) => w.length > 5) || words[0] || 'Concept';

      if (i % 3 === 0) {
        generatedCards.push({
          id: `mock-${Date.now()}-${i}`,
          card_type: 'multiple_choice',
          front: `What is the key takeaway regarding: "${sentence.slice(0, 60)}..."?`,
          back: keyWord,
          distractors: ['Alternative explanation', 'Opposing principle', 'Secondary factor'],
          explanation: `In the context of ${prompt}, ${keyWord} is the central point.`,
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      } else if (i % 3 === 1) {
        generatedCards.push({
          id: `mock-${Date.now()}-${i}`,
          card_type: 'fill_blank',
          front: sentence.replace(new RegExp(`\\b${keyWord}\\b`, 'i'), '________'),
          back: keyWord,
          explanation: `The missing term completes the principle correctly.`,
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      } else {
        generatedCards.push({
          id: `mock-${Date.now()}-${i}`,
          card_type: 'flashcard',
          front: `Define or explain: ${keyWord} in relation to ${prompt}`,
          back: sentence,
          explanation: `Recall this core definition for active retention.`,
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ cards: generatedCards, source: 'smart-fallback' });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate cards' }, { status: 500 });
  }
}
