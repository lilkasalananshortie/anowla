import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { question, answer, explanation } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a friendly and encouraging study tutor for the study app Alwinyah (similar to Gizmo).
Explain the following concept to a student simply and memorably.
Use 2-3 concise sentences and provide a quick real-world analogy.

Question: ${question}
Correct Answer: ${answer}
Context: ${explanation || 'None'}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return NextResponse.json({ explanation: response.text });
      } catch (err: any) {
        console.warn('Gemini tutor call failed:', err?.message);
      }
    }

    // Fallback intuitive explanation
    return NextResponse.json({
      explanation: `Think of it this way: "${answer}" directly addresses "${question}". Memorizing key terms like this builds mental anchors, making it easier to recall during exams!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate tutor explanation' }, { status: 500 });
  }
}
