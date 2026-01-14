'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MaintenanceRecord } from '@/types';

interface MaintenanceContextType {
  records: MaintenanceRecord[];
  isLoaded: boolean;
  toggleTaskCompletion: (machineId: string, taskId: string, month: number, year: number) => Promise<void>;
  isTaskCompleted: (machineId: string, taskId: string, month: number, year: number) => boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch('/api/maintenance');
      const data = await res.json();
      setRecords(data);
      setIsLoaded(true);
    } catch (err) {
      console.error('Error fetching maintenance records:', err);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const toggleTaskCompletion = async (machineId: string, taskId: string, month: number, year: number) => {
    const id = `${machineId}-${taskId}-${month}-${year}`;
    const record: MaintenanceRecord = {
      id,
      machineId,
      taskId,
      month,
      year,
      completedAt: new Date().toISOString(),
    };
    
    setRecords(prev => {
      const exists = prev.some(r => r.id === id);
      if (exists) return prev.filter(r => r.id !== id);
      return [...prev, record];
    });

    try {
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (err) {
      console.error('Error toggling task completion:', err);
    }
  };

  const isTaskCompleted = (machineId: string, taskId: string, month: number, year: number) => {
    return records.some(
      (r) => r.machineId === machineId && r.taskId === taskId && r.month === month && r.year === year
    );
  };

  return (
    <MaintenanceContext.Provider value={{ records, isLoaded, toggleTaskCompletion, isTaskCompleted }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
