'use client';

import React, { useState, useEffect } from 'react';
import { MachineGrid } from '@/components/MachineGrid';
import { MaintenanceTable } from '@/components/MaintenanceTable';
import { MonthlySummary } from '@/components/MonthlySummary';
import { TodayTasks } from '@/components/TodayTasks';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CalendarView } from '@/components/CalendarView';
import { SettingsView } from '@/components/SettingsView';
import { useSchedule } from '@/hooks/useSchedule';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Calendar as CalendarIcon,
  ChevronRight,
  Zap
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'status' | 'schedule' | 'summary' | 'planner' | 'settings'>('status');
  const { scheduledTasks, generateMonthSchedule, isLoaded } = useSchedule();

  // Auto-generate schedule if empty for current month
  useEffect(() => {
    if (isLoaded && scheduledTasks.length === 0) {
      const now = new Date();
      generateMonthSchedule(now.getMonth(), now.getFullYear());
    }
  }, [isLoaded, scheduledTasks.length, generateMonthSchedule]);

  const tabs = [
    { id: 'status', label: 'Fleet Status', icon: LayoutDashboard },
    { id: 'schedule', label: 'PM Tracker', icon: ClipboardList },
    { id: 'planner', label: 'Month Planner', icon: CalendarIcon },
    { id: 'summary', label: 'Performance', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20 md:pb-0">
      <header className="bg-white border-b sticky top-0 z-20 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setActiveTab('settings')}
                className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200 rotate-3 hover:rotate-0 transition-transform cursor-pointer"
              >
                <Settings size={28} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-black text-gray-900 leading-none tracking-tighter uppercase">AMF 82-70</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase">Maintenance Pro v2.0</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all uppercase tracking-tight ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <NotificationCenter />
              <div className="w-px h-8 bg-gray-200 mx-2 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-3 pl-2">
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Technician</p>
                  <p className="text-sm font-black text-gray-900">Admin Mode</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-black">
                  AD
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Stats / Welcome */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap size={120} className="text-blue-600" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                  Ready for today's PMs?
                </h2>
                <p className="text-gray-500 font-medium max-w-md">
                  We've optimized the lubrication schedule for all 20 machines. Remember: Fri/Sat are for emergency repairs only.
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
                  <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl flex items-center gap-2">
                    <CalendarIcon size={16} className="text-blue-600" />
                    <span className="text-xs font-black text-blue-700 uppercase tracking-widest">January 2026</span>
                  </div>
                  <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-black text-green-700 uppercase tracking-widest">18 Active Machines</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 min-h-[600px] overflow-hidden">
              {activeTab === 'status' && <MachineGrid />}
              {activeTab === 'schedule' && <MaintenanceTable />}
              {activeTab === 'planner' && <CalendarView />}
              {activeTab === 'summary' && <MonthlySummary />}
              {activeTab === 'settings' && <SettingsView />}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <TodayTasks />
            
            {/* Maintenance Tips / Quick Links */}
            <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl shadow-gray-200 relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-blue-600/20 rounded-full blur-2xl" />
              <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                <Zap size={18} className="text-blue-400" /> Maintenance Tips
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold italic">01</div>
                  <p className="text-sm text-gray-300 font-medium leading-relaxed">Check oil levels on the distributor pinion before daily startup.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold italic">02</div>
                  <p className="text-sm text-gray-300 font-medium leading-relaxed">Clean the track rail assembly weekly to prevent pin jams.</p>
                </li>
              </ul>
              <button className="w-full mt-6 bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                All Guidelines <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t flex justify-around p-3 z-30 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1.5 px-4 py-1.5 rounded-2xl transition-all ${
              activeTab === tab.id ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
            }`}
          >
            <tab.icon size={22} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
