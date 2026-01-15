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

export type IssueType = 'pin_drop' | 'scoring' | 'interlock' | 'ball_return' | 'other';

export type StopType = 'pin_jam' | 'ball_return' | 'subway_balls' | 'interlock' | 'other';

export type UserRole = 'admin' | 'manager' | 'mechanic' | 'pin_chaser' | 'front_desk' | 'user';

export interface User {
  id: string;
  name: string;
  pin: string; // 3-4 digit PIN
  role: UserRole;
  active: boolean;
}

export interface MachineIssue {
  id: string;
  machineId: string;
  type: IssueType;
  timestamp: string;
  resolved: boolean;
  notes?: string;
  isStop?: boolean;
  stopType?: StopType;
}

export interface FrameLog {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  frameCount: number;
  notes?: string;
}

export interface AppSettings {
  closedDays: number[]; // 0-6
  dayCapacities: Record<number, number>; // day index -> max machines
  preferredDays: number[]; // 0-6
  spreadMethod: 'even' | 'packed';
  issueThresholds: Record<IssueType, number>;
}

export interface PMTask {
  id: string;
  name: string;
  months: number[];
  method: 'oil' | 'grease' | 'inspect';
  pdfRef?: {
    file: 'service' | 'lubrication';
    page: number;
  };
}

export type InventoryCategory = 'Electrical' | 'Ball Lift' | 'Cushion' | 'Drive' | 'Distributor' | 'Consumables' | 'Other';

export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minQuantity: number;
  idealQuantity: number;
  location?: string;
  pdfPage?: number;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  change: number;
  reason: string;
  technicianName: string;
  timestamp: string;
}

export interface RepairPartRequirement {
  partNumber: string;
  quantity: number;
  name: string;
}

export interface RepairManualRef {
  file: 'service' | 'parts' | 'lubrication';
  page: number;
  title?: string;
}

export interface RepairDefinition {
  id: string;
  name: string;
  category: InventoryCategory;
  description: string;
  requiredParts: RepairPartRequirement[];
  instructionRef?: RepairManualRef;
  assemblyRef: RepairManualRef;
}
