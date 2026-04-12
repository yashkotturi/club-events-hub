'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Calendar as CalendarIcon, MapPin, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
  registration_count?: number;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      // In production, we'd join with clubs table for the club name
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          clubs (
            name
          )
        `)
        .order('date_time', { ascending: true });

      if (error) {
        console.error('Supabase Error:', error.message, error.details, error.hint);
        throw error;
      }
      
      const formattedEvents = (data || []).map((e: any) => ({
        ...e,
        club_name: e.clubs?.name || 'Unknown Club'
      }));

      setEvents(formattedEvents);
    } catch (error: any) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.club_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Workshop', 'Seminar', 'Social', 'Competition', 'Other'];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 gradient-bg z-0" />
        <div className="absolute inset-0 bg-black/20 z-10" />
        
        <div className="container mx-auto px-4 relative z-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Elevate Your <br /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">University Experience</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto font-light">
            Discover, register, and engage with the best student club events on campus. 
            All in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:shadow-xl transition-all flex items-center group"
            >
              Explore Events
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link href="/register" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              Join a Club
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-0 -right-24 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
      </section>

      {/* Explore Section */}
      <section id="explore" className="py-20 bg-gray-50 flex-1">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-xl flex-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Upcoming Events</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search workshops, meetups, or clubs..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all shrink-0 ${
                    categoryFilter === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
              <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                <CalendarIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date_time);
  
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-gray-100 border-opacity-50">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-indigo-600 uppercase tracking-wider">
          {event.category}
        </div>
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center">
          <Users className="w-3.5 h-3.5 mr-1.5" />
          {event.capacity} Spots
        </div>
      </div>
      
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center text-indigo-600 text-sm font-bold mb-3 uppercase tracking-widest">
          {event.club_name}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-1 leading-tight group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-500 text-sm">
            <CalendarIcon className="w-4 h-4 mr-3 text-indigo-400" />
            <span suppressHydrationWarning>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="w-4 h-4 mr-3 text-indigo-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <Link 
          href={`/events/${event.id}`}
          className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold text-center hover:bg-indigo-600 hover:text-white transition-all mt-auto"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
