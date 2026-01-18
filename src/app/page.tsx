
'use client';

import { useRef } from 'react';
import Auth from './auth/page';
import NeuralNetworkBackground from '@/components/NeuralNetworkBackground';

export default function Home() {
  const authSectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="relative w-full snap-y snap-mandatory overflow-y-scroll h-screen">
      <NeuralNetworkBackground />
      {/* Landing Page Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-transparent overflow-hidden snap-start">
        <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white animate-fade-in-down">
            SmartSketch
          </h1>
        </main>
        <div className="absolute bottom-10 w-full flex justify-center">
          <button
            onClick={scrollToAuth}
            className="animate-bounce cursor-pointer"
            aria-label="Scroll to authentication"
          >
            <div className="flex flex-col items-center text-gray-300 hover:text-white transition-colors">
              <span className="text-lg">Get Started</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Auth Section */}
      <div ref={authSectionRef} className="min-h-screen w-full snap-start">
        <Auth scrollRootRef={scrollContainerRef} />
      </div>
    </div>
  );
}
