import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';
import ErrorAlert from '../components/ErrorAlert';
import portada from '../images/portada.png';
import escudoUNSA from '../images/Escudo_UNSA.png';

const inputStyle =
  'w-full bg-transparent border-0 border-b-[1.5px] border-sillar-line py-2.5 px-0.5 text-[0.95rem] text-ink placeholder:text-[#a89d86] rounded-none transition-colors duration-150 hover:border-gold focus:outline-none focus:border-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4 focus-visible:rounded-sm disabled:opacity-50 disabled:cursor-not-allowed';

const labelStyle =
  'text-[0.72rem] font-semibold tracking-wider uppercase text-ink-soft';

function Monogram({ className = 'h-[52px] w-[46px]' }) {
  return (
    <svg viewBox="0 0 64 72" className={className}>
      <path
        d="M6 66 V30 A26 26 0 0 1 58 30 V66"
        fill="none"
        className="stroke-gold-soft"
        strokeWidth="2.4"
      />
      <text x="32" y="46" textAnchor="middle" className="fill-white font-serif text-[26px]">A</text>
      <circle cx="32" cy="12" r="2.4" className="fill-gold-soft" />
    </svg>
  );
}

export default function Login() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const emailRef = useRef(null);
  const usernameRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isRegister && usernameRef.current) {
      usernameRef.current.focus();
    } else if (!isRegister && emailRef.current) {
      emailRef.current.focus();
    }
  }, [isRegister]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let data;
      if (isRegister) {
        data = await register(form.username, form.email, form.password);
      } else {
        data = await login(form.email, form.password);
      }
      loginUser(
        { id: data.userId, email: data.email, role: data.role },
        data.token
      );
      navigate(data.role === 'ADMIN' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* ---------- Columna izquierda: fotografía ---------- */}
      <div className="relative hidden w-1/2 lg:block">
        {!imgFailed ? (
          <img
            src={portada}
            alt="Campus UNSA"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-[75%_center]"
          />
        ) : (
          <div className="absolute inset-0 bg-ink">
            <div className="flex h-full items-center justify-center">
              <Monogram className="h-32 w-28 opacity-30" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        <div className="absolute inset-0 p-10 xl:p-14">
          <div className="flex items-center gap-3">

          </div>
        </div>
      </div>

      {/* ---------- Columna derecha: formulario ---------- */}
      <div className="relative flex w-full flex-1 items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex flex-col items-center text-center">
            <img src={escudoUNSA} alt="Escudo UNSA" className="mb-5 h-16 w-auto" />
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-granate">
              Elecciones universitarias &middot; UNSA
            </p>
            <h1 className="mb-2 font-serif text-[1.7rem] font-semibold tracking-tight text-ink">
              {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            </h1>
            <p className="text-[0.88rem] leading-relaxed text-ink-soft">
              {isRegister
                ? 'Regístrate para participar en las votaciones'
                : 'Ingresa con tu cuenta para votar'}
            </p>
          </div>

          <div className="mb-7 flex items-center justify-center" aria-hidden="true">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-sillar-line" />
            <span className="mx-2.5 h-1.5 w-1.5 flex-shrink-0 rotate-45 bg-gold" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-sillar-line" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[1.15rem]" noValidate>
            <ErrorAlert message={error} onClose={() => setError('')} />

            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className={labelStyle}>Usuario</label>
                <input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  autoComplete="username"
                  autoCapitalize="off"
                  spellCheck="false"
                  placeholder="Tu nombre de usuario"
                  value={form.username}
                  onChange={handleChange}
                  disabled={busy}
                  className={inputStyle}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={labelStyle}>Correo electrónico</label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="email"
                placeholder="usuario@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                disabled={busy}
                className={inputStyle}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className={labelStyle}>Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder="Ingresa tu contraseña"
                value={form.password}
                onChange={handleChange}
                disabled={busy}
                className={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-lg bg-granate px-4 py-3.5 text-[0.95rem] font-semibold text-sillar
                transition-[background-color,transform] duration-150 enabled:hover:bg-granate-deep
                enabled:active:scale-[0.98] focus-visible:outline focus-visible:outline-2
                focus-visible:outline-gold focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {busy ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-[0.85rem] text-ink-soft">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="font-semibold text-granate underline decoration-gold-soft underline-offset-4 hover:text-granate-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 focus-visible:rounded-sm"
            >
              {isRegister ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>

          <p className="mt-6 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-soft/60">
            Fundada en 1828 &middot; Arequipa, Perú
          </p>
        </div>
      </div>
    </div>
  );
}
