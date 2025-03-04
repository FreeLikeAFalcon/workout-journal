
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

interface DangerTabProps {
  onSuccess: () => void;
}

const DangerTab: React.FC<DangerTabProps> = ({ onSuccess }) => {
  const { t } = useLanguage();
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: t('error'),
        description: t('enterPasswordToConfirm'),
        variant: "destructive",
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteAccount(password);
      
      toast({
        title: t('accountDeleted'),
        description: t('accountDeletedDesc'),
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error deleting account:", error);
      
      toast({
        title: t('error'),
        description: t('errorDeletingAccount'),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <h3 className="font-medium text-destructive mb-2">{t('deleteAccountConfirm')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('deleteAccountWarning')}
        </p>
      </div>
      
      <form onSubmit={handleDeleteAccount}>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm text-muted-foreground mb-1">
            {t('enterPasswordToConfirm')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-2 border border-input rounded-lg bg-transparent"
            required
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 border border-input rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={isDeleting}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            {isDeleting ? `${t('pleaseWait')}...` : t('delete')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DangerTab;
