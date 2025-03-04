
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMetrics } from "@/contexts/MetricsContext";
import { toast } from "@/hooks/use-toast";

export const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  weight: z.preprocess(
    // Convert empty string to undefined, string number to number
    (val) => val === '' ? undefined : val === null ? undefined : Number(val),
    z.number().min(20).max(500).optional()
  ),
  email: z.string().email("Invalid email address"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileTabProps {
  initialData: {
    username: string;
    weight?: number;
    email: string;
  };
  onSuccess: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ initialData, onSuccess }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addMetric } = useMetrics();
  const [error, setError] = React.useState<string | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: initialData.username,
      weight: initialData.weight,
      email: initialData.email,
    },
  });
  
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setError(null);
      
      if (user && values.username !== initialData.username) {
        const { error } = await supabase
          .from('profiles')
          .update({ username: values.username })
          .eq('id', user.id);
          
        if (error) throw error;
      }
      
      if (user && values.email !== initialData.email) {
        const { error } = await supabase.auth.updateUser({
          email: values.email,
        });
        
        if (error) throw error;
      }
      
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
      
      onSuccess();
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
  
  return (
    <div className="space-y-4 py-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('weight')} (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder={t('enterWeight')} 
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : Number(value));
                    }}
                    value={field.value ?? ''}
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
    </div>
  );
};

export default ProfileTab;
