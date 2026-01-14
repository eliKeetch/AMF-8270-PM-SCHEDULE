'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Machine, MachineStatus } from '@/types';

interface MachineContextType {
  machines: Machine[];
  isLoaded: boolean;
  updateMachineStatus: (id: string, status: MachineStatus) => Promise<void>;
}

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export const MachineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchMachines = useCallback(async () => {
    try {
      const res = await fetch('/api/machines');
      const data = await res.json();
      setMachines(data);
      setIsLoaded(true);
    } catch (err) {
      console.error('Error fetching machines:', err);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const updateMachineStatus = async (id: string, status: MachineStatus) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, status } : m));

    try {
      const res = await fetch('/api/machines', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) throw new Error('Failed to update status');
    } catch (error) {
      console.error('Error updating machine status:', error);
    }
  };

  return (
    <MachineContext.Provider value={{ machines, isLoaded, updateMachineStatus }}>
      {children}
    </MachineContext.Provider>
  );
};

export const useMachines = () => {
  const context = useContext(MachineContext);
  if (context === undefined) {
    throw new Error('useMachines must be used within a MachineProvider');
  }
  return context;
};
