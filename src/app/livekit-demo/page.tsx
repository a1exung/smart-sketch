'use client';

import LiveKitCapture from '@/components/LiveKitCapture';

export default function LiveKitDemoPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-4xl h-full max-h-[80vh] p-4">
        <LiveKitCapture isActive={true} onConceptExtracted={() => {}} />
      </div>
    </div>
  );
}
