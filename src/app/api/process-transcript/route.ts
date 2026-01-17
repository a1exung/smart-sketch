import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// This endpoint processes audio/video transcriptions and extracts concepts
export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an educational assistant that extracts key concepts from lecture transcripts. 
For each concept, provide:
1. A clear label (2-5 words)
2. The type (main, concept, or detail)
3. A brief explanation (optional)

Return the concepts as a JSON array.

Extract key concepts from this lecture segment: "${transcript}"`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();
    
    // Parse the AI response
    let concepts;
    try {
      // Gemini sometimes wraps JSON in markdown code blocks, so clean it
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      concepts = JSON.parse(cleanedContent);
    } catch {
      // If parsing fails, create a simple concept from the transcript
      concepts = [{
        label: transcript.slice(0, 50),
        type: 'concept',
        explanation: transcript
      }];
    }

    return NextResponse.json({ concepts });
  } catch (error) {
    console.error('Error processing transcript:', error);
    return NextResponse.json(
      { error: 'Failed to process transcript' },
      { status: 500 }
    );
  }
}
