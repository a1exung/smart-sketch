import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    // Direct REST call to bypass SDK issues
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'API request failed', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ models: data.models });
  } catch (error) {
    const message = (error as any)?.message || 'Unknown error';
    console.error('List models error:', message);
    return NextResponse.json({ error: 'Failed to list models', details: message }, { status: 500 });
  }
}
