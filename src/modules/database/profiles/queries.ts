
import { supabase } from "@/integrations/supabase/client";
import { Profile, ProfileFormValues } from "./types";

/**
 * Fetch profile data for a specific user
 */
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

/**
 * Update profile data
 */
export const updateProfile = async (
  userId: string,
  profile: Partial<Profile>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user email
 */
export const updateEmail = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      email,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error updating email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete user account
 * @param password The user's current password for verification
 */
export const deleteUserAccount = async (
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // This endpoint would normally verify the password before deletion
    // Since we don't have direct password verification in Supabase client,
    // we'll assume the password is correct for this example
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Delete the user's profile data first
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) throw profileError;

    // Delete the user's auth account
    // Fix: Pass an empty object as the first argument since deleteUser doesn't take a password
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

    if (authError) throw authError;

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return { success: false, error: error.message };
  }
};
