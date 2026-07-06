export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'voter' | 'admin';
  avatar_url: string | null;
  created_at: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'closed';
  start_date: string;
  end_date: string;
  icon: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  party: string;
  photo_url: string | null;
  description: string;
  created_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  election_id: string;
  candidate_id: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  detail: string;
  created_at: string;
}

export type Page =
  | 'login'
  | 'register'
  | 'home'
  | 'my-elections'
  | 'vote'
  | 'results'
  | 'profile'
  | 'help'
  | 'admin';
