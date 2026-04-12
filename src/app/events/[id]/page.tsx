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

    try {
      const { error } = await supabase
        .from('registrations')
        .insert({
          event_id: id,
          user_id: session.user.id,
          status: 'registered'
        });

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('You are already registered for this event.');
        } else {
          setErrorMessage(error.message);
        }
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Event not found</h2>
        <Link href="/" className="text-indigo-600 font-bold hover:underline flex items-center">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  const date = new Date(event.date_time);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header Image */}
      <div className="relative h-[40vh] md:h-[60vh] w-full">
        <img 
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <Link 
          href="/"
          className="absolute top-8 left-8 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all z-20"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="container mx-auto px-4">
            <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-bold uppercase tracking-widest mb-4 inline-block">
              {event.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 italic text-gray-600 text-lg leading-relaxed">
              {event.description}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl flex items-start space-x-4">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Date & Time</h4>
                  <p className="text-gray-600">{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-gray-600 font-medium">{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl flex items-start space-x-4">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Location</h4>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Registration */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100 text-gray-500 font-medium">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-indigo-400 font-bold" />
                  <span>Available Capacity</span>
                </div>
                <span className="text-gray-900 font-bold text-lg">{event.capacity} Spots</span>
              </div>

              {registrationStatus === 'success' ? (
                <div className="text-center py-6">
                  <div className="inline-block p-4 bg-green-100 rounded-full text-green-600 mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">You're going!</h3>
                  <p className="text-gray-500 mb-6">A confirmation has been sent to your student email.</p>
                  <Link href="/my-events" className="text-indigo-600 font-bold hover:underline">
                    View My Events
                  </Link>
                </div>
              ) : registrationStatus === 'error' ? (
                <div className="text-center py-6">
                  <div className="inline-block p-4 bg-red-100 rounded-full text-red-600 mb-4">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Failed</h3>
                  <p className="text-red-500 mb-6">{errorMessage}</p>
                  <button 
                    onClick={() => setRegistrationStatus('idle')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : isRegistered ? (
                <div className="text-center py-6">
                  <div className="inline-block p-4 bg-indigo-50 rounded-full text-indigo-600 mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Already Registered</h3>
                  <p className="text-gray-500 mb-6">You are secured for this event.</p>
                  <Link href="/my-events" className="w-full inline-block py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200">
                    Get QR Code
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-5 gradient-bg text-white rounded-2xl font-bold text-xl shadow-lg shadow-indigo-200 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  {registering ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Register for Event'}
                </button>
              )}

              <p className="mt-6 text-center text-sm text-gray-400">
                Managed by <span className="text-gray-600 font-bold uppercase tracking-wider">{event.club_name}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
