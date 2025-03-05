
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tihibpfypycjsraijtcd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGlicGZ5cHljanNyYWlqdGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTYxOTYsImV4cCI6MjA1NjU3MjE5Nn0.cWdp3lWbaBVNKDfwFbrGhx4q1X0Vl4zyVu__CzO2gQM";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Define interfaces for RPC parameters to solve TypeScript typing issues
interface GetPoliciesParams {
  table_name: string;
}

interface EnableRLSParams {
  table_name: string;
}

interface CreatePolicyParams {
  table_name: string;
  policy_name: string;
  operation: string;
  using_expr?: string;
  with_check_expr?: string;
}

// Add RLS policies to the workouts table
export const setupWorkoutsRLS = async () => {
  try {
    // Check if the policies already exist
    const { data: policies, error: policiesError } = await supabase
      .rpc<GetPoliciesParams, any[]>('get_policies', { table_name: 'workouts' });
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError);
      return;
    }
    
    // If no policies are found, create them
    if (!policies || (Array.isArray(policies) && policies.length === 0)) {
      console.log('No RLS policies found for workouts table, creating them...');
      
      // Enable RLS on the workouts table
      const { error: enableError } = await supabase
        .rpc<EnableRLSParams, any>('enable_rls', { table_name: 'workouts' });
      
      if (enableError) {
        console.error('Error enabling RLS:', enableError);
        return;
      }
      
      // Create policies for CRUD operations
      const { error: selectError } = await supabase
        .rpc<CreatePolicyParams, any>('create_policy', { 
          table_name: 'workouts',
          policy_name: 'Users can view their own workouts',
          operation: 'SELECT',
          using_expr: 'auth.uid() = user_id'
        });
      
      if (selectError) {
        console.error('Error creating SELECT policy:', selectError);
      }
      
      const { error: insertError } = await supabase
        .rpc<CreatePolicyParams, any>('create_policy', { 
          table_name: 'workouts',
          policy_name: 'Users can create their own workouts',
          operation: 'INSERT',
          with_check_expr: 'auth.uid() = user_id'
        });
      
      if (insertError) {
        console.error('Error creating INSERT policy:', insertError);
      }
      
      const { error: updateError } = await supabase
        .rpc<CreatePolicyParams, any>('create_policy', { 
          table_name: 'workouts',
          policy_name: 'Users can update their own workouts',
          operation: 'UPDATE',
          using_expr: 'auth.uid() = user_id'
        });
      
      if (updateError) {
        console.error('Error creating UPDATE policy:', updateError);
      }
      
      const { error: deleteError } = await supabase
        .rpc<CreatePolicyParams, any>('create_policy', { 
          table_name: 'workouts',
          policy_name: 'Users can delete their own workouts',
          operation: 'DELETE',
          using_expr: 'auth.uid() = user_id'
        });
      
      if (deleteError) {
        console.error('Error creating DELETE policy:', deleteError);
      }
      
      console.log('RLS policies created successfully for workouts table');
    }
  } catch (error) {
    console.error('Error setting up RLS policies:', error);
  }
};
