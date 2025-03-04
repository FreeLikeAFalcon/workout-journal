
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import DeleteAccountDialog from "./DeleteAccountDialog";

const DangerZoneCard: React.FC = () => {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto border-red-200 dark:border-red-900/30 mt-6">
        <CardHeader className="border-b border-red-200 dark:border-red-900/30">
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="size-5" />
            {t('dangerZone')}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10">
              <div>
                <h3 className="font-medium">{t('deleteAccount')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('deleteAccountDescription')}</p>
              </div>
              <Button 
                variant="destructive" 
                className="mt-3 sm:mt-0"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 size-4" />
                {t('deleteAccount')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isDeleteDialogOpen && (
        <DeleteAccountDialog 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </>
  );
};

export default DangerZoneCard;
