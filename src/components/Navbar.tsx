'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Calendar, User as UserIcon, LogOut, LayoutDashboard, Compass } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="gradient-bg text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tight">
              <Calendar className="w-8 h-8" />
              <span>ClubHub</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2">
                <Compass className="w-4 h-4" />
                <span>Explore</span>
              </Link>
              {user && (
                <Link href="/my-events" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>My Events</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-75">Student Member</span>
                </div>
                <div className="h-8 w-px bg-white/20 mx-2" />
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium border border-white/20"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-opacity-90 transition-all font-bold shadow-md"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
