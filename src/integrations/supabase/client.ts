
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const setupRLS = async () => {
  try {
    console.log("Setting up RLS...");
    
    // Define types for RPC parameters
    type GetPoliciesParams = Record<string, never>;
    type EnableRLSParams = { p_table_name: string };
    type CreatePolicyParams = {
      p_table_name: string;
      p_policy_name: string;
      p_policy_definition: string;
      p_operation: string;
      p_check_expression: string;
    };
    
    // Correctly specify both return type and parameters type
    const { data: policies } = await supabase.rpc<Record<string, any>, GetPoliciesParams>('get_policies', {});
    
    console.log("Current policies:", policies);
    
    if (!policies || (Array.isArray(policies) && policies.length === 0)) {
      console.log("No RLS policies found, creating them...");
      
      // Enable RLS on all tables with correct type parameters
      await supabase.rpc<null, EnableRLSParams>('enable_rls', {
        p_table_name: 'profiles'
      });
      
      await supabase.rpc<null, EnableRLSParams>('enable_rls', {
        p_table_name: 'workouts'
      });
      
      // Create profile policies with correct type parameters
      await supabase.rpc<null, CreatePolicyParams>('create_policy', {
        p_table_name: 'profiles',
        p_policy_name: 'Users can view their own profile',
        p_policy_definition: 'auth.uid() = id',
        p_operation: 'SELECT',
        p_check_expression: 'true'
      });
      
      await supabase.rpc<null, CreatePolicyParams>('create_policy', {
        p_table_name: 'profiles',
        p_policy_name: 'Users can update their own profile',
        p_policy_definition: 'auth.uid() = id',
        p_operation: 'UPDATE',
        p_check_expression: 'true'
      });
      
      // Create workout policies with correct type parameters
      await supabase.rpc<null, CreatePolicyParams>('create_policy', {
        p_table_name: 'workouts',
        p_policy_name: 'Users can view their own workouts',
        p_policy_definition: 'auth.uid() = user_id',
        p_operation: 'SELECT',
        p_check_expression: 'true'
      });
      
      await supabase.rpc<null, CreatePolicyParams>('create_policy', {
        p_table_name: 'workouts',
        p_policy_name: 'Users can insert their own workouts',
        p_policy_definition: 'auth.uid() = user_id',
        p_operation: 'INSERT',
        p_check_expression: 'true'
      });
      
      await supabase.rpc<null, CreatePolicyParams>('create_policy', {
        p_table_name: 'workouts',
        p_policy_name: 'Users can update their own workouts',
        p_policy_definition: 'auth.uid() = user_id',
        p_operation: 'UPDATE',
        p_check_expression: 'true'
      });
      
      await supabase.rpc<null, CreatePolicyParams>('create_policy', {
        p_table_name: 'workouts',
        p_policy_name: 'Users can delete their own workouts',
        p_policy_definition: 'auth.uid() = user_id',
        p_operation: 'DELETE',
        p_check_expression: 'true'
      });
      
      console.log("RLS policies created successfully");
    } else {
      console.log("RLS policies already exist");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error setting up RLS:", error);
    return { success: false, error };
  }
};

export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
};
