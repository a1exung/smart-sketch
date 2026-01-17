import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 bg-gradient-to-b from-blue-50 to-white">
      <main className="flex flex-col gap-8 items-center max-w-4xl">
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Smart Sketch
        </h1>
        
        <p className="text-xl text-center text-gray-700 max-w-2xl">
          Interactive lecture visualization tool that transforms live video and audio 
          into dynamic mind maps and visual aids for enhanced learning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">🎥 Live Capture</h3>
            <p className="text-gray-600">
              Capture video and audio from lectures in real-time using LiveKit
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-purple-600">🧠 AI Processing</h3>
            <p className="text-gray-600">
              Interpret lecture content using AI to extract key concepts and relationships
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-green-600">🗺️ Visual Maps</h3>
            <p className="text-gray-600">
              Generate interactive mind maps using ReactFlow for better understanding
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Link 
            href="/lecture"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Start Lecture Session
          </Link>
          
          <Link 
            href="/demo"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View Demo
          </Link>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Getting Started</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Configure your LiveKit credentials in <code className="bg-white px-2 py-1 rounded">.env.local</code></li>
            <li>Set up OpenAI API key for content interpretation</li>
            <li>Start a lecture session and enable camera/microphone</li>
            <li>Watch as the AI creates a visual mind map in real-time</li>
          </ol>
        </div>
      </main>

      <footer className="text-center text-gray-500 text-sm mt-12">
        <p>Smart Sketch - Enhanced Learning Tool for Everyone</p>
      </footer>
    </div>
  );
}
