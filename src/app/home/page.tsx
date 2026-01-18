"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="relative w-full min-h-screen bg-gray-50 overflow-hidden">
        {/* Logout - top right */}
        <div className="absolute top-6 right-6">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Welcome + Actions */}
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center space-y-10">
          <div>
            <h1 className="text-6xl md:text-8xl font-bold text-gray-800 animate-fade-in-down">
              Welcome Back
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mt-4 animate-fade-in-down">
              Ready to sketch your ideas?
            </p>
          </div>

          <div className="w-full max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8">
            {/* New Sketch Option */}
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start a New Sketch</h3>
              <p className="text-gray-600 text-center mb-6">Begin live feed or upload media</p>
              <Link
                href="/record"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Begin
              </Link>
            </div>

            {/* Past Sketches Option */}
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">View Past Sketches</h3>
              <p className="text-gray-600 text-center mb-6">Refresh and interact with past sketches</p>
              <Link
                href="/demo"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
