import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getElection, getCandidates } from '../api/elections';
import { castVote } from '../api/votes';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import portada from '../images/portada.png';
import escudoUNSA from '../images/Escudo_UNSA.png';

function CalendarIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-4.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .293.454l3.5 1.5a.5.5 0 0 0 .414-.908L9 7.69V4a.5.5 0 0 0-.5-.5Z" />
    </svg>
  );
}

export default function Vote() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getElection(id), getCandidates(id)])
      .then(([e, c]) => {
        setElection(e);
        setCandidates(c);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleVote() {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const result = await castVote(user.id, election.id, selected.id);
      const votedIds = JSON.parse(localStorage.getItem('votedElections') || '[]');
      if (!votedIds.includes(election.id)) {
        votedIds.push(election.id);
        localStorage.setItem('votedElections', JSON.stringify(votedIds));
      }
      setSuccess(`Voto registrado exitosamente. Hash: ${result.hash.slice(0, 16)}...`);
      setTimeout(() => navigate(`/results/${election.id}`), 2000);
    } catch (err) {
      setError(err.message || 'Error al registrar el voto');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading text="Cargando información de la votación..." />;

  return (
    <div>
      {/* ─── Banner ─── */}
      <div className="relative h-36 sm:h-44">
        {!imgFailed ? (
          <img
            src={portada}
            alt="Campus de la Universidad Nacional de San Agustín"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-[75%_center]"
          />
        ) : (
          <div className="absolute inset-0 bg-granate-deep" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-granate-deep/85 to-granate-deep/20" />

        <div className="absolute inset-0 flex items-end p-6 sm:p-8">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-4">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-white p-1.5 sm:h-12 sm:w-12">
              <img src={escudoUNSA} alt="" aria-hidden="true" className="h-full w-full object-contain" />
            </div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-soft">
              Elecciones universitarias &middot; UNSA
            </p>
          </div>
        </div>
      </div>

      {/* ─── Contenido ─── */}
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="max-w-2xl">
          <h1 className="font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.4rem]">
            {election.title}
          </h1>
          {election.description && (
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
              {election.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[0.82rem] text-ink-soft">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 fill-current opacity-50" />
              Inicio: {new Date(election.startDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 fill-current opacity-50" />
              Cierre: {new Date(election.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <ErrorAlert message={error} onClose={() => setError('')} />
          <SuccessAlert message={success} />
        </div>

        {!success && (
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            {/* ---------- Lista de candidatos, estilo cédula ---------- */}
            <div className="lg:col-span-2">
              <p className="mb-6 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                {candidates.length} candidato{candidates.length !== 1 ? 's' : ''} &middot; elige uno
              </p>

              {candidates.length === 0 ? (
                <div className="rounded-2xl border border-sillar-line px-8 py-16 text-center">
                  <h3 className="mb-1 font-serif text-[1.1rem] font-semibold text-ink">Sin candidatos</h3>
                  <p className="text-[0.88rem] text-ink-soft">No hay candidatos registrados para esta elección.</p>
                </div>
              ) : (
                <div className="border-y border-sillar-line">
                  {candidates.map((candidate, i) => {
                    const isSelected = selected?.id === candidate.id;
                    return (
                      <button
                        key={candidate.id}
                        onClick={() => { setSelected(candidate); setConfirming(false); }}
                        disabled={busy}
                        className={`group flex w-full items-center gap-5 border-b border-sillar-line py-6 text-left transition-colors duration-150 last:border-b-0
                          ${isSelected ? 'bg-granate/5' : 'hover:bg-sillar/50'}
                          focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:-outline-offset-2 disabled:cursor-not-allowed`}
                      >
                        <span
                          className={`w-2 flex-shrink-0 self-stretch rounded-full transition-colors duration-150 ${
                            isSelected ? 'bg-granate' : 'bg-transparent'
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={`w-12 flex-shrink-0 font-serif text-[2rem] leading-none transition-colors duration-150 ${
                            isSelected ? 'text-granate' : 'text-ink-soft/30 group-hover:text-ink-soft/50'
                          }`}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-[1.05rem] font-medium text-ink">
                            {candidate.name}
                          </strong>
                          {candidate.party && (
                            <span className="block truncate text-[0.85rem] text-ink-soft">{candidate.party}</span>
                          )}
                        </div>
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                            isSelected ? 'border-granate bg-granate' : 'border-sillar-line'
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && <span className="h-2 w-2 rounded-full bg-sillar" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ---------- Panel de resumen, fijo al hacer scroll ---------- */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-sillar-line bg-white p-7 lg:sticky lg:top-24">
                {!confirming ? (
                  <>
                    <p className="mb-5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      Tu voto
                    </p>
                    {selected ? (
                      <>
                        <div className="mb-6 flex items-center gap-3">
                          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-granate text-[0.9rem] font-semibold text-sillar">
                            {selected.name.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <strong className="block truncate text-[0.98rem] font-medium text-ink">
                              {selected.name}
                            </strong>
                            {selected.party && (
                              <span className="block truncate text-[0.8rem] text-ink-soft">{selected.party}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setConfirming(true)}
                          disabled={busy}
                          className="w-full rounded-lg bg-granate px-5 py-3 text-[0.9rem] font-semibold text-sillar transition-[background-color,transform] duration-150 enabled:hover:bg-granate-deep enabled:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Continuar
                        </button>
                      </>
                    ) : (
                      <p className="text-[0.88rem] leading-relaxed text-ink-soft">
                        Elige un candidato de la lista para continuar con tu voto.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-granate">
                      Confirma tu voto
                    </p>
                    <p className="mb-6 text-[0.95rem] leading-relaxed text-ink">
                      Vas a votar por <strong className="font-semibold">{selected.name}</strong>
                      {selected.party && <span className="text-ink-soft"> ({selected.party})</span>}.
                      Esta acción no se puede deshacer.
                    </p>
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={handleVote}
                        disabled={busy}
                        className="w-full rounded-lg bg-granate px-5 py-3 text-[0.9rem] font-semibold text-sillar transition-[background-color,transform] duration-150 enabled:hover:bg-granate-deep enabled:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? 'Registrando...' : 'Sí, confirmar voto'}
                      </button>
                      <button
                        onClick={() => setConfirming(false)}
                        disabled={busy}
                        className="w-full rounded-lg border border-sillar-line px-5 py-3 text-[0.9rem] font-semibold text-ink-soft transition-colors duration-150 hover:border-granate hover:text-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Volver
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
