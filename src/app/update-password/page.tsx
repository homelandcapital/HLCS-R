
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UpdatePasswordFormValues = z.infer<typeof formSchema>;

export default function UpdatePasswordPage() {
  const { updateUserPassword, loading: authLoading, getSupabaseSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [tokenProcessed, setTokenProcessed] = useState(false);

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Check if the URL fragment indicates a recovery flow (Supabase adds #type=recovery)
    // Or if there's an active session which might be the temporary recovery session
    const hash = window.location.hash;
    const session = getSupabaseSession();

    if (hash.includes('type=recovery') || (session && session.user)) {
        setIsRecoveryFlow(true);
    }
    // Mark token as "processed" after initial check to avoid UI flicker if user navigates away and back
    setTokenProcessed(true); 
  }, [getSupabaseSession]);


  async function onSubmit(values: UpdatePasswordFormValues) {
    const { error } = await updateUserPassword(values.newPassword);
    if (!error) {
      // The updateUserPassword function in AuthContext already handles redirecting to login
      // and showing a success toast. We can reset the form here.
      form.reset();
    }
    // Error handling (toast) is done within updateUserPassword
  }

  // This check ensures we only render the form if it seems like a valid recovery flow.
  // It also prevents rendering the form briefly if the user lands here without a token.
  if (!tokenProcessed && !isRecoveryFlow) {
     return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
            <Card className="w-full max-w-md shadow-xl text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Checking Link...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Verifying your password reset link...</p>
                </CardContent>
            </Card>
        </div>
     );
  }


  if (!isRecoveryFlow && tokenProcessed) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Invalid or Expired Link</CardTitle>
            <CardDescription>
              This password reset link may be invalid or expired. Please request a new one if needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
             <p className="mt-4">
              <Link href="/agents/login" className="text-sm text-primary hover:underline flex items-center justify-center">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">Set New Password</CardTitle>
          <CardDescription>Enter your new password below. Make sure it's secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                      </div>
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
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || authLoading}>
                {(form.formState.isSubmitting || authLoading) ? 'Updating Password...' : 'Update Password & Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
