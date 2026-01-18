import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = 'gemini-flash-latest';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const { messages, transcript, title } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages payload' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      systemInstruction:
        'You are Sketch Discussion, a concise, helpful assistant summarizing and clarifying lecture concepts captured in transcripts and mind maps.',
    });

    const history = messages
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const context = `Session title: ${title || 'Untitled session'}\nTranscript excerpt (may be truncated):\n${(transcript || '').slice(0, 4000)}`;

    const prompt = `${context}\n\nConversation so far:\n${history}\n\nRespond clearly and concisely, with actionable explanations if asked.`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    const message = (error as any)?.message || 'Unknown error';
    console.error('Gemini chat error:', message);
    return NextResponse.json({ error: 'Failed to generate response', details: message }, { status: 500 });
  }
}
