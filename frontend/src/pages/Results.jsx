import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { getElection } from '../api/elections';
import { getLiveResults, getLiveStatistics } from '../api/results';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import portada from '../images/portada.png';
import escudoUNSA from '../images/Escudo_UNSA.png';

const CHART_COLORS = ['#7a1b29', '#b8862d', '#5c121e', '#d4a843', '#a0562a', '#c9bb8f'];

function CandidateTick({ x, y, payload, index }) {
  const color = CHART_COLORS[index % CHART_COLORS.length];
  const label = payload.value.length > 12 ? `${payload.value.slice(0, 11)}…` : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx={0} cy={16} r={13} fill={color} />
      <text x={0} y={20} textAnchor="middle" fontSize={11} fontWeight={600} fill="#efe8d6">
        {payload.value.charAt(0)}
      </text>
      <text x={0} y={40} textAnchor="middle" fontSize={11} fill="#6f6555">
        {label}
      </text>
    </g>
  );
}

function BarTopLabel({ x, y, width, value }) {
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={13} fontWeight={700} fill="#322a20">
      {value.toFixed(1)}%
    </text>
  );
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

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
  const ranked = [...results].sort((a, b) => b.votes - a.votes);
  const chartData = ranked.map(r => ({
    name: r.candidateName,
    votes: r.votes,
    pct: totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0,
  }));
  const leader = chartData[0];

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
            <div>
              <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-soft">
                Resultados electorales
              </p>
              <h1 className="font-serif text-[1.35rem] font-semibold leading-tight text-white sm:text-[1.65rem]">
                {election ? election.title : 'Resultados'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Contenido ─── */}
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-ink-soft transition-colors hover:text-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 focus-visible:rounded-sm"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
              <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
            Volver
          </button>

          <span className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wide text-ink-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-granate opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-granate" />
            </span>
            En vivo
          </span>
        </div>

        <ErrorAlert message={error} onClose={() => setError('')} />

        {statistics && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-sillar-line bg-white p-5 text-center">
              <span className="block font-serif text-[1.8rem] font-bold leading-none text-granate">{statistics.totalVotes}</span>
              <span className="mt-1.5 block text-[0.8rem] font-semibold tracking-wide text-ink-soft">Votos emitidos</span>
            </div>
            <div className="rounded-xl border border-sillar-line bg-white p-5 text-center">
              <span className="block font-serif text-[1.8rem] font-bold leading-none text-granate">{statistics.totalCandidates}</span>
              <span className="mt-1.5 block text-[0.8rem] font-semibold tracking-wide text-ink-soft">Candidatos</span>
            </div>
            <div className="rounded-xl border border-sillar-line bg-white p-5 text-center">
              <span className="block font-serif text-[1.8rem] font-bold leading-none text-granate">
                {totalVotes > 0 ? Math.round(totalVotes / statistics.totalCandidates) : 0}
              </span>
              <span className="mt-1.5 block text-[0.8rem] font-semibold tracking-wide text-ink-soft">Promedio por candidato</span>
            </div>
          </div>
        )}

        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-sillar-line px-8 py-16 text-center">
            <h3 className="font-serif text-[1.2rem] font-semibold text-ink">Sin resultados</h3>
            <p className="text-[0.88rem] text-ink-soft">Aún no hay votos registrados para esta elección.</p>
          </div>
        ) : (
          <>
            {/* ---------- Candidato en punta ---------- */}
            {leader && (
              <div className="mb-6 flex items-center gap-4 rounded-2xl border border-sillar-line bg-white p-5">
                <span
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[1rem] font-bold text-sillar"
                  style={{ backgroundColor: CHART_COLORS[0] }}
                >
                  {leader.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-granate">
                    Va en primer lugar
                  </p>
                  <p className="truncate font-serif text-[1.15rem] font-semibold text-ink">{leader.name}</p>
                </div>
                <span className="flex-shrink-0 font-serif text-[1.6rem] font-bold text-granate">
                  {leader.pct.toFixed(1)}%
                </span>
              </div>
            )}

            {/* ---------- Gráfico de barras verticales ---------- */}
            <div className="mb-6 rounded-2xl border border-sillar-line bg-white p-5 sm:p-7">
              <h3 className="mb-6 text-[0.85rem] font-semibold text-ink">Votos por candidato</h3>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={chartData} margin={{ top: 30, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c9bb8f30" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={<CandidateTick />}
                    axisLine={{ stroke: '#c9bb8f' }}
                    tickLine={false}
                    height={50}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#7a6f5a' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <ReTooltip
                    cursor={{ fill: '#efe8d64d' }}
                    formatter={(value, n, p) => [`${value} votos (${p.payload.pct.toFixed(1)}%)`, 'Resultado']}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #c9bb8f',
                      background: '#f5efe4',
                      fontSize: '0.82rem',
                    }}
                  />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]} maxBarSize={72}>
                    {chartData.map((entry, i) => (
                      <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                    <LabelList dataKey="pct" content={<BarTopLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ---------- Desglose detallado ---------- */}
            <div className="rounded-2xl border border-sillar-line bg-white p-5 sm:p-7">
              <h3 className="mb-4 text-[0.85rem] font-semibold text-ink">Detalle de resultados</h3>
              <div className="flex flex-col divide-y divide-sillar-line">
                {chartData.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[0.68rem] font-bold text-sillar"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    >
                      {i + 1}
                    </span>
                    <span className="w-[130px] truncate text-[0.88rem] font-semibold text-ink sm:w-[200px]">{r.name}</span>
                    <div className="hidden flex-1 sm:block">
                      <div className="h-2 overflow-hidden rounded-full bg-sillar-line/25">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${r.pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                    <span className="w-14 flex-shrink-0 text-right text-[0.85rem] font-bold text-ink">{r.pct.toFixed(1)}%</span>
                    <span className="hidden w-20 flex-shrink-0 text-right text-[0.8rem] text-ink-soft sm:block">
                      {r.votes} voto{r.votes !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-sillar-line pt-4 text-right text-[0.88rem] font-bold text-ink">
                Total: {totalVotes} voto{totalVotes !== 1 ? 's' : ''}
              </div>
            </div>
          </>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={loadData}
            className="rounded-lg border border-sillar-line px-5 py-2.5 text-[0.88rem] font-semibold text-ink-soft transition-colors duration-150 hover:border-granate hover:text-granate focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}
