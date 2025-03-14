-- Create recipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image TEXT,
  calories INTEGER,
  protein INTEGER,
  prep_time INTEGER,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  nutrition JSONB,
  tags TEXT[],
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  is_community BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read access" ON recipes;
CREATE POLICY "Public read access"
ON recipes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
CREATE POLICY "Users can insert their own recipes"
ON recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
CREATE POLICY "Users can update their own recipes"
ON recipes FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;
CREATE POLICY "Users can delete their own recipes"
ON recipes FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Public read access for recipe images" ON storage.objects;
CREATE POLICY "Public read access for recipe images"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS "Authenticated users can upload recipe images" ON storage.objects;
CREATE POLICY "Authenticated users can upload recipe images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own recipe images" ON storage.objects;
CREATE POLICY "Users can update their own recipe images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'recipe-images' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete their own recipe images" ON storage.objects;
CREATE POLICY "Users can delete their own recipe images"
ON storage.objects FOR DELETE
USING (bucket_id = 'recipe-images' AND auth.uid() = owner);

-- Enable realtime for recipes
alter publication supabase_realtime add table recipes;
