-- Create recipe-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'recipe-images', 'recipe-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'recipe-images');

-- Allow public access to the bucket
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'policies') THEN
    INSERT INTO storage.policies (name, definition, bucket_id)
    SELECT 'Public Access', 
           '{"version":"1.0","statements":[{"effect":"allow","principal":"*","action":["select"],"resource":["*"]}]}',
           'recipe-images'
    WHERE NOT EXISTS (SELECT 1 FROM storage.policies WHERE name = 'Public Access' AND bucket_id = 'recipe-images');
  END IF;
END $$;
