import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/30">
      {/* Hero Section */}
      <main className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100 via-transparent to-transparent opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 shadow-soft">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary-900">AI-Powered Learning Visualization</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-slate-900">Transform Lectures</span>
              <span className="block mt-2 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
                Into Visual Knowledge
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed">
              Capture live video and audio, extract key concepts with AI, and watch as
              your lecture transforms into an interactive mind map in real-time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/lecture" className="btn-primary group">
                Start Lecture Session
                <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link href="/demo" className="btn-secondary">
                View Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary-600">Real-time</div>
                <div className="text-sm text-slate-600">AI Processing</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary-600">Visual</div>
                <div className="text-sm text-slate-600">Mind Maps</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary-600">Live</div>
                <div className="text-sm text-slate-600">Capture</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 group hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/40 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Live Capture</h3>
              <p className="text-slate-600 leading-relaxed">
                Capture high-quality video and audio from lectures using LiveKit's real-time streaming infrastructure.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 group hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-accent-500/30 group-hover:shadow-xl group-hover:shadow-accent-500/40 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Processing</h3>
              <p className="text-slate-600 leading-relaxed">
                Powered by OpenAI to intelligently extract key concepts, relationships, and insights from your content.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 group hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:shadow-xl group-hover:shadow-emerald-500/40 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Interactive Maps</h3>
              <p className="text-slate-600 leading-relaxed">
                Dynamic mind maps built with ReactFlow that grow and evolve as new concepts are discovered.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="card-elevated p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Getting Started</h2>
              <p className="text-slate-600">Follow these simple steps to begin your enhanced learning experience</p>
            </div>

            <div className="space-y-6">
              {[
                { num: '1', title: 'Configure Credentials', desc: 'Set up your LiveKit and OpenAI API keys in .env.local' },
                { num: '2', title: 'Start Session', desc: 'Click "Start Lecture Session" and grant camera and microphone permissions' },
                { num: '3', title: 'Watch Magic Happen', desc: 'AI extracts concepts in real-time and builds an interactive mind map' },
                { num: '4', title: 'Learn Better', desc: 'Navigate the visual representation to understand connections and relationships' },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-slate-600 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-600 text-sm">
            Smart Sketch - Empowering learners through AI-driven visualization
          </p>
        </div>
      </footer>
    </div>
  );
}
