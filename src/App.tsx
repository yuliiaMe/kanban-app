import React, { useState } from 'react';
import Header from './components/Header';
import BoardView from './components/Board';
import { UserProfile, AuthProvider, Participant } from './types';
import { GUEST_USER } from './data/mockData';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const handleCustomLogin = (name: string, email: string, provider: AuthProvider = 'Google') => {
    setUser({
      id: `usr-${Date.now()}`,
      name: name,
      email: email,
      provider: provider,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const currentUserParticipant: Participant = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: 'owner',
      }
    : GUEST_USER;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Header user={user} onCustomLogin={handleCustomLogin} onLogout={handleLogout} />
      <main className="w-full">
        <BoardView currentUser={currentUserParticipant} />
      </main>
    </div>
  );
}
