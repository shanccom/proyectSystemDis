import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Election, Candidate, Page } from '../types';

interface Props {
  election?: Election | null;
  onNavigate: (page: Page, data?: unknown) => void;
}

interface CandidateResult {
  candidate: Candidate;
  votes: number;
  percentage: number;
}

const BAR_COLORS = ['bg-blue-500', 'bg-violet-400', 'bg-amber-400', 'bg-green-400', 'bg-rose-400'];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d: Date) {
  return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ResultsPage({ election: initialElection, onNavigate }: Props) {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(initialElection ?? null);
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('elections').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        setElections(data ?? []);
        if (!selectedElection && data && data.length > 0) setSelectedElection(data[0]);
      });
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    setLoading(true);
    async function loadResults() {
      const [{ data: cands }, { data: votes }] = await Promise.all([
        supabase.from('candidates').select('*').eq('election_id', selectedElection!.id),
        supabase.from('votes').select('candidate_id').eq('election_id', selectedElection!.id),
      ]);
      const candidateList = cands ?? [];
      const voteList = votes ?? [];
      const total = voteList.length;
      setTotalVotes(total);
      const res = candidateList.map(c => {
        const cnt = voteList.filter(v => v.candidate_id === c.id).length;
        return {
          candidate: c,
          votes: cnt,
          percentage: total > 0 ? Math.round((cnt / total) * 100) : 0,
        };
      }).sort((a, b) => b.votes - a.votes);
      setResults(res);
      setLoading(false);
    }
    loadResults();
  }, [selectedElection]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Resultados</h1>
        </div>

        {/* Election selector */}
        {elections.length > 1 && (
          <div className="mb-4">
            <select
              value={selectedElection?.id ?? ''}
              onChange={e => setSelectedElection(elections.find(el => el.id === e.target.value) ?? null)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {elections.map(el => (
                <option key={el.id} value={el.id}>{el.title}</option>
              ))}
            </select>
          </div>
        )}

        {selectedElection && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-gray-900">
                Resultados – {selectedElection.title}
              </h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                selectedElection.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {selectedElection.status === 'active' ? 'Activa' : 'Cerrada'}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-1">Resultados preliminares</p>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-6">
              <Calendar className="w-3.5 h-3.5" />
              Actualizado: {formatDateTime(new Date())}
            </p>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-5 mb-8">
                {results.map((r, idx) => (
                  <div key={r.candidate.id} className="flex items-center gap-3">
                    <img
                      src={r.candidate.photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(r.candidate.name)}&background=e2e8f0&color=64748b`}
                      alt={r.candidate.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{r.candidate.name}</p>
                          <p className="text-xs text-gray-400">{r.candidate.party}</p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="text-sm font-bold text-gray-800">{r.percentage}%</p>
                          <p className="text-xs text-gray-400">{r.votes.toLocaleString()} votos</p>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS[idx % BAR_COLORS.length]}`}
                          style={{ width: `${r.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {results.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">No hay resultados disponibles aún.</p>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-gray-100">
              {[
                { label: 'Total de votos', value: totalVotes.toLocaleString() },
                { label: 'Participación', value: totalVotes > 0 ? '—' : '0%' },
                { label: 'Votos válidos', value: totalVotes.toLocaleString() },
                { label: 'Votos nulos', value: '0' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-blue-50 px-4 py-2.5 rounded-lg">
              <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              Los resultados son preliminares y se actualizarán cada 5 minutos.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
