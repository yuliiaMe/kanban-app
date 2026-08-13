import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BoardView from './components/Board';
import { UserProfile, AuthProvider, Participant } from './types';
import { GUEST_USER } from './data/mockData';

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
    // Generate deterministic or persistent user id based on email
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
