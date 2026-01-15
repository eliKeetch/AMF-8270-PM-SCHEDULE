'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { InventoryItem } from '@/types';

interface InventoryContextType {
  items: InventoryItem[];
  isLoaded: boolean;
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  adjustStock: (id: string, change: number, reason: string, technicianName: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setItems(data);
      setIsLoaded(true);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const newItem = await res.json();
      setItems(prev => [...prev, newItem]);
    } catch (err) {
      console.error('Error adding inventory item:', err);
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const updatedItem = await res.json();
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
    } catch (err) {
      console.error('Error updating inventory item:', err);
    }
  };

  const adjustStock = async (id: string, change: number, reason: string, technicianName: string) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, change, reason, technicianName }),
      });
      const updatedItem = await res.json();
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
    } catch (err) {
      console.error('Error adjusting inventory stock:', err);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/inventory?id=${id}`, {
        method: 'DELETE',
      });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting inventory item:', err);
    }
  };

  return (
    <InventoryContext.Provider value={{ items, isLoaded, addItem, updateItem, adjustStock, deleteItem }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
