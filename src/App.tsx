import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { UserProfile, AuthProvider } from './types';

const AUTH_STORAGE_KEY = 'kanban_user_session';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [user]);

  const handleCustomLogin = (
    name: string,
    email: string,
    provider: AuthProvider = 'Google',
    avatarUrl?: string
  ) => {
    const userId = `usr-${btoa(email.toLowerCase()).replace(/=/g, '').slice(0, 12)}`;
    const avatar =
      avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;

    const newUser: UserProfile = {
      id: userId,
      name,
      email,
      provider,
      avatar,
    };
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Header user={user} onCustomLogin={handleCustomLogin} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Канбан Таскборд</h2>
          <p className="text-sm text-slate-400 mb-6">
            Базова структура проекту та аутентифікація користувача готові.
          </p>

          {user ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Поточний користувач:</p>
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-950/50 py-3 px-4 rounded-xl border border-slate-800">
              Натисніть на кнопку профілю у верхньому правому кутку для авторизації через Google.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}