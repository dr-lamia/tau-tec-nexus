-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Create instructor_applications table
CREATE TABLE public.instructor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  expertise TEXT NOT NULL,
  bio TEXT NOT NULL,
  cv_url TEXT,
  linkedin_url TEXT,
  years_experience INTEGER,
  status application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.instructor_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert applications"
ON public.instructor_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own applications"
ON public.instructor_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
ON public.instructor_applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all applications"
ON public.instructor_applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('instructor-cvs', 'instructor-cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for CVs
CREATE POLICY "Users can upload own CV"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instructor-cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own CV"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'instructor-cvs' AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Admins can view all CVs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'instructor-cvs' AND has_role(auth.uid(), 'admin'));