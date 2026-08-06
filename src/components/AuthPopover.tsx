import React from 'react';
import { UserProfile, AuthProvider } from '../types';
import { User, Facebook, LogOut, Plus } from 'lucide-react';

interface AuthPopoverProps {
  user: UserProfile | null;
  onLogin: (provider: AuthProvider) => void;
  onLogout: () => void;
}

export default function AuthPopover({ user, onLogin, onLogout }: AuthPopoverProps) {
  return (
    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl py-6 px-4 text-gray-800 border border-gray-100 transform origin-top-right transition-all animate-in fade-in zoom-in-95 z-50">
      {user ? (
        <div className="flex flex-col items-center mb-6">
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-blue-50 shadow-sm mb-3 object-cover"
          />
          <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full mt-2 font-medium">
            Увійшли через {user.provider}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <User size={40} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">Ви не авторизовані</h3>
          <p className="text-sm text-gray-500 text-center mt-1">
            Увійдіть, щоб зберігати та відстежувати зміни
          </p>
        </div>
      )}

      <div className="space-y-3">
        {!user ? (
          <>
            <button
              onClick={() => onLogin('Google')}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              onClick={() => onLogin('Facebook')}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#166FE5] transition-colors cursor-pointer"
            >
              <Facebook className="w-5 h-5 mr-3 fill-current" />
              Facebook
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onLogin('Facebook')}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2 text-gray-400" />
              Додати акаунт
            </button>
            <div className="h-px bg-gray-100 my-2"></div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-red-100 rounded-xl bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Вийти
            </button>
          </>
        )}
      </div>
    </div>
  );
}
