-- Run this to verify your user_profiles table has the required columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('role', 'timezone', 'theme_preference', 'username')
ORDER BY column_name;

-- Also check for constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass
  AND conname IN ('valid_role', 'valid_theme');
