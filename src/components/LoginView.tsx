'use client';

import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types';
import { Lock, Delete, ChevronRight, AlertCircle, User as UserIcon, ShieldCheck, Wrench, Store, ArrowLeft } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { users, validateLogin, isLoaded } = useUsers();

  const activeUsers = users.filter(u => u.active);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleLogin = () => {
    if (!selectedUser) return;
    const user = validateLogin(pin, selectedUser.id);
    if (user) {
      onLogin(user);
    } else {
      setError(true);
      setPin('');
    }
  };

  const getRoleIcon = (role: string, size: number = 20) => {
    switch (role) {
      case 'admin': return <ShieldCheck size={size} />;
      case 'manager': return <UserIcon size={size} />;
      case 'mechanic': 
      case 'pin_chaser': return <Wrench size={size} />;
      case 'front_desk': return <Store size={size} />;
      default: return <UserIcon size={size} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-400/10';
      case 'manager': return 'text-purple-400 bg-purple-400/10';
      case 'mechanic': return 'text-blue-400 bg-blue-400/10';
      case 'front_desk': return 'text-green-400 bg-green-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/20 rotate-3">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">AMF 82-70</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium tracking-widest uppercase text-[10px]">Maintenance Access Control</p>
        </div>

        <div className="bg-gray-50 dark:bg-slate-900 rounded-[3rem] p-1 border border-gray-100 dark:border-slate-800 shadow-2xl shadow-black/10 dark:shadow-none overflow-hidden">
          {!selectedUser ? (
            <div className="p-10">
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 text-center">Select Personnel</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="p-6 rounded-[2rem] bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group flex flex-col items-center text-center hover:-translate-y-1 active:scale-95 shadow-sm shadow-black/5 dark:shadow-none"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 ${getRoleColor(user.role).includes('text-red-400') ? 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' : getRoleColor(user.role).includes('text-purple-400') ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400' : getRoleColor(user.role).includes('text-blue-400') ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : getRoleColor(user.role).includes('text-green-400') ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' : 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-gray-400'}`}>
                      {getRoleIcon(user.role, 20)}
                    </div>
                    <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight block truncate w-full">{user.name}</span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">{user.role.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Left Side: Selected User Profile */}
              <div className="w-full md:w-1/3 bg-gray-100/50 dark:bg-slate-800/50 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800">
                <button 
                  onClick={() => { setSelectedUser(null); setPin(''); setError(false); }}
                  className="absolute top-6 left-6 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${getRoleColor(selectedUser.role).includes('text-red-400') ? 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' : getRoleColor(selectedUser.role).includes('text-purple-400') ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400' : getRoleColor(selectedUser.role).includes('text-blue-400') ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : getRoleColor(selectedUser.role).includes('text-green-400') ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' : 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-gray-400'}`}>
                  {getRoleIcon(selectedUser.role, 40)}
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{selectedUser.name}</h3>
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.2em]">{selectedUser.role.replace('_', ' ')}</p>
              </div>

              {/* Right Side: PIN Pad */}
              <div className="w-full md:w-2/3 p-10 bg-white dark:bg-slate-900">
                <div className="flex justify-center gap-4 mb-10">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        pin.length > i 
                          ? 'bg-blue-600 border-blue-600 scale-125 shadow-lg shadow-blue-500/20' 
                          : error 
                            ? 'border-red-500 bg-red-500/20 animate-shake' 
                            : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest mb-6 justify-center">
                    <AlertCircle size={14} /> Invalid Access Pin
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      onClick={() => handleNumberClick(num.toString())}
                      className="h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 text-2xl font-black text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-blue-600 active:text-white active:scale-90 transition-all border border-gray-100 dark:border-slate-700 shadow-sm shadow-black/5 dark:shadow-none"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={handleDelete}
                    className="h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-90 transition-all border border-gray-100 dark:border-slate-700 shadow-sm shadow-black/5 dark:shadow-none"
                  >
                    <Delete size={24} />
                  </button>
                  <button
                    onClick={() => handleNumberClick('0')}
                    className="h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 text-2xl font-black text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-blue-600 active:text-white active:scale-90 transition-all border border-gray-100 dark:border-slate-700 shadow-sm shadow-black/5 dark:shadow-none"
                  >
                    0
                  </button>
                  <button
                    onClick={handleLogin}
                    disabled={pin.length < 3}
                    className={`h-16 rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-blue-500 shadow-lg shadow-blue-500/20 ${
                      pin.length >= 3 ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-100 dark:bg-slate-900 text-gray-300 dark:text-slate-700 border-gray-200 dark:border-slate-800'
                    }`}
                  >
                    <ChevronRight size={32} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-10 text-gray-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
          Authorized personnel only. Contact management for security credentials.
        </p>
      </div>
    </div>
  );
};
