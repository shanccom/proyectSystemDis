import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createElection, addCandidate } from '../api/admin';
import ErrorAlert from '../components/ErrorAlert';

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
      <div className="page">
        <div className="page-head">
          <h1>Nueva Elección</h1>
          <p className="page-desc">Crea una nueva elección para el sistema de votación</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/admin')} style={{ marginBottom: '1rem' }}>
          ← Volver al panel
        </button>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <div className="card" style={{ maxWidth: 560 }}>
          <form onSubmit={handleCreateElection}>
            <div className="form-group">
              <label htmlFor="title">Título de la elección</label>
              <input id="title" name="title" type="text" required
                placeholder="Ej: Elección del Consejo Universitario 2026"
                value={election.title} onChange={handleElectionChange} disabled={busy} />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea id="description" name="description" rows={3}
                placeholder="Descripción opcional de la elección"
                value={election.description} onChange={handleElectionChange} disabled={busy}
                style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '0.9rem',
                  resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="startDate">Fecha de inicio</label>
                <input id="startDate" name="startDate" type="datetime-local" required
                  value={election.startDate} onChange={handleElectionChange} disabled={busy} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="endDate">Fecha de cierre</label>
                <input id="endDate" name="endDate" type="datetime-local" required
                  value={election.endDate} onChange={handleElectionChange} disabled={busy} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Creando...' : 'Crear elección'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Agregar Candidatos</h1>
        <p className="page-desc">Agrega los candidatos para la elección creada</p>
      </div>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <div className="card" style={{ maxWidth: 560 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
          Elección: <strong>{election.title}</strong>
        </p>
        {candidates.map((c, i) => (
          <div key={i} style={{
            display: 'flex', gap: '0.5rem', marginBottom: '0.75rem',
            alignItems: 'flex-end'
          }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor={`cname-${i}`}>Nombre</label>
              <input id={`cname-${i}`} type="text" required
                placeholder="Nombre del candidato"
                value={c.name} onChange={e => handleCandidateChange(i, 'name', e.target.value)}
                disabled={busy} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor={`cparty-${i}`}>Partido</label>
              <input id={`cparty-${i}`} type="text"
                placeholder="Partido (opcional)"
                value={c.party} onChange={e => handleCandidateChange(i, 'party', e.target.value)}
                disabled={busy} />
            </div>
            {candidates.length > 1 && (
              <button type="button" className="btn btn-ghost btn-sm"
                onClick={() => removeCandidateRow(i)} disabled={busy}
                style={{ marginBottom: 0 }} aria-label="Eliminar candidato">
                ✕
              </button>
            )}
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={addCandidateRow} disabled={busy}
            style={{ color: 'var(--blue-600)', borderColor: 'var(--blue-300)' }}>
            + Agregar candidato
          </button>
          <button type="button" className="btn btn-success" onClick={handleAddCandidates} disabled={busy}
            style={{ marginLeft: 'auto' }}>
            {busy ? 'Guardando...' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
}
