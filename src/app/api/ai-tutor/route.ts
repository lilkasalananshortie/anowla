import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, answer, promptType = 'explain', customQuery } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    let instruction = '';
    if (promptType === 'mnemonic') {
      instruction = 'Create a memorable, clever, high-yield mnemonic or memory hook for this concept. Break down what each letter or part represents, and explain why it works.';
    } else if (promptType === 'example') {
      instruction = 'Provide a concrete practical scenario or real-world example illustrating this question and answer. Keep it vivid, clear, and high-yield.';
    } else if (promptType === 'custom' && customQuery) {
      instruction = `Answer the student's specific question: "${customQuery}". Be encouraging, direct, and pedagogically sound.`;
    } else {
      instruction = 'Explain this concept clearly and intuitively in 2-3 concise paragraphs or bullet points. Use an easy-to-understand analogy if applicable. Highlight the "why" behind the answer.';
    }

    const systemPrompt = `You are an elite academic AI tutor on the Alwinyah study platform.
Your goal is to help students truly master concepts for long-term retention.
Flashcard Question: "${question}"
Flashcard Answer: "${answer}"

Task: ${instruction}

Formatting rules:
- Keep the response concise, clear, and easy to read during a study session (under 180 words).
- Use clear bullet points and bold key terms.
- Jump straight into the explanation on sentence one.

UNSLOP NATURAL TUTOR CONTRACT:
- ZERO AI FLUFF: Never use conversational filler like "Great question!", "Certainly!", "Here's the breakdown:", "Let's dive in", or "I hope this helps!".
- NO CORPORATE/AI BUZZWORDS: Never use "delve", "rich tapestry", "cornerstone", "stands as a testament", "pivotal", or "crucial role".
- PUNCHY & HUMAN: Write like a brilliant human instructor or peer explaining it on a whiteboard without artificial hype.`;

    const CANDIDATE_MODELS = [
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
    ];

    let explanation: string | null = null;
    let lastError: string | null = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 600,
              },
            }),
          }
        );

        if (!response.ok) {
          const errBody = await response.text();
          lastError = `Model ${model} returned ${response.status}: ${errBody}`;
          continue;
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResult) {
          explanation = textResult.trim();
          break;
        }
      } catch (err: any) {
        lastError = err.message || 'Network error';
      }
    }

    if (!explanation) {
      return NextResponse.json(
        { error: lastError || 'Unable to generate tutor explanation. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error('AI Tutor API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
