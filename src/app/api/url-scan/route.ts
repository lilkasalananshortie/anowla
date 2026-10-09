import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, cardCount = 12 } = await request.json();

    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return NextResponse.json(
        { error: 'Please provide a valid HTTP or HTTPS URL.' },
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

    const cleanUrl = url.trim();
    let extractedText = '';
    let extractedTitle = 'Web Study Material';

    // 1. Check if it's a YouTube URL
    const ytMatch = cleanUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );

    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      try {
        const ytRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        if (ytRes.ok) {
          const html = await ytRes.text();

          // Extract title
          const titleMatch = html.match(/<title>([^<]+)<\/title>/);
          if (titleMatch) {
            extractedTitle = titleMatch[1].replace(' - YouTube', '').trim();
          }

          // Search for captionTracks inside ytInitialPlayerResponse
          const captionsRegex = /"captionTracks":\s*(\[.*?\])/;
          const match = html.match(captionsRegex);

          if (match && match[1]) {
            try {
              const captionTracks = JSON.parse(match[1]);
              const englishTrack =
                captionTracks.find((t: any) => t.languageCode === 'en' || t.vssId?.includes('.en')) ||
                captionTracks[0];

              if (englishTrack && englishTrack.baseUrl) {
                const subRes = await fetch(englishTrack.baseUrl);
                if (subRes.ok) {
                  const subXml = await subRes.text();
                  // Extract text content from XML tags
                  const cleanSub = subXml
                    .replace(/<text[^>]*>(.*?)<\/text>/gi, '$1 ')
                    .replace(/&amp;/g, '&')
                    .replace(/&#39;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                  if (cleanSub.length > 100) {
                    extractedText = cleanSub;
                  }
                }
              }
            } catch (parseErr) {
              console.warn('Error parsing YouTube captions JSON:', parseErr);
            }
          }

          // Fallback if captions are disabled: extract description and video metadata
          if (!extractedText || extractedText.length < 100) {
            const descMatch = html.match(/"shortDescription":"(.*?)"/);
            if (descMatch && descMatch[1]) {
              extractedText = `Video Title: ${extractedTitle}\n\nDescription: ${descMatch[1].replace(/\\n/g, '\n')}`;
            }
          }
        }
      } catch (ytErr) {
        console.warn('Error fetching YouTube page:', ytErr);
      }
    } else {
      // 2. Regular Web Article or Web Page
      try {
        const webRes = await fetch(cleanUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (webRes.ok) {
          const html = await webRes.text();

          // Title
          const titleMatch = html.match(/<title>([^<]+)<\/title>/);
          if (titleMatch) {
            extractedTitle = titleMatch[1].split('|')[0].split('-')[0].trim();
          }

          // Strip non-content tags
          const textOnly = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
            .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
            .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
            .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '')
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (textOnly.length > 80) {
            extractedText = textOnly.slice(0, 30000);
          }
        }
      } catch (webErr: any) {
        return NextResponse.json(
          { error: `Could not fetch web page: ${webErr.message}` },
          { status: 400 }
        );
      }
    }

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { 
          error: 'Could not extract sufficient text or captions from this URL. If it is a YouTube video, ensure English closed captions (CC) are enabled.' 
        },
        { status: 400 }
      );
    }

    // 3. Gemini Academic Flashcard Extraction
    const systemPrompt = `You are an expert academic study tutor for the Alwinyah active-recall platform.
Analyze the following source material from "${extractedTitle}".
Extract exactly ${cardCount} high-yield, conceptual, clinical, or academic flashcards.

CRITICAL INSTRUCTIONS:
1. STRICTLY IGNORE video sponsors, subscribe reminders, timestamps, advertisements, site navigation, and copyright boilerplate.
2. Focus ONLY on core definitions, clinical mechanisms, diagnostic criteria, key equations, concepts, and factual knowledge.
3. Mix card formats:
   - 'multiple_choice' with 3 plausible distractors
   - 'flashcard' with direct question and answer
   - 'fill_blank' where a key medical/technical term is replaced with '________'

UNSLOP NATURAL WRITING CONTRACT:
- NO AI CLICHÉS OR BUZZWORDS: Never use "delve", "rich tapestry", "cornerstone", "testament", "pivotal", "in today's world".
- NO THROAT-CLEARING: Ban "Here's the thing:", "Let's unpack", "Remember that", "Certainly".
- DIRECT & PRECISE: Extract sharp questions that test actual recall and comprehension, not trivia. Explanations must explain the mechanism directly without fluff.

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

    const userPrompt = `SOURCE CONTENT:\n${extractedText.slice(0, 30000)}`;

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
                { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
                maxOutputTokens: 8192,
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
          rawOutput = textResult;
          break;
        }
      } catch (err: any) {
        lastError = err.message || 'Network error';
      }
    }

    if (!rawOutput) {
      return NextResponse.json(
        { error: lastError || 'AI card generation failed. Please try again.' },
        { status: 500 }
      );
    }

    function safeParseCardJson(raw: string): any[] {
      if (!raw || typeof raw !== 'string') return [];
      let clean = raw.trim();
      if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      clean = clean.trim();

      try {
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.cards)) return parsed.cards;
      } catch (e) {}

      const lastBraceIndex = clean.lastIndexOf('}');
      if (lastBraceIndex !== -1) {
        let candidate = clean.slice(0, lastBraceIndex + 1).trim();
        if (candidate.endsWith(',')) candidate = candidate.slice(0, -1).trim();
        const firstBracket = candidate.indexOf('[');
        if (firstBracket !== -1) candidate = candidate.slice(firstBracket) + ']';
        else candidate = '[' + candidate + ']';
        try {
          const recovered = JSON.parse(candidate);
          if (Array.isArray(recovered) && recovered.length > 0) return recovered;
        } catch (e) {}
      }
      return [];
    }

    const cards = safeParseCardJson(rawOutput);

    return NextResponse.json({
      title: extractedTitle,
      sourceUrl: cleanUrl,
      cardsCount: cards.length,
      cards: cards.map((c: any, idx: number) => ({
        id: crypto.randomUUID ? crypto.randomUUID() : `card_url_${Date.now()}_${idx}`,
        card_type: c.card_type || 'flashcard',
        front: c.front,
        back: c.back,
        distractors: Array.isArray(c.distractors) ? c.distractors : [],
        explanation: c.explanation || '',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('URL Scan Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error processing URL.' },
      { status: 500 }
    );
  }
}
