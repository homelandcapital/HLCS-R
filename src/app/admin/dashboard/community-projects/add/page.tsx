
// src/app/admin/dashboard/community-projects/add/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition, useEffect, useCallback } from 'react';
import { PlusCircle, UploadCloud, Link as LinkIcon, DollarSign, Users2, Image as ImageIcon, X, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { CommunityProjectCategory, PlatformAdmin, CommunityProjectStatus } from '@/lib/types';
import { communityProjectCategories } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import type { TablesInsert } from '@/lib/database.types';
import { Skeleton } from '@/components/ui/skeleton';
import NextImage from 'next/image';
import { uploadPropertyImages } from '@/actions/upload-images';

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
  brochure_link: z.string().url({ message: "Please enter a valid URL for the brochure." }).optional().or(z.literal('')),
  budget_tiers: z.array(z.string()).min(1, { message: "At least one budget tier must be selected." }),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function AddCommunityProjectPage() {
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const router = useRouter();
  const { user, loading: authLoading, platformSettings } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [availableBudgetTiers, setAvailableBudgetTiers] = useState<string[]>([]);

  useEffect(() => {
    if (platformSettings && platformSettings.configuredCommunityBudgetTiers) {
      setAvailableBudgetTiers(platformSettings.configuredCommunityBudgetTiers.split(',').map(t => t.trim()).filter(Boolean));
    } else {
      setAvailableBudgetTiers([]);
    }
  }, [platformSettings]);


  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      category: undefined,
      description: '',
      brochure_link: '',
      budget_tiers: [],
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...filesArray].slice(0, 10)); 
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews].slice(0, 10));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prevPreviews => {
      const newPreviews = prevPreviews.filter((_, index) => index !== indexToRemove);
      if (prevPreviews[indexToRemove]) {
        URL.revokeObjectURL(prevPreviews[indexToRemove]);
      }
      return newPreviews;
    });
  };
  
  useEffect(() => {
    return () => {
      imagePreviews.forEach(previewUrl => URL.revokeObjectURL(previewUrl));
    };
  }, [imagePreviews]);


  async function onSubmit(values: ProjectFormValues) {
    startTransition(async () => {
      console.log('[onSubmit] Transition started');
      try {
        if (authLoading || !user || user.role !== 'platform_admin') {
          toast({ title: 'Authentication Error', description: 'You must be logged in as an admin.', variant: 'destructive' });
          console.log('[onSubmit] Auth check failed, returning.');
          return;
        }

        let imageUrls: string[] = [];
        if (selectedFiles.length > 0) {
          const formData = new FormData();
          selectedFiles.forEach(file => {
            formData.append('files', file);
          });
          
          console.log('[onSubmit] Starting image upload...');
          const uploadResult = await uploadPropertyImages(formData);
          console.log('[onSubmit] Image upload finished. Result:', uploadResult);

          if (uploadResult.error) {
            toast({ title: 'Image Upload Failed', description: uploadResult.error, variant: 'destructive' });
            console.log('[onSubmit] Image upload error, returning.');
            return; 
          }
          imageUrls = uploadResult.urls || [];
        } else {
          console.log('[onSubmit] No files to upload.');
        }
        
        const currentAdmin = user as PlatformAdmin;
        const generatedHumanReadableId = generateCommunityProjectId();

        const projectDataToInsert: TablesInsert<'community_projects'> = {
          human_readable_id: generatedHumanReadableId,
          title: values.title,
          category: values.category,
          description: values.description,
          brochure_link: values.brochure_link || null,
          budget_tier: values.budget_tiers,
          images: imageUrls.length > 0 ? imageUrls : ['https://placehold.co/600x400.png?text=Project+Image'], 
          status: 'Ongoing' as CommunityProjectStatus,
          managed_by_user_id: currentAdmin.id,
        };
        
        console.log('[onSubmit] Starting database insert...', projectDataToInsert);
        const { data: newProject, error: dbError } = await supabase
          .from('community_projects')
          .insert(projectDataToInsert)
          .select()
          .single();
        console.log('[onSubmit] Database insert finished. Error:', dbError, 'Data:', newProject);

        if (dbError) {
          console.error("Error saving project to DB:", dbError);
          toast({ title: 'Error Adding Project', description: `Could not save project: ${dbError.message}`, variant: 'destructive' });
          console.log('[onSubmit] DB insert error, returning.');
          return;
        }

        toast({ title: 'Community Project Published!', description: `${values.title} (ID: ${generatedHumanReadableId}) has been added and is now live.` });
        form.reset();
        setSelectedFiles([]);
        setImagePreviews([]); 
        router.push('/admin/dashboard/community-projects');
        console.log('[onSubmit] Submission successful.');

      } catch (error: any) {
        console.error("[onSubmit] Critical error during project submission process:", error);
        toast({ title: 'Critical Submission Error', description: `An critical error occurred: ${error.message || 'Unknown error. Check console.'}`, variant: 'destructive' });
      } finally {
        console.log('[onSubmit] Transition block finished.');
      }
    });
  }
 
  if (authLoading || (platformSettings === null && !authLoading) ) {
    return <Skeleton className="h-[500px] w-full" />;
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
        <p className="text-muted-foreground">Fill in the details for the new community project. It will be published immediately with an "Ongoing" status.</p>
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
                <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><Package className="w-4 h-4 mr-1"/>Category</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select project category" /></SelectTrigger></FormControl> <SelectContent>{communityProjectCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea placeholder="Detailed description of the project, its goals, and impact..." {...field} rows={5} /></FormControl> <FormMessage /> </FormItem> )} />
              
              <FormField control={form.control} name="brochure_link" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><LinkIcon className="w-4 h-4 mr-1"/>Brochure Link (Optional)</FormLabel> <FormControl><Input type="url" placeholder="https://example.com/brochure.pdf" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )} />
                 
                <FormField
                  control={form.control}
                  name="budget_tiers"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel className="text-base flex items-center"><DollarSign className="w-4 h-4 mr-1"/>Budget Tiers</FormLabel>
                        <FormDescription>
                          Select one or more applicable budget tiers for this project.
                        </FormDescription>
                      </div>
                      {availableBudgetTiers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {availableBudgetTiers.map((tierName) => (
                            <FormField
                              key={tierName}
                              control={form.control}
                              name="budget_tiers"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={tierName}
                                    className="flex flex-row items-center space-x-2 space-y-0 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(tierName)}
                                        onCheckedChange={(checked) => {
                                          const currentTiers = field.value || [];
                                          return checked
                                            ? field.onChange([...currentTiers, tierName])
                                            : field.onChange(
                                                currentTiers.filter(
                                                  (value) => value !== tierName
                                                )
                                              )
                                        }}
                                        id={`tier-${tierName.replace(/\s+/g, '-')}`}
                                      />
                                    </FormControl>
                                    <FormLabel htmlFor={`tier-${tierName.replace(/\s+/g, '-')}`} className="font-normal text-sm cursor-pointer flex-grow">
                                      {tierName}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No budget tiers configured yet by admin.</p>
                      )}
                      {availableBudgetTiers.length === 0 && platformSettings && !platformSettings.configuredCommunityBudgetTiers?.trim() && (
                        <FormDescription className="text-xs text-destructive">
                          Budget tiers not configured by admin. Please set them in Platform Settings.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormItem>
                <FormLabel className="flex items-center"><ImageIcon className="w-4 h-4 mr-1 text-muted-foreground"/>Project Images (Max 10)</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </FormControl>
                <FormDescription>Select one or more images for the project.</FormDescription>
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((previewUrl, index) => (
                      <div key={index} className="relative group aspect-square">
                        <NextImage src={previewUrl} alt={`Preview ${index + 1}`} fill style={{objectFit:"cover"}} className="rounded-md" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={() => removeImage(index)}
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </FormItem>
              
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || authLoading}>
                {isSubmitting ? 'Publishing Project...' : 'Publish Community Project'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
    
