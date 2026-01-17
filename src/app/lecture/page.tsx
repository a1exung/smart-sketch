'use client';

import { useState } from 'react';
import LiveKitCapture from '@/components/LiveKitCapture';
import MindMapVisualization from '@/components/MindMapVisualization';
import Link from 'next/link';

export default function LecturePage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [conceptData, setConceptData] = useState<any[]>([]);

  const handleStartSession = () => {
    setIsSessionActive(true);
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
  };

  const handleConceptExtracted = (concept: any) => {
    setConceptData(prev => [...prev, concept]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="glass border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Smart Sketch
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Concept Counter */}
              {isSessionActive && conceptData.length > 0 && (
                <div className="px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl">
                  <span className="text-sm font-medium text-primary-900">
                    {conceptData.length} concept{conceptData.length !== 1 ? 's' : ''} captured
                  </span>
                </div>
              )}

              {/* Session Control */}
              {!isSessionActive ? (
                <button
                  onClick={handleStartSession}
                  className="btn-primary group"
                >
                  <svg className="inline-block w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start Session
                </button>
              ) : (
                <button
                  onClick={handleStopSession}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    Stop Session
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Video/Audio Capture Panel */}
          <div className="card-elevated overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Live Capture
                </h2>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              <LiveKitCapture
                isActive={isSessionActive}
                onConceptExtracted={handleConceptExtracted}
              />
            </div>
          </div>

          {/* Mind Map Visualization Panel */}
          <div className="card-elevated overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Knowledge Map
                </h2>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <MindMapVisualization concepts={conceptData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
