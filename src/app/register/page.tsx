'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, ArrowRight, Sparkles, X } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // University email restriction (basic domain check)
    if (!email.endsWith('.edu')) {
      setError('Please use a valid university email address (.edu)');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/login?message=Registration successful! Please check your email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-16 px-6">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-16">
           <Link href="/" className="inline-flex items-center space-x-3 group mb-10">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                Club<span className="text-indigo-400">Hub</span>
              </span>
            </Link>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">Create Identity</h2>
            <p className="text-muted font-bold text-lg">Join the premier student network at MIT Manipal.</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center text-red-400 text-xs font-bold leading-relaxed">
              <X className="w-5 h-5 mr-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleRegister}>
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4 ml-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-muted/30 w-4 h-4" />
                  <input
                    type="text"
                    required
                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm placeholder:text-muted/20 focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-white shadow-inner"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4 ml-2">University Email</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted/30 w-4 h-4" />
                  <input
                    type="email"
                    required
                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm placeholder:text-muted/20 focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-white shadow-inner"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4 ml-2">Secret (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-muted/30 w-4 h-4" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm placeholder:text-muted/20 focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-white shadow-inner"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center justify-center mt-12 shadow-2xl"
            >
              {loading ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <>
                  Register Now
                  <ArrowRight className="ml-4 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 pt-12 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted leading-relaxed">
              Already have an account?{' '}
              <Link href="/login" className="text-white hover:text-indigo-400 transition-colors ml-2 underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
