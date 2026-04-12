'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  User, 
  Calendar,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const [regId, setRegId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regId) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // 1. Fetch registration and check if it exists
      const { data: reg, error: fetchError } = await supabase
        .from('registrations')
        .select(`
          *,
          events ( title ),
          profiles ( full_name, university_id )
        `)
        .eq('id', regId)
        .single();

      if (fetchError || !reg) {
        throw new Error('Registration not found. Please check the code.');
      }

      if (reg.status === 'attended') {
        setResult(reg);
        setError('User already checked in.');
        return;
      }

      // 2. Perform check-in
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ 
          status: 'attended',
          checked_in_at: new Date().toISOString()
        })
        .eq('id', regId);

      if (updateError) throw updateError;

      setResult(reg);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/admin" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 font-medium">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
              <Zap className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 font-tight leading-tight">Quick Check-in</h1>
            <p className="text-gray-500">Scan the student's QR code or enter the Registration ID manually.</p>
          </div>

          <form onSubmit={handleCheckIn} className="px-12 pb-12">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Enter Registration ID (e.g., uuid...)"
                className="w-full pl-12 pr-4 py-5 bg-gray-50 border-none rounded-2xl font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 gradient-bg text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Check-in"}
            </button>
          </form>

          {/* Results Area */}
          {(result || error) && (
            <div className={`mx-12 mb-12 p-8 rounded-3xl border ${error ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-2xl ${error ? 'bg-white text-red-500' : 'bg-white text-green-500'}`}>
                  {error ? <XCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${error ? 'text-red-900' : 'text-green-900'}`}>
                    {error ? "Check-in Error" : "Success! Checked In"}
                  </h3>
                  {result && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 opacity-50" />
                        <span className="font-bold">{result.profiles.full_name}</span>
                        <span className="mx-2 opacity-30">|</span>
                        <span className="text-gray-500">{result.profiles.university_id}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 opacity-50" />
                        <span className="text-gray-600">{result.events.title}</span>
                      </div>
                    </div>
                  )}
                  {error && <p className="mt-2 text-sm text-red-700 font-medium">{error}</p>}
                </div>
              </div>
              
              {!error && (
                <button 
                  onClick={() => {setResult(null); setRegId('');}}
                  className="mt-8 w-full py-3 bg-white text-gray-700 rounded-xl font-bold border border-green-200"
                >
                  Scan Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
