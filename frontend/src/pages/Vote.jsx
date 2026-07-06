import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getElection, getCandidates } from '../api/elections';
import { castVote } from '../api/votes';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import ShieldLogo from '../components/ShieldLogo';

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
    <div className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px] opacity-15 bg-gradient-to-b from-transparent to-sillar-shadow to-[92%]
          [clip-path:polygon(0_100%,0_82%,38%_82%,47%_50%,53%_55%,62%_30%,71%_60%,100%_65%,100%_100%)]"
      />

      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-1.5 text-[0.85rem] font-semibold text-ink-soft transition-colors hover:text-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 focus-visible:rounded-sm"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
          <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
        Volver
      </button>

      <div className="mb-10 overflow-hidden rounded-2xl border border-sillar-line bg-gradient-to-br from-sillar to-sillar-shadow/10 px-7 py-7 sm:px-9 sm:py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]
            [background-image:repeating-linear-gradient(0deg,transparent_0_46px,#c9bb8f_46px_47px,transparent_47px_92px),repeating-linear-gradient(90deg,transparent_0_78px,#c9bb8f_78px_79px,transparent_79px_156px)]"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-14 w-[52px] flex-shrink-0 items-center justify-center rounded-t-[26px] rounded-b-md border-2 border-gold-soft bg-granate shadow-[0_6px_14px_-10px_rgba(74,15,24,0.45)]">
            <ShieldLogo className="h-8 w-7" strokeWidth={1.8} />
          </div>
          <div>
            <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-granate">
              Elecciones universitarias &middot; UNSA
            </p>
            <h1 className="font-serif text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.7rem]">
              {election.title}
            </h1>
            {election.description && (
              <p className="mt-1.5 max-w-prose text-[0.92rem] leading-relaxed text-ink-soft">
                {election.description}
              </p>
            )}
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-sillar-line pt-4 text-[0.78rem] text-ink-soft">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current opacity-60"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-4.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .293.454l3.5 1.5a.5.5 0 0 0 .414-.908L9 7.69V4a.5.5 0 0 0-.5-.5Z"/></svg>
            Inicio: {new Date(election.startDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current opacity-60"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-4.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .293.454l3.5 1.5a.5.5 0 0 0 .414-.908L9 7.69V4a.5.5 0 0 0-.5-.5Z"/></svg>
            Cierre: {new Date(election.endDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current opacity-60"><path d="M8 1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2 2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 8a4 4 0 0 1-4-4h1a3 3 0 0 0 6 0h1a4 4 0 0 1-4 4z"/></svg>
            Candidatos: {candidates.length}
          </span>
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} />

      {!success && (
        <>
          {confirming ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-sillar-line bg-white p-8 text-center shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_24px_48px_-24px_rgba(50,42,32,0.35)]">
              <div className="mx-auto mb-4 flex h-12 w-[44px] items-center justify-center rounded-t-[22px] rounded-b-md border-2 border-gold-soft bg-granate">
                <ShieldLogo className="h-7 w-6" strokeWidth={1.8} />
              </div>
              <h2 className="mb-3 font-serif text-[1.3rem] font-semibold text-ink">
                Confirma tu voto
              </h2>
              <p className="mb-6 text-[1rem] leading-relaxed text-ink-soft">
                Vas a votar por <strong className="text-ink">{selected.name}</strong>
                {selected.party && <span> ({selected.party})</span>}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  className="rounded-lg border border-sillar-line px-5 py-2.5 text-[0.88rem] font-semibold text-ink-soft transition-colors duration-150 hover:border-granate hover:text-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setConfirming(false)} disabled={busy}
                >
                  Cancelar
                </button>
                <button
                  className="rounded-lg bg-granate px-5 py-2.5 text-[0.88rem] font-semibold text-sillar transition-[background-color,transform] duration-150 enabled:hover:bg-granate-deep enabled:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleVote} disabled={busy}
                >
                  {busy ? 'Registrando...' : 'Sí, confirmar voto'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-3">
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-granate">
                  <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 10H9V5h2v6Zm0 4H9v-2h2v2Z" />
                </svg>
                <h2 className="text-[0.88rem] font-semibold text-ink">Selecciona tu candidato</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {candidates.map(candidate => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelected(candidate)}
                    className={`relative flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-150 ${
                      selected?.id === candidate.id
                        ? 'border-granate bg-granate/5'
                        : 'border-sillar-line bg-white hover:border-granate/40'
                    } focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-granate text-[0.88rem] font-bold text-sillar">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <strong className="block text-[0.88rem] text-ink">{candidate.name}</strong>
                      {candidate.party && (
                        <span className="text-[0.8rem] text-ink-soft">{candidate.party}</span>
                      )}
                    </div>
                    {selected?.id === candidate.id && (
                      <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-granate text-[0.65rem] font-bold text-sillar">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
                {candidates.length === 0 && (
                  <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-sillar-line bg-sillar/60 px-8 py-12 text-center">
                    <h3 className="font-serif text-[1.1rem] font-semibold text-ink">Sin candidatos</h3>
                    <p className="text-[0.88rem] text-ink-soft">No hay candidatos registrados para esta elección.</p>
                  </div>
                )}
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  className="rounded-lg bg-granate px-8 py-3 text-[0.95rem] font-semibold text-sillar transition-[background-color,transform] duration-150 enabled:hover:bg-granate-deep enabled:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
                  disabled={!selected}
                  onClick={() => setConfirming(true)}
                >
                  {selected ? `Votar por ${selected.name}` : 'Selecciona un candidato'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
