-- Create enum types
CREATE TYPE transaction_type AS ENUM ('enrollment_payment', 'instructor_payout');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE audit_action AS ENUM (
  'user_login', 'user_logout', 'user_signup',
  'course_created', 'course_updated', 'course_deleted',
  'request_approved', 'request_rejected',
  'settings_changed', 'role_assigned'
);
CREATE TYPE meeting_type AS ENUM ('course_session', 'company_consultation', 'company_training');

-- Create transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_status payment_status DEFAULT 'pending',
  payment_method text,
  stripe_payment_id text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own payments"
ON transactions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Instructors view own payouts"
ON transactions FOR SELECT TO authenticated
USING (
  transaction_type = 'instructor_payout' 
  AND user_id = auth.uid()
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins manage transactions"
ON transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action audit_action NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins view audit logs"
ON audit_logs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage audit logs"
ON audit_logs FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create meetings table
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  meeting_type meeting_type NOT NULL,
  host_id uuid,
  zoom_meeting_id text,
  zoom_join_url text,
  zoom_start_url text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  course_session_id uuid REFERENCES course_sessions(id) ON DELETE CASCADE,
  company_request_id uuid REFERENCES company_requests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view relevant meetings"
ON meetings FOR SELECT TO authenticated
USING (
  host_id = auth.uid() 
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'company')
);

CREATE POLICY "Admins manage meetings"
ON meetings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create company_request_files table
CREATE TABLE public.company_request_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES company_requests(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE company_request_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies upload files for own requests"
ON company_request_files FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_requests
    WHERE id = request_id AND company_id = auth.uid()
  )
);

CREATE POLICY "Companies and admins view files"
ON company_request_files FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_requests
    WHERE id = request_id 
    AND (company_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Create platform_settings table
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read settings"
ON platform_settings FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only admins update settings"
ON platform_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed initial settings
INSERT INTO platform_settings (setting_key, setting_value, category, description) VALUES
('max_storage_per_user_mb', '"500"', 'storage', 'Maximum storage per user in MB'),
('course_categories', '["Programming", "Data Science", "Business", "Design", "Marketing", "Finance"]', 'categories', 'Available course categories'),
('default_course_price', '"99.99"', 'pricing', 'Default course price in USD'),
('instructor_commission_rate', '"0.70"', 'pricing', 'Instructor commission rate (70%)');

-- Add admin review columns to company_requests
ALTER TABLE public.company_requests 
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS reviewed_by uuid,
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Update company_requests RLS policies
DROP POLICY IF EXISTS "Companies can view own requests" ON company_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON company_requests;

CREATE POLICY "Companies view own requests"
ON company_requests FOR SELECT TO authenticated
USING (
  company_id = auth.uid() 
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins update requests"
ON company_requests FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));