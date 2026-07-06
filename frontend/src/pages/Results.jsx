import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getElection } from '../api/elections';
import { getLiveResults, getLiveStatistics } from '../api/results';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function loadData() {
    setLoading(true);
    setError('');
    Promise.all([
      getElection(id),
      getLiveResults(id),
      getLiveStatistics(id),
    ])
      .then(([e, r, s]) => {
        setElection(e);
        setResults(r);
        setStatistics(s);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <Loading text="Cargando resultados..." />;

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate('/')}>
        &larr; Volver
      </button>

      <div className="page-head">
        <h1>Resultados</h1>
        {election && <p className="page-desc">{election.title}</p>}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {statistics && (
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{statistics.totalVotes}</span>
            <span className="stat-label">Votos emitidos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{statistics.totalCandidates}</span>
            <span className="stat-label">Candidatos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalVotes > 0 ? Math.round(totalVotes / statistics.totalCandidates) : 0}</span>
            <span className="stat-label">Promedio por candidato</span>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>Sin resultados</h3>
          <p>Aún no hay votos registrados para esta elección.</p>
        </div>
      ) : (
        <div className="card">
          <div className="results-list">
            {[...results]
              .sort((a, b) => b.votes - a.votes)
              .map((r, i) => {
                const pct = totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0;
                return (
                  <div key={r.candidateId} className="result-row">
                    <div className="result-rank">#{i + 1}</div>
                    <div className="result-info">
                      <span className="result-name">{r.candidateName}</span>
                    </div>
                    <div className="result-bar-wrap">
                      <div className="result-bar-bg">
                        <div
                          className="result-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="result-pct">{pct.toFixed(1)}%</div>
                    <div className="result-votes">{r.votes} votos</div>
                  </div>
                );
              })}
          </div>
          <div className="result-total">
            Total: {totalVotes} voto{totalVotes !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <div className="page-foot">
        <button className="btn btn-secondary" onClick={loadData}>
          Actualizar
        </button>
        <button className="btn btn-primary" onClick={() => navigate(`/vote/${id}`)}>
          Volver a votar
        </button>
      </div>
    </div>
  );
}
