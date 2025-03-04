
import React from "react";
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

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    username: string;
    weight?: number;
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
  
  // Create form schema
  const formSchema = z.object({
    username: z.string().min(3, t('usernameMinLength')),
    weight: z.number().min(20).max(500).optional(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: initialData.username,
      weight: initialData.weight,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Update profile (username)
      if (user && values.username !== initialData.username) {
        const { error } = await supabase
          .from('profiles')
          .update({ username: values.username })
          .eq('id', user.id);
          
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
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t('error'),
        description: t('errorUpdatingProfile'),
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
