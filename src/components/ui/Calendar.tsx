'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  eventDates?: Record<string, string[]>; // Map of YYYY-MM-DD to category colors
}

export default function Calendar({ selectedDate, onDateSelect, eventDates = {} }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-black text-white tracking-tighter uppercase">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] uppercase font-black tracking-widest text-white/40">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1">
        {allDays.map((d) => {
          const dateKey = format(d, 'yyyy-MM-dd');
          const hasEvents = eventDates[dateKey];
          const isSelected = isSameDay(d, selectedDate);
          const isCurrentMonth = isSameMonth(d, monthStart);

          return (
            <div
              key={d.toString()}
              onClick={() => onDateSelect(d)}
              className={`
                relative h-12 flex flex-col items-center justify-center cursor-pointer rounded-2xl transition-all
                ${!isCurrentMonth ? 'text-white/20 pointer-events-none' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20' : ''}
              `}
            >
              <span className="text-sm font-bold leading-none">
                {format(d, 'd')}
              </span>
              
              {/* Category dots */}
              {hasEvents && isCurrentMonth && (
                <div className="flex space-x-0.5 mt-1.5 h-1 items-center justify-center">
                  {hasEvents.slice(0, 3).map((color, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} 
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-sm">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
