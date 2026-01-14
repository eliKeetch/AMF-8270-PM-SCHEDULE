'use client';

import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types';
import { Lock, Delete, ChevronRight, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { validateLogin, isLoaded } = useUsers();

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
    const user = validateLogin(pin);
    if (user) {
      onLogin(user);
    } else {
      setError(true);
      setPin('');
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20 rotate-3">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">AMF 82-70</h1>
          <p className="text-slate-400 font-medium tracking-widest uppercase text-[10px]">Maintenance Access Control</p>
        </div>

        <div className="bg-slate-800 rounded-[3rem] p-10 border border-slate-700 shadow-2xl">
          <div className="flex justify-center gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  pin.length > i 
                    ? 'bg-blue-500 border-blue-500 scale-125' 
                    : error 
                      ? 'border-red-500 bg-red-500/20' 
                      : 'border-slate-600 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-widest mb-6 justify-center animate-shake">
              <AlertCircle size={14} /> Invalid Access Pin
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="h-20 rounded-2xl bg-slate-700 text-2xl font-black text-white hover:bg-slate-600 active:bg-blue-600 active:scale-90 transition-all border border-slate-600"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="h-20 rounded-2xl bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600 active:scale-90 transition-all border border-slate-600"
            >
              <Delete size={24} />
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              className="h-20 rounded-2xl bg-slate-700 text-2xl font-black text-white hover:bg-slate-600 active:bg-blue-600 active:scale-90 transition-all border border-slate-600"
            >
              0
            </button>
            <button
              onClick={handleLogin}
              disabled={pin.length < 3}
              className={`h-20 rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-blue-500 shadow-lg shadow-blue-500/20 ${
                pin.length >= 3 ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-800 text-slate-600 border-slate-700 grayscale'
              }`}
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-slate-500 text-xs font-medium">
          Authorized personnel only. Contact management for PIN assignment.
        </p>
      </div>
    </div>
  );
};
