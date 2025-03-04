
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { updatePassword } from "@/modules/database/profiles/queries";
import { toast } from "@/hooks/use-toast";
import { passwordFormSchema, type PasswordFormValues } from "../schemas/profileSchemas";

interface PasswordTabProps {
  onClose: () => void;
}

export const PasswordTab: React.FC<PasswordTabProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      setError(null);
      
      const result = await updatePassword(values.newPassword);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: t('passwordUpdated'),
        description: t('passwordUpdatedDesc'),
      });
      
      form.reset();
      onClose();
    } catch (error: any) {
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
            control={form.control}
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
            control={form.control}
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
          
          <div className="pt-4 flex justify-end">
            <Button type="submit">{t('updatePassword')}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
