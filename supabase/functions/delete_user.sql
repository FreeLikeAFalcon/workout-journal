
CREATE OR REPLACE FUNCTION public.delete_user(user_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the ID of the current user
  current_user_id := auth.uid();
  
  -- Check if the user exists
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Delete user's metrics
  DELETE FROM public.metrics WHERE user_id = current_user_id;
  
  -- Delete user's workouts (and cascading exercises, sets, etc.)
  DELETE FROM public.workouts WHERE user_id = current_user_id;
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  -- User account deletion is handled by Supabase Auth
  -- We will use the signOut function and then manually delete from the UI
  -- as Supabase doesn't allow direct deletion of auth.users through SQL
END;
$$;
