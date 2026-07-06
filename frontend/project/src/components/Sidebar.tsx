import {
  Home,
  ListChecks,
  BarChart2,
  User,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../types';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  open: boolean;
  onClose: () => void;
}

const items = [
  { page: 'home' as Page, label: 'Inicio', Icon: Home },
  { page: 'my-elections' as Page, label: 'Mis elecciones', Icon: ListChecks },
  { page: 'results' as Page, label: 'Resultados', Icon: BarChart2 },
  { page: 'profile' as Page, label: 'Perfil', Icon: User },
  { page: 'help' as Page, label: 'Ayuda', Icon: HelpCircle },
];

export default function Sidebar({ currentPage, onNavigate, open, onClose }: Props) {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 flex flex-col
          w-56 bg-white border-r border-gray-100 shadow-sm
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
          <span className="font-bold text-[#0d2461] text-sm">Menú</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4">
          {items.map(({ page, label, Icon }) => {
            const active = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => { onNavigate(page); onClose(); }}
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
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-2 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
