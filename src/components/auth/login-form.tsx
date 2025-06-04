
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockAgents, mockGeneralUsers, mockPlatformAdmins } from '@/lib/mock-data'; 
import type { AuthenticatedUser } from '@/lib/types';
import { LogIn, Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Min 1 for demo purposes
});

type LoginFormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: LoginFormValues) {
    // Simulate login by checking mock data
    let foundUser: AuthenticatedUser | undefined = mockAgents.find(a => a.email === values.email);
    if (!foundUser) {
      foundUser = mockGeneralUsers.find(u => u.email === values.email);
    }
    if (!foundUser) {
      foundUser = mockPlatformAdmins.find(admin => admin.email === values.email);
    }

    // In a real app, you'd verify password hash
    if (foundUser) {
      login(foundUser);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${foundUser.name}! You are logged in as a ${foundUser.role}.`,
      });

      if (foundUser.role === 'agent') {
        router.push('/agents/dashboard');
      } else if (foundUser.role === 'platform_admin') {
        // Placeholder for admin dashboard redirect
        toast({ title: "Admin Logged In", description: "Admin dashboard not yet implemented. Redirecting to home."});
        router.push('/');
      } else {
        // General user redirect
        router.push('/');
      }
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
      form.setError("email", { type: "manual", message: "Invalid credentials" });
      form.setError("password", { type: "manual", message: "Invalid credentials" });
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">Login</CardTitle>
          <CardDescription>Access your EstateList account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
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
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an agent account?{' '}
            <Link href="/agents/register" className="font-medium text-primary hover:underline">
              Register as Agent
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
