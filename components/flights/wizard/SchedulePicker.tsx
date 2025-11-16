'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  setHours,
  setMinutes,
  startOfDay,
  parseISO,
} from 'date-fns';

// --- Sub-components ---

function CalendarView({ viewDate, selectedDate, onSelectDate, setViewDate, minDate }: any) {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array(firstDayOfWeek).fill(null);

  return (
    <div className="p-4 rounded-sm bg-[#F4F4F4]/50 dark:bg-black/20 border border-zinc-200/80 dark:border-zinc-800/50">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="p-1 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft size={18} className="text-zinc-500" />
        </button>
        <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 text-center">
          {format(viewDate, 'MMMM yyyy')}
        </div>
        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="p-1 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronRight size={18} className="text-zinc-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={`${day}-${index}`} className="text-xs font-mono text-zinc-400 text-center py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {paddingDays.map((_, idx) => <div key={`pad-${idx}`} />)}
        {daysInMonth.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isInMonth = isSameMonth(day, viewDate);
          const isPast = minDate ? day < startOfDay(minDate) : false;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => !isPast && onSelectDate(day)}
              disabled={isPast}
              className={`
                h-8 w-8 flex items-center justify-center text-xs rounded-sm transition-all
                ${!isInMonth ? 'text-zinc-400/40 dark:text-zinc-600/40' : 'text-zinc-700 dark:text-zinc-300'}
                ${isCurrentDay && !isSelected ? 'border border-zinc-400 dark:border-zinc-600' : ''}
                ${isSelected ? 'bg-[#F04E30] text-white font-bold shadow-inner' : 'hover:bg-zinc-200/70 dark:hover:bg-zinc-800/70'}
                ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeInput({ label, date, onTimeChange, isActive, onActivate }: any) {
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
    onTimeChange(setHours(date, hours));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
    onTimeChange(setMinutes(date, minutes));
  };

  return (
    <div 
      onClick={onActivate}
      className={`p-4 rounded-sm border transition-all cursor-pointer ${isActive ? 'border-[#F04E30] bg-orange-500/5 dark:bg-[#F04E30]/5' : 'border-zinc-200/80 dark:border-zinc-800/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/20'}`}
    >
      <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Clock size={16} className={`transition-colors ${isActive ? 'text-[#F04E30]' : 'text-zinc-400'}`} />
        <div className="flex items-center gap-1.5 flex-1 font-mono">
          <input
            type="number"
            min="0" max="23"
            value={String(date.getHours()).padStart(2, '0')}
            onChange={handleHourChange}
            className="w-full h-10 px-2 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-sm text-lg text-center focus:outline-none focus:ring-1 focus:ring-[#F04E30]"
          />
          <div className="text-zinc-400 text-lg">:</div>
          <input
            type="number"
            min="0" max="59" step="5"
            value={String(date.getMinutes()).padStart(2, '0')}
            onChange={handleMinuteChange}
            className="w-full h-10 px-2 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-sm text-lg text-center focus:outline-none focus:ring-1 focus:ring-[#F04E30]"
          />
        </div>
      </div>
      <div className="text-center text-xs text-zinc-400 mt-2 font-mono">
        {format(date, 'MMM d, yyyy')}
      </div>
    </div>
  );
}


// --- Main Component ---

interface SchedulePickerProps {
  scheduledAt: string;
  arrivalAt: string;
  onScheduledAtChange: (date: string) => void;
  onArrivalAtChange: (date: string) => void;
  errors: {
    scheduledAt?: string;
    arrivalAt?: string;
  };
}

export default function SchedulePicker({
  scheduledAt,
  arrivalAt,
  onScheduledAtChange,
  onArrivalAtChange,
  errors,
}: SchedulePickerProps) {
  const [activeInput, setActiveInput] = useState<'departure' | 'arrival'>('departure');
  
  const departureDate = scheduledAt ? parseISO(scheduledAt) : new Date();
  const arrivalDate = arrivalAt ? parseISO(arrivalAt) : new Date(departureDate.getTime() + 2 * 60 * 60 * 1000);

  const selectedDate = activeInput === 'departure' ? departureDate : arrivalDate;

  const [viewDate, setViewDate] = useState(selectedDate);

  const handleSelectDate = (day: Date) => {
    const activeDate = activeInput === 'departure' ? departureDate : arrivalDate;
    const newDate = setMinutes(setHours(day, activeDate.getHours()), activeDate.getMinutes());
    
    if (activeInput === 'departure') {
      onScheduledAtChange(newDate.toISOString());
    } else {
      onArrivalAtChange(newDate.toISOString());
    }
  };

  const handleDepartureTimeChange = (date: Date) => {
    onScheduledAtChange(date.toISOString());
  };

  const handleArrivalTimeChange = (date: Date) => {
    onArrivalAtChange(date.toISOString());
  };

  useEffect(() => {
    const newDate = activeInput === 'departure' ? departureDate : arrivalDate;
    // Only switch view if the month is different
    if (!isSameMonth(newDate, viewDate)) {
      setViewDate(newDate);
    }
  }, [activeInput, departureDate, arrivalDate, viewDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      <div className="lg:col-span-3">
        <CalendarView 
          viewDate={viewDate}
          setViewDate={setViewDate}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          minDate={activeInput === 'arrival' ? departureDate : undefined}
        />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <TimeInput 
          label="Departure"
          date={departureDate}
          onTimeChange={handleDepartureTimeChange}
          isActive={activeInput === 'departure'}
          onActivate={() => setActiveInput('departure')}
        />
        <TimeInput 
          label="Arrival"
          date={arrivalDate}
          onTimeChange={handleArrivalTimeChange}
          isActive={activeInput === 'arrival'}
          onActivate={() => setActiveInput('arrival')}
        />
        {errors.scheduledAt && <p className="text-xs text-[#F04E30]">{errors.scheduledAt}</p>}
        {errors.arrivalAt && <p className="text-xs text-[#F04E30]">{errors.arrivalAt}</p>}
      </div>
    </div>
  );
}
