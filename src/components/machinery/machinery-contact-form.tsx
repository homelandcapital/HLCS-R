
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, User, Phone } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/auth-context';
import type { MachineryInquiry } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof formSchema>;

interface MachineryContactFormProps {
  machineryTitle: string;
  machineryId: string;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  onFormSubmit?: () => void;
}

const MachineryContactForm = ({ 
  machineryTitle, 
  machineryId, 
  initialName, 
  initialEmail, 
  initialPhone,
  onFormSubmit 
}: MachineryContactFormProps) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialName || '',
      email: initialEmail || '',
      phone: initialPhone || '',
      message: `I'm interested in the ${machineryTitle}.`,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialName || '',
      email: initialEmail || '',
      phone: initialPhone || '',
      message: `I'm interested in the ${machineryTitle}.`,
    });
  }, [initialName, initialEmail, initialPhone, machineryTitle, form]);

  async function onSubmit(values: ContactFormValues) {
    const inquiryToInsert = {
      machinery_id: machineryId,
      machinery_title: machineryTitle,
      inquirer_name: values.name,
      inquirer_email: values.email,
      inquirer_phone: values.phone || null,
      initial_message: values.message,
      status: 'new' as MachineryInquiry['status'],
      user_id: authUser?.id || null,
    };

    const { error } = await supabase
      .from('machinery_inquiries')
      .insert(inquiryToInsert);

    if (error) {
      console.error('Error saving machinery inquiry to database:', error);
      toast({ 
        title: 'Inquiry Submission Failed', 
        description: `Could not send inquiry: ${error.message}. Please try again.`, 
        variant: 'destructive' 
      });
      return;
    }

    toast({
      title: 'Inquiry Sent!',
      description: `Your message about ${machineryTitle} has been sent successfully.`,
      variant: 'default',
    });
    
    form.reset({
        name: initialName || '',
        email: initialEmail || '',
        phone: initialPhone || '',
        message: `I'm interested in the ${machineryTitle}.`,
    });
    onFormSubmit?.();
  }

  return (
    <Card className="shadow-none border-none">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="Your Name" {...field} className="pl-10" />
                    </div>
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                     <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                     <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="tel" placeholder="Your Phone Number" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your message..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MachineryContactForm;
