
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, PenSquare, Weight, Mail, UserCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import { useMetrics } from "@/contexts/MetricsContext";

const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { getLatestMetricValue } = useMetrics();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Get the latest weight value from metrics if available
  const currentWeight = getLatestMetricValue("weight");

  return (
    <Layout>
      <div className="animate-fade-in space-y-6 py-6">
        <h1 className="text-3xl font-bold">{t('profile')}</h1>
        
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
                value={profile?.username || t('notSet')} 
              />
              
              <ProfileField 
                icon={<Mail />} 
                label={t('email')} 
                value={user?.email || t('notSet')} 
              />
              
              <ProfileField 
                icon={<Weight />} 
                label={t('weight')} 
                value={currentWeight ? `${currentWeight} kg` : t('notSet')} 
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => setIsEditDialogOpen(true)}
              className="w-full sm:w-auto"
              variant="default"
            >
              <PenSquare className="mr-2 size-4" />
              {t('editProfile')}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {isEditDialogOpen && (
        <EditProfileDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          initialData={{
            username: profile?.username || '',
            weight: currentWeight || undefined
          }}
        />
      )}
    </Layout>
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

export default Profile;
