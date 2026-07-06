import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Vote,
  Users,
  UserCheck,
  BarChart2,
  FileSearch,
  Settings,
  Menu,
  X,
  Eye,
  TrendingUp,
  Plus,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Election, Profile } from '../../types';

type AdminSection = 'dashboard' | 'elections' | 'candidates' | 'users' | 'results' | 'audit' | 'settings';

interface Props {
  profile: Profile;
}

const nav = [
  { section: 'dashboard' as AdminSection, label: 'Dashboard', Icon: LayoutDashboard, group: null },
  { section: 'elections' as AdminSection, label: 'Elecciones', Icon: Vote, group: 'Gestión' },
  { section: 'candidates' as AdminSection, label: 'Candidatos', Icon: UserCheck, group: 'Gestión' },
  { section: 'users' as AdminSection, label: 'Usuarios', Icon: Users, group: 'Gestión' },
  { section: 'results' as AdminSection, label: 'Resultados', Icon: BarChart2, group: 'Reportes' },
  { section: 'audit' as AdminSection, label: 'Auditoría', Icon: FileSearch, group: 'Reportes' },
  { section: 'settings' as AdminSection, label: 'Configuración', Icon: Settings, group: null },
];

function statusBadge(status: string) {
  const cls =
    status === 'active' ? 'bg-green-100 text-green-700' :
    status === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
    'bg-gray-100 text-gray-500';
  const label = status === 'active' ? 'Activa' : status === 'inactive' ? 'Inactiva' : 'Cerrada';
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminPage({ profile }: Props) {
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // New election form
  const [showNewElection, setShowNewElection] = useState(false);
  const [newEl, setNewEl] = useState({ title: '', description: '', start_date: '', end_date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: el }, { count: vc }, { count: uc }] = await Promise.all([
        supabase.from('elections').select('*').order('created_at', { ascending: false }),
        supabase.from('votes').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);
      setElections(el ?? []);
      setTotalVotes(vc ?? 0);
      setTotalUsers(uc ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function createElection() {
    setSaving(true);
    const { data, error } = await supabase.from('elections').insert({
      title: newEl.title,
      description: newEl.description,
      start_date: newEl.start_date,
      end_date: newEl.end_date,
      status: 'active',
      icon: 'vote',
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setElections(prev => [data, ...prev]);
      setNewEl({ title: '', description: '', start_date: '', end_date: '' });
      setShowNewElection(false);
    }
  }

  async function deleteElection(id: string) {
    if (!confirm('¿Eliminar esta elección y todos sus datos?')) return;
    await supabase.from('elections').delete().eq('id', id);
    setElections(prev => prev.filter(e => e.id !== id));
  }

  const activeCount = elections.filter(e => e.status === 'active').length;

  const groups = ['', 'Gestión', 'Reportes'];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 flex flex-col
        w-52 bg-white border-r border-gray-100 shadow-sm flex-shrink-0
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-bold text-[#0d2461] text-sm">Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {groups.map(group => {
            const items = nav.filter(n => (n.group ?? '') === group);
            return (
              <div key={group} className="mb-1">
                {group && (
                  <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">{group}</p>
                )}
                {items.map(({ section: s, label, Icon }) => {
                  const active = section === s;
                  return (
                    <button
                      key={s}
                      onClick={() => { setSection(s); setSidebarOpen(false); }}
                      className={`
                        flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition
                        ${active
                          ? 'bg-blue-50 text-[#0d2461] border-r-2 border-[#0d2461]'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#0d2461]' : 'text-gray-400'}`} />
                      {label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin topbar */}
        <header className="h-14 bg-[#0d2461] flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-white opacity-80 hover:opacity-100 lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-bold text-sm flex-1">Panel de Administración</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
              {profile.full_name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{profile.full_name}</p>
              <p className="text-xs text-blue-300">Administrador</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {section === 'dashboard' && (
            <DashboardSection
              elections={elections}
              totalVotes={totalVotes}
              totalUsers={totalUsers}
              activeCount={activeCount}
              loading={loading}
            />
          )}
          {section === 'elections' && (
            <ElectionsSection
              elections={elections}
              showNew={showNewElection}
              setShowNew={setShowNewElection}
              newEl={newEl}
              setNewEl={setNewEl}
              saving={saving}
              onCreate={createElection}
              onDelete={deleteElection}
            />
          )}
          {(section === 'candidates' || section === 'users' || section === 'results' || section === 'audit' || section === 'settings') && (
            <ComingSoon section={section} />
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function DashboardSection({ elections, totalVotes, totalUsers, activeCount, loading }: {
  elections: Election[]; totalVotes: number; totalUsers: number; activeCount: number; loading: boolean;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Elecciones activas" value={activeCount} />
          <StatCard label="Total de votos" value={totalVotes} />
          <StatCard label="Usuarios registrados" value={totalUsers} />
          <StatCard
            label="Participación"
            value={totalUsers > 0 ? `${Math.round((totalVotes / totalUsers) * 100)}%` : '—'}
          />
        </div>
      )}

      <h2 className="text-base font-semibold text-gray-700 mb-4">Elecciones recientes</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Nombre</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
              <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Inicio</th>
              <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Fin</th>
              <th className="text-left px-5 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {elections.slice(0, 5).map(el => (
              <tr key={el.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3 font-medium text-gray-900">{el.title}</td>
                <td className="px-5 py-3">{statusBadge(el.status)}</td>
                <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{formatDate(el.start_date)}</td>
                <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{formatDate(el.end_date)}</td>
                <td className="px-5 py-3">
                  <button className="text-gray-400 hover:text-blue-600 transition">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {elections.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No hay elecciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ElectionsSection({ elections, showNew, setShowNew, newEl, setNewEl, saving, onCreate, onDelete }: {
  elections: Election[];
  showNew: boolean;
  setShowNew: (v: boolean) => void;
  newEl: { title: string; description: string; start_date: string; end_date: string };
  setNewEl: (v: { title: string; description: string; start_date: string; end_date: string }) => void;
  saving: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Elecciones</h1>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 bg-[#0d2461] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition"
        >
          <Plus className="w-4 h-4" />
          Nueva elección
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Nueva elección</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
              <input
                type="text"
                value={newEl.title}
                onChange={e => setNewEl({ ...newEl, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <input
                type="text"
                value={newEl.description}
                onChange={e => setNewEl({ ...newEl, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={newEl.start_date}
                onChange={e => setNewEl({ ...newEl, start_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
              <input
                type="date"
                value={newEl.end_date}
                onChange={e => setNewEl({ ...newEl, end_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={onCreate}
              disabled={saving || !newEl.title || !newEl.start_date || !newEl.end_date}
              className="bg-[#0d2461] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear elección'}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Nombre</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Inicio</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Fin</th>
              <th className="text-left px-5 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {elections.map(el => (
              <tr key={el.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{el.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{el.description}</p>
                </td>
                <td className="px-5 py-3">{statusBadge(el.status)}</td>
                <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{formatDate(el.start_date)}</td>
                <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{formatDate(el.end_date)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-blue-600 transition">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(el.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {elections.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No hay elecciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComingSoon({ section }: { section: AdminSection }) {
  const labels: Record<string, string> = {
    candidates: 'Candidatos',
    users: 'Usuarios',
    results: 'Resultados',
    audit: 'Auditoría',
    settings: 'Configuración',
  };
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <TrendingUp className="w-10 h-10 text-gray-300 mb-3" />
      <h2 className="text-lg font-semibold text-gray-700 mb-1">{labels[section]}</h2>
      <p className="text-sm text-gray-400">Esta sección estará disponible próximamente.</p>
    </div>
  );
}
