import React, { useState, useEffect } from 'react';
import { UserProfile, AuthProvider } from '../types';
import { User, LogOut, Check, Image as ImageIcon } from 'lucide-react';

interface AuthPopoverProps {
  user: UserProfile | null;
  onCustomLogin: (name: string, email: string, provider?: AuthProvider, avatarUrl?: string) => void;
  onLogout: () => void;
}

// Utility function to parse Google Credential JWT safely
function parseGoogleJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT:', e);
    return null;
  }
}

export default function AuthPopover({ user, onCustomLogin, onLogout }: AuthPopoverProps) {
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputAvatar, setInputAvatar] = useState('');
  const [showAvatarField, setShowAvatarField] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Google Identity Services (GIS) button initialization
  useEffect(() => {
    if (user) return;

    // Load Google GIS script dynamically if not present
    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.head.appendChild(script);
    } else if ((window as any).google?.accounts?.id) {
      initGsi();
    }

    function initGsi() {
      if (!(window as any).google?.accounts?.id) return;

      const handleCredentialResponse = (response: any) => {
        if (response.credential) {
          const payload = parseGoogleJwt(response.credential);
          if (payload) {
            onCustomLogin(
              payload.name || payload.email.split('@')[0],
              payload.email,
              'Google',
              payload.picture
            );
          }
        }
      };

      try {
        (window as any).google.accounts.id.initialize({
          client_id:
            (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
            '1000000000000-example.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        const btnDiv = document.getElementById('google-signin-btn-container');
        if (btnDiv) {
          (window as any).google.accounts.id.renderButton(btnDiv, {
            theme: 'outline',
            size: 'medium',
            type: 'standard',
            text: 'signin_with',
            shape: 'pill',
          });
        }
      } catch (err) {
        // Fallback for non-valid client_id
      }
    }
  }, [user, onCustomLogin]);

  const handleSubmit = (e: React.FormEvent, provider: AuthProvider = 'Google') => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = inputName.trim();
    const trimmedEmail = inputEmail.trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMsg("Будь ласка, введіть ім'я та email!");
      return;
    }

    onCustomLogin(trimmedName, trimmedEmail, provider, inputAvatar.trim() || undefined);
  };

  return (
    <div className="absolute right-0 mt-3 w-80 bg-slate-900 rounded-2xl shadow-2xl py-5 px-5 text-slate-100 border border-slate-700/80 transform origin-top-right transition-all animate-fadeIn z-50">
      {user ? (
        <div className="flex flex-col items-center mb-5">
          <img
            src={user.avatar}
            alt="Avatar"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=6366f1&color=fff`;
            }}
            className="w-16 h-16 rounded-full border-2 border-indigo-500 shadow-md mb-2 object-cover"
          />
          <h3 className="font-bold text-base text-white">{user.name}</h3>
          <p className="text-xs text-slate-400 font-mono">{user.email}</p>
          <p className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full mt-2 font-medium border border-indigo-500/20">
            Вхід через {user.provider || 'Google'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2">
            <User size={24} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-sm text-white">Авторизація користувача</h3>
          <p className="text-xs text-slate-400 text-center mt-0.5">
            Увійдіть для прив'язки власного профілю
          </p>
        </div>
      )}

      {!user ? (
        <form onSubmit={(e) => handleSubmit(e, 'Google')} className="space-y-3">
          {errorMsg && (
            <div className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Ваше реальне ім'я *
            </label>
            <input
              type="text"
              placeholder="Наприклад: Станіслав Мазур"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Ваш реальний Email *
            </label>
            <input
              type="email"
              placeholder="stasmazur885@gmail.com"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAvatarField(!showAvatarField)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
            >
              <ImageIcon className="w-3 h-3" />
              {showAvatarField ? 'Сховати URL аватарки' : '+ Додати фото аватарки (URL)'}
            </button>

            {showAvatarField && (
              <input
                type="url"
                placeholder="https://lh3.googleusercontent.com/..."
                value={inputAvatar}
                onChange={(e) => setInputAvatar(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          <div className="pt-1 space-y-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center py-2 px-3 border border-indigo-500/30 rounded-xl shadow-sm bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Увійти з цим акаунтом
            </button>

            {/* Container for Google Identity Services Official Button */}
            <div id="google-signin-btn-container" className="flex justify-center pt-1" />

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'Google')}
                className="flex-1 flex items-center justify-center py-1.5 px-2 border border-slate-700 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
              >
                Google Sign-In
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
            Вийти (стати гостем)
          </button>
        </div>
      )}
    </div>
  );
}