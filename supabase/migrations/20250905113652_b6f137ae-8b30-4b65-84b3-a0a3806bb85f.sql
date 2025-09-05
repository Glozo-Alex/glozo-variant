-- Add theme preference column to profiles table
ALTER TABLE profiles ADD COLUMN theme_preference text DEFAULT 'default';