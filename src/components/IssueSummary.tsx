'use client';

import React from 'react';
import { useIssues } from '@/hooks/useIssues';
import { useMachines } from '@/hooks/useMachines';
import { useSchedule } from '@/hooks/useSchedule';
import { useFrames } from '@/hooks/useFrames';
import { IssueType, StopType } from '@/types';
import { 
  AlertTriangle, 
  TrendingUp, 
  BarChart2, 
  Zap,
  Target,
  ShieldAlert,
  RotateCcw,
  MoreHorizontal,
  ChevronRight,
  Download,
  FileText,
  Calendar,
  History,
  Calculator,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { BowlingPin } from './Icons';
import { 
  startOfWeek, 
  startOfMonth, 
  startOfYear, 
  endOfWeek, 
  endOfMonth, 
  endOfYear, 
  subDays, 
  isWithinInterval, 
  parseISO, 
  format, 
  isSameDay,
  addDays,
  subWeeks,
  addWeeks
} from 'date-fns';

export const IssueSummary: React.FC = () => {
  const { issues, getAllIssueStats, isLoaded: issuesLoaded } = useIssues();
  const { machines, isLoaded: machinesLoaded } = useMachines();
  const { settings, isLoaded: settingsLoaded } = useSchedule();
  const { frameLogs, addFrameLog, isLoaded: framesLoaded } = useFrames();
  
  const [showFrameModal, setShowFrameModal] = React.useState(false);
  const [newFrameDate, setNewFrameDate] = React.useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [weekFrames, setWeekFrames] = React.useState<Record<string, string>>({});
  
  const [viewRange, setViewRange] = React.useState<'week' | 'month' | 'year' | 'custom'>('week');
  const [customRange, setCustomRange] = React.useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const handleWeekChange = React.useCallback((dateStr: string) => {
    const start = startOfWeek(parseISO(dateStr), { weekStartsOn: 1 });
    const formattedStart = format(start, 'yyyy-MM-dd');
    setNewFrameDate(formattedStart);
    
    const newWeekFrames: Record<string, string> = {};
    for (let i = 0; i < 7; i++) {
      const d = format(addDays(start, i), 'yyyy-MM-dd');
      const existing = frameLogs.find(l => l.date === d);
      newWeekFrames[d] = existing ? existing.frameCount.toString() : '';
    }
    setWeekFrames(newWeekFrames);
  }, [frameLogs]);

  React.useEffect(() => {
    if (showFrameModal) {
      handleWeekChange(newFrameDate);
    }
  }, [showFrameModal, handleWeekChange, newFrameDate]);

  if (!issuesLoaded || !machinesLoaded || !settingsLoaded || !framesLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getInterval = () => {
    const now = new Date();
    switch (viewRange) {
      case 'week': return { start: startOfWeek(now, { weekStartsOn: 1 }), end: now };
      case 'month': return { start: startOfMonth(now), end: now };
      case 'year': return { start: startOfYear(now), end: now };
      case 'custom': return { start: parseISO(customRange.start), end: parseISO(customRange.end) };
    }
  };

  const currentInterval = getInterval();

  const calculateStats = (interval: { start: Date; end: Date }) => {
    const filteredFrames = frameLogs.filter(l => {
      const d = parseISO(l.date);
      return isWithinInterval(d, interval);
    });
    
    const filteredIssues = issues.filter(i => {
      const d = parseISO(i.timestamp);
      return isWithinInterval(d, interval);
    });

    const totalFrames = filteredFrames.reduce((acc, l) => acc + l.frameCount, 0);
    const stopCount = filteredIssues.filter(i => i.isStop).length;

    return {
      fps: stopCount === 0 ? totalFrames : Math.round(totalFrames / stopCount),
      frames: totalFrames,
      stops: stopCount,
      reports: filteredIssues.length,
      filteredIssues
    };
  };

  const stats = calculateStats(currentInterval);
  const filteredIssues = stats.filteredIssues;

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Machine', 'Type', 'Is Stop?', 'Stop Category', 'Status', 'Notes'];
    const rows = filteredIssues.map(issue => {
      const machine = machines.find(m => m.id === issue.machineId);
      return [
        new Date(issue.timestamp).toLocaleString(),
        machine?.number || 'N/A',
        issue.type,
        issue.isStop ? 'YES' : 'NO',
        issue.stopType || 'N/A',
        issue.resolved ? 'Resolved' : 'Active',
        issue.notes || ''
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pinsetter_audit_${viewRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    const promises = Object.entries(weekFrames).map(([date, count]) => {
      if (!count) return Promise.resolve();
      return addFrameLog(date, parseInt(count));
    });
    await Promise.all(promises);
    setShowFrameModal(false);
  };

  const totalIssuesByType: Record<IssueType, number> = {
    pin_drop: 0,
    scoring: 0,
    interlock: 0,
    ball_return: 0,
    other: 0,
  };

  const machineIssueCounts: Record<string, Record<IssueType, number>> = {};
  filteredIssues.forEach(issue => {
    if (!machineIssueCounts[issue.machineId]) {
      machineIssueCounts[issue.machineId] = { pin_drop: 0, scoring: 0, interlock: 0, ball_return: 0, other: 0 };
    }
    machineIssueCounts[issue.machineId][issue.type]++;
    totalIssuesByType[issue.type]++;
  });

  const problematicMachines: { machineNumber: number; issueType: IssueType; count: number }[] = [];
  const thresholds = settings?.issueThresholds || {
    pin_drop: 5,
    scoring: 3,
    interlock: 2,
    ball_return: 4,
    other: 5,
  };

  Object.entries(machineIssueCounts).forEach(([machineId, counts]) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;
    Object.entries(counts).forEach(([type, count]) => {
      if (count >= (thresholds as any)[type]) {
        problematicMachines.push({
          machineNumber: machine.number,
          issueType: type as IssueType,
          count
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
    <div className="p-10 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Header & Range Toggles */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1 bg-blue-600 dark:bg-blue-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Executive Summary</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Machine Intelligence</h2>
          <p className="text-slate-500 dark:text-gray-400 font-medium mt-4 max-w-xl text-lg italic">
            Statistical analysis for {format(currentInterval.start, 'MMM d, yyyy')} - {format(currentInterval.end, 'MMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-black/5 dark:shadow-none flex gap-1">
            {(['week', 'month', 'year', 'custom'] as const).map(range => (
              <button
                key={range}
                onClick={() => setViewRange(range)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewRange === range ? 'bg-blue-600 text-white shadow-lg shadow-black/10' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {viewRange === 'custom' && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
              <input 
                type="date" 
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-blue-500 outline-none"
              />
              <span className="text-slate-300 dark:text-slate-700 self-center">→</span>
              <input 
                type="date" 
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-blue-500 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {(Object.entries(totalIssuesByType) as [IssueType, number][]).map(([type, count]) => (
          <div key={type} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl dark:hover:shadow-slate-800/50 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                {getIssueIcon(type)}
              </div>
              <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${count > (thresholds as any)[type] ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                {count > (thresholds as any)[type] ? 'High' : 'Normal'}
              </div>
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white leading-none mb-2">{count}</div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{getIssueLabel(type)} Reports</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* FPS Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm shadow-black/5 dark:shadow-none">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-black/10 dark:shadow-emerald-900/20">
                  <Calculator size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Frames Per Stop (FPS)</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1">Efficiency Metric</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFrameModal(true)}
                className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 dark:hover:bg-slate-700 shadow-xl shadow-black/20 dark:shadow-none flex items-center gap-2"
              >
                <Plus size={14} /> Log Weekly Frames
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group border border-slate-800">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                  <TrendingUp size={120} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-4">Calculated FPS</span>
                <div className="text-6xl font-black mb-2 tracking-tighter">{stats.fps.toLocaleString()}</div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Efficiency Rating</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: 2,000</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 group">
                <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] block mb-4 text-center">Frames Bowled</span>
                <div className="text-5xl font-black text-slate-900 dark:text-white mb-4 text-center tracking-tighter">{stats.frames.toLocaleString()}</div>
                <div className="flex flex-col gap-2">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest text-center">Total Volume in Period</span>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] p-8 border border-red-100 dark:border-red-900/30 group">
                <span className="text-[10px] font-black text-red-400 dark:text-red-400 uppercase tracking-[0.2em] block mb-4 text-center">Mechanical Stops</span>
                <div className="text-5xl font-black text-red-600 dark:text-red-500 mb-4 text-center tracking-tighter">{stats.stops}</div>
                <div className="flex flex-col gap-2">
                  <div className="h-1.5 w-full bg-red-200 dark:bg-red-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (stats.stops / 20) * 100)}%` }} />
                  </div>
                  <span className="text-[9px] font-black text-red-400 dark:text-red-400 uppercase tracking-widest text-center">Impact on Service</span>
                </div>
              </div>
            </div>

            {/* Daily Breakdown */}
            {(viewRange === 'week' || viewRange === 'custom') && (
              <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-6 ml-2">Daily Performance Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = subDays(currentInterval.end, i);
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayFrames = frameLogs.find(l => l.date === dateStr)?.frameCount || 0;
                    const dayStops = issues.filter(issue => issue.isStop && isSameDay(parseISO(issue.timestamp), date)).length;
                    const dayFps = dayStops === 0 ? dayFrames : Math.round(dayFrames / dayStops);

                    return (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase mb-2">{format(date, 'EEE d')}</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white leading-none">{dayFps.toLocaleString()}</div>
                        <span className="text-[8px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-tighter mt-1">FPS</span>
                        <div className="mt-3 flex gap-1">
                          <div className={`w-1 h-1 rounded-full ${dayFrames > 0 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                          <div className={`w-1 h-1 rounded-full ${dayStops > 0 ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Activity History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm shadow-black/5 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                  <History size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Activity History</h3>
              </div>
              <button 
                onClick={handleExportCSV}
                className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-100 dark:border-slate-700 shadow-sm shadow-black/5 dark:shadow-none"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-50 dark:border-slate-800">
                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Date/Time</th>
                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Machine</th>
                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Category</th>
                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Impact</th>
                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-gray-500 text-sm font-medium italic">No activity recorded for this period.</td>
                    </tr>
                  ) : (
                    filteredIssues.map(issue => {
                      const machine = machines.find(m => m.id === issue.machineId);
                      return (
                        <tr key={issue.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4">
                            <div className="text-xs font-black text-slate-900 dark:text-white">{format(parseISO(issue.timestamp), 'MMM d')}</div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">{format(parseISO(issue.timestamp), 'h:mm a')}</div>
                          </td>
                          <td className="py-4">
                            <span className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white dark:text-gray-300 flex items-center justify-center text-[10px] font-black border border-slate-800 dark:border-slate-700">#{machine?.number}</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{getIssueIcon(issue.type)}</span>
                              <span className="text-[10px] font-black uppercase text-slate-700 dark:text-gray-300">{getIssueLabel(issue.type)}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            {issue.isStop ? (
                              <span className="px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[9px] font-black uppercase border border-red-200 dark:border-red-900/30">MECHANICAL STOP</span>
                            ) : (
                              <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase border border-blue-200 dark:border-blue-900/30">QUICK REPORT</span>
                            )}
                          </td>
                          <td className="py-4 text-right pr-4">
                            {issue.resolved ? (
                              <CheckCircle2 size={16} className="text-green-500 ml-auto" />
                            ) : (
                              <AlertCircle size={16} className="text-amber-500 ml-auto" />
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 dark:bg-slate-950 rounded-[3rem] p-8 text-white shadow-2xl shadow-black/20 relative overflow-hidden border border-white/10 dark:border-slate-800">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap size={120} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <TrendingUp size={20} className="text-blue-400" /> Strategic Insight
            </h3>
            <p className="text-slate-300 font-medium leading-relaxed mb-8 text-sm">
              {problematicMachines.length > 0 ? (
                <>
                  <span className="text-white font-bold underline decoration-blue-500">Machine #{problematicMachines[0].machineNumber}</span> is 
                  triggering <span className="text-white font-bold underline decoration-blue-500">{getIssueLabel(problematicMachines[0].issueType)}</span> alerts 
                  more than {problematicMachines[0].count} times in this period.
                </>
              ) : (
                "Equipment performance is within nominal parameters for this selected timeframe."
              )}
            </p>
            <button 
              onClick={() => window.print()}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40"
            >
              Print Audit Report <FileText size={16} />
            </button>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 rounded-[3rem] p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-red-600 text-white p-3 rounded-2xl shadow-lg shadow-black/10 dark:shadow-red-900/20">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-red-900 dark:text-red-500 tracking-tight uppercase leading-none">High Frequency</h3>
            </div>

            {problematicMachines.length > 0 ? (
              <div className="space-y-4">
                {problematicMachines.slice(0, 5).map((alert, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 p-6 rounded-[2rem] shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 text-white dark:text-gray-200 rounded-xl flex items-center justify-center font-black text-lg shadow-lg border border-slate-700">
                        #{alert.machineNumber}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{getIssueLabel(alert.issueType)}</p>
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Repeat Issue</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-800 pt-4">
                      <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Reports: {alert.count}</span>
                      <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-lg text-[8px] font-black uppercase border border-red-100 dark:border-red-900/30">Exceeds Target</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Zap size={48} className="mx-auto text-green-500 mb-4 opacity-30" />
                <p className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">All Systems Nominal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly FPS Modal */}
      {showFrameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-sm" onClick={() => setShowFrameModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-5xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 w-16 h-16 rounded-[1.5rem] flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <Calculator size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Weekly FPS Log</h3>
                  <p className="text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Manual Frame Entry & Automatic Stop Sync</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                <button 
                  type="button"
                  onClick={() => handleWeekChange(format(subWeeks(parseISO(newFrameDate), 1), 'yyyy-MM-dd'))}
                  className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="text-center min-w-[150px]">
                  <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Week Starting</span>
                  <span className="font-black text-slate-900 dark:text-white">{format(parseISO(newFrameDate), 'MMM d, yyyy')}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => handleWeekChange(format(addWeeks(parseISO(newFrameDate), 1), 'yyyy-MM-dd'))}
                  className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveWeek}>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-10">
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = addDays(parseISO(newFrameDate), i);
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const stopsCount = issues.filter(issue => issue.isStop && isSameDay(parseISO(issue.timestamp), date)).length;
                  
                  return (
                    <div key={dateStr} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-4 flex flex-col items-center group hover:border-emerald-500 transition-all">
                      <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase mb-1">{format(date, 'EEE')}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white mb-4">{format(date, 'MMM d')}</span>
                      
                      <div className="w-full space-y-4">
                        <div>
                          <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-1 text-center">Frames</label>
                          <input 
                            type="number"
                            value={weekFrames[dateStr] || ''}
                            onChange={(e) => setWeekFrames(prev => ({ ...prev, [dateStr]: e.target.value }))}
                            placeholder="0"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-center font-black text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                          />
                        </div>
                        
                        <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl py-2 px-1 border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                          <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase mb-1">Stops</span>
                          <div className={`text-sm font-black ${stopsCount > 0 ? 'text-red-500' : 'text-slate-300 dark:text-slate-700'}`}>
                            {stopsCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowFrameModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 font-black uppercase tracking-widest text-xs py-5 rounded-[1.5rem] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-emerald-600 text-white font-black uppercase tracking-widest text-xs py-5 rounded-[1.5rem] hover:bg-emerald-700 transition-all shadow-xl shadow-black/10 dark:shadow-emerald-900/20 flex items-center justify-center gap-3"
                >
                  Save Full Week <CheckCircle2 size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
