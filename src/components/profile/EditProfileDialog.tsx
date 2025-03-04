
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import ProfileTab from "./ProfileTab";
import PasswordTab from "./PasswordTab";
import DangerTab from "./DangerTab";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    username: string;
    weight?: number;
    email: string;
  };
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ 
  open, 
  onOpenChange,
  initialData 
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("profile");
  
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editProfile')}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
            <TabsTrigger value="password">{t('password')}</TabsTrigger>
            <TabsTrigger value="danger" className="text-destructive">{t('deleteAccount')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileTab initialData={initialData} onSuccess={handleSuccess} />
          </TabsContent>
          
          <TabsContent value="password">
            <PasswordTab onSuccess={handleSuccess} />
          </TabsContent>
          
          <TabsContent value="danger">
            <DangerTab onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
