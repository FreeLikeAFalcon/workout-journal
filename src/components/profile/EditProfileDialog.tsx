
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetrics } from "@/contexts/MetricsContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { addMetric } = useMetrics();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [error, setError] = useState<string | null>(null);
  
  // Create profile form schema
  const profileFormSchema = z.object({
    username: z.string().min(3, t('usernameMinLength')),
    weight: z.number().min(20).max(500).optional(),
    email: z.string().email(t('invalidEmail')),
  });

  // Create password form schema
  const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, t('passwordMinLength')),
    newPassword: z.string().min(6, t('passwordMinLength')),
    confirmPassword: z.string().min(6, t('passwordMinLength')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('passwordsDoNotMatch'),
    path: ["confirmPassword"],
  });

  // Initialize profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: initialData.username,
      weight: initialData.weight,
      email: initialData.email,
    },
  });

  // Initialize password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitProfile = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setError(null);
      
      // Update profile (username)
      if (user && values.username !== initialData.username) {
        const { error } = await supabase
          .from('profiles')
          .update({ username: values.username })
          .eq('id', user.id);
          
        if (error) throw error;
      }
      
      // Update email if changed
      if (user && values.email !== initialData.email) {
        const { error } = await supabase.auth.updateUser({
          email: values.email,
        });
        
        if (error) throw error;
      }
      
      // Add new weight metric if changed and has a value
      if (values.weight && values.weight !== initialData.weight) {
        await addMetric({
          type: 'weight',
          value: values.weight,
          date: new Date().toISOString(),
        });
      }
      
      toast({
        title: t('profileUpdated'),
        description: t('profileUpdatedDesc'),
      });
      
      if (values.email !== initialData.email) {
        toast({
          title: t('emailVerificationNeeded'),
          description: t('emailVerificationNeededDesc'),
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || t('errorUpdatingProfile'));
      toast({
        title: t('error'),
        description: error.message || t('errorUpdatingProfile'),
        variant: "destructive",
      });
    }
  };

  const onSubmitPassword = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: t('passwordUpdated'),
        description: t('passwordUpdatedDesc'),
      });
      
      passwordForm.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating password:", error);
      setError(error.message || t('errorUpdatingPassword'));
      toast({
        title: t('error'),
        description: error.message || t('errorUpdatingPassword'),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editProfile')}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
            <TabsTrigger value="password">{t('password')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('username')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('enterUsername')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('enterEmail')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('weight')} (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={t('enterWeight')} 
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseFloat(value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="submit">{t('save')}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="password" className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('currentPassword')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('newPassword')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('confirmPassword')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="submit">{t('updatePassword')}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
