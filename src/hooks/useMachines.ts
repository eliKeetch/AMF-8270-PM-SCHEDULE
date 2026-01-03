import { useLocalStorage } from './useLocalStorage';
import { Machine, MachineStatus } from '../types';

const INITIAL_MACHINES: Machine[] = Array.from({ length: 20 }, (_, i) => ({
  id: `machine-${i + 1}`,
  number: i + 1,
  status: i + 1 === 19 || i + 1 === 20 ? 'permanently_down' : 'active',
}));

export function useMachines() {
  const [machines, setMachines, isLoaded] = useLocalStorage<Machine[]>('pinsetter-machines', INITIAL_MACHINES);

  const updateMachineStatus = (id: string, status: MachineStatus) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const addMachine = () => {
    setMachines((prev) => {
      const nextNumber = prev.length > 0 ? Math.max(...prev.map((m) => m.number)) + 1 : 1;
      return [
        ...prev,
        {
          id: `machine-${nextNumber}`,
          number: nextNumber,
          status: 'active',
        },
      ];
    });
  };

  const removeMachine = (id: string) => {
    setMachines((prev) => prev.filter((m) => m.id !== id));
  };

  return {
    machines,
    updateMachineStatus,
    addMachine,
    removeMachine,
    isLoaded,
  };
}
