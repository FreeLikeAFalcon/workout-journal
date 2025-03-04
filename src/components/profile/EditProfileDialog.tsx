
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProfileTab } from "./tabs/ProfileTab";
import { PasswordTab } from "./tabs/PasswordTab";
import { DangerZoneTab } from "./tabs/DangerZoneTab";

// Props interface for the EditProfileDialog component
interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    username: string;
    weight?: number;
    email: string;
  };
}

// Main dialog component for editing user profile
const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ 
  open, 
  onOpenChange,
  initialData 
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<string>("profile");

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
            <TabsTrigger value="danger" className="text-destructive">
              {t('deleteAccount')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileTab 
              initialData={initialData} 
              onClose={() => onOpenChange(false)} 
            />
          </TabsContent>
          
          <TabsContent value="password">
            <PasswordTab onClose={() => onOpenChange(false)} />
          </TabsContent>
          
          <TabsContent value="danger">
            <DangerZoneTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
