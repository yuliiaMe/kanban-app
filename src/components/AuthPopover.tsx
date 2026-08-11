import React, { useState } from 'react';
import { UserProfile, AuthProvider } from '../types';
import { User, Facebook, LogOut, Check } from 'lucide-react';

interface AuthPopoverProps {
  user: UserProfile | null;
  onCustomLogin: (name: string, email: string, provider?: AuthProvider) => void;
  onLogout: () => void;
}

export default function AuthPopover({ user, onCustomLogin, onLogout }: AuthPopoverProps) {
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');

  const handleSubmit = (e: React.FormEvent, provider: AuthProvider = 'Google') => {
    e.preventDefault();
    const nameToUse = inputName.trim() || 'Користувач';
    const emailToUse = inputEmail.trim() || `${nameToUse.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    onCustomLogin(nameToUse, emailToUse, provider);
  };

  return (
    <div className="absolute right-0 mt-3 w-80 bg-slate-900 rounded-2xl shadow-2xl py-5 px-5 text-slate-100 border border-slate-700/80 transform origin-top-right transition-all animate-in fade-in zoom-in-95 z-50">
      {user ? (
        <div className="flex flex-col items-center mb-5">
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-16 h-16 rounded-full border-2 border-indigo-500 shadow-md mb-2 object-cover"
          />
          <h3 className="font-bold text-base text-white">{user.name}</h3>
          <p className="text-xs text-slate-400 font-mono">{user.email}</p>
          <p className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full mt-2 font-medium border border-indigo-500/20">
            Вхід через {user.provider || 'Email'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2">
            <User size={24} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-sm text-white">Авторизація користувача</h3>
          <p className="text-xs text-slate-400 text-center mt-0.5">
            Введіть ваші дані для ідентифікації
          </p>
        </div>
      )}

      {!user ? (
        <form onSubmit={(e) => handleSubmit(e, 'Google')} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Ваше ім'я
            </label>
            <input
              type="text"
              placeholder="Наприклад: Олена"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Ваш Email
            </label>
            <input
              type="email"
              placeholder="olena@example.com"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="pt-1 space-y-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center py-2 px-3 border border-indigo-500/30 rounded-xl shadow-sm bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Увійти з цими даними
            </button>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'Google')}
                className="flex-1 flex items-center justify-center py-1.5 px-2 border border-slate-700 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
              >
                Google
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'Facebook')}
                className="flex-1 flex items-center justify-center py-1.5 px-2 border border-slate-700 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-xs font-medium text-blue-300 transition cursor-pointer"
              >
                Facebook
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="pt-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center py-2 px-4 border border-rose-500/30 rounded-xl bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Вийти (стати Гість)
          </button>
        </div>
      )}
    </div>
  );
}
