'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Loader2, ArrowRight, QrCode as QrIcon } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

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

      // Generate QRs for all registrations
      const qrs: Record<string, string> = {};
      for (const reg of data || []) {
        const qr = await QRCode.toDataURL(JSON.stringify({
          registrationId: reg.id,
          eventId: reg.event_id,
          userId: session.user.id
        }));
        qrs[reg.id] = qr;
      }
      setQrCodeData(qrs);

    } catch (error) {
      console.error('Error fetching my events:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const upcoming = registrations.filter(r => new Date(r.events.date_time) > new Date());
  const past = registrations.filter(r => new Date(r.events.date_time) <= new Date());

  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-32">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Registered Events</h1>
        <p className="text-gray-500 mb-12">Track your participation and access your check-in codes.</p>

        {registrations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="inline-block p-6 bg-gray-50 rounded-full mb-6 text-gray-400">
              <Calendar className="w-16 h-16" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You haven't registered for any events yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Explore upcoming events from your favorite clubs and start getting involved!</p>
            <Link href="/" className="inline-flex items-center px-8 py-4 gradient-bg text-white rounded-2xl font-bold shadow-lg shadow-indigo-200">
              Browse Events <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                  Upcoming Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcoming.map(reg => (
                    <RegistrationCard 
                      key={reg.id} 
                      registration={reg} 
                      qrUrl={qrCodeData[reg.id]} 
                    />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="w-3 h-3 bg-gray-400 rounded-full mr-3" />
                  Past Participation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grayscale opacity-75">
                  {past.map(reg => (
                    <RegistrationCard 
                      key={reg.id} 
                      registration={reg} 
                      qrUrl={qrCodeData[reg.id]} 
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
  qrUrl, 
  isPast = false 
}: { 
  registration: Registration; 
  qrUrl?: string;
  isPast?: boolean;
}) {
  const { events: event } = registration;
  const date = new Date(event.date_time);
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full">
      <div className="relative h-48">
        <img 
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
          {registration.status}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">{event.clubs.name}</p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
            <span>{date.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" />
            <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {!isPast && (
          <button 
            onClick={() => setShowQR(true)}
            className="w-full py-3 bg-gray-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all mt-auto"
          >
            <QrIcon className="w-4 h-4 mr-2" />
            Show Check-in QR
          </button>
        )}
      </div>

      {/* QR Code Modal Overlay */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
            >
              Close
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Check-in Terminal</h3>
            <p className="text-gray-500 mb-8 text-sm">Present this code at the event entrance.</p>
            
            <div className="bg-gray-50 p-6 rounded-3xl inline-block mb-8 border-2 border-dashed border-gray-200">
              {qrUrl ? (
                <img src={qrUrl} alt="Check-in QR" className="w-48 h-48" />
              ) : (
                <Loader2 className="w-48 h-48 animate-spin text-gray-200" />
              )}
            </div>
            
            <div className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-1">
              Event ID
            </div>
            <div className="text-gray-400 font-mono text-[10px] break-all">
              {registration.id}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
