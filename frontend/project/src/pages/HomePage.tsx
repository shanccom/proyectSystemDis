import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, GraduationCap, Users, UserCheck, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Election, Vote, ActivityLog, Profile, Page } from '../types';

interface Props {
  profile: Profile;
  onNavigate: (page: Page, data?: unknown) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  graduation: <GraduationCap className="w-8 h-8" />,
  users: <Users className="w-8 h-8" />,
  group: <UserCheck className="w-8 h-8" />,
  vote: <CheckCircle className="w-8 h-8" />,
};

const iconColors = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
];

const statusLabel = (s: string) =>
  s === 'active' ? 'Activa' : s === 'inactive' ? 'Inactiva' : 'Cerrada';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(d: string) {
  return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function HomePage({ profile, onNavigate }: Props) {
  const [elections, setElections] = useState<Election[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: el }, { data: v }, { data: act }] = await Promise.all([
        supabase.from('elections').select('*').order('created_at', { ascending: false }),
        supabase.from('votes').select('*'),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      setElections(el ?? []);
      setVotes(v ?? []);
      setActivity(act ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const firstName = profile.full_name.split(' ')[0] || profile.email.split('@')[0];
  const hasVoted = (electionId: string) => votes.some(v => v.election_id === electionId);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {firstName}</h1>
          <p className="text-gray-500 mt-1 text-sm">Estas son las elecciones disponibles para ti.</p>
        </div>

        {/* Elections */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Elecciones disponibles</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {elections.map((el, idx) => {
                const voted = hasVoted(el.id);
                const color = iconColors[idx % iconColors.length];
                return (
                  <div
                    key={el.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`w-14 h-14 rounded-xl ${color.bg} ${color.text} flex items-center justify-center flex-shrink-0`}>
                      {iconMap[el.icon] ?? iconMap['vote']}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{el.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          el.status === 'active' ? 'bg-green-100 text-green-700' :
                          el.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {statusLabel(el.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1.5">{el.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(el.start_date)} – {formatDate(el.end_date)}</span>
                      </div>
                    </div>
                    {voted ? (
                      <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0">
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Votado</span>
                      </div>
                    ) : el.status === 'active' ? (
                      <button
                        onClick={() => onNavigate('vote', el)}
                        className="bg-[#0d2461] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition flex-shrink-0 flex items-center gap-1.5"
                      >
                        Votar ahora
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('results', el)}
                        className="border border-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex-shrink-0 flex items-center gap-1.5"
                      >
                        Ver resultados
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
              {elections.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay elecciones disponibles en este momento.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-4">Actividad reciente</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {activity.length === 0 && !loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin actividad reciente.</p>
            ) : (
              activity.map(act => (
                <div key={act.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    act.action === 'login' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {act.action === 'login'
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      : <Clock className="w-3.5 h-3.5 text-blue-600" />
                    }
                  </div>
                  <p className="flex-1 text-sm text-gray-700 min-w-0">{act.detail}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(act.created_at)}</span>
                  <button className="text-xs text-blue-600 hover:text-blue-800 transition flex-shrink-0">Ver más</button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
