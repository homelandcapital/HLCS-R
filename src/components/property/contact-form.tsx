
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardHeader, CardTitle
import { useToast } from '@/hooks/use-toast';
import { Mail, User, Phone } from 'lucide-react';
import { mockInquiries } from '@/lib/mock-data';
import type { Inquiry } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof formSchema>;

interface ContactFormProps {
  propertyTitle: string;
  propertyId: string;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  onFormSubmit?: () => void;
}

const ContactForm = ({ 
  propertyTitle, 
  propertyId, 
  initialName, 
  initialEmail, 
  initialPhone,
  onFormSubmit 
}: ContactFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialName || '',
      email: initialEmail || '',
      phone: initialPhone || '',
      message: `I'm interested in ${propertyTitle}.`,
    },
  });

  // Effect to reset form if initial values or property context changes
  useEffect(() => {
    form.reset({
      name: initialName || '',
      email: initialEmail || '',
      phone: initialPhone || '',
      message: `I'm interested in ${propertyTitle}.`,
    });
  }, [initialName, initialEmail, initialPhone, propertyTitle, form]);


  function onSubmit(values: ContactFormValues) {
    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      propertyId,
      propertyName: propertyTitle,
      inquirerName: values.name,
      inquirerEmail: values.email,
      inquirerPhone: values.phone,
      message: values.message,
      dateReceived: new Date().toISOString(),
      status: 'new',
    };

    mockInquiries.push(newInquiry);
    console.log('New inquiry added:', newInquiry);
    console.log('All inquiries:', mockInquiries);


    toast({
      title: 'Inquiry Sent!',
      description: `Your message about ${propertyTitle} has been sent successfully. The platform admin will contact you shortly.`,
      variant: 'default',
    });
    form.reset({ // Reset to initial default message after submission
        name: initialName || '', // Persist prefilled if available
        email: initialEmail || '',
        phone: initialPhone || '',
        message: `I'm interested in ${propertyTitle}.`,
    });
    onFormSubmit?.(); // Call callback to close dialog if provided
  }

  return (
    <Card className="shadow-none border-none">
      {/* Removed CardHeader and its CardTitle from here */}
      <CardContent className="p-0"> {/* Adjust padding if needed, was p-0 */}
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
                      <Input placeholder="Adekunle Adebayo" {...field} className="pl-10" />
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
                      <Input type="tel" placeholder="080X XXX XXXX" {...field} className="pl-10" />
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

export default ContactForm;
