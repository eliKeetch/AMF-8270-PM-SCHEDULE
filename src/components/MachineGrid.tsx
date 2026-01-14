'use client';

import React from 'react';
import { useMachines } from '@/hooks/useMachines';
import { useSchedule } from '@/hooks/useSchedule';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Machine, MachineStatus, User } from '@/types';
import { Calendar, AlertCircle, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

export const MachineGrid: React.FC = () => {
  const { machines, updateMachineStatus, isLoaded: machinesLoaded } = useMachines();
  const { scheduledTasks, isLoaded: scheduleLoaded } = useSchedule();
  const [currentUser] = useLocalStorage<User | null>('pinsetter-session', null);

  if (!machinesLoaded || !scheduleLoaded) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const isAdmin = currentUser?.role === 'admin';

  const getStatusUI = (status: MachineStatus) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: <CheckCircle2 size={16} className="text-green-500" />,
          label: 'Operational'
        };
      case 'maintenance':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: <Clock size={16} className="text-yellow-500" />,
          label: 'Service'
        };
      case 'down':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <AlertCircle size={16} className="text-red-500" />,
          label: 'Down'
        };
      case 'permanently_down':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-500',
          icon: <AlertCircle size={16} className="text-gray-400" />,
          label: 'Parts Only'
        };
    }
  };

  const getNextPM = (machineId: string) => {
    const futureTasks = scheduledTasks
      .filter(t => t.machineId === machineId && t.status === 'pending')
      .sort((a, b) => a.date.localeCompare(b.date));
    return futureTasks.length > 0 ? futureTasks[0].date : null;
  };

  const sortedMachines = [...machines].sort((a, b) => a.number - b.number);
  
  // Group machines into pairs (1-2, 3-4, etc.)
  const pairs: Machine[][] = [];
  for (let i = 0; i < sortedMachines.length; i += 2) {
    pairs.push(sortedMachines.slice(i, i + 2));
  }

  const handleUpdatePairStatus = (pair: Machine[], status: MachineStatus) => {
    pair.forEach(m => updateMachineStatus(m.id, status));
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Pinsetters</h2>
          <p className="text-gray-500 mt-1 font-medium italic">Real-time machine status and upcoming service</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {pairs.map((pair, pairIdx) => (
          <div key={pairIdx} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8 px-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">
                  Pair {pairIdx + 1}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  Machines {pair.map(m => `#${m.number}`).join(' & ')}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdatePairStatus(pair, 'active')}
                  className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-all active:scale-95"
                >
                  Set Open
                </button>
                <button 
                  onClick={() => handleUpdatePairStatus(pair, 'down')}
                  className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-all active:scale-95"
                >
                  Shut Down
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {pair.map((machine) => {
                const ui = getStatusUI(machine.status);
                const nextPM = getNextPM(machine.id);
                const isPMToday = nextPM && isToday(parseISO(nextPM));

                return (
                  <div
                    key={machine.id}
                    className={`relative flex flex-col border-2 rounded-[2rem] transition-all duration-300 ${ui.border} bg-white hover:shadow-xl hover:-translate-y-0.5 overflow-hidden`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none block mb-2">#{machine.number}</span>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ui.bg} ${ui.text} border ${ui.border}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${ui.bg.replace('50', '500')}`} />
                            {ui.label}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="relative group">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 block ml-1">Update Status</label>
                          <div className="relative">
                            <select
                              value={machine.status}
                              onChange={(e) => updateMachineStatus(machine.id, e.target.value as MachineStatus)}
                              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <option value="active">Operational</option>
                              <option value="maintenance">Service</option>
                              <option value="down">Out of Order</option>
                              <option value="permanently_down">Parts Machine</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                          </div>
                        </div>

                        <div className={`p-4 rounded-2xl border-2 ${isPMToday ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/30 border-gray-100'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className={isPMToday ? 'text-blue-500' : 'text-gray-400'} />
                              <span className={`text-[9px] font-black uppercase tracking-widest ${isPMToday ? 'text-blue-600' : 'text-gray-500'}`}>
                                Next Scheduled PM
                              </span>
                            </div>
                            {isPMToday && (
                              <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg animate-pulse">
                                DUE TODAY
                              </span>
                            )}
                          </div>
                          <div className={`text-xl font-black ${isPMToday ? 'text-blue-700' : 'text-gray-900'}`}>
                            {nextPM ? format(parseISO(nextPM), 'MMMM dd, yyyy') : 'No Service Scheduled'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {machine.status === 'permanently_down' && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] -rotate-12 border-4 border-white shadow-2xl">
                          Offline / Parts
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
