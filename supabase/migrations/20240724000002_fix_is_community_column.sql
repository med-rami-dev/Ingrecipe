-- Check if the column exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'is_community') THEN
        ALTER TABLE recipes ADD COLUMN is_community BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'user_id') THEN
        ALTER TABLE recipes ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'user_email') THEN
        ALTER TABLE recipes ADD COLUMN user_email TEXT;
    END IF;
END
$$;

-- Don't try to add to publication if already a member
DO $$
BEGIN
    -- This will silently do nothing if the table is already in the publication
    -- avoiding the error: relation "recipes" is already member of publication "supabase_realtime"
    PERFORM pg_catalog.pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'recipes';
    IF NOT FOUND THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
    END IF;
END
$$;
