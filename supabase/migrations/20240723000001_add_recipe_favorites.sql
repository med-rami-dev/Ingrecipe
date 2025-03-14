-- Create a table to track user favorites
CREATE TABLE IF NOT EXISTS recipe_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Enable row-level security
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON recipe_favorites;
CREATE POLICY "Users can view their own favorites"
  ON recipe_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON recipe_favorites;
CREATE POLICY "Users can insert their own favorites"
  ON recipe_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own favorites" ON recipe_favorites;
CREATE POLICY "Users can update their own favorites"
  ON recipe_favorites FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON recipe_favorites;
CREATE POLICY "Users can delete their own favorites"
  ON recipe_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE recipe_favorites;
