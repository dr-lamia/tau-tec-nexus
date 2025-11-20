-- Create storage bucket for company data files
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-data-files', 'company-data-files', false);

-- RLS policies for company data files bucket
CREATE POLICY "Companies can upload their data files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'company-data-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Companies can view their own data files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'company-data-files' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can view all company data files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'company-data-files' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Companies can delete their own data files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'company-data-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);