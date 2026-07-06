import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
} from 'recharts';
import { getElection } from '../api/elections';
import { getLiveResults, getLiveStatistics } from '../api/results';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import ShieldLogo from '../components/ShieldLogo';

const CHART_COLORS = ['#7a1b29', '#b8862d', '#5c121e', '#d4a843', '#a0562a', '#c9bb8f'];

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
  const chartData = [...results]
    .sort((a, b) => b.votes - a.votes)
    .map(r => ({ name: r.candidateName, votes: r.votes }));

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

      <div className="relative mb-10 overflow-hidden rounded-2xl border border-sillar-line bg-gradient-to-br from-sillar to-sillar-shadow/10 px-7 py-7 sm:px-9 sm:py-8">
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
              Resultados electorales
            </p>
            <h1 className="font-serif text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.7rem]">
              {election ? election.title : 'Resultados'}
            </h1>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {statistics && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-sillar-line bg-white p-5 text-center shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
            <span className="block font-serif text-[1.8rem] font-bold text-granate leading-none">{statistics.totalVotes}</span>
            <span className="mt-1.5 block text-[0.8rem] font-semibold tracking-wide text-ink-soft">Votos emitidos</span>
          </div>
          <div className="rounded-xl border border-sillar-line bg-white p-5 text-center shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
            <span className="block font-serif text-[1.8rem] font-bold text-granate leading-none">{statistics.totalCandidates}</span>
            <span className="mt-1.5 block text-[0.8rem] font-semibold tracking-wide text-ink-soft">Candidatos</span>
          </div>
          <div className="rounded-xl border border-sillar-line bg-white p-5 text-center shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
            <span className="block font-serif text-[1.8rem] font-bold text-granate leading-none">
              {totalVotes > 0 ? Math.round(totalVotes / statistics.totalCandidates) : 0}
            </span>
            <span className="mt-1.5 block text-[0.8rem] font-semibold tracking-wide text-ink-soft">Promedio por candidato</span>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-sillar-line bg-sillar/60 px-8 py-16 text-center">
          <div className="flex h-14 w-[52px] items-center justify-center rounded-t-[26px] rounded-b-md border-2 border-gold-soft bg-granate opacity-60">
            <ShieldLogo className="h-8 w-7" strokeWidth={1.6} />
          </div>
          <div>
            <h3 className="mb-1 font-serif text-[1.2rem] font-semibold text-ink">Sin resultados</h3>
            <p className="text-[0.88rem] text-ink-soft">Aún no hay votos registrados para esta elección.</p>
          </div>
        </div>
      ) : (
        <>
          {chartData.length > 1 && (
            <div className="mb-6 rounded-2xl border border-sillar-line bg-white p-5 shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
              <h3 className="mb-4 text-[0.85rem] font-semibold text-ink">Votos por candidato</h3>
              <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 48)}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c9bb8f30" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#7a6f5a' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#2c2417' }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Bar dataKey="votes" radius={[0, 6, 6, 0]} barSize={20} fill="#7a1b29" />
                  <ReTooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #c9bb8f',
                      background: '#f5efe4',
                      fontSize: '0.82rem',
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="rounded-2xl border border-sillar-line bg-white p-5 shadow-[0_1px_3px_-1px_rgba(50,42,32,0.08)]">
            <div className="flex flex-col gap-3">
              {chartData.map((r, i) => {
                const pct = totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0;
                return (
                  <div key={r.name} className="flex items-center gap-3">
                    <span className="w-6 text-right text-[0.85rem] font-bold text-ink-soft">#{i + 1}</span>
                    <span className="w-[130px] truncate text-[0.88rem] font-semibold text-ink sm:w-[180px]">{r.name}</span>
                    <div className="flex-1">
                      <div className="h-6 overflow-hidden rounded-md bg-sillar-line/20">
                        <div
                          className="h-full rounded-md bg-gradient-to-r from-granate to-gold transition-all duration-500"
                          style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
                        />
                      </div>
                    </div>
                    <span className="w-14 text-right text-[0.85rem] font-bold text-ink">{pct.toFixed(1)}%</span>
                    <span className="hidden w-16 text-right text-[0.8rem] text-ink-soft sm:block">{r.votes} voto{r.votes !== 1 ? 's' : ''}</span>
                  </div>
                );
              })}
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
        <button
          onClick={() => navigate(`/vote/${id}`)}
          className="rounded-lg bg-granate px-5 py-2.5 text-[0.88rem] font-semibold text-sillar transition-[background-color,transform] duration-150 enabled:hover:bg-granate-deep enabled:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
        >
          Volver a votar
        </button>
      </div>
    </div>
  );
}
