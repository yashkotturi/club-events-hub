'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
}

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      checkRegistrationStatus();
    }
  }, [id]);

  async function fetchEventDetails() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          clubs (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setEvent({
        ...data,
        club_name: data.clubs?.name || 'Unknown Club'
      });
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkRegistrationStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', id)
      .eq('user_id', session.user.id)
      .neq('status', 'cancelled')
      .single();

    if (data) setIsRegistered(true);
  }

  async function handleRegister() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push(`/login?redirect=/events/${id}`);
      return;
    }

    setRegistering(true);
    setErrorMessage('');

    // Open Google Form in a new tab
    window.open('https://forms.gle/nK2qvLbHJ599WTU56', '_blank');

    try {
      const { error } = await supabase
        .from('registrations')
        .insert({
          event_id: id,
          user_id: session.user.id,
          status: 'registered'
        });

      if (error && error.code !== '23505') {
        setErrorMessage(error.message);
        setRegistrationStatus('error');
      } else {
        setRegistrationStatus('success');
        setIsRegistered(true);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      setRegistrationStatus('error');
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <h2 className="text-3xl font-black text-white mb-6 tracking-tighter">Protocol not found</h2>
        <Link href="/" className="btn-primary inline-flex items-center text-[10px] uppercase tracking-[0.2em] px-10 py-4">
          <ArrowLeft className="mr-3 w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  const date = new Date(event.date_time);

  return (
    <div className="bg-black min-h-screen pb-32">
      {/* Header Image */}
      <div className="relative h-[50vh] md:h-[65vh] w-full">
        <img 
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'} 
          alt={event.title}
          className="w-full h-full object-cover grayscale-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <Link 
          href="/"
          className="absolute top-12 left-12 p-4 bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/[0.1] transition-all z-20"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        <div className="absolute bottom-20 left-0 right-0 z-10">
          <div className="container mx-auto px-6">
            <span className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block">
              {event.category}
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] max-w-4xl">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-2xl italic text-muted text-xl leading-relaxed font-medium">
              "{event.description}"
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] flex items-start space-x-6">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shadow-inner">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-2">Schedule Detail</h4>
                  <p className="text-white font-black text-xl tracking-tighter">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p className="text-indigo-400 font-bold tabular-nums mt-1">{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
              </div>
              
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] flex items-start space-x-6">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shadow-inner">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-2">Sector Location</h4>
                  <p className="text-white font-black text-xl tracking-tighter">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Registration */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] p-10 border border-white/5 shadow-2xl sticky top-32">
              <div className="flex items-center justify-between mb-10 pb-10 border-b border-white/5">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-4 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
                  <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Operational Capacity</span>
                </div>
                <span className="text-white font-black text-2xl tabular-nums tracking-tighter">{event.capacity}</span>
              </div>

              {registrationStatus === 'success' ? (
                <div className="text-center py-10">
                  <div className="inline-block p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-emerald-400 mb-8 shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">Authentication Successful</h3>
                  <p className="text-muted font-bold mb-10 text-sm leading-relaxed">External portal activated. Your session has been synchronized for this event.</p>
                  <Link href="/my-events" className="btn-primary inline-flex text-[10px] font-black uppercase tracking-[0.2em] px-10 py-5">
                    View My Actions
                  </Link>
                </div>
              ) : registrationStatus === 'error' ? (
                <div className="text-center py-10">
                  <div className="inline-block p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-rose-400 mb-8 shadow-inner">
                    <AlertCircle className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">Access Error</h3>
                  <p className="text-rose-400 font-bold mb-10 text-sm opacity-80">{errorMessage}</p>
                  <button 
                    onClick={() => setRegistrationStatus('idle')}
                    className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
                  >
                    Retry Handshake
                  </button>
                </div>
              ) : isRegistered ? (
                <div className="text-center py-10">
                  <div className="inline-block p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] text-indigo-400 mb-8 shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">Registration Secured</h3>
                  <p className="text-muted font-bold mb-10 text-sm leading-relaxed">Your identifier is already locked for this protocol.</p>
                  <Link href="/my-events" className="btn-secondary w-full inline-block py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                    View Registration
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-6 gradient-bg text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {registering ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    'Initiate Registration'
                  )}
                </button>
              )}

              <div className="mt-10 pt-10 border-t border-white/5 text-center">
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-4">Authority</p>
                <div className="inline-block px-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.1em]">
                  {event.club_name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
