'use client';

import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { UserRole, User } from '@/types';
import { Plus, UserPlus, Shield, User as UserIcon, Trash2, Key, CheckCircle, XCircle } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, isLoaded } = useUsers();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('mechanic');

  const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
    { id: 'admin', label: 'Admin', icon: Shield, color: 'text-red-600 bg-red-50' },
    { id: 'manager', label: 'Manager', icon: Shield, color: 'text-purple-600 bg-purple-50' },
    { id: 'mechanic', label: 'Mechanic', icon: UserIcon, color: 'text-blue-600 bg-blue-50' },
    { id: 'pin_chaser', label: 'Pin Chaser', icon: UserIcon, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'front_desk', label: 'Front Desk', icon: UserIcon, color: 'text-green-600 bg-green-50' },
    { id: 'user', label: 'Guest', icon: UserIcon, color: 'text-slate-600 bg-slate-50' },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPin) {
      addUser(newName, newPin, newRole);
      setNewName('');
      setNewPin('');
      setShowAdd(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="p-10 mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1 bg-red-600 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Access Control</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">User Management</h2>
          <p className="text-slate-500 font-medium mt-4 max-w-xl text-lg">Manage personnel access levels and identification PINs.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl shadow-slate-200"
        >
          {showAdd ? <XCircle size={18} /> : <UserPlus size={18} />}
          {showAdd ? 'Cancel' : 'Add Staff Member'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border-2 border-slate-900 rounded-[3rem] p-10 mb-12 shadow-2xl shadow-slate-200 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Staff Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-slate-900 focus:outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Access PIN (4 digits)</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="****"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold tracking-[1em] text-center focus:border-slate-900 focus:outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Role Level</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-slate-900 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-100"
            >
              Create Account
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((user) => {
          const roleInfo = roles.find(r => r.id === user.role)!;
          return (
            <div key={user.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => deleteUser(user.id)}
                  disabled={user.id === 'admin-1'}
                  className="text-slate-300 hover:text-red-600 transition-colors disabled:hidden"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="flex items-center gap-6 mb-8">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${roleInfo.color} shadow-sm`}>
                  <roleInfo.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{user.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{roleInfo.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-green-500' : 'bg-slate-300'}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Key size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Login PIN</span>
                  </div>
                  <span className="text-lg font-black text-slate-900 tracking-[0.5em]">****</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => updateUser(user.id, { active: !user.active })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${user.active ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    {user.active ? 'Enabled' : 'Disabled'}
                  </button>
                  <button className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">
                    Reset PIN
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
