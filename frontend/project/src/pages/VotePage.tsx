import { useEffect, useState } from 'react';
import { ArrowLeft, Lock, Info, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Election, Candidate, Page } from '../types';

interface Props {
  election: Election;
  onNavigate: (page: Page, data?: unknown) => void;
}

export default function VotePage({ election, onNavigate }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const [{ data: cands }, { data: vote }] = await Promise.all([
        supabase.from('candidates').select('*').eq('election_id', election.id).order('created_at'),
        supabase.from('votes').select('id').eq('election_id', election.id).maybeSingle(),
      ]);
      setCandidates(cands ?? []);
      if (vote) setAlreadyVoted(true);
      setLoading(false);
    }
    load();
  }, [election.id]);

  async function handleVote() {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.from('votes').insert({ election_id: election.id, candidate_id: selected });
    if (err) {
      setError('No se pudo registrar el voto. Es posible que ya hayas votado en esta elección.');
      setSubmitting(false);
      return;
    }
    // Log activity
    const candidate = candidates.find(c => c.id === selected);
    await supabase.from('activity_log').insert({
      action: 'vote',
      detail: `Voto registrado en ${election.title}`,
    });
    setSuccess(true);
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Voto registrado!</h2>
          <p className="text-gray-500 text-sm mb-6">Tu voto ha sido registrado de forma segura y anónima.</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-[#0d2461] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-900 transition text-sm"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-lg font-bold text-gray-900">Votar</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {/* Election title */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-gray-900">{election.title}</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              election.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {election.status === 'active' ? 'Activa' : 'Cerrada'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Selecciona a tu candidato de preferencia</p>

          {alreadyVoted && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2 mb-5">
              <Info className="w-4 h-4 flex-shrink-0" />
              Ya emitiste tu voto en esta elección.
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {candidates.map(c => (
                <label
                  key={c.id}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition
                    ${alreadyVoted ? 'cursor-default opacity-80' : ''}
                    ${selected === c.id
                      ? 'border-[#0d2461] bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'}
                  `}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={c.id}
                    checked={selected === c.id}
                    onChange={() => !alreadyVoted && setSelected(c.id)}
                    disabled={alreadyVoted}
                    className="w-4 h-4 text-[#0d2461] accent-[#0d2461] flex-shrink-0"
                  />
                  <img
                    src={c.photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=e2e8f0&color=64748b`}
                    alt={c.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.party}</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 transition flex items-center gap-1 flex-shrink-0"
                    onClick={e => e.preventDefault()}
                  >
                    Ver propuestas
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </label>
              ))}
            </div>
          )}

          {/* Note */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-start gap-2 mb-6">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Recuerda: Solo puedes emitir un voto por elección.</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {!alreadyVoted && (
            <button
              onClick={handleVote}
              disabled={!selected || submitting}
              className="w-full bg-[#0d2461] text-white py-3 rounded-xl font-medium hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Registrando voto...' : 'Confirmar voto'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
