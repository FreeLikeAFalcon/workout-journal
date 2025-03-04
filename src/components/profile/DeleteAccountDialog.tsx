
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ 
  open, 
  onOpenChange
}) => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  
  // Create form schema
  const formSchema = z.object({
    password: z.string().min(1, t('passwordRequired')),
    confirmation: z.string().refine(val => val === "DELETE", {
      message: t('typeDeleteToConfirm')
    })
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmation: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // First verify the password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: values.password
      });
      
      if (signInError) {
        throw new Error(t('incorrectPassword'));
      }
      
      // Call RPC function to delete user data
      const { error: rpcError } = await supabase.rpc('delete_user_data');
      
      if (rpcError) {
        throw rpcError;
      }
      
      // Delete the user's auth account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user?.id || ''
      );
      
      if (deleteError) {
        // If admin delete fails, try self-delete
        const { error: selfDeleteError } = await supabase.auth.updateUser({
          data: { delete_user: true }
        });
        
        if (selfDeleteError) {
          throw selfDeleteError;
        }
      }
      
      // Sign out after successful deletion
      await signOut();
      
      toast({
        title: t('accountDeleted'),
        description: t('accountDeletedDescription'),
      });
      
      // Close dialog after successful submission
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: t('error'),
        description: error.message || t('errorDeletingAccount'),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">{t('deleteAccount')}</DialogTitle>
          <DialogDescription>
            {t('deleteAccountWarning')}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('currentPassword')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={t('enterCurrentPassword')} 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmDeletion')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('typeDeleteToConfirm')} 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="submit" variant="destructive">{t('permanentlyDeleteAccount')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
