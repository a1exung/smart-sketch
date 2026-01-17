import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    // Escape text for shell
    const escapedText = text.replace(/"/g, '\\"');
    
    // Call Python script
    const { stdout, stderr } = await execAsync(
      `python3 scripts/compress.py "${escapedText}"`
    );
    
    if (stderr) {
      console.error('Python stderr:', stderr);
    }
    
    const result = JSON.parse(stdout);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Compression error:', error);
    return NextResponse.json(
      { error: 'Compression failed' },
      { status: 500 }
    );
  }
}
