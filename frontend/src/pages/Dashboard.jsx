import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listElections } from '../api/elections';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';

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

  return (
    <div className="page">
      <div className="page-head">
        <h1>Elecciones disponibles</h1>
        <p className="page-desc">Selecciona una elección para emitir tu voto</p>
      </div>
      <ErrorAlert message={error} onClose={() => setError('')} />
      {elections.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>No hay elecciones abiertas</h3>
          <p>Actualmente no hay elecciones disponibles para votar.</p>
        </div>
      ) : (
        <div className="election-grid">
          {elections.map(election => (
            <button
              key={election.id}
              className="card election-card"
              onClick={() => navigate(`/vote/${election.id}`)}
            >
              <div className="election-card-top">
                <span className={`badge badge-${election.status.toLowerCase()}`}>
                  {election.status}
                </span>
              </div>
              <h3>{election.title}</h3>
              {election.description && (
                <p className="election-desc">{election.description}</p>
              )}
              <div className="election-meta">
                <span>Inicia: {new Date(election.startDate).toLocaleDateString()}</span>
                <span>Termina: {new Date(election.endDate).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
