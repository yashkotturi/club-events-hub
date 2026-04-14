'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Loader2, ArrowRight, ExternalLink, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

interface Registration {
  id: string;
  event_id: string;
  status: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    date_time: string;
    location: string;
    image_url: string;
    clubs: {
      name: string;
    };
  };
}

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeData, setQrCodeData] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  async function fetchMyEvents() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login?redirect=/my-events');
        return;
      }

      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          events (
            id,
            title,
            date_time,
            location,
            image_url,
            clubs (
              name
            )
          )
        `)
        .eq('user_id', session.user.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);

      if (error) throw error;
      setRegistrations(data || []);

    } catch (error) {
      console.error('Error fetching my events:', error);
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

  const upcoming = registrations.filter(r => new Date(r.events.date_time) > new Date());
  const past = registrations.filter(r => new Date(r.events.date_time) <= new Date());

  return (
    <div className="min-h-screen bg-black pt-40 pb-32">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <div className="flex items-center space-x-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Personal Dashboard</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">My Experience</h1>
          <p className="text-muted font-bold mt-4 max-w-lg text-lg">Track your registered events and access your check-in portals in the campus ecosystem.</p>
        </div>

        {registrations.length === 0 ? (
          <div className="bg-white/[0.01] rounded-[3.5rem] p-32 text-center border border-white/5 shadow-2xl">
            <div className="inline-block p-10 bg-white/[0.03] rounded-full mb-10 text-indigo-400">
              <Calendar className="w-16 h-16" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">No activations found</h3>
            <p className="text-muted font-medium mb-12 max-w-sm mx-auto leading-relaxed text-lg">You haven't registered for any events yet. Start your journey by exploring the campus hub.</p>
            <Link href="/" className="btn-primary inline-flex items-center text-[10px] uppercase tracking-[0.2em] px-12 py-5 shadow-2xl">
              Explore Events <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-32">
            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-12 pb-8 border-b border-white/5">
                  <h2 className="text-3xl font-black text-white tracking-tighter flex items-center">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full mr-6 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                    Upcoming Actions
                  </h2>
                  <Badge variant="info">{upcoming.length} Events</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {upcoming.map(reg => (
                    <RegistrationCard 
                      key={reg.id} 
                      registration={reg} 
                    />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-12 pb-8 border-b border-white/5">
                  <div className="flex items-center text-3xl font-black text-white tracking-tighter opacity-60">
                    <span className="w-3 h-3 bg-white/20 rounded-full mr-6" />
                    Historical Graph
                  </div>
                  <Badge variant="neutral">{past.length} Attended</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 opacity-40">
                  {past.map(reg => (
                    <RegistrationCard 
                      key={reg.id} 
                      registration={reg} 
                      isPast={true}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RegistrationCard({ 
  registration, 
  isPast = false 
}: { 
  registration: Registration; 
  isPast?: boolean;
}) {
  const { events: event } = registration;
  const date = new Date(event.date_time);
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="bg-white/[0.03] rounded-[3rem] overflow-hidden border border-white/5 flex flex-col h-full card-hover group shadow-2xl backdrop-blur-sm">
      <div className="relative h-60">
        <img 
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'} 
          alt={event.title}
          className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-8 right-8">
          <Badge variant={isPast ? 'neutral' : 'success'}>
            {registration.status}
          </Badge>
        </div>
      </div>

      <div className="p-10 flex-1 flex flex-col">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 leading-none">{event.clubs.name}</p>
        <h3 className="text-2xl font-black text-white mb-8 leading-[1.1] tracking-tighter line-clamp-2">{event.title}</h3>

        <div className="space-y-5 mb-12">
          <div className="flex items-center text-xs font-bold text-muted">
            <Calendar className="w-4 h-4 mr-4 text-indigo-400/60" />
            <span>{date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center text-xs font-bold text-muted">
            <Clock className="w-4 h-4 mr-4 text-indigo-400/60" />
            <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center text-xs font-bold text-muted">
            <MapPin className="w-4 h-4 mr-4 text-indigo-400/60" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {!isPast && (
          <button 
            onClick={() => window.open('https://forms.gle/nK2qvLbHJ599WTU56', '_blank')}
            className="mt-auto w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-2xl"
          >
            <ExternalLink className="w-4 h-4 mr-4" />
            Open Registration Form
          </button>
        )}
      </div>

    </div>
  );
}
