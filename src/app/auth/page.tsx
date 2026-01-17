
import Link from 'next/link';

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Get Started</h1>
        <div className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            Login
          </button>
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="#" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
