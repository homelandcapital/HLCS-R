
'use client';

import * as React from 'react'; // Added this line
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
import type { UserRole } from '@/lib/types'; // Agent, GeneralUser not directly needed for form values
// mockAgents, mockGeneralUsers are no longer needed
import { UserPlus, User, Mail, KeyRound, Briefcase, Phone as PhoneIcon, Building } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from 'react';

const baseFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
});

const agentFormSchema = baseFormSchema.extend({
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  agency: z.string().optional(),
});

const userFormSchema = baseFormSchema; // No additional fields for basic user

// Main schema that refines based on role and password confirmation
const registerFormSchema = z.discriminatedUnion("role", [
  agentFormSchema.extend({ role: z.literal("agent") }),
  userFormSchema.extend({ role: z.literal("user") }),
]).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const RegisterForm = () => {
  const { signUpUser, signUpAgent, loading: authLoading } = useAuth();
  const router = useRouter(); // Still used for redirection after successful registration
  const { toast } = useToast();
  
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('user');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      role: 'user', // Default role
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '', // Initialize to empty string
      agency: '', // Initialize to empty string
    },
    context: { role: activeRoleTab } // Provide role context for conditional validation
  });
  
  // Watch activeRoleTab to update the form's context for Zod's discriminatedUnion
  React.useEffect(() => {
    form.setValue('role', activeRoleTab, { shouldValidate: true });
  }, [activeRoleTab, form]);


  async function onSubmit(values: RegisterFormValues) {
    let result;
    if (values.role === 'agent') {
        // Type assertion because Zod already validated this structure
        const agentValues = values as Extract<RegisterFormValues, { role: 'agent' }>;
      result = await signUpAgent(agentValues.name, agentValues.email, agentValues.password, agentValues.phone, agentValues.agency);
    } else if (values.role === 'user') {
        const userValues = values as Extract<RegisterFormValues, { role: 'user' }>;
      result = await signUpUser(userValues.name, userValues.email, userValues.password);
    } else {
      toast({ title: "Registration Error", description: "Invalid role selected.", variant: "destructive"});
      return;
    }

    if (result && !result.error && result.data?.user) {
      // Redirection will be handled by onAuthStateChange in AuthContext
      // For agent, it might go to /agents/dashboard, for user to /users/dashboard or /
      // toast message is handled in signUpUser/signUpAgent
      form.reset(); // Reset form fields on success
    } else if (result && result.error) {
      // Toast message already handled by signUpUser/signUpAgent
      form.setError("email", { type: "manual", message: result.error.message });
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
            const newRole = value as UserRole;
            setActiveRoleTab(newRole);
            form.setValue('role', newRole, { shouldValidate: true }); // Update Zod's context
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
                        <Input placeholder="Adekunle Adebayo" {...field} className="pl-10"/>
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
                    name="phone" // Zod will expect this path for agent role
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="tel" placeholder="080X XXX XXXX" {...field} className="pl-10"/>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agency" // Zod will expect this path for agent role
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
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || authLoading}>
                {(form.formState.isSubmitting || authLoading) ? 'Registering...' : `Register as ${activeRoleTab === 'user' ? 'User' : 'Agent'}`}
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
