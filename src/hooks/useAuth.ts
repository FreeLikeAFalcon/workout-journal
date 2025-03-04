
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { fetchProfile } from "@/modules/database/profiles/queries";
import { Profile } from "@/modules/database/profiles/types";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(true);

  useEffect(() => {
    const fetchInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setIsEmailConfirmed(session.user.email_confirmed_at !== null);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }
      
      setLoading(false);
    };

    fetchInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setIsEmailConfirmed(session.user.email_confirmed_at !== null);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
          setIsEmailConfirmed(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Fehler beim Anmelden",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        setIsEmailConfirmed(false);
        toast({
          title: "E-Mail nicht bestätigt",
          description: "Bitte bestätige deine E-Mail, um fortzufahren.",
          variant: "destructive",
        });
        return;
      }

      setIsEmailConfirmed(true);
      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen zurück!",
      });
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      
      const redirectUrl = window.location.origin + '/auth?tab=login';
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast({
          title: "Fehler beim Registrieren",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Registrierung erfolgreich",
        description: "Bitte überprüfe deine E-Mails für die Bestätigung.",
      });
      
      setIsEmailConfirmed(false);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string, redirectTo: string) => {
    try {
      setLoading(true);
      
      const fullRedirectUrl = new URL(redirectTo, window.location.origin).toString();
      
      console.log("Sending password reset with redirect to:", fullRedirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: fullRedirectUrl,
      });

      if (error) {
        toast({
          title: "Fehler beim Zurücksetzen des Passworts",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "E-Mail gesendet",
        description: "Überprüfe deine E-Mails für den Link zum Zurücksetzen des Passworts.",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Abgemeldet",
        description: "Bis bald!",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Fehler beim Abmelden",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading,
    isEmailConfirmed,
  };
}
