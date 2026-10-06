-- Profile fields for user accounts. These are optional and may be cleared
-- (set to NULL) by the user from the profile page.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS bio text;
