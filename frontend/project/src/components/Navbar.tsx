import { Bell, ChevronDown, Menu, Shield, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Page } from '../types';

interface Props {
  profile: Profile;
  onNavigate: (page: Page) => void;
  onToggleSidebar?: () => void;
  title?: string;
}

export default function Navbar({ profile, onNavigate, onToggleSidebar, title }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const initials = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || profile.email[0].toUpperCase();

  return (
    <header className="h-14 bg-[#0d2461] flex items-center px-4 gap-4 flex-shrink-0 relative z-30">
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="text-white opacity-80 hover:opacity-100 transition lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-center gap-2 mr-auto">
        <Shield className="w-5 h-5 text-blue-300" fill="currentColor" />
        <span className="text-white font-bold text-base tracking-tight">
          {title ?? 'VotoSeguro'}
        </span>
      </div>

      <button className="text-white opacity-70 hover:opacity-100 transition relative">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full" />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2.5 text-white hover:opacity-90 transition"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold leading-tight">{profile.full_name || profile.email}</p>
            <p className="text-xs text-blue-300 capitalize">{profile.role === 'admin' ? 'Administrador' : 'Votante'}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
            <button
              onClick={() => { setShowDropdown(false); onNavigate('profile'); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <User className="w-4 h-4 text-gray-400" />
              Perfil
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
