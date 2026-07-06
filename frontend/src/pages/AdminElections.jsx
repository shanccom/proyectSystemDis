import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createElection, addCandidate } from '../api/admin';
import ErrorAlert from '../components/ErrorAlert';

const inputClass =
  'w-full rounded-lg border border-sillar-line bg-transparent px-3.5 py-2.5 text-[0.92rem] text-ink placeholder:text-[#a89d86] transition-colors duration-150 hover:border-gold focus:border-granate focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

export default function AdminElections() {
  const navigate = useNavigate();
  const [step, setStep] = useState('election');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [election, setElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [createdId, setCreatedId] = useState(null);
  const [candidates, setCandidates] = useState([{ name: '', party: '' }]);

  function handleElectionChange(e) {
    setElection({ ...election, [e.target.name]: e.target.value });
  }

  function handleCandidateChange(i, field, value) {
    const next = [...candidates];
    next[i] = { ...next[i], [field]: value };
    setCandidates(next);
  }

  function addCandidateRow() {
    setCandidates([...candidates, { name: '', party: '' }]);
  }

  function removeCandidateRow(i) {
    if (candidates.length <= 1) return;
    setCandidates(candidates.filter((_, idx) => idx !== i));
  }

  async function handleCreateElection(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = {
        title: election.title,
        description: election.description || null,
        startDate: new Date(election.startDate).toISOString(),
        endDate: new Date(election.endDate).toISOString(),
      };
      const created = await createElection(data);
      setCreatedId(created.id);
      setStep('candidates');
    } catch (err) {
      setError(err.message || 'Error al crear la elección');
    } finally {
      setBusy(false);
    }
  }

  async function handleAddCandidates() {
    setError('');
    setBusy(true);
    try {
      const valid = candidates.filter(c => c.name.trim());
      for (const c of valid) {
        await addCandidate(createdId, { name: c.name.trim(), party: c.party.trim() || null });
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Error al agregar candidatos');
    } finally {
      setBusy(false);
    }
  }

  if (step === 'election') {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <button
          onClick={() => navigate('/admin')}
          className="mb-6 flex items-center gap-1.5 text-[0.85rem] font-semibold text-ink-soft transition-colors hover:text-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 focus-visible:rounded-sm"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
          Volver al panel
        </button>

        <div className="mb-8">
          <p className="mb-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-granate">
            Administración
          </p>
          <h1 className="font-serif text-[1.9rem] font-semibold tracking-tight text-ink">Nueva Elección</h1>
          <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-soft">Crea una nueva elección para el sistema de votación</p>
        </div>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <div className="max-w-lg rounded-2xl border border-sillar-line bg-white p-6 shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
          <form onSubmit={handleCreateElection} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-[0.72rem] font-semibold tracking-wider uppercase text-ink-soft">
                Título de la elección
              </label>
              <input
                id="title" name="title" type="text" required
                placeholder="Ej: Elección del Consejo Universitario 2026"
                value={election.title} onChange={handleElectionChange} disabled={busy}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-[0.72rem] font-semibold tracking-wider uppercase text-ink-soft">
                Descripción
              </label>
              <textarea
                id="description" name="description" rows={3}
                placeholder="Descripción opcional de la elección"
                value={election.description} onChange={handleElectionChange} disabled={busy}
                className={inputClass + ' resize-y'}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="startDate" className="text-[0.72rem] font-semibold tracking-wider uppercase text-ink-soft">
                  Fecha de inicio
                </label>
                <input
                  id="startDate" name="startDate" type="datetime-local" required
                  value={election.startDate} onChange={handleElectionChange} disabled={busy}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="endDate" className="text-[0.72rem] font-semibold tracking-wider uppercase text-ink-soft">
                  Fecha de cierre
                </label>
                <input
                  id="endDate" name="endDate" type="datetime-local" required
                  value={election.endDate} onChange={handleElectionChange} disabled={busy}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit" disabled={busy}
              className="mt-2 w-full rounded-lg bg-granate px-4 py-3 text-[0.92rem] font-semibold text-sillar transition-[background-color,transform] duration-150 enabled:hover:bg-granate-deep enabled:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-65 disabled:cursor-not-allowed"
            >
              {busy ? 'Creando...' : 'Crear elección'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <p className="mb-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-granate">
          Administración
        </p>
        <h1 className="font-serif text-[1.9rem] font-semibold tracking-tight text-ink">Agregar Candidatos</h1>
        <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-soft">Agrega los candidatos para la elección creada</p>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="max-w-lg rounded-2xl border border-sillar-line bg-white p-6 shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
        <p className="mb-5 text-[0.88rem] text-ink-soft">
          Elección: <strong className="text-ink">{election.title}</strong>
        </p>

        {candidates.map((c, i) => (
          <div key={i} className="mb-3 flex items-end gap-2.5">
            <div className="flex-1">
              <label htmlFor={`cname-${i}`} className="mb-1 block text-[0.72rem] font-semibold tracking-wider uppercase text-ink-soft">
                Nombre
              </label>
              <input
                id={`cname-${i}`} type="text" required
                placeholder="Nombre del candidato"
                value={c.name} onChange={e => handleCandidateChange(i, 'name', e.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-sillar-line bg-transparent px-3 py-2 text-[0.92rem] text-ink placeholder:text-[#a89d86] transition-colors duration-150 hover:border-gold focus:border-granate focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex-1">
              <label htmlFor={`cparty-${i}`} className="mb-1 block text-[0.72rem] font-semibold tracking-wider uppercase text-ink-soft">
                Partido
              </label>
              <input
                id={`cparty-${i}`} type="text"
                placeholder="Partido (opcional)"
                value={c.party} onChange={e => handleCandidateChange(i, 'party', e.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-sillar-line bg-transparent px-3 py-2 text-[0.92rem] text-ink placeholder:text-[#a89d86] transition-colors duration-150 hover:border-gold focus:border-granate focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {candidates.length > 1 && (
              <button
                type="button"
                onClick={() => removeCandidateRow(i)} disabled={busy}
                className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-sillar-line text-[0.85rem] text-ink-soft transition-colors hover:border-granate hover:text-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Eliminar candidato"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button" onClick={addCandidateRow} disabled={busy}
            className="rounded-lg border border-granate/30 px-3.5 py-2 text-[0.82rem] font-semibold text-granate transition-colors duration-150 hover:bg-granate/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Agregar candidato
          </button>
          <button
            type="button" onClick={handleAddCandidates} disabled={busy}
            className="ml-auto rounded-lg bg-granate px-5 py-2.5 text-[0.88rem] font-semibold text-sillar transition-[background-color,transform] duration-150 enabled:hover:bg-granate-deep enabled:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-65 disabled:cursor-not-allowed"
          >
            {busy ? 'Guardando...' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
}
