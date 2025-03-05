import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const setupRLS = async () => {
  try {
    console.log("Setting up RLS...");
    
    // Use a different approach for type parameters
    const { data: policies } = await supabase.rpc<Record<string, any>[]>('get_policies', {});
    
    console.log("Current policies:", policies);
    
    if (!policies || policies.length === 0) {
      console.log("No RLS policies found, creating them...");
      
      // Create types for the RPC function parameters
      type RPCParams = Record<string, any>;
      
      // Enable RLS on all tables
      await supabase.rpc<Record<string, any>>('enable_rls', {
        p_table_name: 'profiles'
      } as RPCParams);
      
      await supabase.rpc<Record<string, any>>('enable_rls', {
        p_table_name: 'workouts'
      } as RPCParams);
      
      // Create profile policies
      await supabase.rpc<Record<string, any>>('create_policy', {
        p_table_name: 'profiles',
        p_policy_name: 'Users can view their own profile',
        p_policy_definition: 'auth.uid() = id',
        p_operation: 'SELECT',
        p_check_expression: 'true'
      } as RPCParams);
      
      await supabase.rpc<Record<string, any>>('create_policy', {
        p_table_name: 'profiles',
        p_policy_name: 'Users can update their own profile',
        p_policy_definition: 'auth.uid() = id',
        p_operation: 'UPDATE',
        p_check_expression: 'true'
      } as RPCParams);
      
      // Create workout policies
      await supabase.rpc<Record<string, any>>('create_policy', {
        p_table_name: 'workouts',
        p_policy_name: 'Users can view their own workouts',
        p_policy_definition: 'auth.uid() = user_id',
        p_operation: 'SELECT',
        p_check_expression: 'true'
      } as RPCParams);
      
      await supabase.rpc<Record<string, any>>('create_policy', {
        p_table_name: 'workouts',
        p_policy_name: 'Users can insert their own workouts',
        p_policy_definition: 'auth.uid() = user_id',
        p_operation: 'INSERT',
        p_check_expression: 'true'
      } as RPCParams);
      
      await supabase.rpc<Record<string, any>>('create_policy', {
        p_table_name: 'workouts',
        p_policy_name: 'Users can update their own workouts',
        p_policy_definition: 'auth.uid() = user_id',
        p_operation: 'UPDATE',
        p_check_expression: 'true'
      } as RPCParams);
      
      await supabase.rpc<Record<string, any>>('create_policy', {
        p_table_name: 'workouts',
        p_policy_name: 'Users can delete their own workouts',
        p_policy_definition: 'auth.uid() = user_id',
        p_operation: 'DELETE',
        p_check_expression: 'true'
      } as RPCParams);
      
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
