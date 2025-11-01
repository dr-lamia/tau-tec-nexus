-- Insert roles for existing users
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('bd471003-60c3-4216-b2b1-55f4a96e3d1c', 'instructor'), -- dr.l.fadaly@gmail.com
  ('1f0ef2af-509c-4026-b676-da6a1a597970', 'student')      -- lzaki@msa.edu.eg
ON CONFLICT (user_id, role) DO NOTHING;

-- Create trigger to auto-assign student role to new users as fallback
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if no role exists for this user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();