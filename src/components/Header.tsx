import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, User } from 'lucide-react';
import { UserProfile, AuthProvider } from '../types';
import AuthPopover from './AuthPopover';

interface HeaderProps {
  user: UserProfile | null;
  onLogin: (provider: AuthProvider) => void;
  onLogout: () => void;
}

export default function Header({ user, onLogin, onLogout }: HeaderProps) {
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
    <header className="px-6 py-4 flex justify-between items-center border-b border-white/10 bg-black/20 backdrop-blur-md relative z-10">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-xl shadow-lg">
          <LayoutDashboard size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white/90">Таскборд</h1>
      </div>

      {/* Auth Widget */}
      <div className="relative" ref={authRef}>
        <button
          onClick={() => setIsAuthOpen(!isAuthOpen)}
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full p-1 pr-4 border border-white/10 cursor-pointer"
        >
          {user ? (
            <>
              <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
              <span className="text-sm font-medium text-white/90 truncate max-w-[120px]">{user.name}</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User size={16} className="text-white/70" />
              </div>
              <span className="text-sm font-medium text-white/90">Гість</span>
            </>
          )}
        </button>

        {isAuthOpen && (
          <AuthPopover
            user={user}
            onLogin={(provider) => {
              onLogin(provider);
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
