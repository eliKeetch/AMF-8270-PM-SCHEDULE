'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MachineIssue, IssueType, StopType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface IssueContextType {
  issues: MachineIssue[];
  isLoaded: boolean;
  reportIssue: (machineId: string, type: IssueType, notes?: string, isStop?: boolean, stopType?: StopType) => Promise<void>;
  resolveIssue: (issueId: string) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  getMachineIssueStats: (machineId: string) => Record<IssueType, number>;
  getAllIssueStats: () => Record<string, Record<IssueType, number>>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const IssueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<MachineIssue[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchIssues = useCallback(async () => {
    try {
      const res = await fetch('/api/issues');
      const data = await res.json();
      setIssues(data);
      setIsLoaded(true);
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const reportIssue = async (machineId: string, type: IssueType, notes?: string, isStop?: boolean, stopType?: StopType) => {
    const newIssue: MachineIssue = {
      id: uuidv4(),
      machineId,
      type,
      timestamp: new Date().toISOString(),
      resolved: false,
      notes,
      isStop,
      stopType
    };
    
    setIssues(prev => [newIssue, ...prev]);
    
    try {
      await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIssue)
      });
    } catch (err) {
      console.error('Error reporting issue:', err);
    }
  };

  const resolveIssue = async (issueId: string) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, resolved: true } : i));
    try {
      await fetch('/api/issues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: issueId, resolved: true })
      });
    } catch (err) {
      console.error('Error resolving issue:', err);
    }
  };

  const deleteIssue = async (issueId: string) => {
    setIssues(prev => prev.filter(i => i.id !== issueId));
    try {
      await fetch(`/api/issues?id=${issueId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting issue:', err);
    }
  };

  const getMachineIssueStats = useCallback((machineId: string) => {
    const machineIssues = issues.filter((i) => i.machineId === machineId);
    const counts: Record<IssueType, number> = {
      pin_drop: 0,
      scoring: 0,
      interlock: 0,
      ball_return: 0,
      other: 0,
    };

    machineIssues.forEach((issue) => {
      counts[issue.type]++;
    });

    return counts;
  }, [issues]);

  const getAllIssueStats = useCallback(() => {
    const stats: Record<string, Record<IssueType, number>> = {};

    issues.forEach((issue) => {
      if (!stats[issue.machineId]) {
        stats[issue.machineId] = {
          pin_drop: 0,
          scoring: 0,
          interlock: 0,
          ball_return: 0,
          other: 0,
        };
      }
      stats[issue.machineId][issue.type]++;
    });

    return stats;
  }, [issues]);

  return (
    <IssueContext.Provider value={{ 
      issues, 
      isLoaded, 
      reportIssue, 
      resolveIssue, 
      deleteIssue, 
      getMachineIssueStats, 
      getAllIssueStats 
    }}>
      {children}
    </IssueContext.Provider>
  );
};

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};
