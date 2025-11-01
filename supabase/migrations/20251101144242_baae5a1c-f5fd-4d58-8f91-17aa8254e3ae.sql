-- Create enum for student status
CREATE TYPE student_status AS ENUM ('current_student', 'graduated');

-- Add new columns to profiles table
ALTER TABLE profiles 
  ADD COLUMN university text,
  ADD COLUMN student_status student_status;

-- Update the handle_new_user() trigger function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    phone, 
    university, 
    student_status
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'university',
    (NEW.raw_user_meta_data->>'student_status')::student_status
  );
  RETURN NEW;
END;
$$;