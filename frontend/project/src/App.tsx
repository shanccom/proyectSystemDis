import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import type { Election, Page, Profile } from './types';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MyElectionsPage from './pages/MyElectionsPage';
import VotePage from './pages/VotePage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import AdminPage from './pages/admin/AdminPage';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

type VoterPage = Extract<Page, 'home' | 'my-elections' | 'vote' | 'results' | 'profile' | 'help'>;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState<Page>('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) loadProfile(s.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      (async () => {
        setSession(s);
        if (s) {
          await loadProfile(s.user.id);
          if (event === 'SIGNED_IN') {
            await supabase.from('activity_log').insert({
              action: 'login',
              detail: 'Sesión iniciada correctamente',
            });
          }
        } else {
          setProfile(null);
          setPage('login');
          setAuthLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setPage(data.role === 'admin' ? 'admin' : 'home');
    } else {
      // Profile not yet created (trigger delay), retry once
      await new Promise(r => setTimeout(r, 800));
      const { data: retry } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (retry) {
        setProfile(retry);
        setPage(retry.role === 'admin' ? 'admin' : 'home');
      }
    }
    setAuthLoading(false);
  }

  function navigate(target: Page, data?: unknown) {
    if (target === 'vote' && data) setSelectedElection(data as Election);
    if (target === 'results' && data) setSelectedElection(data as Election);
    setPage(target);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d2461]">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-blue-300">Cargando...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated views
  if (!session || !profile) {
    return (
      <div className="min-h-screen">
        {page === 'register'
          ? <RegisterPage onNavigate={navigate} />
          : <LoginPage onNavigate={navigate} />
        }
      </div>
    );
  }

  // Admin view (full-screen, has its own layout)
  if (profile.role === 'admin' || page === 'admin') {
    return <AdminPage profile={profile} />;
  }

  // Voter layout
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        profile={profile}
        onNavigate={navigate}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPage={page as VoterPage}
          onNavigate={navigate}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          {page === 'home' && <HomePage profile={profile} onNavigate={navigate} />}
          {page === 'my-elections' && <MyElectionsPage onNavigate={navigate} />}
          {page === 'vote' && selectedElection && (
            <VotePage election={selectedElection} onNavigate={navigate} />
          )}
          {page === 'vote' && !selectedElection && <HomePage profile={profile} onNavigate={navigate} />}
          {page === 'results' && <ResultsPage election={selectedElection} onNavigate={navigate} />}
          {page === 'profile' && (
            <ProfilePage
              profile={profile}
              onProfileUpdate={updated => setProfile(updated)}
            />
          )}
          {page === 'help' && <HelpPage />}
        </div>
      </div>
    </div>
  );
}
