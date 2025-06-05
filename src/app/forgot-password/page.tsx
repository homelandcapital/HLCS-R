
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { MailQuestion, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
// useRouter is not explicitly needed here for navigation as AuthContext handles toasts/feedback

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth(); // Removed loading from here

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    // sendPasswordResetEmail will handle its own toasts.
    // Form's isSubmitting state will handle button.
    const { error } = await sendPasswordResetEmail(values.email);
    if (!error) {
      form.reset();
    }
    // Error toast is handled by sendPasswordResetEmail in AuthContext
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <MailQuestion className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">Forgot Password</CardTitle>
          <CardDescription>Enter your email address below. If an account exists, we'll send you a link to reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="email" placeholder="your.email@example.com" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm">
            <Link href="/agents/login" className="font-medium text-primary hover:underline flex items-center justify-center">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
