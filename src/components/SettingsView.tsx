'use client';

import React from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { Save, Calendar, Clock, RotateCcw, ShieldAlert } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, isLoaded } = useSchedule();

  if (!isLoaded) return null;

  const days = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
  ];

  const handleToggleClosed = (dayId: number) => {
    const isClosed = settings.closedDays.includes(dayId);
    updateSettings({
      ...settings,
      closedDays: isClosed 
        ? settings.closedDays.filter(d => d !== dayId)
        : [...settings.closedDays, dayId]
    });
  };

  const handleCapacityChange = (dayId: number, capacity: number) => {
    updateSettings({
      ...settings,
      dayCapacities: {
        ...settings.dayCapacities,
        [dayId]: Math.max(0, capacity)
      }
    });
  };

  const handleTogglePreferred = (dayId: number) => {
    const isPreferred = settings.preferredDays.includes(dayId);
    updateSettings({
      ...settings,
      preferredDays: isPreferred 
        ? settings.preferredDays.filter(d => d !== dayId)
        : [...settings.preferredDays, dayId]
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Settings</h2>
        <p className="text-gray-500 font-medium">Configure scheduling logic and house rules</p>
      </div>

      <div className="space-y-8">
        {/* Weekly Schedule */}
        <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <Calendar size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Weekly Capacity & Availability</h3>
          </div>

          <div className="grid gap-4">
            {days.map(day => {
              const isClosed = settings.closedDays.includes(day.id);
              const isPreferred = settings.preferredDays.includes(day.id);
              const capacity = settings.dayCapacities[day.id] || 0;

              return (
                <div key={day.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all ${isClosed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-200 shadow-sm'}`}>
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs uppercase tracking-tighter ${isClosed ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                      {day.name.substring(0, 3)}
                    </div>
                    <div>
                      <span className="font-black text-gray-900">{day.name}</span>
                      <div className="flex gap-2 mt-1">
                        <button 
                          onClick={() => handleToggleClosed(day.id)}
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isClosed ? 'bg-red-500 text-white border-red-500' : 'text-gray-400 border-gray-200 hover:border-red-500 hover:text-red-500'}`}
                        >
                          {isClosed ? 'Closed' : 'Open'}
                        </button>
                        {!isClosed && (
                          <button 
                            onClick={() => handleTogglePreferred(day.id)}
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isPreferred ? 'bg-green-500 text-white border-green-500' : 'text-gray-400 border-gray-200 hover:border-green-500 hover:text-green-500'}`}
                          >
                            Preferred
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isClosed && (
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Machines/Day</label>
                      <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button 
                          onClick={() => handleCapacityChange(day.id, capacity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-blue-600 transition-all font-bold"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-black text-gray-900">{capacity}</span>
                        <button 
                          onClick={() => handleCapacityChange(day.id, capacity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-blue-600 transition-all font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Algorithm Strategy */}
        <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
              <RotateCcw size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Scheduling Strategy</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => updateSettings({ ...settings, spreadMethod: 'even' })}
              className={`p-6 rounded-[2rem] border-2 text-left transition-all ${settings.spreadMethod === 'even' ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <h4 className="font-black text-gray-900 uppercase tracking-tight mb-2">Even Spread</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Distributes machines across the whole month. Keeps a steady pace and avoids burnout.</p>
            </button>

            <button 
              onClick={() => updateSettings({ ...settings, spreadMethod: 'packed' })}
              className={`p-6 rounded-[2rem] border-2 text-left transition-all ${settings.spreadMethod === 'packed' ? 'border-purple-600 bg-purple-50/50 shadow-xl shadow-purple-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <h4 className="font-black text-gray-900 uppercase tracking-tight mb-2">Capacity Packed</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Fills your preferred days (e.g., Mon/Tue) to max capacity first. Gets PMs done as early in the month as possible.</p>
            </button>
          </div>
        </section>

        <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-6 flex gap-4">
          <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600 shrink-0 h-fit">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="font-black text-yellow-800 uppercase tracking-tight text-sm mb-1">Important Note</h4>
            <p className="text-xs text-yellow-700 font-medium leading-relaxed">Changing these settings will not automatically move your existing scheduled tasks. Go to the <span className="font-bold underline">Planner</span> tab and click <span className="font-bold underline">Regenerate Evenly</span> to apply your new rules to the current month.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
