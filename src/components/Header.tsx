import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, User } from 'lucide-react';
import { UserProfile, AuthProvider } from '../types';
import AuthPopover from './AuthPopover';

interface HeaderProps {
  user: UserProfile | null;
  onCustomLogin: (name: string, email: string, provider?: AuthProvider) => void;
  onLogout: () => void;
}

export default function Header({ user, onCustomLogin, onLogout }: HeaderProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (authRef.current && !authRef.current.contains(event.target as Node)) {
        setIsAuthOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="px-6 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-10">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl shadow-lg">
          <LayoutDashboard size={22} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Канбан Таскборд</h1>
      </div>

      {/* Auth Widget */}
      <div className="relative" ref={authRef}>
        <button
          onClick={() => setIsAuthOpen(!isAuthOpen)}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 transition rounded-full p-1 pr-4 border border-slate-700 cursor-pointer"
        >
          {user ? (
            <>
              <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-indigo-400/50" />
              <span className="text-xs font-semibold text-white max-w-[120px] truncate">{user.name}</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <User size={16} className="text-slate-300" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Гість</span>
            </>
          )}
        </button>

        {isAuthOpen && (
          <AuthPopover
            user={user}
            onCustomLogin={(name, email, provider) => {
              onCustomLogin(name, email, provider);
              setIsAuthOpen(false);
            }}
            onLogout={() => {
              onLogout();
              setIsAuthOpen(false);
            }}
          />
        )}
      </div>
    </header>
  );
}
