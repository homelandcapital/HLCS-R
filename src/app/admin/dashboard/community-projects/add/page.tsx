
// src/app/admin/dashboard/community-projects/add/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition, useEffect } from 'react';
import { PlusCircle, UploadCloud, Users2, MapPin, DollarSign, CalendarDays, Briefcase, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { NigerianState, CommunityProjectCategory, CommunityProjectStatus, PlatformAdmin } from '@/lib/types';
import { nigerianStates, communityProjectCategories, communityProjectStatuses } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import type { TablesInsert } from '@/lib/database.types';
import { Skeleton } from '@/components/ui/skeleton';
// import { uploadPropertyImages } from '@/actions/upload-images'; // TODO: Adapt for community project images if needed

function generateCommunityProjectId(): string {
  const yearDigits = new Date().getFullYear().toString().slice(-2);
  const n1 = Math.floor(Math.random() * 10).toString();
  const a1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const n2 = Math.floor(Math.random() * 10).toString();
  const a2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const a3 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `HLC-CP${yearDigits}${n1}${a1}${n2}${a2}${a3}`;
}

const projectFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  category: z.enum(communityProjectCategories as [CommunityProjectCategory, ...CommunityProjectCategory[]], { required_error: "Project category is required."}),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  location_description: z.string().min(5, { message: 'Location description is required.' }),
  state: z.enum(nigerianStates, { required_error: "State is required."}),
  status: z.enum(communityProjectStatuses as [CommunityProjectStatus, ...CommunityProjectStatus[]], { required_error: "Project status is required."}),
  organization_name: z.string().optional(),
  contact_email: z.string().email({ message: "Invalid email format."}).optional().or(z.literal('')),
  funding_goal: z.preprocess(val => (val === "" || val === undefined ? undefined : Number(val)), z.number().positive({ message: 'Funding goal must be positive if provided.' }).optional()),
  current_funding: z.preprocess(val => (val === "" || val === undefined ? 0 : Number(val)), z.number().min(0, { message: 'Current funding cannot be negative.' }).optional().default(0)),
  start_date: z.preprocess(val => (val ? new Date(val as string).toISOString().split('T')[0] : undefined), z.string().optional()),
  expected_completion_date: z.preprocess(val => (val ? new Date(val as string).toISOString().split('T')[0] : undefined), z.string().optional()),
  // images field will be handled separately
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function AddCommunityProjectPage() {
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // const [imagePreviews, setImagePreviews] = useState<string[]>([]); // For image previews if implemented

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      category: undefined,
      description: '',
      location_description: '',
      state: undefined,
      status: 'Planning',
      organization_name: '',
      contact_email: '',
      funding_goal: undefined,
      current_funding: 0,
      start_date: undefined,
      expected_completion_date: undefined,
    },
  });

  // File handling (simplified for now, assumes URL input or separate upload mechanism)
  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files) {
  //     // Placeholder for actual file handling and preview logic
  //   }
  // };

  async function onSubmit(values: ProjectFormValues) {
    startTransition(async () => {
      if (authLoading || !user || user.role !== 'platform_admin') {
        toast({ title: 'Authentication Error', description: 'You must be logged in as an admin.', variant: 'destructive' });
        return;
      }

      // Image upload logic would go here if using a direct uploader.
      // For now, we'll assume images are URLs added manually or later.
      const imageUrls: string[] = ['https://placehold.co/600x400.png?text=Project+Image']; 
      
      const currentAdmin = user as PlatformAdmin;
      const generatedHumanReadableId = generateCommunityProjectId();

      const projectDataToInsert: TablesInsert<'community_projects'> = {
        human_readable_id: generatedHumanReadableId,
        title: values.title,
        category: values.category,
        description: values.description,
        location_description: values.location_description,
        state: values.state,
        status: values.status,
        organization_name: values.organization_name || null,
        contact_email: values.contact_email || null,
        funding_goal: values.funding_goal ? Number(values.funding_goal) : null,
        current_funding: values.current_funding ? Number(values.current_funding) : 0,
        start_date: values.start_date || null,
        expected_completion_date: values.expected_completion_date || null,
        images: imageUrls, 
        managed_by_user_id: currentAdmin.id,
      };

      const { data: newProject, error } = await supabase
        .from('community_projects')
        .insert(projectDataToInsert)
        .select()
        .single();

      if (error) {
        console.error("Error saving project to DB:", error);
        toast({ title: 'Error Adding Project', description: `Could not save project: ${error.message}`, variant: 'destructive' });
        return;
      }

      toast({ title: 'Community Project Added!', description: `${values.title} (ID: ${generatedHumanReadableId}) has been added.` });
      form.reset();
      // setSelectedFiles([]);
      // setImagePreviews([]);
      router.push('/admin/dashboard/community-projects');
    });
  }

  if (authLoading) {
    return <Skeleton className="h-[500px] w-full" />; // Basic loading state
  }
   if (user?.role !== 'platform_admin') {
     return ( <div className="text-center py-12"> <h1 className="text-2xl font-headline">Access Denied</h1> <p className="text-muted-foreground">This page is for platform administrators only.</p> </div> );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <PlusCircle className="mr-3 h-8 w-8 text-primary" /> Add New Community Project
        </h1>
        <p className="text-muted-foreground">Fill in the details for the new community project. A unique ID will be generated.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><Users2 className="w-4 h-4 mr-1"/>Project Title</FormLabel> <FormControl><Input placeholder="e.g., Clean Water Initiative for XYZ Village" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select project category" /></SelectTrigger></FormControl> <SelectContent>{communityProjectCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea placeholder="Detailed description of the project, its goals, and impact..." {...field} rows={5} /></FormControl> <FormMessage /> </FormItem> )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="location_description" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><MapPin className="w-4 h-4 mr-1"/>Location Description</FormLabel> <FormControl><Input placeholder="e.g., Villages in Ogbomosho South LGA" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="state" render={({ field }) => ( <FormItem> <FormLabel>State</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl> <SelectContent>{nigerianStates.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select project status" /></SelectTrigger></FormControl> <SelectContent>{communityProjectStatuses.map(s => (<SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="organization_name" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><Briefcase className="w-4 h-4 mr-1"/>Organization (Optional)</FormLabel> <FormControl><Input placeholder="e.g., XYZ Foundation" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="contact_email" render={({ field }) => ( <FormItem> <FormLabel>Contact Email (Optional)</FormLabel> <FormControl><Input type="email" placeholder="contact@organization.org" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="funding_goal" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><DollarSign className="w-4 h-4 mr-1"/>Funding Goal (NGN, Optional)</FormLabel> <FormControl><Input type="number" placeholder="e.g., 5000000" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="current_funding" render={({ field }) => ( <FormItem> <FormLabel>Current Funding (NGN, Optional)</FormLabel> <FormControl><Input type="number" placeholder="e.g., 1500000" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="start_date" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><CalendarDays className="w-4 h-4 mr-1"/>Start Date (Optional)</FormLabel> <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="expected_completion_date" render={({ field }) => ( <FormItem> <FormLabel>Expected Completion (Optional)</FormLabel> <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )} />
              </div>
              {/* Placeholder for Image Upload - To be implemented more fully later */}
              <FormItem> <FormLabel className="flex items-center"><UploadCloud className="w-4 h-4 mr-1"/>Project Images (URLs for now)</FormLabel> <FormControl><Input placeholder="Enter comma-separated image URLs" /></FormControl> <FormDescription>For now, please provide URLs. Direct upload coming soon.</FormDescription> </FormItem>
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || authLoading}>
                {isSubmitting ? 'Adding Project...' : 'Add Community Project'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
