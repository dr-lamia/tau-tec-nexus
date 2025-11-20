-- Add meeting_mode column to meetings table
ALTER TABLE public.meetings 
ADD COLUMN meeting_mode text CHECK (meeting_mode IN ('online', 'offline')) DEFAULT 'online';