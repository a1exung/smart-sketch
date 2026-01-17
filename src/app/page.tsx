
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50 overflow-hidden">
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-gray-800 animate-fade-in-down">
          SmartSketch
        </h1>
      </main>
      <div className="absolute bottom-10 w-full flex justify-center">
        <Link href="/auth" className="animate-bounce">
          <div className="flex flex-col items-center text-gray-600 hover:text-gray-800">
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
        </Link>
      </div>
    </div>
  );
}
