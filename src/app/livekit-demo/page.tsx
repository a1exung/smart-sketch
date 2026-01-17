'use client';

import { useState } from 'react';
import LiveKitCapture from '@/components/LiveKitCapture';

export default function LiveKitDemoPage() {
  const [isActive, setIsActive] = useState(false);
  const [concepts, setConcepts] = useState<any[]>([]);

  const handleConceptExtracted = (concept: any) => {
    setConcepts((prev) => [...prev, concept]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-4xl h-[60vh] bg-white rounded-lg shadow-lg border">
        <LiveKitCapture isActive={isActive} onConceptExtracted={handleConceptExtracted} />
      </div>
      <div className="mt-8">
        {!isActive ? (
          <button
            onClick={() => setIsActive(true)}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={() => setIsActive(false)}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          >
            Stop Session
          </button>
        )}
      </div>
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800">Extracted Concepts</h2>
        <div className="mt-4 p-4 bg-white rounded-lg shadow-inner h-48 overflow-y-auto border">
          {concepts.length > 0 ? (
            <ul>
              {concepts.map((concept, index) => (
                <li key={index} className="text-gray-700 py-1">
                  {JSON.stringify(concept)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No concepts extracted yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}