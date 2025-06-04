
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockAgents, mockGeneralUsers, mockPlatformAdmins } from '@/lib/mock-data';
import type { AuthenticatedUser, UserRole } from '@/lib/types';
import { LogIn, Mail, KeyRound, UserCheck } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Min 1 for demo purposes
  role: z.enum(['agent', 'user', 'platform_admin'], { required_error: 'Please select a role.' }),
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
      role: undefined, // User must select a role
    },
  });

  function onSubmit(values: LoginFormValues) {
    let foundUser: AuthenticatedUser | undefined;

    switch (values.role) {
      case 'agent':
        foundUser = mockAgents.find(a => a.email === values.email);
        break;
      case 'user':
        foundUser = mockGeneralUsers.find(u => u.email === values.email);
        break;
      case 'platform_admin':
        foundUser = mockPlatformAdmins.find(admin => admin.email === values.email);
        break;
      default:
        toast({
          title: 'Login Error',
          description: 'Invalid role selected.',
          variant: 'destructive',
        });
        return;
    }

    // In a real app, you'd verify password hash
    if (foundUser) {
      login(foundUser);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${foundUser.name}! You are logged in as a ${foundUser.role.replace('_', ' ')}.`,
      });

      if (foundUser.role === 'agent') {
        router.push('/agents/dashboard');
      } else if (foundUser.role === 'platform_admin') {
        toast({ title: "Admin Logged In", description: "Admin dashboard not yet implemented. Redirecting to home."});
        router.push('/');
      } else { // General user
        router.push('/');
      }
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password for the selected role. Please try again.',
        variant: 'destructive',
      });
      form.setError("email", { type: "manual", message: "Invalid credentials for selected role" });
      form.setError("password", { type: "manual", message: "Invalid credentials for selected role" });
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login as</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                           <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <span className="pl-6"> <SelectValue placeholder="Select your role" /></span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">General User</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="platform_admin">Platform Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
           <p className="mt-2 text-center text-xs text-muted-foreground">
            (General user or admin accounts cannot be created through public registration)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
