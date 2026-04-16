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
  Star,
  Camera,
  Share2,
  Send
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

interface BoardMember {
  id: string;
  name: string;
  role: string;
  image_url?: string;
  bio?: string;
  linkedin_url?: string;
  instagram_url?: string;
}

export default function ClubProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'board'>('overview');

  const mockBoardMembers: BoardMember[] = [
    { id: '1', name: 'Arjun Sharma', role: 'President', bio: 'Strategic lead and community builder.' },
    { id: '2', name: 'Preeti Nair', role: 'General Secretary', bio: 'Operations and event orchestration expert.' },
    { id: '3', name: 'Rohan Gupta', role: 'Technical Lead', bio: 'Full-stack vision and infrastructure architect.' },
    { id: '4', name: 'Sanya Malhotra', role: 'Creative Director', bio: 'Visual identity and branding lead.' },
    { id: '5', name: 'Kabir Singh', role: 'Marketing Head', bio: 'Growth and engagement specialist.' },
    { id: '6', name: 'Ananya Roy', role: 'Treasurer', bio: 'Financial governance and resource planning.' },
  ];

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
        <div className="absolute top-28 left-0 right-0 z-30">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pb-14">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img
              src={logoUrl}
              alt={club.name}
              className="relative w-32 h-32 md:w-44 md:h-44 bg-white/[0.02] border border-white/10 rounded-[3rem] p-4 md:p-8 backdrop-blur-xl shadow-2xl object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
            />
          </div>

          <div className="text-center mt-16 px-6">
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

      {/* Tab Navigator */}
      <div className="container mx-auto px-6 relative z-50 -mt-20 mb-16">
        <div className="flex items-center justify-center">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-2 rounded-[2rem] flex items-center space-x-2 shadow-2xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-black shadow-xl shadow-white/5'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'board'
                  ? 'bg-white text-black shadow-xl shadow-white/5'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              Board Members
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Layout */}
      <div className="container mx-auto px-6 relative z-40">
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-in fade-in duration-700">
            {/* Left Sidebar: Narrative */}
            <div className="lg:col-span-8 space-y-24">
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
            <div className="space-y-16">
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
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 sticky top-32 space-y-12">
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
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                <Users className="w-4 h-4" />
                <span>Executive Leadership</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">Strategic Board</h2>
              <p className="text-muted font-bold tracking-tight max-w-2xl mx-auto text-lg leading-relaxed">
                The core leadership unit driving the vision, operations, and cultural growth of {club.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {mockBoardMembers.map((member) => (
                <div key={member.id} className="glass-card p-12 rounded-[3.5rem] border border-white/5 text-center group hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                  {/* Background Accents */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative mb-12">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/5 z-0" />
                    <div className="relative z-10 inline-block">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                      <div className="relative p-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl">
                        <img 
                          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(member.name)}`}
                          alt={member.name}
                          className="w-32 h-32 rounded-full bg-white/[0.03] transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-20">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] block">
                      {member.role}
                    </span>
                    <h3 className="text-3xl font-black text-white tracking-tighter">
                      {member.name}
                    </h3>
                    <div className="w-12 h-1 bg-white/5 mx-auto rounded-full mb-6 group-hover:w-20 group-hover:bg-indigo-500/30 transition-all duration-700" />
                    <p className="text-muted text-sm font-bold leading-relaxed px-2">
                      {member.bio}
                    </p>
                  </div>

                  {/* Social Action Grid (Inspo-aligned Footer) */}
                  <div className="pt-10 mt-10 border-t border-white/5 flex flex-col items-center relative z-20">
                    <div className="flex items-center space-x-1 mb-8 opacity-40">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      ))}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-muted hover:text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group/icon">
                        <Globe className="w-4 h-4 transition-transform group-hover/icon:scale-110" />
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-muted hover:text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group/icon">
                        <Users className="w-4 h-4 transition-transform group-hover/icon:scale-110" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Social Media Links Section */}
        <div className="mt-32 pt-20 border-t border-white/5 text-center px-6">
          <div className="inline-flex items-center space-x-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
            <Globe className="w-4 h-4" />
            <span>Digital Presence</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-12 leading-none">Connect with the Network</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            {club.instagram_url && (
              <a 
                href={club.instagram_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-indigo-500 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
                <Camera className="w-8 h-8 text-muted group-hover:text-white transition-colors mb-4 relative z-10" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted group-hover:text-white relative z-10">Instagram</span>
              </a>
            )}
            
            <a 
              href="#" 
              className="group relative flex flex-col items-center p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-indigo-500 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
              <Share2 className="w-8 h-8 text-muted group-hover:text-white transition-colors mb-4 relative z-10" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted group-hover:text-white relative z-10">LinkedIn</span>
            </a>

            <a 
              href="#" 
              className="group relative flex flex-col items-center p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-indigo-500 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
              <Send className="w-8 h-8 text-muted group-hover:text-white transition-colors mb-4 relative z-10" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted group-hover:text-white relative z-10">Discord</span>
            </a>

            <a 
              href="#" 
              className="group relative flex flex-col items-center p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-indigo-500 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
              <Globe className="w-8 h-8 text-muted group-hover:text-white transition-colors mb-4 relative z-10" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted group-hover:text-white relative z-10">Website</span>
            </a>
          </div>

          <p className="mt-16 text-[8px] font-black text-muted uppercase tracking-[0.3em]">Authorized Digital Portal — End of Phase</p>
        </div>
      </div>
    </div>
  );
}
