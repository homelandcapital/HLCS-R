
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Agent, GeneralUser, UserRole } from '@/lib/types';
import { mockAgents, mockGeneralUsers } from '@/lib/mock-data';
import { UserPlus, User, Mail, KeyRound, Briefcase, Phone as PhoneIcon, Building, Shield } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(), 
  agency: z.string().optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof formSchema>;

const RegisterForm = () => {
  const { login } = useAuth(); 
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('user');

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery === 'agent') {
      setActiveRoleTab('agent');
    } else {
      setActiveRoleTab('user');
    }
  }, [searchParams]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      agency: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(values: RegisterFormValues) {
    if (activeRoleTab === 'agent') {
      if (!values.phone || values.phone.trim().length < 10) { // Also check if empty or just whitespace
        form.setError("phone", { type: "manual", message: "Phone number must be at least 10 digits for agents." });
        return;
      }
      const newAgentUser: Agent = { 
        id: `agent-${Date.now()}`, 
        name: values.name,
        email: values.email,
        phone: values.phone,
        agency: values.agency,
        role: 'agent',
        avatarUrl: 'https://placehold.co/100x100.png'
      };
      mockAgents.push(newAgentUser);
      login(newAgentUser);
      toast({
        title: 'Agent Registration Successful!',
        description: `Welcome, ${newAgentUser.name}! Your agent account has been created.`,
      });
      router.push('/agents/dashboard');
    } else if (activeRoleTab === 'user') {
      const newUser: GeneralUser = {
        id: `user-${Date.now()}`,
        name: values.name,
        email: values.email,
        role: 'user',
        avatarUrl: 'https://placehold.co/100x100.png'
      };
      mockGeneralUsers.push(newUser);
      login(newUser);
      toast({
        title: 'User Registration Successful!',
        description: `Welcome, ${newUser.name}! Your account has been created.`,
      });
      router.push('/');
    } else {
      toast({ title: "Registration Error", description: "Invalid role selected.", variant: "destructive"});
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">Create Account</CardTitle>
          <CardDescription>
            {activeRoleTab === 'user' ? 'Sign up for a general user account.' : 'Register as a new real estate agent.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeRoleTab} onValueChange={(value) => {
            setActiveRoleTab(value as UserRole);
            form.clearErrors("phone"); 
          }} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-5 w-5" /> User
              </TabsTrigger>
              <TabsTrigger value="agent" className="flex items-center gap-2">
                <Building className="h-5 w-5" /> Agent
              </TabsTrigger>
            </TabsList>
          </Tabs>

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
                        <Input placeholder="John Doe" {...field} className="pl-10"/>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="email" placeholder="your.email@example.com" {...field} className="pl-10"/>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {activeRoleTab === 'agent' && (
                <>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="tel" placeholder="(555) 123-4567" {...field} className="pl-10"/>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agency (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Your Real Estate Agency" {...field} className="pl-10"/>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10"/>
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10"/>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Registering...' : `Register as ${activeRoleTab === 'user' ? 'User' : 'Agent'}`}
              </Button>
            </form>
          </Form>
           <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/agents/login" className="font-medium text-primary hover:underline">
              Login here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
