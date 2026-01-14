'use client';

import React, { useState } from 'react';
import { PM_SCHEDULE } from '@/data/schedule';
import { PMTask } from '@/types';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useMachines } from '@/hooks/useMachines';
import { CheckCircle2, Circle as CircleIcon, AlertCircle, Droplets, Square } from 'lucide-react';
import { format } from 'date-fns';
import { ManualModal } from '@/components/ManualModal';

interface MaintenanceTableProps {
  initialMachineId?: string | null;
  onMachineChange?: (id: string) => void;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({ 
  initialMachineId, 
  onMachineChange 
}) => {
  const { machines, isLoaded: machinesLoaded } = useMachines();
  const { isTaskCompleted, toggleTaskCompletion, isLoaded: recordsLoaded } = useMaintenance();
  const [localMachineId, setLocalMachineId] = useState<string | null>(initialMachineId || null);
  const [selectedTask, setSelectedTask] = useState<PMTask | null>(null);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  if (!machinesLoaded || !recordsLoaded) return null;

  const activeMachines = machines.filter(m => m.status !== 'permanently_down').sort((a, b) => a.number - b.number);
  const currentMachineId = initialMachineId || localMachineId || activeMachines[0]?.id;
  const currentMachine = activeMachines.find(m => m.id === currentMachineId) || activeMachines[0];

  const handleMachineChange = (id: string) => {
    setLocalMachineId(id);
    if (onMachineChange) {
      onMachineChange(id);
    }
  };

  if (!currentMachine) {
    return <div className="p-6">No active machines available.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Schedule</h2>
          <p className="text-gray-500">Tracking for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="font-medium text-sm">Machine:</label>
          <select 
            value={currentMachine.id} 
            onChange={(e) => handleMachineChange(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {activeMachines.map(m => (
              <option key={m.id} value={m.id}>Machine #{m.number}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-bold text-sm text-gray-600 sticky left-0 bg-gray-50 z-10 w-64">TASK</th>
                {months.map((month, idx) => (
                  <th 
                    key={month} 
                    className={`p-4 font-bold text-xs text-center border-l ${idx === currentMonth ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                  >
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PM_SCHEDULE.map((task) => (
                <tr key={task.id} className="border-b hover:bg-gray-50 transition-colors group">
                  <td className="p-4 text-sm font-medium text-gray-800 sticky left-0 bg-white border-r shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setSelectedTask(task)}
                        className="flex items-center gap-3 hover:text-blue-600 transition-colors text-left"
                      >
                        <div className={`p-1.5 rounded-lg border ${task.method === 'oil' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                          {task.method === 'oil' ? <Droplets size={14} /> : <Square size={14} />}
                        </div>
                        <span className="font-bold">{task.name}</span>
                      </button>
                    </div>
                  </td>
                  {months.map((_, monthIdx) => {
                    const isScheduled = task.months.includes(monthIdx);
                    const completed = isTaskCompleted(currentMachine.id, task.id, monthIdx, currentYear);
                    const isCurrent = monthIdx === currentMonth;

                    return (
                      <td 
                        key={monthIdx} 
                        className={`p-2 border-l text-center ${isCurrent ? 'bg-blue-50/30' : ''}`}
                      >
                        {isScheduled ? (
                          <button
                            onClick={() => toggleTaskCompletion(currentMachine.id, task.id, monthIdx, currentYear)}
                            className={`mx-auto flex items-center justify-center p-2 rounded-md transition-all ${
                              completed 
                                ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                                : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            {completed ? <CheckCircle2 size={20} /> : <CircleIcon size={20} />}
                          </button>
                        ) : (
                          <span className="text-gray-100 text-[10px]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedTask && (
        <ManualModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};
