
-- This is a reference SQL function that should be created in Supabase SQL editor
-- to allow users to delete their account data

-- Create a function that deletes all user data
CREATE OR REPLACE FUNCTION public.delete_user_data(password TEXT DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid uuid;
BEGIN
  -- Get the current user ID
  uid := auth.uid();
  
  -- Delete user data from various tables
  -- Delete metrics
  DELETE FROM public.body_metrics WHERE user_id = uid;
  
  -- Delete goals
  DELETE FROM public.body_goals WHERE user_id = uid;
  
  -- Delete workout related data (cascade will handle related exercises and sets)
  DELETE FROM public.workouts WHERE user_id = uid;
  
  -- Delete widget configs
  DELETE FROM public.widget_configs WHERE user_id = uid;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE id = uid;
  
  RETURN true;
END;
$$;
