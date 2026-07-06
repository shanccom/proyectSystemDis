import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listElections } from '../api/elections';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import ShieldLogo from '../components/ShieldLogo';

function statusInfo(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('open') || s.includes('activ') || s.includes('curso')) {
    return { label: status, classes: 'bg-granate/10 text-granate' };
  }
  if (s.includes('clos') || s.includes('cerrad') || s.includes('final')) {
    return { label: status, classes: 'bg-sillar-line/20 text-ink-soft' };
  }
  return { label: status, classes: 'border border-gold/30 text-gold' };
}

export default function Dashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    <div className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] opacity-20 bg-gradient-to-b from-transparent to-sillar-shadow to-[92%]
          [clip-path:polygon(0_100%,0_78%,38%_78%,47%_40%,53%_46%,62%_20%,71%_55%,100%_60%,100%_100%)]"
      />

      <div className="relative mb-12 overflow-hidden rounded-2xl border border-sillar-line bg-gradient-to-br from-sillar to-sillar-shadow/20 px-7 py-8 sm:px-10 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]
            [background-image:repeating-linear-gradient(0deg,transparent_0_46px,#c9bb8f_46px_47px,transparent_47px_92px),repeating-linear-gradient(90deg,transparent_0_78px,#c9bb8f_78px_79px,transparent_79px_156px)]"
        />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex h-20 w-[72px] flex-shrink-0 items-center justify-center rounded-t-[36px] rounded-b-lg border-2 border-gold-soft bg-granate shadow-[0_8px_20px_-12px_rgba(74,15,24,0.5)]">
            <ShieldLogo className="h-11 w-[38px]" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-granate">
              Universidad Nacional de San Agustín
            </p>
            <h1 className="font-serif text-[1.7rem] font-semibold tracking-tight text-ink sm:text-[2rem]">
              Sistema de Voto Electrónico
            </h1>
            <p className="mt-1.5 max-w-prose text-[0.92rem] leading-relaxed text-ink-soft">
              Selecciona una elección de la lista para emitir tu voto de forma segura y transparente.
            </p>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-5 border-t border-sillar-line pt-5 sm:mt-7 sm:pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-granate/10">
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-granate">
                <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 10H9V5h2v6Zm0 4H9v-2h2v2Z" />
              </svg>
            </div>
            <div>
              <span className="block font-serif text-[1.2rem] font-bold text-granate leading-none">{openCount}</span>
              <span className="text-[0.72rem] font-semibold tracking-wide text-ink-soft">Elecciones activas</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10">
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-gold">
                <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-1 5h2v6H9V6Zm0 8h2v2H9v-2Z" />
              </svg>
            </div>
            <div>
              <span className="block font-serif text-[1.2rem] font-bold text-gold leading-none">{totalCount}</span>
              <span className="text-[0.72rem] font-semibold tracking-wide text-ink-soft">Total elecciones</span>
            </div>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {elections.length === 0 ? (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-sillar-line bg-sillar/60 px-8 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-t-[32px] rounded-b-md border-2 border-gold-soft bg-granate">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-sillar" strokeWidth="1.6">
              <path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Z" strokeLinejoin="round" />
              <path d="M4 8 12 3l8 5" strokeLinejoin="round" />
              <path d="M9 12h6" strokeLinecap="round" />
            </svg>
          </div>
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
          {elections.map(election => {
            const { label, classes } = statusInfo(election.status);
            return (
              <button
                key={election.id}
                onClick={() => navigate(`/vote/${election.id}`)}
                className="group relative flex flex-col rounded-2xl border border-sillar-line bg-white p-5 text-left
                  shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]
                  transition-all duration-150 hover:-translate-y-0.5 hover:border-granate hover:shadow-[0_16px_32px_-20px_rgba(50,42,32,0.4)]
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide ${classes}`}>
                    {label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rotate-45 bg-gold opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  />
                </div>

                <h3 className="mb-1.5 font-serif text-[1.15rem] font-semibold leading-snug text-ink">
                  {election.title}
                </h3>

                {election.description && (
                  <p className="mb-4 line-clamp-2 text-[0.85rem] leading-relaxed text-ink-soft">
                    {election.description}
                  </p>
                )}

                <div className="mt-auto flex flex-col gap-1 border-t border-sillar-line pt-3 text-[0.78rem] text-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current opacity-60">
                      <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-4.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .293.454l3.5 1.5a.5.5 0 0 0 .414-.908L9 7.69V4a.5.5 0 0 0-.5-.5Z" />
                    </svg>
                    Inicia: {new Date(election.startDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current opacity-60">
                      <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-4.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .293.454l3.5 1.5a.5.5 0 0 0 .414-.908L9 7.69V4a.5.5 0 0 0-.5-.5Z" />
                    </svg>
                    Termina: {new Date(election.endDate).toLocaleDateString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
