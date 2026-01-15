'use client';

import React, { useState } from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { Bell, X, AlertCircle, Calendar, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import { format, parseISO, addDays, isAfter } from 'date-fns';

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    clearNotifications, 
    rescheduleTask, 
    updateTaskStatus 
  } = useSchedule();
  const [isOpen, setIsOpen] = useState(false);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleReschedule = async (taskId: string, date: string) => {
    const result = await rescheduleTask(taskId, date);
    if (result.success) {
      setReschedulingId(null);
      // Mark notification as read or remove it? Let's just mark as read for now.
    } else {
      alert(result.message);
    }
  };

  const handleConfirmDone = (taskId: string, notificationId: string) => {
    updateTaskStatus(taskId, 'completed');
    markNotificationRead(notificationId);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 z-40 overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                Notifications
                {unreadCount > 0 && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={clearNotifications}
                  className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 uppercase tracking-widest"
                >
                  Clear All
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-gray-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info size={32} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`p-4 transition-colors ${n.read ? 'opacity-60' : 'bg-blue-50/10 dark:bg-blue-900/10'}`}>
                    <div className="flex gap-3">
                      <div className={`mt-1 p-2 rounded-lg ${
                        n.type === 'missed_task' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        n.type === 'schedule_conflict' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {n.type === 'missed_task' ? <AlertCircle size={16} /> :
                         n.type === 'schedule_conflict' ? <Calendar size={16} /> :
                         <Info size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{n.title}</h4>
                          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {format(parseISO(n.timestamp), 'h:mm a')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">{n.message}</p>
                        
                        {!n.read && n.type === 'missed_task' && n.data?.scheduledTaskId && (
                          <div className="flex flex-col gap-2">
                            {reschedulingId === n.id ? (
                              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 space-y-3">
                                <div>
                                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Select New Date</label>
                                  <input 
                                    type="date" 
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReschedule(n.data!.scheduledTaskId!, rescheduleDate)}
                                    className="flex-1 bg-blue-600 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-blue-700 transition-all"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setReschedulingId(null)}
                                    className="px-3 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleConfirmDone(n.data!.scheduledTaskId!, n.id)}
                                  className="flex-1 bg-green-600 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                                >
                                  I Did This
                                </button>
                                <button
                                  onClick={() => setReschedulingId(n.id)}
                                  className="flex-1 bg-blue-600 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                                >
                                  Reschedule
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!n.read && n.type !== 'missed_task' && (
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
