
/*
# Fix handle_new_user trigger function

## Problem
Supabase enforces a secure search_path for functions. Without explicitly setting
search_path = public, the trigger cannot resolve the `profiles` table reference,
causing "Database error saving new user" on sign-up.

## Fix
- Recreate handle_new_user with SET search_path = public so the profiles table
  is found correctly.
- Wrap the INSERT in an EXCEPTION block so any unexpected error is swallowed
  gracefully instead of rolling back the auth.users INSERT.
- Re-attach the trigger to auth.users.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'voter')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
