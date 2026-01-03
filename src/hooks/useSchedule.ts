import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useMachines } from './useMachines';
import { PM_SCHEDULE } from '@/data/schedule';
import { ScheduledTask, AppNotification, ScheduledTaskStatus, AppSettings } from '@/types';
import { 
  format, 
  isBefore, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  parseISO, 
  addDays,
} from 'date-fns';

const DEFAULT_SETTINGS: AppSettings = {
  closedDays: [0, 5, 6], // Sunday, Friday, Saturday
  dayCapacities: {
    1: 2, // Monday
    2: 2, // Tuesday
    3: 2, // Wednesday
    4: 1, // Thursday
    5: 0,
    6: 0,
    0: 0
  },
  preferredDays: [1, 2], // Monday, Tuesday
  spreadMethod: 'even'
};

export function useSchedule() {
  const { machines, isLoaded: machinesLoaded } = useMachines();
  const [scheduledTasks, setScheduledTasks, isScheduleLoaded] = useLocalStorage<ScheduledTask[]>('pinsetter-schedule', []);
  const [notifications, setNotifications, isNotificationsLoaded] = useLocalStorage<AppNotification[]>('pinsetter-notifications', []);
  const [settings, setSettings, isSettingsLoaded] = useLocalStorage<AppSettings>('pinsetter-settings', DEFAULT_SETTINGS);

  const isLoaded = machinesLoaded && isScheduleLoaded && isNotificationsLoaded && isSettingsLoaded;

  const generateMonthSchedule = useCallback((month: number, year: number) => {
    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(start);
    const days = eachDayOfInterval({ start, end });
    
    // Filter out closed days
    const availableDays = days.filter(day => {
      const d = getDay(day);
      return !settings.closedDays.includes(d);
    });

    const activeMachines = machines.filter(m => m.status !== 'permanently_down');
    const tasksToSchedule: ScheduledTask[] = [];
    
    if (activeMachines.length > 0 && availableDays.length > 0) {
      const totalMachines = activeMachines.length;
      const totalCapacity = availableDays.reduce((acc, day) => acc + (settings.dayCapacities[getDay(day)] || 0), 0);
      const ratio = totalMachines / totalCapacity;

      let machinesAssigned = 0;
      let accumulator = 0;

      if (settings.spreadMethod === 'even') {
        // PROPORTIONAL DAY SPREAD: Distribute machines based on day capacity vs total capacity
        availableDays.forEach(day => {
          if (machinesAssigned >= totalMachines) return;
          
          const dayOfWeek = getDay(day);
          const dayCapacity = settings.dayCapacities[dayOfWeek] || 0;
          
          accumulator += (dayCapacity * ratio);
          
          // Determine how many machines to assign today
          let toAssign = Math.round(accumulator);
          
          // Cap by day capacity and total remaining machines
          toAssign = Math.min(toAssign, dayCapacity, totalMachines - machinesAssigned);
          
          // Ensure we don't leave a huge "debt" that never gets filled
          // If we have very few days left, we might need to force assignment
          const remainingDays = availableDays.filter(d => isBefore(day, d)).length;
          if (toAssign === 0 && (totalMachines - machinesAssigned) > (remainingDays * 1)) {
             // This is a safety check to avoid packing everything at the end
          }

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
        // PACKED: Prioritize preferred days and fill them up early
        const sortedDays = [...availableDays].sort((a, b) => {
          const prefA = settings.preferredDays.includes(getDay(a)) ? 0 : 1;
          const prefB = settings.preferredDays.includes(getDay(b)) ? 0 : 1;
          if (prefA !== prefB) return prefA - prefB;
          return a.getTime() - b.getTime();
        });

        sortedDays.forEach(day => {
          if (machinesAssigned >= totalMachines) return;
          const capacity = settings.dayCapacities[getDay(day)] || 0;
          
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

    setScheduledTasks(prev => {
      const otherTasks = prev.filter(t => {
        const d = parseISO(t.date);
        return d.getMonth() !== month || d.getFullYear() !== year;
      });
      return [...otherTasks, ...tasksToSchedule];
    });
  }, [machines, setScheduledTasks, settings]);

  const updateTaskStatus = useCallback((id: string, status: ScheduledTaskStatus) => {
    setScheduledTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, [setScheduledTasks]);

  const regenerateSchedule = useCallback((month: number, year: number) => {
    setScheduledTasks(prev => prev.filter(t => {
      const d = parseISO(t.date);
      return d.getMonth() !== month || d.getFullYear() !== year;
    }));
    generateMonthSchedule(month, year);
  }, [generateMonthSchedule, setScheduledTasks]);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNote: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNote, ...prev]);
  }, [setNotifications]);

  const checkMissedTasks = useCallback(() => {
    const today = new Date();
    const missed = scheduledTasks.filter(t => {
      const taskDate = parseISO(t.date);
      return t.status === 'pending' && isBefore(taskDate, today) && !isSameDay(taskDate, today);
    });

    missed.forEach(task => {
      updateTaskStatus(task.id, 'missed');
      const machine = machines.find(m => m.id === task.machineId);
      const pmTask = PM_SCHEDULE.find(pt => pt.id === task.taskId);
      addNotification({
        type: 'missed_task',
        title: `Missed PM: Machine #${machine?.number}`,
        message: `${pmTask?.name} was scheduled for ${task.date} but not completed.`,
        data: { machineId: task.machineId, taskId: task.taskId, date: task.date, scheduledTaskId: task.id }
      });
    });
  }, [scheduledTasks, machines, updateTaskStatus, addNotification]);

  useEffect(() => {
    if (isLoaded && scheduledTasks.length > 0) {
      checkMissedTasks();
    }
  }, [isLoaded]);

  const rescheduleTask = useCallback((taskId: string, newDate: string) => {
    const date = parseISO(newDate);
    const dayOfWeek = getDay(date);
    
    if (settings.closedDays.includes(dayOfWeek)) {
      return { success: false, message: "Cannot schedule on closed days." };
    }

    const tasksOnDay = scheduledTasks.filter(t => t.date === newDate);
    const machinesOnDay = new Set(tasksOnDay.map(t => t.machineId)).size;
    const capacity = settings.dayCapacities[dayOfWeek] || 0;

    if (machinesOnDay >= capacity) {
      return { 
        success: false, 
        message: `The schedule will change too drastically (max ${capacity} machines on this day). Please select another date.` 
      };
    }

    setScheduledTasks(prev => prev.map(t => t.id === taskId ? { ...t, date: newDate, status: 'pending' } : t));
    return { success: true };
  }, [scheduledTasks, setScheduledTasks, settings]);

  return {
    scheduledTasks,
    notifications,
    settings,
    updateSettings: setSettings,
    isLoaded,
    generateMonthSchedule,
    regenerateSchedule,
    updateTaskStatus,
    rescheduleTask,
    markNotificationRead: (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
    clearNotifications: () => setNotifications([])
  };
}
