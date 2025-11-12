'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
  addHours,
  addDays,
  addWeeks,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';

interface DateTimePickerProps {
  label: string;
  value: string; // ISO string
  onChange: (isoString: string) => void;
  error?: string;
  required?: boolean;
  minDate?: Date;
}

const QUICK_OPTIONS = [
  { label: 'Now', getValue: () => new Date() },
  { label: 'In 2 hours', getValue: () => addHours(new Date(), 2) },
  { label: 'In 6 hours', getValue: () => addHours(new Date(), 6) },
  { label: 'Tomorrow', getValue: () => addDays(startOfDay(new Date()), 1) },
  { label: 'In 1 week', getValue: () => addWeeks(new Date(), 1) },
];

export default function DateTimePicker({
  label,
  value,
  onChange,
  error,
  required = false,
  minDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [tempHours, setTempHours] = useState(
    selectedDate ? selectedDate.getHours() : 12
  );
  const [tempMinutes, setTempMinutes] = useState(
    selectedDate ? selectedDate.getMinutes() : 0
  );

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setViewDate(date);
      setTempHours(date.getHours());
      setTempMinutes(date.getMinutes());
    }
  }, [value]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad beginning with previous month days to align weeks
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const handleDateClick = (date: Date) => {
    const newDate = setMinutes(setHours(date, tempHours), tempMinutes);
    setSelectedDate(newDate);
    const isoString = newDate.toISOString();
    console.log('Date selected:', isoString);
    onChange(isoString);
    setIsOpen(false);
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setTempHours(hours);
    setTempMinutes(minutes);
    
    if (selectedDate) {
      const newDate = setMinutes(setHours(selectedDate, hours), minutes);
      setSelectedDate(newDate);
      const isoString = newDate.toISOString();
      console.log('Time changed:', isoString);
      onChange(isoString);
    }
  };

  const handleQuickOption = (getValue: () => Date) => {
    const date = getValue();
    setSelectedDate(date);
    setViewDate(date);
    setTempHours(date.getHours());
    setTempMinutes(date.getMinutes());
    onChange(date.toISOString());
    setIsOpen(false);
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return 'Select date and time';
    return format(selectedDate, 'MMM d, yyyy · h:mm a');
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>

      {/* Input Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-4 border text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue ${
          error ? 'border-red' : 'border-border'
        }`}
      >
        <span className={selectedDate ? 'text-text-primary' : 'text-text-secondary'}>
          {formatDisplayValue()}
        </span>
        <Calendar size={16} className="text-text-secondary" />
      </button>

      {/* Error */}
      {error && <p className="mt-1 text-xs text-red">{error}</p>}

      {/* Inline Picker Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 bg-white border border-border shadow-lg p-3 overflow-hidden"
          >
            {/* Quick Options */}
            <div className="mb-2 pb-2 border-b border-border">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleQuickOption(option.getValue)}
                    className="px-2 py-1 text-xs font-medium border border-border hover:bg-surface transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="p-1 hover:bg-surface transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="font-semibold text-text-primary">
                {format(viewDate, 'MMMM yyyy')}
              </div>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-1 hover:bg-surface transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div
                  key={day}
                  className="text-xs font-semibold text-text-secondary text-center py-0.5"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5 mb-2">
              {paddingDays.map((_, idx) => (
                <div key={`pad-${idx}`} className="aspect-square" />
              ))}
              {daysInMonth.map((day) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                const isInMonth = isSameMonth(day, viewDate);
                const isPast = minDate && day < minDate;

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => !isPast && handleDateClick(day)}
                    disabled={isPast}
                    className={`
                      h-7 flex items-center justify-center text-xs transition-all
                      ${!isInMonth ? 'text-gray opacity-40' : ''}
                      ${isCurrentDay ? 'font-bold' : ''}
                      ${isSelected ? 'bg-blue text-white' : 'hover:bg-surface'}
                      ${isPast ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Time Selection */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-text-secondary" />
                <div className="flex items-center gap-1.5 flex-1">
                  {/* Hours */}
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={tempHours}
                      onChange={(e) => {
                        const hours = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                        handleTimeChange(hours, tempMinutes);
                      }}
                      placeholder="HH"
                      className="w-full h-8 px-2 border border-border text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                  </div>

                  <div className="text-text-secondary text-xs">:</div>

                  {/* Minutes */}
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={tempMinutes.toString().padStart(2, '0')}
                      onChange={(e) => {
                        const minutes = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                        handleTimeChange(tempHours, minutes);
                      }}
                      placeholder="MM"
                      className="w-full h-8 px-2 border border-border text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                  </div>

                  {/* AM/PM Display */}
                  <div className="text-xs font-mono text-text-secondary">
                    {tempHours >= 12 ? 'PM' : 'AM'}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-text-secondary text-center">
                Click date to select · Adjust time if needed
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
