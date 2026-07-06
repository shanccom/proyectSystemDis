import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function RegisterPage({ onNavigate }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPass) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (err) {
      if (err.message.toLowerCase().includes('already registered') || err.message.toLowerCase().includes('already been registered')) {
        setError('Este correo ya está registrado. Inicia sesión.');
      } else {
        setError(err.message);
      }
    } else {
      if (data.session === null) {
        setNeedsConfirmation(true);
      }
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h2>
          {needsConfirmation ? (
            <p className="text-gray-500 mb-6">
              Revisa tu correo <span className="font-medium text-gray-700">{email}</span> y confirma tu cuenta antes de iniciar sesión.
            </p>
          ) : (
            <p className="text-gray-500 mb-6">Tu cuenta ha sido registrada exitosamente. Ya puedes iniciar sesión.</p>
          )}
          <button
            onClick={() => onNavigate('login')}
            className="bg-[#0d2461] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition text-sm"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between bg-[#0d2461] text-white p-10 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 rounded-full border-2 border-white" />
          <div className="absolute bottom-40 right-10 w-32 h-32 rounded-full border-2 border-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Shield className="w-8 h-8 text-blue-300" fill="currentColor" />
            <span className="text-2xl font-bold tracking-tight">VotoSeguro</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Únete al proceso<br />democrático
          </h1>
          <p className="text-blue-200 text-lg">
            Crea tu cuenta y participa en las elecciones de tu institución.
          </p>
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
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Shield className="w-7 h-7 text-blue-700" fill="currentColor" />
            <span className="text-xl font-bold text-[#0d2461]">VotoSeguro</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Crear cuenta</h2>
              <p className="text-gray-500 mt-1">Regístrate para participar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
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
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
