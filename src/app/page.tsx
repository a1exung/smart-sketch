'use client';

import { useRef } from 'react';
import AuthForm from '@/components/AuthForm';
import LandingNeuralNetworkBackground from '@/components/LandingNeuralNetworkBackground';

export default function Home() {
  const authSectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="relative w-full snap-y snap-mandatory overflow-y-scroll h-screen">
      <LandingNeuralNetworkBackground />

      {/* Landing Page Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-transparent overflow-hidden snap-start">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />

        <main className="flex flex-col items-center justify-center flex-1 px-4 text-center relative">
          {/* Decorative accent line */}
          <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full mb-8 animate-fade-in-down opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]" />

          {/* Main title with gradient */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tight animate-fade-in-down opacity-0 [animation-fill-mode:forwards]">
            <span className="text-gradient-primary">Smart</span>
            <span className="text-foreground">Sketch</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-foreground-muted max-w-xl animate-fade-in-up opacity-0 [animation-delay:0.3s] [animation-fill-mode:forwards]">
            Transform lectures into visual understanding.
            <span className="text-primary"> AI-powered</span> mind maps that grow as you learn.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in-up opacity-0 [animation-delay:0.5s] [animation-fill-mode:forwards]">
            <span className="px-4 py-2 text-sm font-medium rounded-full glass text-foreground-muted">
              Real-time Transcription
            </span>
            <span className="px-4 py-2 text-sm font-medium rounded-full glass text-foreground-muted">
              Visual Mind Maps
            </span>
            <span className="px-4 py-2 text-sm font-medium rounded-full glass text-foreground-muted">
              AI Concept Extraction
            </span>
          </div>
        </main>

        {/* Scroll CTA */}
        <div className="absolute bottom-12 w-full flex justify-center">
          <button
            onClick={scrollToAuth}
            className="group cursor-pointer animate-fade-in-up opacity-0 [animation-delay:0.7s] [animation-fill-mode:forwards]"
            aria-label="Scroll to authentication"
          >
            <div className="flex flex-col items-center gap-2 text-foreground-muted hover:text-primary transition-colors duration-300">
              <span className="text-base font-medium tracking-wide">Get Started</span>
              <div className="w-10 h-10 rounded-full border border-surface-border-light flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                <svg
                  className="w-5 h-5 animate-bounce"
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
            </div>
          </button>
        </div>
      </div>

      {/* Auth Section */}
      <div ref={authSectionRef} className="min-h-screen w-full snap-start">
        <AuthForm scrollRootRef={scrollContainerRef} />
      </div>
    </div>
  );
}
