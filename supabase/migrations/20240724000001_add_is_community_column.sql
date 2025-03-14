-- Add is_community column to recipes table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'is_community') THEN
    ALTER TABLE recipes ADD COLUMN is_community BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add user_id and user_email columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'user_id') THEN
    ALTER TABLE recipes ADD COLUMN user_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'user_email') THEN
    ALTER TABLE recipes ADD COLUMN user_email TEXT;
  END IF;
END $$;

-- Enable realtime for recipes table
alter publication supabase_realtime add table recipes;
