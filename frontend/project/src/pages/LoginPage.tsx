import { useState } from 'react';
import { Shield, Eye, EyeOff, CheckSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function LoginPage({ onNavigate }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between bg-[#0d2461] text-white p-10 relative overflow-hidden flex-shrink-0">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 rounded-full border-2 border-white" />
          <div className="absolute top-40 left-32 w-20 h-20 rounded-full border border-white" />
          <div className="absolute bottom-40 right-10 w-32 h-32 rounded-full border-2 border-white" />
          <div className="absolute bottom-20 left-20 w-16 h-16 rounded-full border border-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Shield className="w-8 h-8 text-blue-300" fill="currentColor" />
            <span className="text-2xl font-bold tracking-tight">VotoSeguro</span>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Sistema de Votación<br />Electrónica
            </h1>
            <p className="text-blue-200 text-lg font-medium">
              Tu voto. Tu voz. Tu futuro.
            </p>
          </div>
        </div>

        {/* Ballot box illustration */}
        <div className="relative z-10 flex justify-center mb-10">
          <div className="relative">
            <div className="w-44 h-44 border-2 border-blue-300 border-opacity-60 rounded-2xl flex flex-col items-center justify-center bg-blue-800 bg-opacity-40 shadow-2xl">
              <div className="w-28 h-3 bg-blue-300 bg-opacity-70 rounded-full mb-6" />
              <CheckSquare className="w-16 h-16 text-blue-300 opacity-80" />
              <div className="flex gap-1 mt-5">
                {[1,2,3].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-300 opacity-60" />
                ))}
              </div>
            </div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-6 bg-blue-600 rounded border-2 border-blue-400 flex items-center justify-center">
              <div className="w-6 h-1 bg-blue-200 rounded" />
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex gap-2 items-center text-blue-300 text-sm">
            <Shield className="w-4 h-4" />
            <span>Plataforma segura y verificada</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Shield className="w-7 h-7 text-blue-700" fill="currentColor" />
            <span className="text-xl font-bold text-[#0d2461]">VotoSeguro</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
              <p className="text-gray-500 mt-1">Bienvenido de nuevo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-sm text-blue-600 hover:text-blue-800 transition">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0d2461] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
