'use client';

import { useEffect, useState, useRef } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { LiveKitRoom, VideoTrack, AudioTrack } from '@livekit/components-react';

interface LiveKitCaptureProps {
  isActive: boolean;
  onConceptExtracted: (concept: any) => void;
}

export default function LiveKitCapture({ isActive, onConceptExtracted }: LiveKitCaptureProps) {
  const [token, setToken] = useState<string>('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const transcriptBufferRef = useRef<string>('');
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !token) {
      fetchToken();
    }

    return () => {
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
      }
    };
  }, [isActive, token]);

  const fetchToken = async () => {
    setConnecting(true);
    setError('');
    
    try {
      const response = await fetch('/api/livekit/token?room=lecture-room&username=presenter');
      
      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }

      const data = await response.json();
      setToken(data.token);
    } catch (err) {
      setError('Failed to connect to LiveKit. Please check your configuration.');
      console.error('Token fetch error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleTranscript = async (text: string) => {
    transcriptBufferRef.current += ' ' + text;

    // Process transcript every 10 seconds
    if (!processingTimerRef.current) {
      processingTimerRef.current = setInterval(async () => {
        const currentTranscript = transcriptBufferRef.current.trim();
        
        if (currentTranscript.length > 50) {
          try {
            const response = await fetch('/api/process-transcript', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript: currentTranscript }),
            });

            if (response.ok) {
              const { concepts } = await response.json();
              concepts.forEach((concept: any) => onConceptExtracted(concept));
              transcriptBufferRef.current = ''; // Clear buffer after processing
            }
          } catch (err) {
            console.error('Error processing transcript:', err);
          }
        }
      }, 10000); // Process every 10 seconds
    }
  };

  const simulateTranscript = () => {
    // Simulated transcript for demo purposes
    const sampleTranscripts = [
      'Today we will discuss React components',
      'Components are the building blocks of React applications',
      'There are two types: functional and class components',
      'State management is crucial in React',
      'Hooks allow us to use state in functional components'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleTranscripts.length) {
        handleTranscript(sampleTranscripts[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  if (!isActive) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 via-primary-50/20 to-accent-50/20 rounded-xl">
        <div className="text-center p-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-700 text-lg font-semibold mb-2">Ready to Capture</p>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Click &quot;Start Session&quot; to begin recording and analyzing your lecture
          </p>
        </div>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 via-primary-50/20 to-accent-50/20 rounded-xl">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-700 font-medium mb-2">Connecting to LiveKit</p>
          <p className="text-slate-500 text-sm">Setting up your capture session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-700 font-semibold mb-2">Connection Error</p>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchToken}
              className="w-full btn-primary"
            >
              Retry Connection
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gradient-to-br from-red-50 to-orange-50 text-slate-500">or try demo mode</span>
              </div>
            </div>
            <button
              onClick={simulateTranscript}
              className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:scale-105 transition-all duration-200 shadow-lg shadow-emerald-500/30"
            >
              Simulate Lecture Transcript
            </button>
          </div>
        </div>
      </div>
    );
  }

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

  if (!livekitUrl || !token) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-amber-700 font-semibold mb-2">LiveKit Not Configured</p>
          <p className="text-amber-600 text-sm mb-6">Configure your .env.local file to enable live capture</p>
          <button
            onClick={simulateTranscript}
            className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:scale-105 transition-all duration-200 shadow-lg shadow-emerald-500/30"
          >
            Try Demo Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <LiveKitRoom
        serverUrl={livekitUrl}
        token={token}
        connect={true}
        audio={true}
        video={true}
        className="h-full"
      >
        <div className="h-full space-y-4">
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-xl border-2 border-slate-700 relative h-3/4">
            <VideoTrack />
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-red-600 rounded-full shadow-lg animate-pulse-slow">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-semibold">LIVE</span>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700 h-1/4 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>
              <span className="text-slate-300 text-sm font-medium">Audio Active</span>
            </div>
            <AudioTrack />
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}
