'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  MapPin, 
  Users, 
  Image as ImageIcon,
  Tag,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function NewEventPage() {
  const [clubs, setClubs] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    club_id: '',
    title: '',
    description: '',
    date_time: '',
    location: '',
    capacity: 100,
    category: 'Workshop',
    image_url: '',
    registration_deadline: ''
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  async function fetchClubs() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      const { data, error } = await supabase
        .from('clubs')
        .select('id, name')
        .eq('admin_id', session.user.id);

      if (error) throw error;
      setClubs(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, club_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('events')
        .insert([formData]);

      if (error) throw error;
      router.push('/admin');
    } catch (error: any) {
      alert('Error creating event: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (clubs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No Clubs Found</h2>
        <p className="text-gray-500 mb-8">You need to have a club registered to create events.</p>
        <Link href="/admin" className="text-indigo-600 font-bold hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/admin" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 font-medium">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
          <div className="gradient-bg p-12 text-white">
            <h1 className="text-4xl font-extrabold mb-4">Create New Event</h1>
            <p className="text-white/80">Fill in the details below to publish your next club event.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6 md:col-span-2">
                <label className="block">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Hosting Club</span>
                  <select 
                    required
                    className="mt-2 block w-full rounded-2xl bg-gray-50 border-none px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    value={formData.club_id}
                    onChange={e => setFormData({...formData, club_id: e.target.value})}
                  >
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1 text-bold">Event Title</span>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Annual Tech Symposium"
                    className="mt-2 block w-full rounded-2xl bg-gray-50 border-none px-6 py-4 text-gray-900 font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Full Description</span>
                  <textarea 
                    required
                    rows={4}
                    placeholder="What can attendees expect? Details about speakers, food, or activities..."
                    className="mt-2 block w-full rounded-2xl bg-gray-50 border-none px-6 py-4 text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </label>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Event Date & Time</span>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="datetime-local" 
                      required
                      className="block w-full rounded-2xl bg-gray-50 border-none pl-12 pr-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      value={formData.date_time}
                      onChange={e => setFormData({...formData, date_time: e.target.value})}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Location / Venue</span>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Building A, Room 301"
                      className="block w-full rounded-2xl bg-gray-50 border-none pl-12 pr-6 py-4 text-gray-900 font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </label>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Total Capacity</span>
                  <div className="relative mt-2">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="number" 
                      required
                      min={1}
                      className="block w-full rounded-2xl bg-gray-50 border-none pl-12 pr-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      value={formData.capacity}
                      onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Category</span>
                  <div className="relative mt-2">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select 
                      className="block w-full rounded-2xl bg-gray-50 border-none pl-12 pr-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Social">Social</option>
                      <option value="Competition">Competition</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </label>
              </div>

              <div className="md:col-span-2 space-y-6">
                <label className="block">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Featured Image URL</span>
                  <div className="relative mt-2">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/..."
                      className="block w-full rounded-2xl bg-gray-50 border-none pl-12 pr-6 py-4 text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      value={formData.image_url}
                      onChange={e => setFormData({...formData, image_url: e.target.value})}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1 text-bold">Registration Deadline</span>
                  <input 
                    type="datetime-local" 
                    required
                    className="mt-2 block w-full rounded-2xl bg-gray-50 border-none px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    value={formData.registration_deadline}
                    onChange={e => setFormData({...formData, registration_deadline: e.target.value})}
                  />
                </label>
              </div>
            </div>

            <div className="pt-10 flex flex-col sm:flex-row items-center gap-4">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full sm:flex-1 py-5 gradient-bg text-white rounded-3xl font-bold text-xl shadow-xl shadow-indigo-200 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : "Publish Event"}
              </button>
              <Link 
                href="/admin"
                className="w-full sm:w-auto px-10 py-5 bg-gray-100 text-gray-600 rounded-3xl font-bold text-xl hover:bg-gray-200 transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
