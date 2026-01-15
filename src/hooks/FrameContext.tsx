'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FrameLog } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface FrameContextType {
  frameLogs: FrameLog[];
  isLoaded: boolean;
  addFrameLog: (date: string, frameCount: number, notes?: string) => Promise<void>;
  deleteFrameLog: (id: string) => Promise<void>;
}

const FrameContext = createContext<FrameContextType | undefined>(undefined);

export const FrameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [frameLogs, setFrameLogs] = useState<FrameLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/frames');
      const data = await res.json();
      setFrameLogs(data);
      setIsLoaded(true);
    } catch (err) {
      console.error('Error fetching frame logs:', err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addFrameLog = async (date: string, frameCount: number, notes?: string) => {
    const newLog: FrameLog = {
      id: uuidv4(),
      date,
      frameCount,
      notes,
    };
    
    setFrameLogs(prev => [newLog, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    
    try {
      await fetch('/api/frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
    } catch (err) {
      console.error('Error adding frame log:', err);
    }
  };

  const deleteFrameLog = async (id: string) => {
    setFrameLogs(prev => prev.filter(l => l.id !== id));
    try {
      await fetch(`/api/frames?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting frame log:', err);
    }
  };

  return (
    <FrameContext.Provider value={{ frameLogs, isLoaded, addFrameLog, deleteFrameLog }}>
      {children}
    </FrameContext.Provider>
  );
};

export const useFrames = () => {
  const context = useContext(FrameContext);
  if (context === undefined) {
    throw new Error('useFrames must be used within a FrameProvider');
  }
  return context;
};
