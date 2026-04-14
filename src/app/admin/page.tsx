'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Users, 
  QrCode, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

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

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || profile?.role !== 'club_admin') {
        router.push('/');
        return;
      }

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

      if (eventsError) throw eventsError;

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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  const totalRegistered = events.reduce((acc, curr) => acc + curr.registered, 0);
  const totalAttended = events.reduce((acc, curr) => acc + curr.attended, 0);
  const showUpRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;

  return (
    <div className="min-h-screen bg-black pt-40 pb-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-10">
          <div>
            <div className="flex items-center space-x-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Console</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">Club Dashboard</h1>
            <p className="text-muted font-bold mt-4 text-lg">Manage your events and monitor student engagement in real-time.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin/events/new"
              className="btn-primary flex items-center whitespace-nowrap text-[10px] uppercase tracking-[0.2em] px-10"
            >
              <Plus className="w-4 h-4 mr-3" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          <StatCard 
            icon={<Users className="w-5 h-5" />} 
            title="Total Registrations" 
            value={totalRegistered.toString()} 
            subtitle="Registered Students"
            variant="indigo"
          />
          <StatCard 
            icon={<CheckCircle2 className="w-5 h-5" />} 
            title="Total Attendance" 
            value={totalAttended.toString()} 
            subtitle="Verified Check-ins"
            variant="success"
          />
          <StatCard 
            icon={<TrendingUp className="w-5 h-5" />} 
            title="Success Rate" 
            value={`${showUpRate.toFixed(1)}%`} 
            subtitle="Attendance Efficiency"
            variant="warning"
          />
        </div>

        {/* Recent Events Table */}
        <div className="bg-white/[0.02] rounded-[3.5rem] border border-white/5 overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="p-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <h3 className="text-3xl font-black text-white tracking-tighter leading-none">Active Events</h3>
            <div className="flex items-center bg-white/[0.03] rounded-2xl px-6 py-3 border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mr-6">Context:</span>
              <select 
                className="bg-transparent border-none text-[10px] font-black text-indigo-400 focus:ring-0 cursor-pointer uppercase tracking-[0.2em] p-0"
                value={selectedClub || ''}
                onChange={(e) => {
                  setSelectedClub(e.target.value);
                  fetchEventsForClub(e.target.value);
                }}
              >
                {clubs.map(c => <option key={c.id} value={c.id} className="bg-black text-white">{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-muted text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                  <th className="px-12 py-8">Event Narrative</th>
                  <th className="px-12 py-8 text-center border-x border-white/5">Schedule</th>
                  <th className="px-12 py-8 text-center border-r border-white/5">Engagement</th>
                  <th className="px-12 py-8 text-center border-r border-white/5">Attendance</th>
                  <th className="px-12 py-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((event) => (
                  <tr key={event.id} className="group hover:bg-white/[0.03] transition-all">
                    <td className="px-12 py-10">
                      <div className="font-black text-white text-xl leading-tight group-hover:text-indigo-400 transition-colors">
                        {event.title}
                      </div>
                      <div className="text-[10px] text-gray-300 font-bold mt-2 tabular-nums tracking-widest uppercase">
                        Hash: {event.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-12 py-10 text-center border-x border-white/5">
                      <span className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                        {new Date(event.date_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-12 py-10 text-center border-r border-white/5">
                      <div className="text-2xl font-black text-white tabular-nums">{event.registered}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Registrations</div>
                    </td>
                    <td className="px-12 py-10 text-center border-r border-white/5">
                      <div className="flex flex-col items-center">
                        <div className="w-32 bg-white/5 rounded-full h-1.5 mb-3 overflow-hidden border border-white/5">
                          <div 
                            className="bg-indigo-500 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                            style={{ width: `${event.registered > 0 ? (event.attended / event.registered) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                          {event.registered > 0 ? ((event.attended / event.registered) * 100).toFixed(1) : 0}% Verified
                        </span>
                      </div>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <Link 
                        href={`/admin/events/${event.id}`}
                        className="p-4 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-all inline-block border border-transparent hover:border-white/5"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {events.length === 0 && (
            <div className="p-32 text-center">
              <div className="inline-flex p-8 bg-white/[0.02] rounded-full mb-8 text-white/20">
                <Calendar className="w-16 h-16" />
              </div>
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed border-t border-white/5 pt-8">No data protocols founded for this sector selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, variant }: any) {
  const styles: any = {
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-indigo-500/5",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/5",
  };

  return (
    <div className="bg-white/[0.02] rounded-[3.5rem] p-12 border border-white/5 card-hover shadow-xl">
      <div className={`p-5 rounded-3xl w-fit mb-10 border shadow-inner ${styles[variant]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">{title}</p>
      <div className="text-6xl font-black text-white mb-6 tracking-tighter tabular-nums leading-none">{value}</div>
      <p className="text-xs text-gray-400 font-bold tracking-tight uppercase leading-none">{subtitle}</p>
    </div>
  );
}
