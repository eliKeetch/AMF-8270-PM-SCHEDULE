export type MachineStatus = 'active' | 'maintenance' | 'down' | 'permanently_down';

export interface Machine {
  id: string;
  number: number;
  status: MachineStatus;
  lastServiceDate?: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  taskId: string;
  month: number;
  year: number;
  completedAt: string;
  technicianName?: string;
  scheduledDate?: string;
}

export type ScheduledTaskStatus = 'pending' | 'completed' | 'missed' | 'rescheduled';

export interface ScheduledTask {
  id: string;
  machineId: string;
  taskId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  status: ScheduledTaskStatus;
}

export type NotificationType = 'missed_task' | 'schedule_conflict' | 'info' | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: {
    machineId?: string;
    taskId?: string;
    date?: string;
    scheduledTaskId?: string;
  };
}

export interface DayCapacity {
  day: number; // 0-6
  capacity: number;
}

export interface AppSettings {
  closedDays: number[]; // 0-6
  dayCapacities: Record<number, number>; // day index -> max machines
  preferredDays: number[]; // 0-6
  spreadMethod: 'even' | 'packed';
}
