
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tihibpfypycjsraijtcd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGlicGZ5cHljanNyYWlqdGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTYxOTYsImV4cCI6MjA1NjU3MjE5Nn0.cWdp3lWbaBVNKDfwFbrGhx4q1X0Vl4zyVu__CzO2gQM";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add RLS policies to the workouts table
export const setupWorkoutsRLS = async () => {
  try {
    // Check if the policies already exist
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'workouts' });
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError);
      return;
    }
    
    // If no policies are found, create them
    if (!policies || policies.length === 0) {
      console.log('No RLS policies found for workouts table, creating them...');
      
      // Enable RLS on the workouts table
      await supabase.rpc('enable_rls', { table_name: 'workouts' });
      
      // Create policies for CRUD operations
      await supabase.rpc('create_policy', { 
        table_name: 'workouts',
        policy_name: 'Users can view their own workouts',
        operation: 'SELECT',
        using_expr: 'auth.uid() = user_id'
      });
      
      await supabase.rpc('create_policy', { 
        table_name: 'workouts',
        policy_name: 'Users can create their own workouts',
        operation: 'INSERT',
        with_check_expr: 'auth.uid() = user_id'
      });
      
      await supabase.rpc('create_policy', { 
        table_name: 'workouts',
        policy_name: 'Users can update their own workouts',
        operation: 'UPDATE',
        using_expr: 'auth.uid() = user_id'
      });
      
      await supabase.rpc('create_policy', { 
        table_name: 'workouts',
        policy_name: 'Users can delete their own workouts',
        operation: 'DELETE',
        using_expr: 'auth.uid() = user_id'
      });
      
      console.log('RLS policies created successfully for workouts table');
    }
  } catch (error) {
    console.error('Error setting up RLS policies:', error);
  }
};
