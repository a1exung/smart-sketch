// Type definitions for Smart Sketch application

export interface Concept {
  id?: string;
  label: string;
  type: 'main' | 'concept' | 'detail';
  parent?: string;
  explanation?: string;
  timestamp?: number;
}

export interface LectureSession {
  id: string;
  roomName: string;
  startTime: Date;
  endTime?: Date;
  concepts: Concept[];
}

export interface LiveKitConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
}

export interface TranscriptSegment {
  text: string;
  timestamp: number;
  speaker?: string;
}
