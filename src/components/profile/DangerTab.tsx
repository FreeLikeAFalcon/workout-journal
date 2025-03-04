
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { AlertCircle, Trash2 } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface DangerTabProps {
  onSuccess: () => void;
}

const DangerTab: React.FC<DangerTabProps> = ({ onSuccess }) => {
  const { t } = useLanguage();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      toast({
        title: t('error'),
        description: t('please.fill.all.fields'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const { error: deleteError } = await supabase.rpc('delete_user', {
        user_password: deleteConfirmPassword
      });

      if (deleteError) throw deleteError;
      
      toast({
        title: t('accountDeleted'),
        description: t('accountDeletedDesc'),
      });
      
      await signOut();
      
      navigate('/');
      
    } catch (error) {
      console.error("Error deleting account:", error);
      setError(error.message || t('errorDeletingAccount'));
      toast({
        title: t('error'),
        description: error.message || t('errorDeletingAccount'),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-4 py-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('deleteAccountWarning')}
          </AlertDescription>
        </Alert>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('deleteAccount')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteAccountConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteAccountWarning')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4">
              <FormLabel>{t('enterPasswordToConfirm')}</FormLabel>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteAccount();
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? t('pleaseWait') : t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default DangerTab;
