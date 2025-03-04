import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ open, onOpenChange }) => {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Call the Supabase function to delete user data
      const { error: rpcError } = await supabase.rpc('delete_user_data', {
        password: password
      });

      if (rpcError) {
        console.error("Error deleting user data:", rpcError);
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('account.deleteFailed'),
        });
        setIsLoading(false);
        return;
      }

      // Delete the user account from Supabase Auth
      const { error: deleteError } = await supabase.auth.deleteUser({ password });

      if (deleteError) {
        console.error("Error deleting user account:", deleteError);
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('account.deleteFailed'),
        });
        setIsLoading(false);
        return;
      }

      // Sign out the user after successful deletion
      await signOut();
      toast({
        title: t('account.deleteSuccess'),
        description: t('account.redirecting'),
      });
    } catch (error: any) {
      console.error("Unexpected error during account deletion:", error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: error.message || t('account.deleteFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('account.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('account.deleteWarning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label htmlFor="password">{t('password.current')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={handleDeleteAccount}
          >
            {isLoading ? t('loading') : t('account.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;
