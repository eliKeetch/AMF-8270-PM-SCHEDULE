'use client';

import React, { useState } from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { useMachines } from '@/hooks/useMachines';
import { PM_SCHEDULE } from '@/data/schedule';
import { PMTask } from '@/types';
import { CheckCircle2, Circle as CircleIcon, Clock, ArrowRight, AlertCircle, Droplets, Square } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { ManualModal } from '@/components/ManualModal';

export const TodayTasks: React.FC = () => {
  const { scheduledTasks, updateTaskStatus, isLoaded: scheduleLoaded } = useSchedule();
  const { machines, isLoaded: machinesLoaded } = useMachines();
  const [selectedTask, setSelectedTask] = useState<PMTask | null>(null);

  if (!scheduleLoaded || !machinesLoaded) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = scheduledTasks.filter(t => t.date === todayStr);
  
  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const pendingCount = todayTasks.filter(t => t.status === 'pending').length;
  const progress = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  if (todayTasks.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <Clock size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No tasks scheduled for today</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-1">Enjoy the breather! Friday and Saturday are busy, use this time for any unplanned repairs.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-100 overflow-hidden shadow-sm">
      <div className="bg-blue-600 p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-black tracking-tight uppercase">Today's Workload</h3>
            <p className="text-blue-100 text-sm font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black leading-none">{completedCount}/{todayTasks.length}</span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Done</p>
          </div>
        </div>
        
        <div className="w-full bg-blue-800/50 h-2.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {todayTasks.map((task) => {
          const machine = machines.find(m => m.id === task.machineId);
          const pmTask = PM_SCHEDULE.find(pt => pt.id === task.taskId);
          const isCompleted = task.status === 'completed';

          return (
            <div key={task.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${isCompleted ? 'bg-green-50/30' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  #{machine?.number}
                </div>
                <button 
                  onClick={() => pmTask && setSelectedTask(pmTask)}
                  className="text-left group"
                >
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 group-hover:text-blue-600 transition-colors'}`}>
                      {pmTask?.name}
                    </h4>
                    {pmTask && (
                      <div className={pmTask.method === 'oil' ? 'text-blue-500' : 'text-orange-500'}>
                        {pmTask.method === 'oil' ? <Droplets size={12} /> : <Square size={12} />}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                      {isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => updateTaskStatus(task.id, isCompleted ? 'pending' : 'completed')}
                className={`p-3 rounded-xl transition-all ${
                  isCompleted 
                    ? 'text-green-600 hover:bg-green-100' 
                    : 'text-gray-300 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={24} /> : <CircleIcon size={24} />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
          <AlertCircle size={12} /> Priority: High
        </p>
        <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={12} />
        </button>
      </div>
      
      {selectedTask && (
        <ManualModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};
