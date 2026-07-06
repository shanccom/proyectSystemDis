import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b-2 border-gold bg-sillar/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-t-xl rounded-b-sm border border-gold-soft bg-granate transition-transform duration-150 group-hover:-translate-y-0.5">
            <svg viewBox="0 0 64 72" className="h-4 w-4">
              <path
                d="M6 66 V30 A26 26 0 0 1 58 30 V66"
                fill="none"
                className="stroke-gold-soft"
                strokeWidth="5"
              />
              <text x="32" y="52" textAnchor="middle" className="fill-sillar font-serif text-[34px]">A</text>
            </svg>
          </span>
          <span className="font-serif text-[1.05rem] font-semibold tracking-tight text-ink">
            Voto Electrónico
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            {user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="rounded-lg border border-granate px-3 py-1.5 text-[0.82rem] font-semibold text-granate
                  transition-colors duration-150 hover:bg-granate hover:text-sillar
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
              >
                Admin
              </Link>
            )}

            <span className="hidden rounded-full bg-granate/10 px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-granate sm:inline-block">
              {user.role}
            </span>

            <span className="hidden max-w-[160px] truncate text-[0.82rem] text-ink-soft md:inline-block">
              {user.email}
            </span>

            <button
              onClick={logout}
              className="rounded-lg border border-sillar-line px-3 py-1.5 text-[0.82rem] font-semibold text-ink-soft
                transition-colors duration-150 hover:border-granate hover:text-granate
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
