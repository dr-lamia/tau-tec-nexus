-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for course materials
CREATE POLICY "Instructors can upload materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-materials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Instructors can update own materials"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-materials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Instructors can delete own materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-materials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view course materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-materials');