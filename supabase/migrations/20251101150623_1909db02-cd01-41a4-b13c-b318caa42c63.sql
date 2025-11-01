-- Add bio and expertise fields to profiles table for instructors
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS expertise TEXT;