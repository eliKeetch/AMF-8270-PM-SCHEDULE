'use client';

import React from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { Save, Calendar, Clock, RotateCcw, ShieldAlert, AlertTriangle, Target, RotateCw, MoreHorizontal } from 'lucide-react';
import { IssueType } from '@/types';
import { BowlingPin } from './Icons';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, isLoaded } = useSchedule();

  if (!isLoaded) return null;

  const issueTypes: { type: IssueType; icon: any; label: string }[] = [
    { type: 'pin_drop', icon: BowlingPin, label: 'Pin Drop' },
    { type: 'scoring', icon: Target, label: 'Scoring' },
    { type: 'interlock', icon: ShieldAlert, label: 'Interlock' },
    { type: 'ball_return', icon: RotateCw, label: 'Ball Return' },
    { type: 'other', icon: MoreHorizontal, label: 'Other' },
  ];

  const handleThresholdChange = (type: IssueType, value: number) => {
    if (!settings) return;
    updateSettings({
      ...settings,
      issueThresholds: {
        ...(settings.issueThresholds || {
          pin_drop: 5,
          scoring: 3,
          interlock: 2,
          ball_return: 4,
          other: 5,
        }),
        [type]: Math.max(1, value)
      }
    });
  };

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
    if (!settings) return;
    const closedDays = settings.closedDays || [];
    const isClosed = closedDays.includes(dayId);
    updateSettings({
      ...settings,
      closedDays: isClosed 
        ? closedDays.filter(d => d !== dayId)
        : [...closedDays, dayId]
    });
  };

  const handleCapacityChange = (dayId: number, capacity: number) => {
    if (!settings) return;
    updateSettings({
      ...settings,
      dayCapacities: {
        ...(settings.dayCapacities || {}),
        [dayId]: Math.max(0, capacity)
      }
    });
  };

  const handleTogglePreferred = (dayId: number) => {
    if (!settings) return;
    const preferredDays = settings.preferredDays || [];
    const isPreferred = preferredDays.includes(dayId);
    updateSettings({
      ...settings,
      preferredDays: isPreferred 
        ? preferredDays.filter(d => d !== dayId)
        : [...preferredDays, dayId]
    });
  };

  return (
    <div className="p-8 mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Configure scheduling logic and house rules</p>
      </div>

      <div className="space-y-8">
        {/* Weekly Schedule */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
              <Calendar size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Weekly Capacity & Availability</h3>
          </div>

          <div className="grid gap-4">
            {days.map(day => {
              const isClosed = settings?.closedDays?.includes(day.id) || false;
              const isPreferred = settings?.preferredDays?.includes(day.id) || false;
              const capacity = settings?.dayCapacities?.[day.id] || 0;

              return (
                <div key={day.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all ${isClosed ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 shadow-sm'}`}>
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs uppercase tracking-tighter ${isClosed ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                      {day.name.substring(0, 3)}
                    </div>
                    <div>
                      <span className="font-black text-gray-900 dark:text-white">{day.name}</span>
                      <div className="flex gap-2 mt-1">
                        <button 
                          onClick={() => handleToggleClosed(day.id)}
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isClosed ? 'bg-red-500 text-white border-red-500' : 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-700 hover:border-red-500 hover:text-red-500'}`}
                        >
                          {isClosed ? 'Closed' : 'Open'}
                        </button>
                        {!isClosed && (
                          <button 
                            onClick={() => handleTogglePreferred(day.id)}
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isPreferred ? 'bg-green-500 text-white border-green-500' : 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-700 hover:border-green-500 hover:text-green-500'}`}
                          >
                            Preferred
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isClosed && (
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Machines/Day</label>
                      <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                        <button 
                          onClick={() => handleCapacityChange(day.id, capacity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 dark:text-white rounded-lg shadow-sm hover:text-blue-600 transition-all font-bold"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-black text-gray-900 dark:text-white">{capacity}</span>
                        <button 
                          onClick={() => handleCapacityChange(day.id, capacity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 dark:text-white rounded-lg shadow-sm hover:text-blue-600 transition-all font-bold"
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
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400">
              <RotateCcw size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Scheduling Strategy</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => settings && updateSettings({ ...settings, spreadMethod: 'even' })}
              className={`p-6 rounded-[2rem] border-2 text-left transition-all ${settings?.spreadMethod === 'even' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-xl shadow-black/5 dark:shadow-none' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-200 dark:hover:border-slate-700'}`}
            >
              <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Even Spread</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Distributes machines across the whole month. Keeps a steady pace and avoids burnout.</p>
            </button>

            <button 
              onClick={() => settings && updateSettings({ ...settings, spreadMethod: 'packed' })}
              className={`p-6 rounded-[2rem] border-2 text-left transition-all ${settings?.spreadMethod === 'packed' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/20 shadow-xl shadow-black/5 dark:shadow-none' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-200 dark:hover:border-slate-700'}`}
            >
              <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Capacity Packed</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Fills your preferred days (e.g., Mon/Tue) to max capacity first. Gets PMs done as early in the month as possible.</p>
            </button>
          </div>
        </section>

        {/* Issue Thresholds */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600 dark:text-orange-400">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Issue Alert Thresholds</h3>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Define how many reports of a specific issue type on a single machine will trigger a "High Frequency" alert in the intelligence summary.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {issueTypes.map(({ type, icon: Icon, label }) => {
              const thresholds = settings?.issueThresholds || {
                pin_drop: 5,
                scoring: 3,
                interlock: 2,
                ball_return: 4,
                other: 5,
              };
              const value = (thresholds as any)[type] || 5;

              return (
                <div key={type} className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-gray-400 dark:text-gray-500">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">{label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-gray-900 dark:text-white">Alert at:</span>
                    <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                      <button 
                        onClick={() => handleThresholdChange(type, value - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-bold dark:text-white"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-black text-gray-900 dark:text-white">{value}</span>
                      <button 
                        onClick={() => handleThresholdChange(type, value + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-bold dark:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-[2rem] p-6 flex gap-4">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl text-yellow-600 dark:text-yellow-400 shrink-0 h-fit">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="font-black text-yellow-800 dark:text-yellow-300 uppercase tracking-tight text-sm mb-1">Important Note</h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-400/80 font-medium leading-relaxed">Changing these settings will not automatically move your existing scheduled tasks. Go to the <span className="font-bold underline">Planner</span> tab and click <span className="font-bold underline">Regenerate Evenly</span> to apply your new rules to the current month.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
