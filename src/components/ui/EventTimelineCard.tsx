'use client';

import React from 'react';
import { format } from 'date-fns';
import { MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EventTimelineCardProps {
  event: {
    id: string;
    title: string;
    date_time: string;
    location: string;
    category: string;
    club_name?: string;
    image_url?: string;
  };
}

export default function EventTimelineCard({ event }: EventTimelineCardProps) {
  const date = new Date(event.date_time);
  
  return (
    <Link href={`/events/${event.id}`} className="group block">
      <div className="flex bg-white/[0.03] backdrop-blur-md rounded-3xl overflow-hidden border border-white/5 hover:border-indigo-600/30 transition-all duration-300 card-hover h-full">
        {/* Date Indicator Side */}
        <div className="w-24 md:w-32 bg-white/[0.02] flex flex-col items-center justify-center border-r border-white/5 px-2 shrink-0 group-hover:bg-indigo-600/10 transition-colors">
          <span className="text-3xl md:text-4xl font-black text-white tabular-nums">
            {format(date, 'dd')}
          </span>
          <span className="text-[10px] md:text-xs uppercase font-black tracking-[0.2em] text-muted mt-1">
            {format(date, 'MMM')}
          </span>
          <div className="mt-4 w-1 h-12 bg-white/10 rounded-full group-hover:bg-indigo-400 group-hover:h-16 transition-all duration-500" />
        </div>

        {/* Content Side */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-white/[0.05] border border-white/10 soft-shadow rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider text-indigo-400">
                {event.category}
              </span>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest hidden sm:block">
                {event.club_name}
              </span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-black text-white mb-4 leading-tight group-hover:text-indigo-400 transition-colors">
              {event.title}
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 text-muted">
              <div className="flex items-center text-xs font-bold">
                <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                {format(date, 'h:mm a')}
              </div>
              <div className="flex items-center text-xs font-bold">
                <MapPin className="w-4 h-4 mr-2 text-indigo-400" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center text-xs font-black text-indigo-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            View Details <ArrowRight className="ml-2 w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
