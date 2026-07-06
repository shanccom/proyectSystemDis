import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getElection, getCandidates } from '../api/elections';
import { castVote } from '../api/votes';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';

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
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate('/')}>
        &larr; Volver
      </button>

      <div className="page-head">
        <h1>{election.title}</h1>
        {election.description && <p className="page-desc">{election.description}</p>}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} />

      {!success && (
        <>
          {confirming ? (
            <div className="card confirm-card">
              <h2>Confirma tu voto</h2>
              <p className="confirm-text">
                Vas a votar por <strong>{selected.name}</strong>
                {selected.party && <span> ({selected.party})</span>}
              </p>
              <div className="confirm-actions">
                <button className="btn btn-secondary" onClick={() => setConfirming(false)} disabled={busy}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleVote} disabled={busy}>
                  {busy ? 'Registrando...' : 'Sí, confirmar voto'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="section-title">Candidatos</h2>
              <div className="candidate-grid">
                {candidates.map(candidate => (
                  <button
                    key={candidate.id}
                    className={`card candidate-card ${selected?.id === candidate.id ? 'selected' : ''}`}
                    onClick={() => setSelected(candidate)}
                  >
                    <div className="candidate-avatar">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="candidate-info">
                      <strong>{candidate.name}</strong>
                      {candidate.party && <span className="candidate-party">{candidate.party}</span>}
                    </div>
                    {selected?.id === candidate.id && <span className="check-mark">✓</span>}
                  </button>
                ))}
                {candidates.length === 0 && (
                  <div className="empty-state">
                    <p>No hay candidatos registrados para esta elección.</p>
                  </div>
                )}
              </div>
              <div className="vote-actions">
                <button
                  className="btn btn-primary"
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
