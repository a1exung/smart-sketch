'use client';

import { useState } from 'react';
import MindMapVisualization from '@/components/MindMapVisualization';
import Link from 'next/link';
import NeuralNetworkBackground from '@/components/NeuralNetworkBackground';

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
    <div className="min-h-screen bg-transparent relative">
      <NeuralNetworkBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-surface-border bg-background-secondary/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-background font-display font-bold">S</span>
            </div>
            <span className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              SmartSketch
            </span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span className="text-accent text-sm font-medium">Demo Mode</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Info Card */}
        <div className="card p-6 mb-6 animate-fade-in-down">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                How SmartSketch Works
              </h1>
              <p className="text-foreground-muted max-w-xl">
                Watch how concepts from a lecture are progressively extracted and visualized.
                In a live session, this happens in real-time as you speak.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={step === 0}
                className="px-4 py-2.5 rounded-xl glass text-foreground-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={step === demoConceptsSequence.length - 1}
                className="px-4 py-2.5 rounded-xl btn-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
              >
                Next Concept
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl glass text-foreground-muted hover:text-foreground transition-all font-medium"
              >
                Reset
              </button>

              {/* Progress indicator */}
              <div className="hidden sm:flex items-center gap-2 ml-2">
                {demoConceptsSequence.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx <= step ? 'bg-primary' : 'bg-surface-border-light'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile step counter */}
          <div className="sm:hidden mt-4 text-center">
            <span className="text-foreground-muted text-sm">
              Step {step + 1} of {demoConceptsSequence.length}
            </span>
          </div>
        </div>

        {/* Visualization Card */}
        <div className="card overflow-hidden h-[calc(100vh-280px)] animate-fade-in-up">
          <div className="h-full">
            <MindMapVisualization concepts={demoConceptsSequence[step]} />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-primary-dark" />
            <span className="text-foreground-muted">Main Topic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-accent to-accent-dark" />
            <span className="text-foreground-muted">Key Concept</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-surface-border-light bg-background-elevated" />
            <span className="text-foreground-muted">Detail</span>
          </div>
        </div>
      </div>
    </div>
  );
}
