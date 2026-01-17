'use client';

import { useState } from 'react';
import MindMapVisualization from '@/components/MindMapVisualization';
import Link from 'next/link';

// Sample demo data showing how concepts are structured
const demoConceptsSequence: Array<Array<{ id: string; label: string; type: 'main' | 'concept' | 'detail'; parent?: string }>> = [
  [
    { id: '1', label: 'Introduction to React', type: 'main' as const }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' as const },
    { id: '2', label: 'Components', type: 'concept' as const, parent: '1' }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' as const },
    { id: '2', label: 'Components', type: 'concept' as const, parent: '1' },
    { id: '3', label: 'JSX', type: 'concept' as const, parent: '1' }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' as const },
    { id: '2', label: 'Components', type: 'concept' as const, parent: '1' },
    { id: '3', label: 'JSX', type: 'concept' as const, parent: '1' },
    { id: '4', label: 'Functional Components', type: 'detail' as const, parent: '2' }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' as const },
    { id: '2', label: 'Components', type: 'concept' as const, parent: '1' },
    { id: '3', label: 'JSX', type: 'concept' as const, parent: '1' },
    { id: '4', label: 'Functional Components', type: 'detail' as const, parent: '2' },
    { id: '5', label: 'Class Components', type: 'detail' as const, parent: '2' }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' as const },
    { id: '2', label: 'Components', type: 'concept' as const, parent: '1' },
    { id: '3', label: 'JSX', type: 'concept' as const, parent: '1' },
    { id: '4', label: 'Functional Components', type: 'detail' as const, parent: '2' },
    { id: '5', label: 'Class Components', type: 'detail' as const, parent: '2' },
    { id: '6', label: 'State Management', type: 'concept' as const, parent: '1' }
  ],
];

export default function DemoPage() {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < demoConceptsSequence.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
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

            <div className="px-4 py-2 bg-accent-50 border border-accent-200 rounded-xl">
              <span className="text-sm font-medium text-accent-900">Demo Mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Info Card */}
        <div className="card-elevated p-8 mb-6 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                Interactive Demo
              </h1>
              <p className="text-slate-600 leading-relaxed">
                Watch how concepts from a lecture are progressively extracted and visualized.
                In a real session, AI processes live audio/video to build this mind map automatically.
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex-shrink-0">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-1">
                  {step + 1}/{demoConceptsSequence.length}
                </div>
                <div className="text-sm text-slate-600">Concepts</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handlePrevious}
              disabled={step === 0}
              className="px-5 py-2.5 bg-white text-slate-700 border-2 border-slate-300 rounded-xl font-semibold hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={step === demoConceptsSequence.length - 1}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
            >
              Next Concept
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>

            {/* Progress Bar */}
            <div className="flex-1 min-w-[200px]">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-600 transition-all duration-500 ease-out"
                  style={{ width: `${((step + 1) / demoConceptsSequence.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="card-elevated overflow-hidden h-[calc(100vh-340px)] animate-scale-in">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Knowledge Map Visualization
              </h2>
            </div>
          </div>
          <div className="h-[calc(100%-60px)]">
            <MindMapVisualization concepts={demoConceptsSequence[step]} />
          </div>
        </div>
      </div>
    </div>
  );
}
