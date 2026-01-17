'use client';

import { useState } from 'react';
import MindMapVisualization from '@/components/MindMapVisualization';
import Link from 'next/link';

// Sample demo data showing how concepts are structured
const demoConceptsSequence = [
  [
    { id: '1', label: 'Introduction to React', type: 'main' }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' },
    { id: '2', label: 'Components', type: 'concept', parent: '1' }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' },
    { id: '2', label: 'Components', type: 'concept', parent: '1' },
    { id: '3', label: 'JSX', type: 'concept', parent: '1' }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' },
    { id: '2', label: 'Components', type: 'concept', parent: '1' },
    { id: '3', label: 'JSX', type: 'concept', parent: '1' },
    { id: '4', label: 'Functional Components', type: 'detail', parent: '2' }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' },
    { id: '2', label: 'Components', type: 'concept', parent: '1' },
    { id: '3', label: 'JSX', type: 'concept', parent: '1' },
    { id: '4', label: 'Functional Components', type: 'detail', parent: '2' },
    { id: '5', label: 'Class Components', type: 'detail', parent: '2' }
  ],
  [
    { id: '1', label: 'Introduction to React', type: 'main' },
    { id: '2', label: 'Components', type: 'concept', parent: '1' },
    { id: '3', label: 'JSX', type: 'concept', parent: '1' },
    { id: '4', label: 'Functional Components', type: 'detail', parent: '2' },
    { id: '5', label: 'Class Components', type: 'detail', parent: '2' },
    { id: '6', label: 'State Management', type: 'concept', parent: '1' }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Smart Sketch
          </Link>
          <span className="text-gray-600 font-medium">Demo Mode</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Demo: How Smart Sketch Works</h1>
          <p className="text-gray-600 mb-4">
            This demo shows how concepts from a lecture are progressively added to the mind map.
            In a real session, these would be extracted from live audio/video in real-time.
          </p>

          {/* Controls */}
          <div className="flex gap-4 items-center">
            <button
              onClick={handlePrevious}
              disabled={step === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={step === demoConceptsSequence.length - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next Concept
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
            <span className="text-gray-600 ml-auto">
              Step {step + 1} of {demoConceptsSequence.length}
            </span>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-white rounded-lg shadow-md p-4 h-[calc(100vh-280px)]">
          <MindMapVisualization concepts={demoConceptsSequence[step]} />
        </div>
      </div>
    </div>
  );
}
