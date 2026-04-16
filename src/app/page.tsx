'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  Calendar as CalendarIcon,
  Filter,
  ChevronRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { format, isSameDay } from 'date-fns';
import Calendar from '@/components/ui/Calendar';
import EventTimelineCard from '@/components/ui/EventTimelineCard';
import ClubCard from '@/components/ui/ClubCard';
import Marquee from '@/components/ui/Marquee';

const MOCK_CLUBS: Club[] = [
  { id: '1', name: 'Royal Oaks CC', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Royal Oaks CC', category: 'Social' },
  { id: '2', name: 'Harbor Yacht Club', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Harbor Yacht Club', category: 'Other' },
  { id: '3', name: 'The Ivy League', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=The Ivy League', category: 'Seminar' },
  { id: '4', name: 'Summit Alpine', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Summit Alpine', category: 'Social' },
  { id: '5', name: 'Regency Polo', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Regency Polo', category: 'Social' },
  { id: '6', name: 'Founders Guild', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Founders Guild', category: 'Workshop' },
  { id: '7', name: 'Classic Racquet', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Classic Racquet', category: 'Competition' },
  { id: '8', name: 'Legacy Rowing', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Legacy Rowing', category: 'Other' },
  { id: '9', name: 'Old Town Social', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Old Town Social', category: 'Social' },
  { id: '10', name: 'Fairway Greens', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Fairway Greens', category: 'Other' },
  { id: '11', name: 'The Archery Club', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=The Archery Club', category: 'Workshop' },
  { id: '12', name: 'Meridian Squash', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Meridian Squash', category: 'Competition' },
  { id: '13', name: 'Stonegate Manor', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Stonegate Manor', category: 'Social' },
  { id: '14', name: 'The Chess House', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=The Chess House', category: 'Workshop' },
  { id: '15', name: 'Atlas Equestrian', logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Atlas Equestrian', category: 'Other' },
];

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  capacity: number;
  image_url: string;
  category: string;
  club_id: string;
  club_name?: string;
}

interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  category?: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch Events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          clubs (
            name
          )
        `)
        .order('date_time', { ascending: true });

      if (eventsError) throw eventsError;

      const formattedEvents = (eventsData || []).map((e: any) => ({
        ...e,
        club_name: e.clubs?.name || 'Unknown Club'
      }));

      setEvents(formattedEvents);

      // Fetch Clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .limit(6);

      if (clubsError) throw clubsError;

      // Real database entries must be used to ensure valid UUIDs for routing
      setClubs(clubsData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const categories = ['All', 'Technical', 'Non-Technical', 'Social', 'Competition', 'Other'];

  const globalFilteredEvents = events.filter(event => {
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredEvents = globalFilteredEvents.filter(event => {
    const eventDate = new Date(event.date_time);
    return isSameDay(eventDate, selectedDate);
  });

  // Map of dates with events for calendar indicators
  const eventDateMarkers = events.reduce((acc, event) => {
    const key = format(new Date(event.date_time), 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(event.category);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* 1. Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden isolate">
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-500/10 to-transparent -z-10 rounded-full blur-[120px] opacity-40" />

        {/* Logo Marquee Background - Supercharged Visibility */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 pointer-events-none space-y-8 opacity-[0.35]">
          <Marquee speed="medium" direction="left">
            {MOCK_CLUBS.map(club => (
              <div key={club.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center w-28 h-28 backdrop-blur-sm">
                <img src={club.logo_url} alt={club.name} className="w-16 h-16 object-contain" />
              </div>
            ))}
          </Marquee>
          <Marquee speed="slow" direction="right">
            {MOCK_CLUBS.slice().reverse().map(club => (
              <div key={club.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center w-28 h-28 backdrop-blur-sm">
                <img src={club.logo_url} alt={club.name} className="w-16 h-16 object-contain" />
              </div>
            ))}
          </Marquee>
        </div>

        <div className="container mx-auto px-6 text-center relative z-20">
          <div className="inline-flex items-center space-x-3 px-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 animate-in fade-in slide-in-from-bottom-4">
            <Sparkles className="w-4 h-4" />
            <span>Empowering Campus Life</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-700">
            Designing the Future <br />
            <span className="text-white opacity-50">of Student Events</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted font-medium mb-16 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
            The premier hub for MIT Manipal students.
            Discover, register, and lead the campus narrative with absolute precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <button
              onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary flex items-center group w-full sm:w-auto justify-center px-12 py-5 shadow-2xl shadow-indigo-500/10"
            >
              Get Started
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              href="/register"
              className="px-10 py-5 bg-white/[0.03] border border-white/5 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/[0.06] transition-all w-full sm:w-auto text-center"
            >
              Join the Network
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Categories & Universal Search Section */}
      <section className="py-8 border-y border-white/5 bg-white/[0.02] backdrop-blur-md relative z-30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6 overflow-x-auto pb-4 lg:pb-0 no-scrollbar w-full lg:w-auto">
              <div className="flex items-center pr-10 border-r border-white/5 shrink-0 mr-6">
                <Filter className="w-4 h-4 mr-3 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Filter by</span>
              </div>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 ${categoryFilter === cat
                      ? 'bg-white text-black shadow-2xl'
                      : 'bg-white/[0.03] text-muted hover:text-white hover:bg-white/[0.08] border border-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Universal Search */}
            <div className="relative w-full lg:w-auto min-w-[320px]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Global Protocol Search..."
                className="w-full pl-16 pr-6 py-4 rounded-full bg-black border border-white/10 text-sm placeholder:text-muted/50 focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-white shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 All Events Listing */}
      <section className="py-32 bg-black overflow-hidden relative border-b border-white/5">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <div className="inline-flex items-center space-x-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Global Discovery</span>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">All Protocols</h2>
              <p className="text-muted font-bold tracking-tight text-lg max-w-xl">Browse all active events across the entire campus network.</p>
            </div>
            
            <div className="hidden md:flex items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] min-w-40 backdrop-blur-md">
              <div className="text-center">
                <span className="block text-4xl font-black text-white tabular-nums tracking-tighter leading-none">{globalFilteredEvents.length}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-2 block">Active</span>
              </div>
            </div>
          </div>
          
          {globalFilteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {globalFilteredEvents.map(event => (
                <EventTimelineCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white/[0.02] rounded-[3.5rem] border border-dashed border-white/5">
               <div className="inline-block p-8 bg-white/[0.03] rounded-full mb-8 text-indigo-400">
                 <CalendarIcon className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-black text-white mb-3 tracking-tight">No active protocols</h3>
               <p className="text-muted font-medium max-w-sm mx-auto">The network is currently dormant.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Calendar Timeline Feature */}
      <section id="explore" className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-24">
            {/* Left: Calendar & Filters */}
            <div className="lg:w-[400px] shrink-0 lg:sticky lg:top-32 h-fit">
              <div className="glass-card p-12 rounded-[3.5rem] border border-white/5">
                <h3 className="text-3xl font-black text-white mb-10 tracking-tighter">Event Calendar</h3>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  eventDates={eventDateMarkers}
                />

                {/* Search moved to global header */}
              </div>
            </div>

            {/* Right: Timeline View */}
            <div className="flex-1">
              <div className="flex items-end justify-between mb-16">
                <div>
                  <h2 className="text-5xl font-black text-white mb-3 tracking-tighter">
                    {format(selectedDate, 'MMMM')} <span className="text-indigo-400">{format(selectedDate, 'do')}</span>
                  </h2>
                  <p className="text-gray-300 font-bold tracking-tight text-lg">Timeline for the selected date on campus.</p>
                </div>
                <div className="hidden sm:flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                  <span>Scroll to explore</span>
                  <div className="w-16 h-px bg-indigo-400/20" />
                </div>
              </div>

              {loading ? (
                <div className="space-y-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/[0.02] rounded-[3rem] h-56 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="space-y-8">
                  {filteredEvents.map(event => (
                    <EventTimelineCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-white/[0.01] rounded-[3.5rem] border-2 border-dashed border-white/5">
                  <div className="inline-block p-8 bg-white/[0.03] rounded-full mb-8 text-indigo-400">
                    <CalendarIcon className="w-14 h-14" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight">No actions on this day</h3>
                  <p className="text-muted font-medium text-lg leading-relaxed max-w-sm mx-auto">Try picking another date or adjusting your filters to find new horizons.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Clubs Listing Section */}
      <section id="clubs" className="py-32 bg-white/[0.01] border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
            <div>
              <div className="inline-flex items-center space-x-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                <Users className="w-4 h-4" />
                <span>Active Networks</span>
              </div>
              <h2 className="text-5xl font-black text-white mb-4 tracking-tighter leading-none">Featured Clubs</h2>
              <p className="text-muted font-bold tracking-tight max-w-xl leading-relaxed text-lg">Join the most active communities at MIT Manipal and grow together in a decentralized ecosystem.</p>
            </div>
            <Link href="/register" className="p-5 bg-white text-black rounded-[1.5rem] transition-all flex items-center group shadow-xl">
              <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Register Club</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {clubs.map(club => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>

          <div className="mt-24 text-center">
            <Link 
              href="/clubs"
              className="inline-block px-16 py-6 bg-white/[0.03] border border-white/5 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-2xl"
            >
              Browse All Clubs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Link href="/" className="text-white font-black tracking-tighter text-2xl">
                Club<span className="text-indigo-400">Hub</span>
              </Link>
              <div className="hidden md:block w-px h-6 bg-white/5" />
              <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">© 2026 Architected by PRISM</p>
            </div>
            <div className="flex items-center space-x-12 text-muted text-[10px] font-black uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-white transition-colors">----</a>
              <a href="#" className="hover:text-white transition-colors">-----</a>
              <a href="#" className="hover:text-white transition-colors">-----</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
