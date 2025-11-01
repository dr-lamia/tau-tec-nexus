-- Create admin whitelist table if not exists
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_whitelist
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Drop and recreate admin whitelist policy
DROP POLICY IF EXISTS "Only admins can view whitelist" ON public.admin_whitelist;
CREATE POLICY "Only admins can view whitelist"
ON public.admin_whitelist
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Pre-populate with initial admin email
INSERT INTO public.admin_whitelist (email) VALUES
('dr.l.fadaly@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Create role validation function
CREATE OR REPLACE FUNCTION public.validate_user_role(
  _user_email text,
  _role app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _role = 'admin' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.admin_whitelist 
      WHERE email = _user_email
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Drop and recreate user_roles INSERT policy
DROP POLICY IF EXISTS "Users can insert own role during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert validated role during signup" ON public.user_roles;

CREATE POLICY "Users can insert validated role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND validate_user_role(auth.email(), role)
);