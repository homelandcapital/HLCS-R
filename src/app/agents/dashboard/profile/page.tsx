
// src/app/agents/dashboard/profile/page.tsx
'use client';

import { useAuth } from '@/contexts/auth-context';
import type { Agent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, Mail, Phone, Briefcase, Edit2, UploadCloud, FileCheck2, Save, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateAgentProfile } from '@/actions/agent-actions';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  agency: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function AgentProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const agent = user as Agent;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', phone: '', agency: '' },
  });

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name || '',
        phone: agent.phone || '',
        agency: agent.agency || '',
      });
    }
  }, [agent, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };
  
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);


  async function onSubmit(values: ProfileFormValues) {
    if (!agent) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('phone', values.phone);
      formData.append('agency', values.agency || '');
      if (selectedFile) {
        formData.append('government_id', selectedFile);
      }

      const result = await updateAgentProfile(agent.id, formData);

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        await refreshUser(); // Refresh user data in context
        setSelectedFile(null);
        removeImage();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  }

  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card><CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!user || user.role !== 'agent') {
    return (
      <div className="text-center py-12"><h1 className="text-2xl font-headline">Access Denied</h1><p className="text-muted-foreground">This page is for agents only.</p><Button asChild className="mt-4"><Link href="/">Go to Homepage</Link></Button></div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <UserCircle className="mr-3 h-8 w-8 text-primary" /> My Profile
        </h1>
        <p className="text-muted-foreground">View and manage your account details.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 space-y-4 sm:space-y-0">
                <Avatar className="h-28 w-28 border-2 border-primary">
                  <AvatarImage src={agent.avatar_url || 'https://placehold.co/128x128.png'} alt={agent.name} />
                  <AvatarFallback>{agent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm">Full Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} className="text-2xl font-headline h-auto p-1 border-0 border-b-2 rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <p className="text-lg text-muted-foreground mt-1">{agent.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center"><Phone className="w-4 h-4 mr-1"/>Phone Number</FormLabel><FormControl><Input placeholder="Your phone number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="agency" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center"><Briefcase className="w-4 h-4 mr-1"/>Agency (Optional)</FormLabel><FormControl><Input placeholder="Your agency name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center"><FileCheck2 className="mr-2 h-5 w-5 text-muted-foreground" /> Government-Issued ID</CardTitle>
              <CardDescription>Upload a clear image of your government-issued ID for verification purposes. This enhances trust on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {agent.government_id_url && !imagePreview && (
                <div>
                  <Label>Current ID on File</Label>
                  <div className="mt-2 relative w-full max-w-sm h-48 rounded-md overflow-hidden border">
                    <NextImage src={agent.government_id_url} alt="Government ID" layout="fill" objectFit="contain" />
                  </div>
                </div>
              )}
              
              <FormItem>
                <FormLabel className="flex items-center"><UploadCloud className="w-4 h-4 mr-1"/>{agent.government_id_url ? 'Upload New ID' : 'Upload ID'}</FormLabel>
                <FormControl><Input type="file" onChange={handleFileChange} accept="image/jpeg, image/png, image/webp" /></FormControl>
                <FormDescription>Accepted formats: JPG, PNG, WEBP. Max size: 5MB.</FormDescription>
              </FormItem>

              {imagePreview && (
                <div>
                  <Label>New ID Preview</Label>
                  <div className="mt-2 relative group w-full max-w-sm h-48 rounded-md overflow-hidden border">
                    <NextImage src={imagePreview} alt="New ID Preview" layout="fill" objectFit="contain" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={removeImage} aria-label="Remove image">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting || !form.formState.isDirty && !selectedFile}>
              <Save className="mr-2 h-5 w-5" /> {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
