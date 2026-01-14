'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useMachines } from './useMachines';
import { PM_SCHEDULE } from '@/data/schedule';
import { ScheduledTask, AppNotification, ScheduledTaskStatus, AppSettings, PMTask } from '@/types';
import { 
  format, 
  isBefore, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  parseISO, 
} from 'date-fns';

interface ScheduleContextType {
  scheduledTasks: ScheduledTask[];
  notifications: AppNotification[];
  settings: AppSettings | null;
  isLoaded: boolean;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  generateMonthSchedule: (month: number, year: number) => Promise<void>;
  regenerateSchedule: (month: number, year: number) => Promise<void>;
  updateTaskStatus: (id: string | string[], status: ScheduledTaskStatus) => Promise<void>;
  rescheduleTask: (taskId: string, newDate: string) => Promise<{ success: boolean; message?: string }>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { machines, isLoaded: machinesLoaded } = useMachines();
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, notesRes, settingsRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/notifications'),
        fetch('/api/settings')
      ]);
      
      if (!tasksRes.ok || !notesRes.ok || !settingsRes.ok) {
        throw new Error('Failed to fetch some schedule data');
      }

      const tasks = await tasksRes.json();
      const notes = await notesRes.json();
      const config = await settingsRes.json();
      
      if (config && !config.error) {
        setScheduledTasks(Array.isArray(tasks) ? tasks : []);
        setNotifications(Array.isArray(notes) ? notes : []);
        setSettings(config);
        setIsDataLoaded(true);
      }
    } catch (err) {
      console.error('Error fetching schedule data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isLoaded = machinesLoaded && isDataLoaded && settings !== null && Array.isArray(settings.closedDays);

  const addNotification = useCallback(async (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNote: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNote, ...prev]);
    
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });
    } catch (err) {
      console.error('Error adding notification:', err);
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: string | string[], status: ScheduledTaskStatus) => {
    const ids = Array.isArray(id) ? id : [id];
    setScheduledTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, status } : t));
    
    try {
      const body = Array.isArray(id) 
        ? id.map(taskId => ({ id: taskId, status }))
        : { id, status };

      await fetch('/api/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  }, []);

  const checkMissedTasks = useCallback(() => {
    if (!isLoaded || scheduledTasks.length === 0) return;

    const today = new Date();
    const missed = scheduledTasks.filter(t => {
      const taskDate = parseISO(t.date);
      return t.status === 'pending' && isBefore(taskDate, today) && !isSameDay(taskDate, today);
    });

    if (missed.length === 0) return;

    const missedIds = missed.map(t => t.id);
    updateTaskStatus(missedIds, 'missed');

    const machineDateGroups: Record<string, ScheduledTask[]> = {};
    missed.forEach(task => {
      const key = `${task.machineId}-${task.date}`;
      if (!machineDateGroups[key]) machineDateGroups[key] = [];
      machineDateGroups[key].push(task);
    });

    Object.values(machineDateGroups).forEach(group => {
      const task = group[0];
      const machine = machines.find(m => m.id === task.machineId);
      addNotification({
        type: 'missed_task',
        title: `Missed PM: Machine #${machine?.number}`,
        message: `${group.length} task(s) were scheduled for ${task.date} but not completed.`,
        data: { machineId: task.machineId, date: task.date, scheduledTaskId: task.id }
      });
    });
  }, [isLoaded, scheduledTasks, machines, updateTaskStatus, addNotification]);

  useEffect(() => {
    if (isLoaded) {
      checkMissedTasks();
    }
  }, [isLoaded, checkMissedTasks]);

  const generateMonthSchedule = useCallback(async (month: number, year: number) => {
    if (!settings || !Array.isArray(settings.closedDays)) return;

    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(start);
    const days = eachDayOfInterval({ start, end });
    
    const availableDays = days.filter(day => {
      const d = getDay(day);
      return settings.closedDays && !settings.closedDays.includes(d);
    });

    const activeMachines = machines.filter(m => m.status !== 'permanently_down');
    const tasksToSchedule: ScheduledTask[] = [];
    
    if (activeMachines.length > 0 && availableDays.length > 0) {
      const totalMachines = activeMachines.length;
      const totalCapacity = availableDays.reduce((acc, day) => {
        const d = getDay(day);
        return acc + (settings.dayCapacities?.[d] || 0);
      }, 0);
      
      const ratio = totalCapacity > 0 ? totalMachines / totalCapacity : 0;

      let machinesAssigned = 0;
      let accumulator = 0;

      if (settings.spreadMethod === 'even') {
        availableDays.forEach(day => {
          if (machinesAssigned >= totalMachines) return;
          const dayOfWeek = getDay(day);
          const dayCapacity = settings.dayCapacities?.[dayOfWeek] || 0;
          accumulator += (dayCapacity * ratio);
          let toAssign = Math.min(Math.round(accumulator), dayCapacity, totalMachines - machinesAssigned);

          for (let i = 0; i < toAssign; i++) {
            const machine = activeMachines[machinesAssigned];
            const scheduledDate = format(day, 'yyyy-MM-dd');
            const tasksDue = PM_SCHEDULE.filter(task => task.months.includes(month));
            tasksDue.forEach(task => {
              tasksToSchedule.push({
                id: `${machine.id}-${task.id}-${scheduledDate}`,
                machineId: machine.id,
                taskId: task.id,
                date: scheduledDate,
                status: 'pending'
              });
            });
            machinesAssigned++;
          }
          accumulator -= toAssign;
        });
      } else {
        const sortedDays = [...availableDays].sort((a, b) => {
          const prefA = settings.preferredDays?.includes(getDay(a)) ? 0 : 1;
          const prefB = settings.preferredDays?.includes(getDay(b)) ? 0 : 1;
          if (prefA !== prefB) return prefA - prefB;
          return a.getTime() - b.getTime();
        });

        sortedDays.forEach(day => {
          if (machinesAssigned >= totalMachines) return;
          const capacity = settings.dayCapacities?.[getDay(day)] || 0;
          for (let i = 0; i < capacity && machinesAssigned < totalMachines; i++) {
            const machine = activeMachines[machinesAssigned];
            const scheduledDate = format(day, 'yyyy-MM-dd');
            const tasksDue = PM_SCHEDULE.filter(task => task.months.includes(month));
            tasksDue.forEach(task => {
              tasksToSchedule.push({
                id: `${machine.id}-${task.id}-${scheduledDate}`,
                machineId: machine.id,
                taskId: task.id,
                date: scheduledDate,
                status: 'pending'
              });
            });
            machinesAssigned++;
          }
        });
      }
    }

    try {
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasksToSchedule)
      });
      
      const res = await fetch('/api/schedule');
      const data = await res.json();
      setScheduledTasks(data);
    } catch (err) {
      console.error('Error saving generated schedule:', err);
    }
  }, [machines, settings]);

  const regenerateSchedule = useCallback(async (month: number, year: number) => {
    await generateMonthSchedule(month, year);
  }, [generateMonthSchedule]);

  const rescheduleTask = useCallback(async (taskId: string, newDate: string) => {
    if (!settings || !Array.isArray(settings.closedDays)) return { success: false, message: "Settings not loaded" };
    
    const date = parseISO(newDate);
    const dayOfWeek = getDay(date);
    
    if (settings.closedDays.includes(dayOfWeek)) {
      return { success: false, message: "Cannot schedule on closed days." };
    }

    const tasksOnDay = (scheduledTasks || []).filter(t => t.date === newDate);
    const machinesOnDay = new Set(tasksOnDay.map(t => t.machineId)).size;
    const capacity = settings.dayCapacities?.[dayOfWeek] || 0;

    if (machinesOnDay >= capacity) {
      return { 
        success: false, 
        message: `The schedule will change too drastically (max ${capacity} machines on this day). Please select another date.` 
      };
    }

    setScheduledTasks(prev => prev.map(t => t.id === taskId ? { ...t, date: newDate, status: 'pending' } : t));
    
    try {
      await fetch('/api/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, date: newDate, status: 'pending' })
      });
      return { success: true };
    } catch (err) {
      console.error('Error rescheduling task:', err);
      return { success: false, message: "Failed to save changes" };
    }
  }, [scheduledTasks, settings]);

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      });
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const clearNotifications = async () => {
    setNotifications([]);
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  return (
    <ScheduleContext.Provider value={{
      scheduledTasks,
      notifications,
      settings,
      isLoaded,
      updateSettings,
      generateMonthSchedule,
      regenerateSchedule,
      updateTaskStatus,
      rescheduleTask,
      markNotificationRead,
      clearNotifications
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
