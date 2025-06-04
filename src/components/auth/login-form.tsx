
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
// useRouter is not directly used here anymore for redirection after login, it's handled in AuthContext
// import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
// mockAgents, mockGeneralUsers, mockPlatformAdmins are no longer needed for login
import { LogIn, Mail, KeyRound, UserCircle, Building, Shield } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from 'react';
import type { UserRole } from '@/lib/types'; // UserRole is still useful for UI

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Supabase handles min length server-side if needed
});

type LoginFormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const { signInWithPassword, loading: authLoading } = useAuth();
  // const router = useRouter(); // Not needed for redirection here
  const { toast } = useToast(); // Still useful for local form errors if any
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('user'); // Still used for UI hint

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    const { error } = await signInWithPassword(values.email, values.password);
    // Error handling and success messages are now managed within signInWithPassword and AuthContext
    if (error) {
      form.setError("email", { type: "manual", message: "Invalid email or password." });
      form.setError("password", { type: "manual", message: " " }); // Clear specific message for password
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">Login</CardTitle>
          <CardDescription>Select your intended role and access your Homeland Capital account.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs can remain for user experience, but Supabase login won't use this role directly */}
          <Tabs value={activeRoleTab} onValueChange={(value) => setActiveRoleTab(value as UserRole)} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" /> User
              </TabsTrigger>
              <TabsTrigger value="agent" className="flex items-center gap-2">
                <Building className="h-5 w-5" /> Agent
              </TabsTrigger>
              <TabsTrigger value="platform_admin" className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Admin
              </TabsTrigger>
            </TabsList>
          </Tabs>

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
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || authLoading}>
                {(form.formState.isSubmitting || authLoading) ? 'Logging in...' : `Login`}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/agents/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
