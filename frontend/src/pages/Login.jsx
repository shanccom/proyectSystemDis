import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';
import ErrorAlert from '../components/ErrorAlert';

const inputStyle =
  'w-full bg-transparent border-0 border-b-[1.5px] border-sillar-line py-2 px-0.5 text-[0.95rem] text-ink placeholder:text-[#a89d86] rounded-none transition-colors duration-150 hover:border-gold focus:outline-none focus:border-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4 focus-visible:rounded-sm disabled:opacity-50 disabled:cursor-not-allowed';

const labelStyle =
  'text-[0.72rem] font-semibold tracking-wider uppercase text-ink-soft';

export default function Login() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
    <div
      className="relative min-h-screen flex items-center justify-center p-5 sm:p-12 bg-sillar
        [background-image:radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(122,27,41,0.06),transparent_70%),repeating-linear-gradient(0deg,transparent_0_46px,#c9bb8f_46px_47px,transparent_47px_92px),repeating-linear-gradient(90deg,transparent_0_78px,#c9bb8f_78px_79px,transparent_79px_156px)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[140px] opacity-30 bg-gradient-to-b from-transparent to-sillar-shadow to-[92%]
          [clip-path:polygon(0_100%,0_78%,38%_78%,47%_40%,53%_46%,62%_20%,71%_55%,100%_60%,100%_100%)]"
      />

      <div className="relative w-full max-w-[400px] animate-settle motion-reduce:animate-none">
        <div
          className="relative z-10 mx-auto -mb-12 flex h-24 w-[84px] items-center justify-center
            rounded-t-[42px] rounded-b-lg border-2 border-gold-soft bg-granate
            shadow-[0_10px_22px_-12px_rgba(74,15,24,0.55)]
            animate-drop-in motion-reduce:animate-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 64 72" className="h-[52px] w-[46px]">
            <path
              d="M6 66 V30 A26 26 0 0 1 58 30 V66"
              fill="none"
              className="stroke-gold-soft"
              strokeWidth="2.4"
            />
            <text
              x="32"
              y="46"
              textAnchor="middle"
              className="fill-sillar font-serif text-[26px]"
            >
              A
            </text>
            <circle cx="32" cy="12" r="2.4" className="fill-gold-soft" />
          </svg>
        </div>

        <div className="relative rounded-[18px] border border-sillar-line bg-sillar px-9 pb-9 pt-16 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_24px_48px_-24px_rgba(50,42,32,0.35)] sm:px-9">
          <div className="mb-6 text-center">
            <p className="mb-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-granate">
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
        </div>
      </div>
    </div>
  );
}
