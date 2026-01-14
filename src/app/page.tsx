'use client';

import React, { useState, useEffect } from 'react';
import { MachineGrid } from '@/components/MachineGrid';
import { MaintenanceTable } from '@/components/MaintenanceTable';
import { MonthlySummary } from '@/components/MonthlySummary';
import { TodayTasks } from '@/components/TodayTasks';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CalendarView } from '@/components/CalendarView';
import { SettingsView } from '@/components/SettingsView';
import { FrontDeskPortal } from '@/components/FrontDeskPortal';
import { IssueSummary } from '@/components/IssueSummary';
import { LoginView } from '@/components/LoginView';
import { UserManagement } from '@/components/UserManagement';
import { useSchedule } from '@/hooks/useSchedule';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { User, UserRole } from '@/types';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Calendar as CalendarIcon,
  ChevronRight,
  Zap,
  Store,
  BrainCircuit,
  LogOut,
  Users as UsersIcon,
  ShieldCheck
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'status' | 'schedule' | 'summary' | 'planner' | 'settings' | 'front_desk' | 'intelligence' | 'users'>('status');
  const [activePersona, setActivePersona] = useState<'mechanic' | 'front_desk' | 'manager' | 'admin'>('mechanic');
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [currentUser, setCurrentUser, isUserLoaded] = useLocalStorage<User | null>('pinsetter-session', null);
  const { scheduledTasks, generateMonthSchedule, isLoaded: isScheduleLoaded } = useSchedule();

  const isLoaded = isScheduleLoaded && isUserLoaded;

  // Auto-generate schedule if empty for current month
  useEffect(() => {
    if (isLoaded && scheduledTasks.length === 0) {
      const now = new Date();
      generateMonthSchedule(now.getMonth(), now.getFullYear());
    }
  }, [isLoaded, scheduledTasks.length, generateMonthSchedule]);

  const personaConfig: Record<string, { label: string; tabs: any[]; color: string }> = {
    mechanic: {
      label: 'Mechanic',
      tabs: [
        { id: 'status', label: 'Pinsetters', icon: LayoutDashboard },
        { id: 'schedule', label: 'PM Tracker', icon: ClipboardList },
        { id: 'planner', label: 'Month Planner', icon: CalendarIcon },
      ],
      color: 'blue'
    },
    front_desk: {
      label: 'Front Desk',
      tabs: [
        { id: 'front_desk', label: 'Lane Control', icon: Store },
      ],
      color: 'green'
    },
    manager: {
      label: 'Management',
      tabs: [
        { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
        { id: 'summary', label: 'Performance', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
      color: 'purple'
    },
    admin: {
      label: 'Admin',
      tabs: [
        { id: 'users', label: 'Users', icon: UsersIcon },
        { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
      color: 'red'
    }
  };

  // Filter personas based on role
  const availablePersonas = currentUser ? (['mechanic', 'front_desk', 'manager', 'admin'] as const).filter(p => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') return p !== 'admin';
    if (currentUser.role === 'mechanic' || currentUser.role === 'pin_chaser') return p === 'mechanic';
    if (currentUser.role === 'front_desk') return p === 'front_desk';
    return p === 'mechanic'; // default
  }) : [];

  const currentPersona = currentUser ? (personaConfig[activePersona] || personaConfig[availablePersonas[0]]) : null;

  // Sync active persona with available personas if current one is not allowed
  useEffect(() => {
    if (currentUser && !availablePersonas.includes(activePersona as any) && availablePersonas.length > 0) {
      setActivePersona(availablePersonas[0] as any);
    }
  }, [currentUser, availablePersonas, activePersona]);

  // If active tab is not in current persona, switch to first tab of persona
  useEffect(() => {
    if (currentUser && currentPersona && !currentPersona.tabs.some(t => t.id === activeTab)) {
      setActiveTab(currentPersona.tabs[0].id as any);
    }
  }, [currentUser, activePersona, currentPersona, activeTab]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Set default persona based on role
    if (user.role === 'admin') setActivePersona('admin');
    else if (user.role === 'manager') setActivePersona('manager');
    else if (user.role === 'front_desk') setActivePersona('front_desk');
    else setActivePersona('mechanic');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!isLoaded) return null;

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20 md:pb-0">
      <header className="bg-white border-b sticky top-0 z-20 backdrop-blur-md bg-white/80">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => {
                  if (availablePersonas.includes('admin')) setActivePersona('admin');
                  else if (availablePersonas.includes('manager')) setActivePersona('manager');
                }}
                className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200 rotate-3 hover:rotate-0 transition-transform cursor-pointer"
              >
                <ShieldCheck size={28} />
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
              {availablePersonas.map((persona) => (
                <button
                  key={persona}
                  onClick={() => setActivePersona(persona)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                    activePersona === persona
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {persona.replace('_', ' ')}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <NotificationCenter />
              <div className="w-px h-8 bg-gray-200 mx-2 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-3 pl-2">
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{currentUser.role}</p>
                  <p className="text-sm font-black text-gray-900">{currentUser.name}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-navigation for Persona Tabs */}
          <div className="flex justify-center border-t py-2">
            <nav className="flex items-center gap-1">
              {currentPersona?.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tight ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className={`${activeTab === 'front_desk' || activeTab === 'intelligence' || activeTab === 'users' ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-8`}>
            {/* Quick Stats / Welcome */}
            {(activeTab !== 'front_desk' && activeTab !== 'intelligence' && activeTab !== 'users') && (
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap size={120} className="text-blue-600" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                    Welcome back, {currentUser.name.split(' ')[0]}!
                  </h2>
                  <p className="text-gray-500 font-medium max-w-md">
                    Access level: <span className="text-blue-600 font-bold uppercase tracking-wider">{currentUser.role}</span>. 
                    {currentUser.role === 'mechanic' ? " You have PMs pending for today." : " Monitoring machine health in real-time."}
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
            )}

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 min-h-[600px] overflow-hidden">
              {activeTab === 'status' && <MachineGrid />}
              {activeTab === 'front_desk' && <FrontDeskPortal />}
              {activeTab === 'intelligence' && <IssueSummary />}
              {activeTab === 'schedule' && (
                <MaintenanceTable 
                  initialMachineId={selectedMachineId} 
                  onMachineChange={setSelectedMachineId} 
                />
              )}
              {activeTab === 'planner' && (
                <CalendarView 
                  onMachineClick={(mId) => {
                    setSelectedMachineId(mId);
                    setActiveTab('schedule');
                  }} 
                />
              )}
              {activeTab === 'summary' && <MonthlySummary />}
              {activeTab === 'settings' && <SettingsView />}
              {activeTab === 'users' && <UserManagement />}
            </div>
          </div>

          {/* Sidebar Area */}
          {(activeTab !== 'front_desk' && activeTab !== 'intelligence' && activeTab !== 'users') && (
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
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t flex justify-around p-3 z-30 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        {currentPersona?.tabs.map((tab) => (
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
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1.5 px-4 py-1.5 rounded-2xl transition-all text-gray-400"
        >
          <LogOut size={22} />
          <span className="text-[10px] font-black uppercase tracking-widest">Exit</span>
        </button>
      </nav>
    </main>
  );
}
