import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Use GPT to extract key concepts from the transcript
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an educational assistant that extracts key concepts from lecture transcripts. 
          For each concept, provide:
          1. A clear label (2-5 words)
          2. The type (main, concept, or detail)
          3. A brief explanation (optional)
          
          Return the concepts as a JSON array.`
        },
        {
          role: 'user',
          content: `Extract key concepts from this lecture segment: "${transcript}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content;
    
    // Parse the AI response
    let concepts;
    try {
      concepts = JSON.parse(content || '[]');
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
