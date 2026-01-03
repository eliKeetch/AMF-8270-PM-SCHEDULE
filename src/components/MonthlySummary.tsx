'use client';

import React from 'react';
import { useMachines } from '@/hooks/useMachines';
import { useMaintenance } from '@/hooks/useMaintenance';
import { PM_SCHEDULE } from '@/data/schedule';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const MonthlySummary: React.FC = () => {
  const { machines, isLoaded: machinesLoaded } = useMachines();
  const { isTaskCompleted, isLoaded: recordsLoaded } = useMaintenance();
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  if (!machinesLoaded || !recordsLoaded) return null;

  const activeMachines = machines.filter(m => m.status !== 'permanently_down');
  const scheduledTasks = PM_SCHEDULE.filter(t => t.months.includes(currentMonth));

  const stats = activeMachines.map(machine => {
    const totalDue = scheduledTasks.length;
    const completed = scheduledTasks.filter(task => 
      isTaskCompleted(machine.id, task.id, currentMonth, currentYear)
    ).length;
    
    return {
      machine,
      totalDue,
      completed,
      percentage: totalDue > 0 ? Math.round((completed / totalDue) * 100) : 100
    };
  });

  const overallCompleted = stats.reduce((acc, s) => acc + s.completed, 0);
  const overallTotal = stats.reduce((acc, s) => acc + s.totalDue, 0);
  const overallPercentage = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 100;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Monthly Progress</p>
            <p className="text-2xl font-bold">{overallPercentage}%</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Tasks</p>
            <p className="text-2xl font-bold">{overallCompleted} / {overallTotal}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Remaining Today</p>
            <p className="text-2xl font-bold">{overallTotal - overallCompleted}</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-4">Machine Readiness</h3>
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-sm text-gray-600">Machine</th>
              <th className="p-4 font-bold text-sm text-gray-600">Progress</th>
              <th className="p-4 font-bold text-sm text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.sort((a, b) => b.percentage - a.percentage).map((stat) => (
              <tr key={stat.machine.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-lg">#{stat.machine.number}</td>
                <td className="p-4 w-1/2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stat.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{stat.percentage}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    stat.percentage === 100 
                      ? 'bg-green-100 text-green-700' 
                      : stat.percentage > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {stat.percentage === 100 ? 'Complete' : stat.percentage > 0 ? 'In Progress' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
