'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Plus, 
  Calendar, 
  Users, 
  QrCode, 
  Search, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface Club {
  id: string;
  name: string;
}

interface EventStats {
  id: string;
  title: string;
  date_time: string;
  registered: number;
  attended: number;
}

export default function AdminDashboard() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [events, setEvents] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  async function checkAdminAndFetchData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login?redirect=/admin');
        return;
      }

      // Check profile for admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || profile?.role !== 'club_admin') {
        router.push('/');
        return;
      }

      setIsAdmin(true);

      // Fetch clubs managed by this admin
      const { data: managedClubs, error: clubsError } = await supabase
        .from('clubs')
        .select('id, name')
        .eq('admin_id', session.user.id);

      if (clubsError) throw clubsError;
      setClubs(managedClubs || []);

      if (managedClubs && managedClubs.length > 0) {
        setSelectedClub(managedClubs[0].id);
        fetchEventsForClub(managedClubs[0].id);
      }

    } catch (error) {
      console.error('Error in admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEventsForClub(clubId: string) {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date_time,
          registrations (
            id,
            status
          )
        `)
        .eq('club_id', clubId)
        .order('date_time', { ascending: false });

      if (eventsError) {
        console.error('Supabase Error:', eventsError.message, eventsError.details);
        throw eventsError;
      }

      const formattedEvents = (eventsData || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        date_time: e.date_time,
        registered: e.registrations.filter((r: any) => r.status !== 'cancelled').length,
        attended: e.registrations.filter((r: any) => r.status === 'attended').length,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events stats:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const totalRegistered = events.reduce((acc, curr) => acc + curr.registered, 0);
  const totalAttended = events.reduce((acc, curr) => acc + curr.attended, 0);
  const showUpRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Club Management</h1>
            <p className="text-gray-500">Monitor engagement and manage your club's presence.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link 
              href="/admin/scan"
              className="flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              <QrCode className="w-5 h-5 mr-3 text-indigo-500" />
              Scan QR
            </Link>
            <Link 
              href="/admin/events/new"
              className="flex items-center px-6 py-3 gradient-bg text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-200"
            >
              <Plus className="w-5 h-5 mr-3" />
              New Event
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard 
            icon={<Users className="w-6 h-6" />} 
            title="Total Registrations" 
            value={totalRegistered.toString()} 
            subtitle="Across all events"
            color="indigo"
          />
          <StatCard 
            icon={<CheckCircle2 className="w-6 h-6" />} 
            title="Total Attendees" 
            value={totalAttended.toString()} 
            subtitle="Successfully checked in"
            color="green"
          />
          <StatCard 
            icon={<TrendingUp className="w-6 h-6" />} 
            title="Avg. Show-up Rate" 
            value={`${showUpRate.toFixed(1)}%`} 
            subtitle="Active engagement"
            color="orange"
          />
        </div>

        {/* Events Table Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Events</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400 mr-2">Managing:</span>
              <select 
                className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-100"
                value={selectedClub || ''}
                onChange={(e) => {
                  setSelectedClub(e.target.value);
                  fetchEventsForClub(e.target.value);
                }}
              >
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Event Title</th>
                  <th className="px-8 py-5 text-center">Date</th>
                  <th className="px-8 py-5 text-center">Registrations</th>
                  <th className="px-8 py-5 text-center">Attended</th>
                  <th className="px-8 py-5 text-center">Show-up Rate</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event) => (
                  <tr key={event.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{event.title}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-tighter">{event.id}</div>
                    </td>
                    <td className="px-8 py-6 text-center text-sm text-gray-500">
                      {new Date(event.date_time).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                        {event.registered}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                        {event.attended}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 max-w-[100px] mx-auto">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full" 
                          style={{ width: `${event.registered > 0 ? (event.attended / event.registered) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {event.registered > 0 ? ((event.attended / event.registered) * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        href={`/admin/events/${event.id}`}
                        className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all inline-block"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 card-hover">
      <div className={`p-4 rounded-2xl w-fit mb-6 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="text-4xl font-extrabold text-gray-900 mb-2">{value}</div>
      <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
    </div>
  );
}
