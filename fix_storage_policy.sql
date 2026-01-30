-- Drop policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow Public Uploads to Rider Documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Read of Rider Documents" ON storage.objects;

-- Create upload policy for 'rider_documents' bucket
CREATE POLICY "Allow Public Uploads to Rider Documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'rider_documents');

-- Create read policy for 'rider_documents' bucket
CREATE POLICY "Allow Public Read of Rider Documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'rider_documents');
