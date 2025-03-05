
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tihibpfypycjsraijtcd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGlicGZ5cHljanNyYWlqdGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTYxOTYsImV4cCI6MjA1NjU3MjE5Nn0.cWdp3lWbaBVNKDfwFbrGhx4q1X0Vl4zyVu__CzO2gQM";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Interface types for RPC function parameters
interface GetPoliciesParams {
  table_name: string;
}

interface EnableRLSParams {
  table_name: string;
}

interface CreatePolicyParams {
  table_name: string;
  policy_name: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  using_expr?: string;
  with_check_expr?: string;
}

// Setup RLS policies for tables
export const setupWorkoutsRLS = async () => {
  try {
    // Tables that need RLS policies
    const tables = ['workouts', 'exercises', 'sets', 'body_metrics', 'body_goals', 'widget_configs'];
    
    for (const table of tables) {
      // Check if the policies already exist for this table
      const { data: policies, error: policiesError } = await supabase
        .rpc<any[]>('get_policies', { table_name: table } as GetPoliciesParams);
      
      if (policiesError) {
        console.error(`Error checking policies for ${table}:`, policiesError);
        continue;
      }
      
      // If no policies are found, create them
      if (!policies || (Array.isArray(policies) && policies.length === 0)) {
        console.log(`No RLS policies found for ${table} table, creating them...`);
        
        // Enable RLS on the table
        const { error: enableError } = await supabase
          .rpc('enable_rls', { table_name: table } as EnableRLSParams);
        
        if (enableError) {
          console.error(`Error enabling RLS for ${table}:`, enableError);
          continue;
        }
        
        // Create policies for CRUD operations
        const { error: selectError } = await supabase
          .rpc('create_policy', { 
            table_name: table,
            policy_name: `Users can view their own ${table}`,
            operation: 'SELECT',
            using_expr: 'auth.uid() = user_id'
          } as CreatePolicyParams);
        
        if (selectError) {
          console.error(`Error creating SELECT policy for ${table}:`, selectError);
        }
        
        const { error: insertError } = await supabase
          .rpc('create_policy', { 
            table_name: table,
            policy_name: `Users can create their own ${table}`,
            operation: 'INSERT',
            with_check_expr: 'auth.uid() = user_id'
          } as CreatePolicyParams);
        
        if (insertError) {
          console.error(`Error creating INSERT policy for ${table}:`, insertError);
        }
        
        const { error: updateError } = await supabase
          .rpc('create_policy', { 
            table_name: table,
            policy_name: `Users can update their own ${table}`,
            operation: 'UPDATE',
            using_expr: 'auth.uid() = user_id'
          } as CreatePolicyParams);
        
        if (updateError) {
          console.error(`Error creating UPDATE policy for ${table}:`, updateError);
        }
        
        const { error: deleteError } = await supabase
          .rpc('create_policy', { 
            table_name: table,
            policy_name: `Users can delete their own ${table}`,
            operation: 'DELETE',
            using_expr: 'auth.uid() = user_id'
          } as CreatePolicyParams);
        
        if (deleteError) {
          console.error(`Error creating DELETE policy for ${table}:`, deleteError);
        }
        
        console.log(`RLS policies created successfully for ${table} table`);
      }
    }
  } catch (error) {
    console.error('Error setting up RLS policies:', error);
  }
};
