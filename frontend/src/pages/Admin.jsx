import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { listAdminElections, updateElectionStatus } from '../api/admin';
import { getAdminElectionResult, getAdminCandidateResults } from '../api/results';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import ShieldLogo from '../components/ShieldLogo';
import portada from '../images/portada.png';
import escudoUNSA from '../images/Escudo_UNSA.png';

const CHART_COLORS = ['#7a1b29', '#b8862d', '#5c121e', '#d4a843', '#a0562a', '#c9bb8f'];

function statusBadge(status) {
  switch (status) {
    case 'OPEN':
      return 'bg-granate/10 text-granate';
    case 'CLOSED':
      return 'bg-sillar-line/20 text-ink-soft';
    case 'PENDING':
      return 'bg-gold/10 text-gold';
    default:
      return 'bg-sillar-line/20 text-ink-soft';
  }
}

export default function Admin() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [electionResult, setElectionResult] = useState(null);
  const [candidateResults, setCandidateResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [busyStatus, setBusyStatus] = useState(null);
  const [error, setError] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

  function loadElections() {
    setLoading(true);
    listAdminElections()
      .then(setElections)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadElections, []);

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

  async function handleStatusChange(electionId, status) {
    setBusyStatus(electionId);
    setError('');
    try {
      await updateElectionStatus(electionId, status);
      loadElections();
      if (selectedId === electionId) loadResults(electionId);
    } catch (err) {
      setError(err.message || 'Error al cambiar estado');
    } finally {
      setBusyStatus(null);
    }
  }

  const chartData = candidateResults.map(cr => ({
    name: cr.candidateName,
    value: cr.voteCount,
    party: cr.party || '—',
  }));

  const totalVotes = candidateResults.reduce((sum, cr) => sum + cr.voteCount, 0);

  return (
    <div>
      {/* ─── Banner ─── */}
      <div className="relative h-48 sm:h-60">
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
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-md sm:h-16 sm:w-16">
              <img src={escudoUNSA} alt="" aria-hidden="true" className="h-full w-full object-contain" />
            </div>
            <div className="pb-0.5">
              <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-soft/90">
                Panel de Administración
              </p>
              <h1 className="font-serif text-[1.4rem] font-semibold leading-tight text-white sm:text-[1.8rem]">
                Resultados consolidados
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Contenido ─── */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8 flex items-center justify-end">
          <button
            onClick={() => navigate('/admin/elections')}
            className="rounded-lg bg-granate px-4 py-2.5 text-[0.85rem] font-semibold text-sillar transition-[background-color,transform] duration-150 enabled:hover:bg-granate-deep enabled:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
          >
            + Nueva elección
          </button>
        </div>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          <div className="rounded-2xl border border-sillar-line bg-white p-4 shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
            <h2 className="mb-3 text-[0.82rem] font-semibold tracking-wide text-ink-soft uppercase">Elecciones</h2>
            {loading ? (
              <Loading text="Cargando..." />
            ) : elections.length === 0 ? (
              <p className="py-3 text-[0.85rem] text-ink-soft">No hay elecciones</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {elections.map(e => (
                  <button
                    key={e.id}
                    onClick={() => loadResults(e.id)}
                    className={`flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left text-[0.82rem] transition-all duration-100 ${
                      selectedId === e.id
                        ? 'border-granate bg-granate/5'
                        : 'border-transparent hover:bg-sillar-line/10'
                    } focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex-1 truncate font-semibold text-ink">{e.title}</span>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${statusBadge(e.status)}`}>
                        {e.status}
                      </span>
                    </div>
                    {e.status !== 'CLOSED' && (
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        {e.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(e.id, 'OPEN')}
                            disabled={busyStatus === e.id}
                            className="flex-1 rounded-md bg-granate/10 px-2 py-1 text-[0.68rem] font-semibold text-granate transition-colors hover:bg-granate/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Abrir
                          </button>
                        )}
                        {e.status === 'OPEN' && (
                          <button
                            onClick={() => handleStatusChange(e.id, 'CLOSED')}
                            disabled={busyStatus === e.id}
                            className="flex-1 rounded-md bg-sillar-line/20 px-2 py-1 text-[0.68rem] font-semibold text-ink-soft transition-colors hover:bg-sillar-line/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cerrar
                          </button>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {loadingResults ? (
              <Loading text="Cargando resultados..." />
            ) : !selectedId ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-sillar-line bg-sillar/60 px-8 py-20 text-center">
                <div className="flex h-14 w-[52px] items-center justify-center rounded-t-[26px] rounded-b-md border-2 border-gold-soft bg-granate opacity-60">
                  <ShieldLogo className="h-8 w-7" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="mb-1 font-serif text-[1.2rem] font-semibold text-ink">Selecciona una elección</h3>
                  <p className="text-[0.88rem] text-ink-soft">Elige una elección del panel izquierdo para ver sus resultados.</p>
                </div>
              </div>
            ) : electionResult ? (
              <>
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Votos totales', value: electionResult.totalVotes },
                    { label: 'Estado', value: electionResult.status },
                    { label: 'Candidatos', value: candidateResults.length },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl border border-sillar-line bg-white p-5 text-center shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
                      <span className="block font-serif text-[1.8rem] font-bold text-granate leading-none">{stat.value}</span>
                      <span className="mt-1.5 block text-[0.8rem] font-semibold tracking-wide text-ink-soft">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {candidateResults.length > 1 && (
                  <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-sillar-line bg-white p-5 shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
                      <h3 className="mb-4 text-[0.85rem] font-semibold text-ink">Distribución de votos</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {chartData.map((_, i) => (
                              <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <ReTooltip
                            contentStyle={{
                              borderRadius: '10px',
                              border: '1px solid #c9bb8f',
                              background: '#f5efe4',
                              fontSize: '0.82rem',
                            }}
                            formatter={(value, _name, props) => [
                              `${value} voto${value !== 1 ? 's' : ''} (${totalVotes > 0 ? ((value / totalVotes) * 100).toFixed(1) : 0}%)`,
                              props.payload.name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                        {chartData.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-1.5 text-[0.75rem] text-ink-soft">
                            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            {d.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-sillar-line bg-white p-5 shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
                      <h3 className="mb-4 text-[0.85rem] font-semibold text-ink">Votos por candidato</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#c9bb8f30" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#7a6f5a' }} axisLine={false} tickLine={false} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#2c2417' }}
                            axisLine={false}
                            tickLine={false}
                            width={80}
                          />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                            {chartData.map((_, i) => (
                              <Cell key={`bar-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                          <ReTooltip
                            contentStyle={{
                              borderRadius: '10px',
                              border: '1px solid #c9bb8f',
                              background: '#f5efe4',
                              fontSize: '0.82rem',
                            }}
                            formatter={(value) => [`${value} voto${value !== 1 ? 's' : ''}`, 'Votos']}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-sillar-line bg-white p-5 shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
                  <h2 className="mb-4 font-serif text-[1.15rem] font-semibold text-ink">{electionResult.electionTitle}</h2>
                  {candidateResults.length === 0 ? (
                    <p className="py-3 text-[0.85rem] text-ink-soft">No hay votos registrados</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[0.88rem]">
                        <thead>
                          <tr className="border-b-2 border-sillar-line text-[0.72rem] font-semibold uppercase tracking-wide text-ink-soft">
                            <th className="px-3 py-2.5 text-left">#</th>
                            <th className="px-3 py-2.5 text-left">Candidato</th>
                            <th className="px-3 py-2.5 text-left">Partido</th>
                            <th className="px-3 py-2.5 text-right">Votos</th>
                            <th className="px-3 py-2.5 text-right">Porcentaje</th>
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
                                <tr key={cr.id} className="border-b border-sillar-line/30 transition-colors hover:bg-sillar-line/10">
                                  <td className="px-3 py-2.5 text-ink-soft">{i + 1}</td>
                                  <td className="px-3 py-2.5 font-semibold text-ink">{cr.candidateName}</td>
                                  <td className="px-3 py-2.5 text-ink-soft">{cr.party || '—'}</td>
                                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink">{cr.voteCount}</td>
                                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink">{pct}%</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-sillar-line bg-sillar/60 px-8 py-16 text-center">
                <h3 className="font-serif text-[1.1rem] font-semibold text-ink">Sin resultados</h3>
                <p className="text-[0.88rem] text-ink-soft">Aún no hay resultados consolidados para esta elección.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
