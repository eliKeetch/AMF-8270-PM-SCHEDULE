'use client';

import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  getDay,
  parseISO,
  isToday
} from 'date-fns';
import { useSchedule } from '@/hooks/useSchedule';
import { useMachines } from '@/hooks/useMachines';
import { PM_SCHEDULE } from '@/data/schedule';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CalendarViewProps {
  onMachineClick?: (machineId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onMachineClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { scheduledTasks, regenerateSchedule, isLoaded: scheduleLoaded } = useSchedule();
  const { machines, isLoaded: machinesLoaded } = useMachines();

  if (!scheduleLoaded || !machinesLoaded) return null;

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  // Get days of the week for header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Add empty slots for days before the 1st
  const firstDayOfMonth = getDay(start);
  const blanks = Array(firstDayOfMonth).fill(null);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleRegenerate = () => {
    if (confirm("This will reset all pending and completed tasks for this month and recreate them evenly. Continue?")) {
      regenerateSchedule(currentMonth.getMonth(), currentMonth.getFullYear());
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Maintenance Planner</h2>
          <p className="text-gray-500 text-sm font-medium">Automatic scheduling: Sun - Thu (max 2 machines/day)</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRegenerate}
            className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-4 py-2 hover:bg-blue-50 rounded-xl transition-all"
          >
            Regenerate Evenly
          </button>
          <div className="flex items-center gap-4 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
            <button onClick={prevMonth} className="p-2 hover:bg-white rounded-xl transition-all text-gray-600 hover:text-blue-600">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-black text-gray-900 min-w-[120px] text-center uppercase tracking-widest">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-white rounded-xl transition-all text-gray-600 hover:text-blue-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b">
          {weekDays.map(day => (
            <div key={day} className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[120px] border-b border-r p-2 bg-gray-50/20" />
          ))}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTasks = scheduledTasks.filter(t => t.date === dateStr);
            const isWeekend = getDay(day) === 5 || getDay(day) === 6;
            const isCurrentToday = isToday(day);
            
            // Group tasks by machine
            const machinesScheduled = Array.from(new Set(dayTasks.map(t => t.machineId)));

            return (
              <div 
                key={dateStr} 
                className={`min-h-[140px] border-b border-r p-3 transition-colors hover:bg-blue-50/30 group ${
                  isWeekend ? 'bg-gray-50/40' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-black ${
                    isCurrentToday ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {machinesScheduled.length} Machines
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {machinesScheduled.map(mId => {
                    const machine = machines.find(m => m.id === mId);
                    const mTasks = dayTasks.filter(t => t.machineId === mId);
                    const allCompleted = mTasks.every(t => t.status === 'completed');
                    const someMissed = mTasks.some(t => t.status === 'missed');

                    return (
                      <button 
                        key={mId} 
                        onClick={() => onMachineClick?.(mId)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all ${
                          allCompleted ? 'bg-green-50 border-green-100 text-green-700' :
                          someMissed ? 'bg-red-50 border-red-100 text-red-700 animate-pulse' :
                          'bg-blue-50/50 border-blue-100/50 text-blue-700'
                        }`}
                      >
                        <span>Machine #{machine?.number}</span>
                        {allCompleted ? <CheckCircle2 size={10} /> : someMissed ? <AlertCircle size={10} /> : null}
                      </button>
                    );
                  })}
                  
                  {isWeekend && !dayTasks.length && (
                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Busy Days - No PMs</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
