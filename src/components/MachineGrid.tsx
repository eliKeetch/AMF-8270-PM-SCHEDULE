'use client';

import React from 'react';
import { useMachines } from '@/hooks/useMachines';
import { useSchedule } from '@/hooks/useSchedule';
import { MachineStatus } from '@/types';
import { Plus, Trash2, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

export const MachineGrid: React.FC = () => {
  const { machines, updateMachineStatus, addMachine, removeMachine, isLoaded: machinesLoaded } = useMachines();
  const { scheduledTasks, isLoaded: scheduleLoaded } = useSchedule();

  if (!machinesLoaded || !scheduleLoaded) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

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
          label: 'Service In Progress'
        };
      case 'down':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <AlertCircle size={16} className="text-red-500" />,
          label: 'Out of Order'
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

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Machine Fleet</h2>
          <p className="text-gray-500 mt-1 font-medium">Real-time status and upcoming maintenance</p>
        </div>
        <button
          onClick={addMachine}
          className="group flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
          Add Machine
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {machines.sort((a, b) => a.number - b.number).map((machine) => {
          const ui = getStatusUI(machine.status);
          const nextPM = getNextPM(machine.id);
          const isPMToday = nextPM && isToday(parseISO(nextPM));

          return (
            <div
              key={machine.id}
              className={`relative overflow-hidden border-2 rounded-2xl transition-all hover:shadow-xl group bg-white ${ui.border}`}
            >
              {/* Top Bar Status */}
              <div className={`h-1.5 w-full ${ui.bg.replace('50', '500')}`} />
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">#{machine.number}</span>
                    <div className={`flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ui.bg} ${ui.text} border ${ui.border}`}>
                      {ui.icon}
                      {ui.label}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeMachine(machine.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    aria-label="Remove machine"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status Picker */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Change Status</label>
                    <select
                      value={machine.status}
                      onChange={(e) => updateMachineStatus(machine.id, e.target.value as MachineStatus)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="active">Operational</option>
                      <option value="maintenance">Service</option>
                      <option value="down">Out of Order</option>
                      <option value="permanently_down">Parts Machine</option>
                    </select>
                  </div>

                  {/* PM Info */}
                  <div className={`p-3 rounded-xl border ${isPMToday ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className={isPMToday ? 'text-blue-500' : 'text-gray-400'} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isPMToday ? 'text-blue-600' : 'text-gray-500'}`}>
                        Next Maintenance
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className={`text-sm font-bold ${isPMToday ? 'text-blue-700' : 'text-gray-700'}`}>
                        {nextPM ? format(parseISO(nextPM), 'MMM dd, yyyy') : 'Not scheduled'}
                      </span>
                      {isPMToday && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                          TODAY
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaction Overlay for permanently_down */}
              {machine.status === 'permanently_down' && (
                <div className="absolute inset-0 bg-white/40 backdrop-grayscale-[0.5] pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
