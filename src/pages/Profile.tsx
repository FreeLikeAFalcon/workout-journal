
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import { useMetrics } from "@/contexts/MetricsContext";
import ProfileInformation from "@/components/profile/ProfileInformation";

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
        
        <ProfileInformation 
          username={profile?.username || ''}
          email={user?.email || ''}
          weight={currentWeight}
          onEditClick={() => setIsEditDialogOpen(true)}
        />
      </div>
      
      {isEditDialogOpen && (
        <EditProfileDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          initialData={{
            username: profile?.username || '',
            weight: currentWeight || undefined,
            email: user?.email || '',
          }}
        />
      )}
    </Layout>
  );
};

export default Profile;
