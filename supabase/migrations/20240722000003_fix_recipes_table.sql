-- Add user_id column to recipes table if it doesn't exist
DO $ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'user_id') THEN
        ALTER TABLE recipes ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    -- Make sure is_community column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'is_community') THEN
        ALTER TABLE recipes ADD COLUMN is_community BOOLEAN DEFAULT false;
    END IF;

    -- Make sure user_email column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'user_email') THEN
        ALTER TABLE recipes ADD COLUMN user_email TEXT;
    END IF;

    -- Make sure created_at column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'created_at') THEN
        ALTER TABLE recipes ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $;
