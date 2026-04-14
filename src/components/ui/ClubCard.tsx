'use client';

import React from 'react';
import { Users, Globe, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ClubCardProps {
  club: {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
    category?: string;
  };
}

export default function ClubCard({ club }: ClubCardProps) {
  // Fallback logo using Identicon matching the profile page
  const logoUrl = club.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(club.name)}`;

  return (
    <div className="bg-white/[0.03] backdrop-blur-md rounded-3xl p-8 border border-white/5 card-hover flex flex-col items-center text-center transition-all duration-300">
      <div className="w-20 h-20 bg-white/[0.02] rounded-[1.5rem] flex items-center justify-center mb-6 overflow-hidden border border-white/5 p-3">
        <img 
          src={logoUrl} 
          alt={club.name} 
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" 
        />
      </div>
      
      <span className="px-3 py-1 bg-white/[0.05] border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-400 rounded-full mb-4">
        {club.category || 'General'}
      </span>
      
      <h3 className="text-xl font-black text-white mb-3 leading-tight">
        {club.name}
      </h3>
      
      <p className="text-sm text-muted line-clamp-2 mb-8 leading-relaxed font-medium">
        {club.description || 'A vibrant community of students focused on exploring new horizons.'}
      </p>
      
      <Link 
        href={`/clubs/${club.id}`}
        className="mt-auto w-full py-3 bg-white/[0.05] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-300"
      >
        View Club Profile
      </Link>
    </div>
  );
}
