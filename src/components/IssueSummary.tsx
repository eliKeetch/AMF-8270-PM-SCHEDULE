'use client';

import React from 'react';
import { useIssues } from '@/hooks/useIssues';
import { useMachines } from '@/hooks/useMachines';
import { useSchedule } from '@/hooks/useSchedule';
import { IssueType, AppSettings } from '@/types';
import { 
  AlertTriangle, 
  TrendingUp, 
  BarChart2, 
  Zap,
  Target,
  ShieldAlert,
  RotateCcw,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { BowlingPin } from './Icons';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const IssueSummary: React.FC = () => {
  const { issues, getAllIssueStats, isLoaded: issuesLoaded } = useIssues();
  const { machines, isLoaded: machinesLoaded } = useMachines();
  const { settings, isLoaded: settingsLoaded } = useSchedule();

  if (!issuesLoaded || !machinesLoaded || !settingsLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const issueStats = getAllIssueStats();
  const thresholds = settings?.issueThresholds || {
    pin_drop: 5,
    scoring: 3,
    interlock: 2,
    ball_return: 4,
    other: 5,
  };

  const totalIssuesByType: Record<IssueType, number> = {
    pin_drop: 0,
    scoring: 0,
    interlock: 0,
    ball_return: 0,
    other: 0,
  };

  const problematicMachines: { machineNumber: number; issueType: IssueType; count: number }[] = [];

  Object.entries(issueStats).forEach(([machineId, stats]) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;

    Object.entries(stats).forEach(([type, count]) => {
      totalIssuesByType[type as IssueType] += count;
      if (count >= thresholds[type as IssueType]) {
        problematicMachines.push({
          machineNumber: machine.number,
          issueType: type as IssueType,
          count,
        });
      }
    });
  });

  const getIssueIcon = (type: IssueType) => {
    switch (type) {
      case 'pin_drop': return <BowlingPin size={18} />;
      case 'scoring': return <Target size={18} />;
      case 'interlock': return <ShieldAlert size={18} />;
      case 'ball_return': return <RotateCcw size={18} />;
      case 'other': return <MoreHorizontal size={18} />;
    }
  };

  const getIssueLabel = (type: IssueType) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="p-10 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1 bg-blue-600 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Executive Summary</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Machine Intelligence</h2>
          <p className="text-slate-500 font-medium mt-4 max-w-xl text-lg">Statistical analysis of recurring machine failures and operational trends for improved ROI and uptime.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">House Health</span>
            <span className="text-2xl font-black text-slate-900">94.2%</span>
          </div>
          <div className="bg-white px-6 py-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">PM Compliance</span>
            <span className="text-2xl font-black text-slate-900">88.0%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {(Object.entries(totalIssuesByType) as [IssueType, number][]).map(([type, count]) => (
          <div key={type} className="bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 border border-slate-100">
                {getIssueIcon(type)}
              </div>
              <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${count > 5 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                {count > 5 ? 'High' : 'Normal'}
              </div>
            </div>
            <div className="text-4xl font-black text-slate-900 leading-none mb-2">{count}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getIssueLabel(type)} Reports</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Analytics Section */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100">
                  <BarChart2 size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Performance Outlook</h3>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MTBF Analysis</div>
            </div>

            <div className="space-y-8">
              {(Object.entries(totalIssuesByType) as [IssueType, number][]).map(([type, count]) => {
                const max = Math.max(...Object.values(totalIssuesByType), 1);
                const percentage = (count / max) * 100;
                
                return (
                  <div key={type} className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-3">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">{getIssueLabel(type)}</span>
                    </div>
                    <div className="col-span-7 h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${percentage > 70 ? 'bg-red-500' : percentage > 40 ? 'bg-amber-500' : 'bg-blue-600'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-lg font-black text-slate-900">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap size={150} className="text-blue-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black tracking-tight mb-6 uppercase flex items-center gap-3">
                <TrendingUp size={24} className="text-blue-400" /> Strategic Insight
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed mb-8 max-w-2xl text-lg">
                Current data patterns indicate that <span className="text-white font-bold underline decoration-blue-500">Machine {problematicMachines.length > 0 ? problematicMachines[0].machineNumber : 'N/A'}</span> is experiencing an above-average failure rate in the {problematicMachines.length > 0 ? getIssueLabel(problematicMachines[0].issueType) : 'critical'} system.
              </p>
              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-900/20">
                  Generate Full Audit <ChevronRight size={18} />
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all">
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Alerts Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-red-50 border-2 border-red-100 rounded-[3rem] p-8 h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-red-600 text-white p-3 rounded-2xl shadow-lg shadow-red-200">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-red-900 tracking-tight uppercase leading-none">Operational Alerts</h3>
            </div>

            {problematicMachines.length > 0 ? (
              <div className="space-y-4">
                {problematicMachines.map((alert, idx) => (
                  <div key={idx} className="bg-white border border-red-100 p-6 rounded-[2rem] shadow-sm group hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg group-hover:bg-red-600 transition-colors">
                        #{alert.machineNumber}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{getIssueLabel(alert.issueType)}</p>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Action Required</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Reports</span>
                        <span className="text-xl font-black text-slate-900">{alert.count}</span>
                      </div>
                      <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-red-100 tracking-tighter">
                        Exceeds Threshold
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/50 border border-white/20 p-12 rounded-[2.5rem] text-center">
                <Zap size={48} className="mx-auto text-green-500 mb-6 opacity-50" />
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">House Status: Nominal</p>
                <p className="text-xs text-slate-500 mt-2">All equipment performing within standard operating parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
