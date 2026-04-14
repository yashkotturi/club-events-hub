'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  MapPin, 
  ArrowLeft, 
  Loader2, 
  ExternalLink,
  Calendar,
  Globe,
  Star
} from 'lucide-react';
import Link from 'next/link';
import EventTimelineCard from '@/components/ui/EventTimelineCard';
import Badge from '@/components/ui/Badge';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string | null;
  instagram_url: string | null;
  is_verified: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  category: string;
  image_url: string;
}

export default function ClubProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClubData();
    }
  }, [id]);

  async function fetchClubData() {
    try {
      setLoading(true);
      
      // Fetch Club Details
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (clubError) throw clubError;
      setClub(clubData);

      // Fetch upcoming events for this club
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('club_id', id)
        .order('date_time', { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

    } catch (error) {
      console.error('Error fetching club details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <div className="p-8 bg-white/[0.03] rounded-full mb-8 text-indigo-400">
          <Building2 className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase">Club Not Found</h2>
        <Link href="/" className="btn-primary inline-flex items-center text-[10px] uppercase tracking-[0.2em] px-10 py-5">
          <ArrowLeft className="mr-3 w-4 h-4" /> Return to Base
        </Link>
      </div>
    );
  }

  // Fallback logo using Identicon
  const logoUrl = club.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(club.name)}`;

  return (
    <div className="bg-black min-h-screen pb-32">
      {/* 1. Hero / Identity Section */}
      <section className="relative h-[45vh] md:h-[55vh] w-full overflow-hidden">
        {/* Animated Background Blur */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" />
        </div>
        
        {/* Navigation */}
        <div className="absolute top-12 left-0 right-0 z-30">
          <div className="container mx-auto px-6">
            <Link 
              href="/"
              className="inline-flex items-center p-4 bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/[0.1] transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Identity Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pt-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img 
              src={logoUrl} 
              alt={club.name}
              className="relative w-32 h-32 md:w-44 md:h-44 bg-white/[0.02] border border-white/10 rounded-[3rem] p-4 md:p-8 backdrop-blur-xl shadow-2xl object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
          
          <div className="text-center mt-12 px-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                {club.category}
              </span>
              {club.is_verified && (
                <div className="flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-[0.3em]">
                  <Star className="w-3 h-3 mr-2 fill-emerald-400" />
                  Verified Entity
                </div>
              )}
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">{club.name}</h1>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
      </section>

      {/* 2. Main Content Layout */}
      <div className="container mx-auto px-6 -mt-10 relative z-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar: Narrative */}
          <div className="lg:col-span-8 space-y-12">
            <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                <Building2 className="w-32 h-32" />
              </div>
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-10">Historical Context</h3>
              <p className="text-white font-medium text-2xl leading-[1.6] tracking-tight mb-12 italic">
                "{club.description}"
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-muted">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block mb-1">Status</span>
                    <span className="text-white font-bold text-lg">Active Network</span>
                  </div>
                </div>
                {club.instagram_url && (
                  <a 
                    href={club.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-6 group/link"
                  >
                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-muted group-hover/link:text-indigo-400 group-hover/link:border-indigo-500/30 transition-all">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block mb-1">Engagement</span>
                      <span className="text-white font-bold text-lg group-hover/link:text-indigo-400 transition-colors">Official Portal</span>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Upcoming Actions Section */}
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Upcoming Events</h2>
                  <p className="text-muted font-bold tracking-tight">Active protocols hosted by {club.name}.</p>
                </div>
                <div className="hidden sm:block h-px flex-1 bg-white/5 mx-12" />
                <Badge variant="outline" className="px-6 py-2 border-indigo-500/20 text-indigo-400">
                  {events.length} Active
                </Badge>
              </div>

              {events.length > 0 ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {events.map(event => (
                    <EventTimelineCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5">
                  <div className="inline-block p-6 bg-white/[0.03] rounded-full mb-6 text-muted">
                    <Calendar className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No active protocols</h3>
                  <p className="text-muted text-sm max-w-xs mx-auto">This entity has no upcoming actions scheduled in the current phase.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Quick Metadata */}
          <div className="lg:col-span-4">
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 sticky top-32 space-y-10">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Administrative Data</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center text-muted">
                      <Users className="w-4 h-4 mr-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Student Pool</span>
                    </div>
                    <span className="text-white font-black tabular-nums">1.2k+</span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center text-muted">
                      <MapPin className="w-4 h-4 mr-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Main Sector</span>
                    </div>
                    <span className="text-white font-black">MIT Campus</span>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-white/5">
                <button className="w-full py-6 gradient-bg text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center">
                  Request Membership
                </button>
                <p className="mt-6 text-center text-[8px] font-black text-muted uppercase tracking-[0.2em]">External Handshake Required</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
