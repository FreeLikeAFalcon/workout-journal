
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./types";
import { toast } from "@/hooks/use-toast";

/**
 * Fetches a user profile by ID
 */
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
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

    return data as Profile;
  } catch (error) {
    console.error("Error in fetchProfile:", error);
    return null;
  }
};

/**
 * Updates a user profile
 */
export const updateProfile = async (
  userId: string, 
  updates: Partial<Profile>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update profile" 
    };
  }
};

/**
 * Updates user password
 */
export const updatePassword = async (
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update password" 
    };
  }
};

/**
 * Deletes a user account with password confirmation
 */
export const deleteUserAccount = async (
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error: deleteError } = await supabase.rpc('delete_user', {
      user_password: password
    } as { user_password: string });

    if (deleteError) {
      throw deleteError;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return { 
      success: false, 
      error: error.message || "Failed to delete account" 
    };
  }
};
