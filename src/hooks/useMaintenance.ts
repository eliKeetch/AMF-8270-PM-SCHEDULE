import { useLocalStorage } from './useLocalStorage';
import { MaintenanceRecord } from '../types';

export function useMaintenance() {
  const [records, setRecords, isLoaded] = useLocalStorage<MaintenanceRecord[]>('pinsetter-maintenance', []);

  const toggleTaskCompletion = (machineId: string, taskId: string, month: number, year: number) => {
    setRecords((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.machineId === machineId && r.taskId === taskId && r.month === month && r.year === year
      );

      if (existingIndex > -1) {
        // Remove it
        const newRecords = [...prev];
        newRecords.splice(existingIndex, 1);
        return newRecords;
      } else {
        // Add it
        return [
          ...prev,
          {
            id: `${machineId}-${taskId}-${month}-${year}`,
            machineId,
            taskId,
            month,
            year,
            completedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const isTaskCompleted = (machineId: string, taskId: string, month: number, year: number) => {
    return records.some(
      (r) => r.machineId === machineId && r.taskId === taskId && r.month === month && r.year === year
    );
  };

  return {
    records,
    toggleTaskCompletion,
    isTaskCompleted,
    isLoaded,
  };
}
