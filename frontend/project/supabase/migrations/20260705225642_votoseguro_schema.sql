
/*
# VotoSeguro – Electronic Voting System Schema

## Short Title
Creates the full multi-user schema for VotoSeguro: profiles, elections, candidates, votes, and activity log.

## Changes
1. `profiles` – extends auth.users with display_name and role (voter | admin). Auto-created on sign-up via trigger.
2. `elections` – stores election metadata (title, description, start/end dates, status).
3. `candidates` – candidates belonging to an election (name, party, photo, description).
4. `votes` – one row per user-election pair (enforces one vote per election per user). Stores candidate_id.
5. `activity_log` – audit trail of user actions (login, vote cast, etc.).

## Security
- RLS enabled on all tables.
- `profiles`: each authenticated user can read all profiles (for candidate lookup) but only update/insert their own.
- `elections` & `candidates`: all authenticated users can read; only admins can write (managed via role check).
- `votes`: authenticated users can insert and read their own votes only.
- `activity_log`: authenticated users can insert and read their own logs.

## Notes
- A trigger on auth.users auto-creates a profile row on sign-up.
- Admin detection uses profiles.role = 'admin'.
- votes table has a UNIQUE constraint on (user_id, election_id) to enforce one-vote-per-election.
*/

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  full_name  text NOT NULL DEFAULT '',
  role       text NOT NULL DEFAULT 'voter' CHECK (role IN ('voter', 'admin')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'voter')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── ELECTIONS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS elections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  icon        text NOT NULL DEFAULT 'vote',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE elections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "elections_select" ON elections;
CREATE POLICY "elections_select" ON elections FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "elections_insert" ON elections;
CREATE POLICY "elections_insert" ON elections FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "elections_update" ON elections;
CREATE POLICY "elections_update" ON elections FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "elections_delete" ON elections;
CREATE POLICY "elections_delete" ON elections FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── CANDIDATES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name        text NOT NULL,
  party       text NOT NULL DEFAULT '',
  photo_url   text,
  description text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS candidates_election_idx ON candidates(election_id);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "candidates_select" ON candidates;
CREATE POLICY "candidates_select" ON candidates FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "candidates_insert" ON candidates;
CREATE POLICY "candidates_insert" ON candidates FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "candidates_update" ON candidates;
CREATE POLICY "candidates_update" ON candidates FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "candidates_delete" ON candidates;
CREATE POLICY "candidates_delete" ON candidates FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── VOTES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS votes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  election_id  uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, election_id)
);

CREATE INDEX IF NOT EXISTS votes_user_idx ON votes(user_id);
CREATE INDEX IF NOT EXISTS votes_election_idx ON votes(election_id);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "votes_select" ON votes;
CREATE POLICY "votes_select" ON votes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "votes_insert" ON votes;
CREATE POLICY "votes_insert" ON votes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "votes_update" ON votes;
CREATE POLICY "votes_update" ON votes FOR UPDATE
  TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "votes_delete" ON votes;
CREATE POLICY "votes_delete" ON votes FOR DELETE
  TO authenticated USING (false);

-- admin can read all votes for results
DROP POLICY IF EXISTS "votes_admin_select" ON votes;
CREATE POLICY "votes_admin_select" ON votes FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action     text NOT NULL,
  detail     text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_user_idx ON activity_log(user_id);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_select" ON activity_log;
CREATE POLICY "activity_select" ON activity_log FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "activity_insert" ON activity_log;
CREATE POLICY "activity_insert" ON activity_log FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_update" ON activity_log;
CREATE POLICY "activity_update" ON activity_log FOR UPDATE
  TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "activity_delete" ON activity_log;
CREATE POLICY "activity_delete" ON activity_log FOR DELETE
  TO authenticated USING (false);

-- ─── SEED DATA ───────────────────────────────────────────────────────────────
INSERT INTO elections (id, title, description, status, start_date, end_date, icon)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Elección Rector 2026', 'Elección para el cargo de Rector de la universidad.', 'active', '2026-06-01', '2026-06-05', 'graduation'),
  ('11111111-0000-0000-0000-000000000002', 'Elección Consejo Universitario', 'Elección para representantes del consejo universitario.', 'active', '2026-06-01', '2026-06-05', 'users'),
  ('11111111-0000-0000-0000-000000000003', 'Elección Representantes Estudiantiles', 'Elige a tus representantes estudiantiles.', 'active', '2026-06-01', '2026-06-05', 'group')
ON CONFLICT (id) DO NOTHING;

INSERT INTO candidates (id, election_id, name, party, description, photo_url)
VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'María Gómez', 'Candidata independiente', 'Comprometida con la excelencia académica y la innovación educativa.', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Carlos Ramírez', 'Movimiento Universitario', 'Defensor de la participación estudiantil y la transparencia institucional.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Lucía Martínez', 'Acción Universitaria', 'Enfocada en el bienestar estudiantil y la modernización de infraestructura.', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150'),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 'Andrés López', 'Frente Académico', 'Candidato comprometido con la mejora de los programas académicos.', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 'Valentina Cruz', 'Alianza Universitaria', 'Promoviendo la inclusión y diversidad en la universidad.', 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000003', 'Diego Morales', 'Voz Estudiantil', 'Representante comprometido con los derechos y necesidades estudiantiles.', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150'),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000003', 'Sara Jiménez', 'Renovación Estudiantil', 'Impulsando nuevas iniciativas para mejorar la vida universitaria.', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150')
ON CONFLICT (id) DO NOTHING;
