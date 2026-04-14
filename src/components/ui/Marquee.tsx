'use client';

import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: 'slow' | 'medium' | 'fast';
  pauseOnHover?: boolean;
  className?: string;
}

export default function Marquee({
  children,
  direction = 'left',
  speed = 'medium',
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  const speedMap = {
    slow: 'animate-marquee-slow',
    medium: 'animate-marquee',
    fast: 'animate-marquee-fast',
  };

  return (
    <div 
      className={`flex overflow-hidden select-none group [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] ${className}`}
    >
      <div 
        className={`flex w-max shrink-0 items-center space-x-12 px-6 ${speedMap[speed]} ${
          pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
