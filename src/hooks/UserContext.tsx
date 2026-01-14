'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface UserContextType {
  users: User[];
  isLoaded: boolean;
  addUser: (name: string, pin: string, role: UserRole) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  validateLogin: (pin: string) => User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
      setIsLoaded(true);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (name: string, pin: string, role: UserRole) => {
    const newUser: User = {
      id: uuidv4(),
      name,
      pin,
      role,
      active: true,
    };
    
    setUsers(prev => [...prev, newUser]);
    
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    try {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const validateLogin = (pin: string): User | null => {
    return users.find((u) => u.pin === pin && u.active) || null;
  };

  return (
    <UserContext.Provider value={{ users, isLoaded, addUser, updateUser, deleteUser, validateLogin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
