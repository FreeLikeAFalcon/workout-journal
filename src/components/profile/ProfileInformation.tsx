
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, Mail, Weight, UserCircle, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileInformationProps {
  username: string;
  email: string;
  weight?: number;
  onEditClick: () => void;
}

const ProfileInformation: React.FC<ProfileInformationProps> = ({
  username,
  email,
  weight,
  onEditClick
}) => {
  const { t } = useLanguage();
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="size-6 text-primary" />
          {t('profileInformation')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileField 
            icon={<User />} 
            label={t('username')} 
            value={username || t('notSet')} 
          />
          
          <ProfileField 
            icon={<Mail />} 
            label={t('email')} 
            value={email || t('notSet')} 
          />
          
          <ProfileField 
            icon={<Weight />} 
            label={t('weight')} 
            value={weight ? `${weight} kg` : t('notSet')} 
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onEditClick}
          className="w-full sm:w-auto"
          variant="default"
        >
          <PenSquare className="mr-2 size-4" />
          {t('editProfile')}
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon, label, value }) => (
  <div className="flex items-center p-3 rounded-lg border border-border/40 bg-background/50">
    <div className="mr-3 text-muted-foreground">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

export default ProfileInformation;
