'use client';

import React from 'react';
import { User } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, LogOut, User as UserIcon, Shield, Wrench, Store, Key } from 'lucide-react';

interface AccountViewProps {
  user: User;
  onLogout: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ user, onLogout }) => {
  const { theme, toggleTheme, isLoaded } = useTheme();
  const [showPin, setShowPin] = React.useState(false);

  if (!isLoaded) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={24} />;
      case 'manager': return <UserIcon size={24} />;
      case 'mechanic': 
      case 'pin_chaser': return <Wrench size={24} />;
      case 'front_desk': return <Store size={24} />;
      default: return <UserIcon size={24} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-500 bg-red-50 dark:bg-red-900/30 dark:text-red-400';
      case 'manager': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400';
      case 'mechanic': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400';
      case 'front_desk': return 'text-green-500 bg-green-50 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Your Account</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your personal settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* User Info Card */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-8 shadow-sm shadow-black/5">
          <div className="flex items-center gap-6 mb-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm ${getRoleColor(user.role)}`}>
              {getRoleIcon(user.role)}
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">{user.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{user.role.replace('_', ' ')}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Key size={18} className="text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Your PIN</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xl font-black text-gray-900 dark:text-white transition-all ${showPin ? 'tracking-normal' : 'tracking-[0.5em]'}`}>
                  {showPin ? user.pin : '****'}
                </span>
                <button 
                  onClick={() => setShowPin(!showPin)}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showPin ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Card */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-8 shadow-sm shadow-black/5">
          <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">System Preferences</h4>
          
          <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-slate-800/50 rounded-3xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-xs ${
                theme === 'light' 
                  ? 'bg-white text-gray-900 shadow-xl shadow-black/10 scale-[1.02]' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Sun size={18} className={theme === 'light' ? 'text-orange-500' : ''} />
              Light
            </button>
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-xs ${
                theme === 'dark' 
                  ? 'bg-slate-900 text-white shadow-xl shadow-black/40 scale-[1.02] border border-slate-700' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Moon size={18} className={theme === 'dark' ? 'text-blue-400' : ''} />
              Dark
            </button>
          </div>
        </section>

        {/* Logout Card */}
        <button
          onClick={onLogout}
          className="w-full bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Logout Session
        </button>
      </div>
    </div>
  );
};
