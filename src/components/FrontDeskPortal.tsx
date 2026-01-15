'use client';

import React, { useState } from 'react';
import { useMachines } from '@/hooks/useMachines';
import { useIssues } from '@/hooks/useIssues';
import { IssueType, Machine, MachineStatus, StopType } from '@/types';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Target,
  ShieldAlert,
  RotateCcw,
  PlusCircle,
  MoreHorizontal,
  Plus,
  Minus,
  TriangleAlert
} from 'lucide-react';
import { BowlingPin } from './Icons';

const ISSUE_OPTIONS: { type: IssueType; label: string; icon: any; color: string }[] = [
  { type: 'pin_drop', label: 'Pin Drop', icon: BowlingPin, color: 'bg-orange-100 text-orange-700' },
  { type: 'scoring', label: 'Scoring', icon: Target, color: 'bg-blue-100 text-blue-700' },
  { type: 'interlock', label: 'Interlock', icon: ShieldAlert, color: 'bg-purple-100 text-purple-700' },
  { type: 'ball_return', label: 'Ball Return', icon: RotateCcw, color: 'bg-cyan-100 text-cyan-700' },
  { type: 'other', label: 'Other Issue', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

const STOP_OPTIONS: { type: StopType; label: string; icon: any; color: string }[] = [
  { type: 'pin_jam', label: 'Pin Jam', icon: BowlingPin, color: 'bg-red-100 text-red-700' },
  { type: 'ball_return', label: 'Ball Return', icon: RotateCcw, color: 'bg-red-100 text-red-700' },
  { type: 'subway_balls', label: 'Balls in Subway', icon: MoreHorizontal, color: 'bg-red-100 text-red-700' },
  { type: 'interlock', label: 'Interlock', icon: ShieldAlert, color: 'bg-red-100 text-red-700' },
  { type: 'other', label: 'Other Stop', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
];

export const FrontDeskPortal: React.FC = () => {
  const { machines, updateMachineStatus, isLoaded: machinesLoaded } = useMachines();
  const { reportIssue, issues, isLoaded: issuesLoaded } = useIssues();
  const [stopModal, setStopModal] = useState<{ machineId: string; number: number } | null>(null);

  if (!machinesLoaded || !issuesLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAddStop = (type: StopType) => {
    if (!stopModal) return;
    reportIssue(stopModal.machineId, 'other', 'Stop recorded from Front Desk', true, type);
    setStopModal(null);
  };

  const getStatusUI = (status: MachineStatus) => {
    switch (status) {
      case 'active':
        return { 
          bg: 'bg-green-50 dark:bg-green-900/10', 
          border: 'border-green-200 dark:border-green-800/50', 
          text: 'text-green-700 dark:text-green-400',
          icon: <CheckCircle2 size={16} className="text-green-500" />, 
          label: 'Unparked' 
        };
      case 'maintenance':
        return { 
          bg: 'bg-yellow-50 dark:bg-yellow-900/10', 
          border: 'border-yellow-200 dark:border-yellow-800/50', 
          text: 'text-yellow-700 dark:text-yellow-400',
          icon: <Clock size={16} className="text-yellow-500" />, 
          label: 'Service' 
        };
      case 'down':
        return { 
          bg: 'bg-red-50 dark:bg-red-900/10', 
          border: 'border-red-200 dark:border-red-800/50', 
          text: 'text-red-700 dark:text-red-400',
          icon: <XCircle size={16} className="text-red-500" />, 
          label: 'Parked' 
        };
      case 'permanently_down':
        return { 
          bg: 'bg-gray-100 dark:bg-slate-800', 
          border: 'border-gray-200 dark:border-slate-700', 
          text: 'text-gray-500 dark:text-gray-400',
          icon: <AlertCircle size={16} className="text-gray-400" />, 
          label: 'Offline' 
        };
    }
  };

  const handleReportIssue = (machineId: string, type: IssueType) => {
    reportIssue(machineId, type);
  };

  const sortedMachines = [...machines].sort((a, b) => a.number - b.number);
  const pairs: Machine[][] = [];
  for (let i = 0; i < sortedMachines.length; i += 2) {
    pairs.push(sortedMachines.slice(i, i + 2));
  }

  const handleUpdatePairStatus = (pair: Machine[], status: MachineStatus) => {
    pair.forEach(m => updateMachineStatus(m.id, status));
  };

  return (
    <div className="p-8">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase">Lane Control</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-2 italic">Instant monitoring and rapid issue reporting</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 3xl:grid-cols-3 gap-10">
        {pairs.map((pair, pairIdx) => (
          <div key={pairIdx} className="bg-slate-50/50 dark:bg-slate-900/50 rounded-[4rem] p-8 border-4 border-white dark:border-slate-800 shadow-inner relative overflow-hidden group/pair">
            <div className="flex justify-between items-center mb-8 px-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  Pair {pairIdx + 1}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdatePairStatus(pair, 'active')}
                  className="bg-white dark:bg-slate-800 border-2 border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-green-500 dark:hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                  Unpark Pair
                </button>
                <button 
                  onClick={() => handleUpdatePairStatus(pair, 'down')}
                  className="bg-white dark:bg-slate-800 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-500/90 dark:hover:bg-red-500/90 hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                  Park Pair
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {pair.map((machine) => {
                const ui = getStatusUI(machine.status);
                const activeIssues = issues.filter(i => i.machineId === machine.id && !i.resolved);

                return (
                  <div
                    key={machine.id}
                    className={`relative border-4 rounded-[3rem] p-8 transition-all duration-300 bg-white dark:bg-slate-900 ${ui.border} shadow-xl shadow-black/5 hover:shadow-2xl dark:hover:shadow-slate-800/50 hover:-translate-y-1`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">#{machine.number}</span>
                        <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ui.bg} ${ui.text} border-2 ${ui.border} whitespace-nowrap`}>
                          {ui.icon}
                          {ui.label}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => setStopModal({ machineId: machine.id, number: machine.number })}
                          className="bg-red-500/90 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-black/10 dark:shadow-red-900/20 flex items-center gap-1.5"
                        >
                          <TriangleAlert size={14} />
                          ADD STOP
                        </button>
                        {activeIssues.length > 0 && (
                          <div className="bg-slate-900 dark:bg-red-500/90 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black animate-pulse shadow-xl shadow-black/20 dark:shadow-none text-base">
                            {activeIssues.length}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center">Quick Report</p>
                      <div className="grid grid-cols-2 gap-2">
                        {ISSUE_OPTIONS.map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() => handleReportIssue(machine.id, opt.type)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-[1.5rem] border-2 border-transparent hover:scale-105 transition-all active:scale-90 shadow-sm ${opt.color.includes('orange-100') ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : opt.color.includes('blue-100') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : opt.color.includes('purple-100') ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : opt.color.includes('cyan-100') ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-400'}`}
                          >
                            <opt.icon size={22} />
                            <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-100 dark:border-slate-800">
                      {machine.status === 'active' ? (
                        <button
                          onClick={() => updateMachineStatus(machine.id, 'down')}
                          className="w-full py-4 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Minus size={18} /> Park Machine
                        </button>
                      ) : (
                        <button
                          onClick={() => updateMachineStatus(machine.id, 'active')}
                          className="w-full py-4 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Plus size={18} /> Unpark Machine
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Stop Selection Modal */}
      {stopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-sm" onClick={() => setStopModal(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setStopModal(null)}
              className="absolute top-8 right-8 text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400 transition-colors"
            >
              <XCircle size={32} />
            </button>
            
            <div className="text-center mb-10">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-800/50">
                <TriangleAlert size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Record Stop</h3>
              <p className="text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Machine #{stopModal.number}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {STOP_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleAddStop(opt.type)}
                  className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group group`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${opt.color.includes('bg-red-100') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-400'}`}>
                    <opt.icon size={28} />
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight block leading-none mb-1">{opt.label}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Customer Interruption</span>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center mt-10 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">
              This will be recorded in the FPS intelligence summary.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
