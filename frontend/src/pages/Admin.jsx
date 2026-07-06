import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listElections } from '../api/elections';
import { getAdminElectionResult, getAdminCandidateResults } from '../api/results';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';

export default function Admin() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [electionResult, setElectionResult] = useState(null);
  const [candidateResults, setCandidateResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    listElections()
      .then(setElections)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function loadResults(electionId) {
    setSelectedId(electionId);
    setLoadingResults(true);
    setError('');
    try {
      const [er, cr] = await Promise.all([
        getAdminElectionResult(electionId),
        getAdminCandidateResults(electionId),
      ]);
      setElectionResult(er);
      setCandidateResults(cr);
    } catch (err) {
      setError(err.message || 'Error al cargar resultados');
      setElectionResult(null);
      setCandidateResults([]);
    } finally {
      setLoadingResults(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Panel de Administración</h1>
        <p className="page-desc">Resultados consolidados del sistema</p>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="admin-layout">
        <div className="admin-sidebar">
          <h2>Elecciones</h2>
          {loading ? (
            <Loading text="Cargando..." />
          ) : elections.length === 0 ? (
            <p className="text-muted">No hay elecciones</p>
          ) : (
            <div className="admin-election-list">
              {elections.map(e => (
                <button
                  key={e.id}
                  className={`admin-election-item ${selectedId === e.id ? 'active' : ''}`}
                  onClick={() => loadResults(e.id)}
                >
                  <span className="admin-election-title">{e.title}</span>
                  <span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="admin-main">
          {loadingResults ? (
            <Loading text="Cargando resultados..." />
          ) : !selectedId ? (
            <div className="empty-state">
              <span className="empty-icon">👈</span>
              <h3>Selecciona una elección</h3>
              <p>Elige una elección del panel izquierdo para ver sus resultados.</p>
            </div>
          ) : electionResult ? (
            <>
              <div className="stats-row">
                <div className="stat-card">
                  <span className="stat-value">{electionResult.totalVotes}</span>
                  <span className="stat-label">Votos totales</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{electionResult.status}</span>
                  <span className="stat-label">Estado</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{candidateResults.length}</span>
                  <span className="stat-label">Candidatos</span>
                </div>
              </div>

              <div className="card">
                <h2>{electionResult.electionTitle}</h2>
                {candidateResults.length === 0 ? (
                  <p className="text-muted">No hay votos registrados</p>
                ) : (
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Candidato</th>
                        <th>Partido</th>
                        <th>Votos</th>
                        <th>Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...candidateResults]
                        .sort((a, b) => b.voteCount - a.voteCount)
                        .map((cr, i) => {
                          const pct = electionResult.totalVotes > 0
                            ? ((cr.voteCount / electionResult.totalVotes) * 100).toFixed(1)
                            : '0.0';
                          return (
                            <tr key={cr.id}>
                              <td>{i + 1}</td>
                              <td className="td-name">{cr.candidateName}</td>
                              <td>{cr.party || '—'}</td>
                              <td className="td-num">{cr.voteCount}</td>
                              <td className="td-num">{pct}%</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📊</span>
              <h3>Sin resultados</h3>
              <p>Aún no hay resultados consolidados para esta elección.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
