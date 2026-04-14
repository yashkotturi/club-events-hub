'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, X } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] px-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Branding - Header outside the card */}
      <div className="text-center mb-8 relative z-10">
         <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              Club<span className="text-indigo-400">Hub</span>
            </span>
          </Link>
      </div>

      <div className="w-full max-w-[420px] relative z-20">
        {/* The Glass Card wrapping border */}
        <div className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-br from-emerald-400/30 via-white/5 to-transparent shadow-2xl">
          <div className="relative bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 overflow-hidden">
            
            {/* Inner top-left intense glow */}
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="relative z-10 text-center mb-10">
              <h2 className="text-3xl font-medium text-white tracking-tight mb-2">Welcome back</h2>
              <p className="text-sm text-gray-400">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center text-red-400 text-xs font-medium">
                <X className="w-4 h-4 mr-3 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 relative z-10">
              <div className="bg-[#111] border border-white/5 rounded-2xl p-3 px-5 focus-within:border-emerald-500/30 transition-colors">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Email</span>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  className="bg-transparent w-full outline-none text-sm text-white placeholder:text-gray-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="bg-[#111] border border-white/5 rounded-2xl p-3 px-5 focus-within:border-emerald-500/30 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Password</span>
                  <a href="#" className="text-[10px] text-gray-500 hover:text-emerald-400 transition-colors">Forgot?</a>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="bg-transparent w-full outline-none text-sm text-white placeholder:text-gray-700 tracking-widest"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Advanced Submit Pill */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-between pl-6 pr-2 py-2 bg-[#141414] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] hover:border-white/10 transition-all group disabled:opacity-50 shadow-inner"
                >
                  <span className="text-sm text-gray-300 font-medium">Continue with Email</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-300 group-active:scale-95 transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    {loading ? (
                      <Loader2 className="animate-spin w-4 h-4 text-black" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-black" />
                    )}
                  </div>
                </button>
              </div>
            </form>

            <div className="mt-10 relative z-10 text-center">
              <p className="text-xs text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
