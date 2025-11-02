-- Create a function to allow admins to assign admin roles to whitelisted users
CREATE OR REPLACE FUNCTION public.assign_admin_role_to_whitelisted_user(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can assign admin roles';
  END IF;
  
  -- Check if target email is in whitelist
  IF NOT EXISTS (SELECT 1 FROM admin_whitelist WHERE email = target_email) THEN
    RAISE EXCEPTION 'Email % is not in admin whitelist', target_email;
  END IF;
  
  -- Get user_id for the email
  SELECT id INTO target_user_id FROM profiles WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email %', target_email;
  END IF;
  
  -- Insert admin role (ignore if already exists)
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;