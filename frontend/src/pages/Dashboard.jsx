import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listElections } from '../api/elections';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import escudoUNSA from '../images/Escudo_UNSA.png';
import portada from '../images/portada.png';

function statusInfo(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('open') || s.includes('activ') || s.includes('curso')) {
    return { label: status, classes: 'bg-granate/10 text-granate ring-1 ring-granate/20' };
  }
  if (s.includes('clos') || s.includes('cerrad') || s.includes('final')) {
    return { label: status, classes: 'bg-sillar-line/15 text-ink-soft ring-1 ring-sillar-line/20' };
  }
  return { label: status, classes: 'bg-gold/10 text-gold ring-1 ring-gold/20' };
}

export default function Dashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgFailed, setImgFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    listElections()
      .then(setElections)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Cargando elecciones..." />;

  const openCount = elections.filter(e => e.status === 'OPEN').length;
  const totalCount = elections.length;

  return (
    <div>
      {/* ─── Banner full-width ─── */}
      <div className="relative h-56 sm:h-80">
        {!imgFailed ? (
          <img
            src={portada}
            alt="Campus de la Universidad Nacional de San Agustín"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-[75%_center]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-granate to-granate-deep" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-granate-deep/80 via-granate/30 to-black/10" />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-25 bg-gradient-to-b from-transparent to-black/70
            [clip-path:polygon(0_100%,0_65%,38%_65%,47%_28%,53%_35%,62%_12%,71%_45%,100%_50%,100%_100%)]"
        />

        <div className="absolute inset-0 flex items-end p-6 sm:p-10">
          <div className="mx-auto flex w-full max-w-6xl items-end gap-5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-lg sm:h-20 sm:w-20">
              <img src={escudoUNSA} alt="" aria-hidden="true" className="h-full w-full object-contain" />
            </div>
            <div className="pb-0.5">
              <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-soft/90">
                Universidad Nacional de San Agustín
              </p>
              <h1 className="font-serif text-[1.6rem] font-semibold leading-tight text-white sm:text-[2.2rem]">
                Sistema de Voto Electrónico
              </h1>
              <p className="mt-1.5 max-w-xl text-[0.88rem] leading-relaxed text-white/70">
                Selecciona una elección para emitir tu voto de forma segura y transparente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Contenido ─── */}
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {/* ── Stats ── */}
        <div className="mb-12 flex flex-wrap items-center gap-6 rounded-2xl border border-sillar-line bg-white px-6 py-5 shadow-[0_1px_3px_-1px_rgba(50,42,32,0.06)] sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-granate to-granate-deep shadow-sm">
              <svg viewBox="0 0 20 20" className="h-5 w-5 fill-white">
                <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 10H9V5h2v6Zm0 4H9v-2h2v2Z" />
              </svg>
            </div>
            <div>
              <span className="block font-serif text-[1.5rem] font-bold leading-none text-granate">{openCount}</span>
              <span className="text-[0.72rem] font-semibold tracking-wide text-ink-soft">Activas</span>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-sillar-line/50 sm:block" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-600 shadow-sm">
              <svg viewBox="0 0 20 20" className="h-5 w-5 fill-white">
                <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-1 5h2v6H9V6Zm0 8h2v2H9v-2Z" />
              </svg>
            </div>
            <div>
              <span className="block font-serif text-[1.5rem] font-bold leading-none text-gold">{totalCount}</span>
              <span className="text-[0.72rem] font-semibold tracking-wide text-ink-soft">Registradas</span>
            </div>
          </div>
          <div className="ml-auto hidden text-[0.78rem] text-ink-soft sm:block">
            {totalCount > 0 ? `${Math.round((openCount / totalCount) * 100)}% de participación` : '—'}
          </div>
        </div>

        <ErrorAlert message={error} onClose={() => setError('')} />

        {/* ── Sección de elecciones ── */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-1 rounded-full bg-granate" aria-hidden="true" />
            <h2 className="font-serif text-[1.25rem] font-semibold text-ink">Elecciones</h2>
          </div>
          <span className="text-[0.78rem] text-ink-soft">{elections.length} resultado{elections.length !== 1 ? 's' : ''}</span>
        </div>

        {elections.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-sillar-line bg-white px-8 py-20 text-center">
            <img src={escudoUNSA} alt="" aria-hidden="true" className="h-14 w-auto opacity-30" />
            <div>
              <h3 className="mb-1 font-serif text-[1.2rem] font-semibold text-ink">
                No hay elecciones disponibles
              </h3>
              <p className="max-w-xs text-[0.9rem] text-ink-soft">
            Actualmente no hay elecciones abiertas para votación. Vuelve más tarde.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {elections.map((election, i) => {
              const { label, classes } = statusInfo(election.status);
              return (
                <button
                  key={election.id}
                  onClick={() => navigate(`/vote/${election.id}`)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-sillar-line bg-white text-left
                    shadow-[0_1px_3px_-1px_rgba(50,42,32,0.06)]
                    transition-all duration-150 hover:-translate-y-1 hover:border-granate/50 hover:shadow-[0_12px_28px_-16px_rgba(50,42,32,0.3)]
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-granate to-gold opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${classes}`}>
                        {label}
                      </span>
                      <span className="font-mono text-[0.7rem] font-medium text-ink-soft/40">
                        0{i + 1}
                      </span>
                    </div>

                    <h3 className="mb-1.5 font-serif text-[1.1rem] font-semibold leading-snug text-ink">
                      {election.title}
                    </h3>

                    {election.description && (
                      <p className="mb-4 line-clamp-2 text-[0.85rem] leading-relaxed text-ink-soft">
                        {election.description}
                      </p>
                    )}

                    <div className="mt-auto flex flex-col gap-1.5 border-t border-sillar-line/60 pt-3 text-[0.75rem] text-ink-soft">
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current opacity-50">
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5ZM2 4v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4H2Z" />
                        </svg>
                        {new Date(election.startDate).toLocaleDateString()} — {new Date(election.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
