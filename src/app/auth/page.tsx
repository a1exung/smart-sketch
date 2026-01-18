
'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import NeuralNetworkBackground from '@/components/NeuralNetworkBackground';

type AuthPageProps = {
  // When embedded in the landing page, we pass the scroll container root
  scrollRootRef?: React.RefObject<HTMLElement>;
};

export default function AuthPage({ scrollRootRef }: AuthPageProps) {
  const router = useRouter();
  const { signUp, signIn, user, loading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleElements, setVisibleElements] = useState<Set<number>>(new Set());
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingOverride, setLoadingOverride] = useState(false);

  // Prevent indefinite loading: if loading persists for >2s, show the forms anyway
  useEffect(() => {
    if (!loading) {
      setLoadingOverride(false);
      return;
    }
    const t = setTimeout(() => setLoadingOverride(true), 2000);
    return () => clearTimeout(t);
  }, [loading]);

  // Only auto-redirect on mount if already logged in, not after login action
  useEffect(() => {
    console.log('[AuthPage] Mount check - user:', user?.email ?? 'null', 'loading:', loading, 'embedded:', !!scrollRootRef);
  }, [user, loading, scrollRootRef]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          setVisibleElements((prev) => {
            const newSet = new Set(prev);
            if (entry.isIntersecting) {
              newSet.add(index);
            } else {
              newSet.delete(index);
            }
            return newSet;
          });
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px 0px 0px',
        root: scrollRootRef?.current ?? null,
      }
    );

    const elements = containerRef.current?.querySelectorAll('[data-index]');
    elements?.forEach((el) => observer.observe(el));
    
    // Immediately mark all elements as visible on mount
    const elementArray = Array.from(elements || []);
    setVisibleElements(new Set(
      elementArray.map((el) => parseInt(el.getAttribute('data-index') || '0'))
    ));

    return () => observer.disconnect();
  }, [isLogin, scrollRootRef]);

  const isVisible = (index: number) => visibleElements.has(index);

  const handleToggle = () => {
    setError('');
    // Animate each field out in sequence (100ms stagger per field)
    const fieldCount = isLogin ? 5 : 7; // login: 2 fields + header, toggle link, button = 5 total | register: 5 fields + header, toggle link, button = 7 total
    const staggerTime = fieldCount * 100; // Time to remove all from visible set
    const animationDuration = 1000; // CSS transition duration
    const totalAnimationTime = staggerTime + animationDuration; // Wait for stagger + full animation
    
    setIsAnimatingOut(true);
    // Remove elements from visible set one by one to trigger staggered exit animation
    for (let i = 0; i <= fieldCount; i++) {
      setTimeout(() => {
        setVisibleElements((prev) => {
          const newSet = new Set(prev);
          newSet.delete(i);
          return newSet;
        });
      }, i * 100);
    }
    
    // Switch form after all fields have animated out completely
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimatingOut(false);
      setVisibleElements(new Set()); // Clear visible set first
      
      // Wait for React to update DOM with new form, then add fields back with stagger
      setTimeout(() => {
        const elements = containerRef.current?.querySelectorAll('[data-index]');
        const elementArray = Array.from(elements || []);
        
        // Sort by data-index to ensure proper order
        elementArray.sort((a, b) => {
          const idxA = parseInt(a.getAttribute('data-index') || '0');
          const idxB = parseInt(b.getAttribute('data-index') || '0');
          return idxA - idxB;
        });
        
        // Add header first (index 0)
        setVisibleElements(new Set([0]));
        
        // Then add each field one by one with 150ms stagger
        elementArray.forEach((el) => {
          const index = parseInt(el.getAttribute('data-index') || '0');
          if (index !== 0) { // Skip header, already added
            setTimeout(() => {
              setVisibleElements((prev) => new Set(prev).add(index));
            }, (index) * 150);
          }
        });
      }, 50); // Wait for DOM to fully update with new form
    }, totalAnimationTime);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('[AuthPage] Login attempt started');

    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setError('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);
    console.log('[AuthPage] Calling signIn...');
    const { error: signInError } = await signIn(loginEmail, loginPassword);

    if (signInError) {
      console.error('[AuthPage] Login failed:', signInError.message);
      setError(signInError.message || 'Failed to login. Please check your credentials.');
      setIsSubmitting(false);
    } else {
      console.log('[AuthPage] Login successful, redirecting to home...');
      router.push('/home');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerFirstName || !registerLastName || !registerEmail || !registerPassword || !registerConfirm) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) {
      setError('Please enter a valid email');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (registerPassword !== registerConfirm) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const { error: signUpError } = await signUp(registerEmail, registerPassword, {
      firstName: registerFirstName,
      lastName: registerLastName
    });

    if (signUpError) {
      setError(signUpError.message || 'Failed to register. Please try again.');
      setIsSubmitting(false);
    } else {
      setError('Registration successful! Please check your email to confirm your account, then login.');
      setIsSubmitting(false);
    }
  };

  if (loading && !loadingOverride && !scrollRootRef) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent relative">
        <NeuralNetworkBackground />
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-white">Loading...</h1>
          <p className="text-gray-300 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent relative">
      {!scrollRootRef && <NeuralNetworkBackground />}
      <div ref={containerRef} className="relative z-10 w-full max-w-md p-8 space-y-8">
        {/* Header */}
        <h1
          data-index="0"
          className={`text-3xl font-bold text-center text-white transition-all duration-300 ${
            isAnimatingOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {isLogin ? 'Login' : 'Register'}
        </h1>

        {isLogin && (
          <form onSubmit={handleLogin} className="flex flex-col space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <input
              type="email"
              placeholder="Email"
              data-index="1"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={isSubmitting}
              className={`px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-1000 transform bg-gray-800 text-white placeholder-gray-400 disabled:bg-gray-700 ${
                isVisible(1)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-8'
              }`}
            />
            <input
              type="password"
              placeholder="Password"
              data-index="2"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              disabled={isSubmitting}
              className={`px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-1000 transform bg-gray-800 text-white placeholder-gray-400 disabled:bg-gray-700 ${
                isVisible(2)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-8'
              }`}
            />
            <button
              type="submit"
              data-index="3"
              disabled={isSubmitting}
              className={`px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-1000 transform ${
                isVisible(3)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-8'
              }`}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
            <p
              data-index="4"
              className={`text-center text-gray-300 transition-all duration-1000 transform ${
                isVisible(4)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-8'
              }`}
            >
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleToggle}
                disabled={isSubmitting}
                className="text-blue-400 hover:text-blue-300 underline cursor-pointer font-semibold disabled:text-gray-400"
              >
                Register
              </button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {!isLogin && (
          <form onSubmit={handleRegister} className="flex flex-col space-y-4">
            {error && (
              <div className={`p-3 border rounded-lg text-sm ${
                error.includes('successful')
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-red-100 border-red-400 text-red-700'
              }`}>
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="First Name"
              data-index="1"
              value={registerFirstName}
              onChange={(e) => setRegisterFirstName(e.target.value)}
              disabled={isSubmitting}
              className={`px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-1000 transform bg-gray-800 text-white placeholder-gray-400 disabled:bg-gray-700 ${
                isVisible(1)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              }`}
            />
            <input
              type="text"
              placeholder="Last Name"
              data-index="2"
              value={registerLastName}
              onChange={(e) => setRegisterLastName(e.target.value)}
              disabled={isSubmitting}
              className={`px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-1000 transform bg-gray-800 text-white placeholder-gray-400 disabled:bg-gray-700 ${
                isVisible(2)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              }`}
            />
            <input
              type="email"
              placeholder="Email"
              data-index="3"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              disabled={isSubmitting}
              className={`px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-1000 transform bg-gray-800 text-white placeholder-gray-400 disabled:bg-gray-700 ${
                isVisible(3)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              }`}
            />
            <input
              type="password"
              placeholder="Password"
              data-index="4"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              disabled={isSubmitting}
              className={`px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-1000 transform bg-gray-800 text-white placeholder-gray-400 disabled:bg-gray-700 ${
                isVisible(4)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              }`}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              data-index="5"
              value={registerConfirm}
              onChange={(e) => setRegisterConfirm(e.target.value)}
              disabled={isSubmitting}
              className={`px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-1000 transform bg-gray-800 text-white placeholder-gray-400 disabled:bg-gray-700 ${
                isVisible(5)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              }`}
            />
            <button
              type="submit"
              data-index="6"
              disabled={isSubmitting}
              className={`px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-1000 transform ${
                isVisible(6)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              }`}
            >
              {isSubmitting ? 'Creating account...' : 'Register'}
            </button>
            <p
              data-index="7"
              className={`text-center text-gray-300 transition-all duration-1000 transform ${
                isVisible(7)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              }`}
            >
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleToggle}
                disabled={isSubmitting}
                className="text-blue-400 hover:text-blue-300 underline cursor-pointer font-semibold disabled:text-gray-400"
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

