'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Users, 
  Filter, 
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import ClubCard from '@/components/ui/ClubCard';

interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  category?: string;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Technical', 'Non-Technical', 'Social', 'Competition', 'Other'];

  useEffect(() => {
    fetchClubs();
  }, []);

  async function fetchClubs() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (club.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Command Center
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <div className="inline-flex items-center space-x-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Global Directory</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-none">
                Organizations
              </h1>
              <p className="text-muted font-bold tracking-tight max-w-xl leading-relaxed text-lg">
                Explore the full network of student-led communities at MIT Manipal. Join, lead, and grow.
              </p>
            </div>
            
            <div className="flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] min-w-[200px] backdrop-blur-md">
              <div className="text-center">
                <span className="block text-5xl font-black text-white tabular-nums tracking-tighter leading-none">
                  {clubs.length}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-2 block">
                  Active Units
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="glass-card mb-16 p-6 rounded-[2.5rem] border border-white/5 sticky top-28 z-40">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search organizations..."
                className="w-full pl-16 pr-6 py-4 rounded-2xl bg-black border border-white/10 text-sm placeholder:text-muted/50 focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-white shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4 overflow-x-auto pb-2 lg:pb-0 no-scrollbar w-full lg:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-white text-black shadow-2xl'
                      : 'bg-white/[0.03] text-muted hover:text-white hover:bg-white/[0.08] border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/[0.02] rounded-[2.5rem] h-[350px] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredClubs.map(club => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white/[0.01] rounded-[3.5rem] border-2 border-dashed border-white/5">
            <div className="inline-block p-10 bg-white/[0.03] rounded-full mb-8 text-indigo-400">
              <Users className="w-16 h-16" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">No organizations found</h3>
            <p className="text-muted font-medium text-lg leading-relaxed max-w-sm mx-auto">
              Adjust your search or filters to discover new communities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
