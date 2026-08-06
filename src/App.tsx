import React, { useState } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import { UserProfile, AuthProvider } from './types';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const handleMockLogin = (provider: AuthProvider) => {
    // Симуляція ідентифікації за email (account linking)
    const mockEmail = 'test@example.com';
    setUser({
      name: 'Тестовий Користувач',
      email: mockEmail,
      provider: provider,
      avatar: 'https://ui-avatars.com/api/?name=Тестовий+Користувач&background=6366f1&color=fff',
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      <Header user={user} onLogin={handleMockLogin} onLogout={handleLogout} />
      <Board />
    </div>
  );
}
