import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import escudoUNSA from '../images/Escudo_UNSA.png';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-sillar-line/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2.5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <img
            src={escudoUNSA}
            alt="Escudo UNSA"
            className="h-8 w-auto flex-shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5"
          />
          <span className="font-serif text-[1.05rem] font-semibold tracking-tight text-ink">
            Universidad Nacional de San Agustin
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            {user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="rounded-lg border border-granate/30 px-3 py-1.5 text-[0.82rem] font-semibold text-granate
                  transition-colors duration-150 hover:border-granate hover:bg-granate hover:text-white
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
