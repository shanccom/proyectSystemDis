import { useEffect, useState } from 'react';
import {
  CheckCircle,
  Calendar,
  ListChecks,
  GraduationCap,
  Users,
  UserCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../types';

interface Props {
  onNavigate: (page: Page, data?: unknown) => void;
}

interface VoteRecord {
  id: string;
  created_at: string;
  election: {
    id: string;
    title: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    icon: string;
  };
  candidate: {
    id: string;
    name: string;
    party: string;
    photo_url: string | null;
    description: string;
  };
}

const iconMap: Record<string, React.ReactNode> = {
  graduation: <GraduationCap className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  group: <UserCheck className="w-5 h-5" />,
  vote: <CheckCircle className="w-5 h-5" />,
};

const iconColors = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatVoteTime(d: string) {
  return new Date(d).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyElectionsPage({ onNavigate }: Props) {
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          id,
          created_at,
          election:elections(id, title, description, status, start_date, end_date, icon),
          candidate:candidates(id, name, party, photo_url, description)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setVotes(data as unknown as VoteRecord[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis elecciones</h1>
          <p className="text-gray-500 text-sm mt-1">
            {votes.length > 0
              ? `Has participado en ${votes.length} elección${votes.length !== 1 ? 'es' : ''}.`
              : 'Aún no has participado en ninguna elección.'}
          </p>
        </div>

        {/* Summary badge */}
        {votes.length > 0 && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-6">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700 font-medium">
              Tu participación ha sido registrada de forma segura y anónima.
            </span>
          </div>
        )}

        {/* Vote list */}
        {votes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
            <ListChecks className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-1">Sin participaciones aún</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Cuando votes en una elección, aparecerá aquí con el candidato que elegiste.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 bg-[#0d2461] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 transition"
            >
              Ver elecciones disponibles
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {votes.map((v, idx) => {
              const color = iconColors[idx % iconColors.length];
              return (
                <div
                  key={v.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Election header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                    <div className={`w-9 h-9 rounded-lg ${color.bg} ${color.text} flex items-center justify-center flex-shrink-0`}>
                      {iconMap[v.election.icon] ?? iconMap['vote']}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm">{v.election.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          v.election.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : v.election.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {v.election.status === 'active' ? 'Activa' : v.election.status === 'inactive' ? 'Inactiva' : 'Cerrada'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{v.election.description}</p>
                    </div>
                    <button
                      onClick={() => onNavigate('results', v.election)}
                      className="text-xs text-blue-600 hover:text-blue-800 transition font-medium flex-shrink-0"
                    >
                      Ver resultados
                    </button>
                  </div>

                  {/* Candidate voted for */}
                  <div className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Candidato elegido
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          v.candidate.photo_url ??
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(v.candidate.name)}&background=e2e8f0&color=64748b`
                        }
                        alt={v.candidate.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{v.candidate.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{v.candidate.party}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{v.candidate.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Tu voto</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: dates + vote time */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-50 gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {formatDate(v.election.start_date)} – {formatDate(v.election.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Votaste el {formatVoteTime(v.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
