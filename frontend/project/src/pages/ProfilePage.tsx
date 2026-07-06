import { useState } from 'react';
import { User, Mail, Shield, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface Props {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export default function ProfilePage({ profile, onProfileUpdate }: Props) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const initials = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || profile.email[0].toUpperCase();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id);
    setSaving(false);
    if (err) {
      setError('No se pudo actualizar el perfil.');
    } else {
      onProfileUpdate({ ...profile, full_name: fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil</h1>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#0d2461] flex items-center justify-center text-2xl font-bold text-white mb-3">
              {initials}
            </div>
            <p className="font-semibold text-gray-900">{profile.full_name || '—'}</p>
            <span className="text-xs text-gray-400 mt-1 capitalize bg-gray-100 px-3 py-1 rounded-full">
              {profile.role === 'admin' ? 'Administrador' : 'Votante'}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profile.role === 'admin' ? 'Administrador' : 'Votante'}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0d2461] text-white py-2.5 rounded-lg font-medium hover:bg-blue-900 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Información de la cuenta</h2>
          <p className="text-xs text-gray-400">
            Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
