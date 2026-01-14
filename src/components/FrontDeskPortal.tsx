'use client';

import React, { useState } from 'react';
import { useMachines } from '@/hooks/useMachines';
import { useIssues } from '@/hooks/useIssues';
import { IssueType, Machine, MachineStatus } from '@/types';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Target,
  ShieldAlert,
  RotateCcw,
  PlusCircle,
  MoreHorizontal
} from 'lucide-react';
import { BowlingPin } from './Icons';

const ISSUE_OPTIONS: { type: IssueType; label: string; icon: any; color: string }[] = [
  { type: 'pin_drop', label: 'Pin Drop', icon: BowlingPin, color: 'bg-orange-100 text-orange-700' },
  { type: 'scoring', label: 'Scoring', icon: Target, color: 'bg-blue-100 text-blue-700' },
  { type: 'interlock', label: 'Interlock', icon: ShieldAlert, color: 'bg-purple-100 text-purple-700' },
  { type: 'ball_return', label: 'Ball Return', icon: RotateCcw, color: 'bg-cyan-100 text-cyan-700' },
  { type: 'other', label: 'Other Issue', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

export const FrontDeskPortal: React.FC = () => {
  const { machines, updateMachineStatus, isLoaded: machinesLoaded } = useMachines();
  const { reportIssue, issues, isLoaded: issuesLoaded } = useIssues();

  if (!machinesLoaded || !issuesLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusUI = (status: MachineStatus) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle2 size={16} className="text-green-500" />, label: 'UP' };
      case 'maintenance':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: <Clock size={16} className="text-yellow-500" />, label: 'Service' };
      case 'down':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle size={16} className="text-red-500" />, label: 'DOWN' };
      case 'permanently_down':
        return { bg: 'bg-gray-100', border: 'border-gray-200', icon: <AlertCircle size={16} className="text-gray-400" />, label: 'Offline' };
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
        <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none uppercase">Lane Control</h2>
        <p className="text-lg text-gray-500 font-medium mt-2 italic">Instant monitoring and rapid issue reporting</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 3xl:grid-cols-3 gap-10">
        {pairs.map((pair, pairIdx) => (
          <div key={pairIdx} className="bg-slate-50/50 rounded-[4rem] p-8 border-4 border-white shadow-inner relative overflow-hidden group/pair">
            <div className="flex justify-between items-center mb-8 px-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-slate-200 rounded-full" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Pair {pairIdx + 1}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdatePairStatus(pair, 'active')}
                  className="bg-white border-2 border-green-100 text-green-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                  Open
                </button>
                <button 
                  onClick={() => handleUpdatePairStatus(pair, 'down')}
                  className="bg-white border-2 border-red-100 text-red-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                  Close
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
                    className={`relative border-4 rounded-[3rem] p-8 transition-all duration-300 bg-white ${ui.border} shadow-xl shadow-black/5 hover:shadow-2xl hover:-translate-y-1`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none">#{machine.number}</span>
                        <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ui.bg} border-2 ${ui.border} whitespace-nowrap`}>
                          {ui.icon}
                          {ui.label}
                        </div>
                      </div>
                      {activeIssues.length > 0 && (
                        <div className="bg-red-500 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black animate-bounce shadow-xl shadow-red-200 text-base">
                          {activeIssues.length}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mt-6">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Quick Report</p>
                      <div className="grid grid-cols-2 gap-2">
                        {ISSUE_OPTIONS.map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() => handleReportIssue(machine.id, opt.type)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-[1.5rem] border-2 border-transparent hover:scale-105 transition-all active:scale-90 shadow-sm ${opt.color}`}
                          >
                            <opt.icon size={22} />
                            <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-100">
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateMachineStatus(machine.id, 'active')}
                          className={`flex-1 py-3 rounded-xl text-[12px] font-black uppercase tracking-[0.1em] border-2 transition-all ${machine.number.toString().length > 2 ? 'px-1' : ''} ${machine.status === 'active' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-50 border-gray-100 text-gray-300 hover:border-green-200 hover:text-green-500'}`}
                        >
                          UP
                        </button>
                        <button
                          onClick={() => updateMachineStatus(machine.id, 'down')}
                          className={`flex-1 py-3 rounded-xl text-[12px] font-black uppercase tracking-[0.1em] border-2 transition-all ${machine.number.toString().length > 2 ? 'px-1' : ''} ${machine.status === 'down' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-100' : 'bg-gray-50 border-gray-100 text-gray-300 hover:border-red-200 hover:text-red-500'}`}
                        >
                          DOWN
                        </button>
                      </div>
                    </div>
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
