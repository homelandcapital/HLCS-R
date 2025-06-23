
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
import { PlusCircle, UploadCloud, Wrench, MapPin, CalendarDays, Image as ImageIcon, MapPinIcon as MapPinIconLucide, Tag, X, FileJson, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { Agent, NigerianState, MachineryCondition } from '@/lib/types';
import { nigerianStates, machineryConditions } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import type { TablesInsert } from '@/lib/database.types';
import { Skeleton } from '@/components/ui/skeleton';
import NextImage from 'next/image';
import { uploadMachineryImages } from '@/actions/upload-images';

function generateMachineryId(): string {
  const yearDigits = new Date().getFullYear().toString().slice(-2);
  const n1 = Math.floor(Math.random() * 10).toString();
  const a1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const n2 = Math.floor(Math.random() * 10).toString();
  const a2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const a3 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `HLC-M${yearDigits}${n1}${a1}${n2}${a2}${a3}`;
}

const machineryFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  category: z.string().min(3, { message: 'Category is required (e.g., Tractor, Excavator).' }),
  condition: z.enum(machineryConditions, { required_error: "Condition is required." }),
  location_city: z.string().min(3, { message: 'Location city is required.' }),
  state: z.enum(nigerianStates, { required_error: "State is required." }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.preprocess(
    val => (val === "" || val === undefined ? undefined : String(val).trim() === "" ? undefined : val),
    z.coerce.number().min(1900, {message: "Year seems too old."}).max(new Date().getFullYear() + 1, {message: "Year cannot be too far in the future."}).optional()
  ),
  specifications: z.string().optional().refine(val => {
    if (!val || val.trim() === '') return true;
    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Specifications must be a valid JSON object." }),
});

type MachineryFormValues = z.infer<typeof machineryFormSchema>;

export default function AddMachineryPage() {
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<MachineryFormValues>({
    resolver: zodResolver(machineryFormSchema),
    defaultValues: {
      title: '',
      category: '',
      condition: undefined,
      location_city: '',
      state: undefined,
      price: '' as any,
      description: '',
      manufacturer: '',
      model: '',
      year: '' as any,
      specifications: '',
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

  async function onSubmit(values: MachineryFormValues) {
    startTransition(async () => {
      if (authLoading || !user || user.role !== 'agent') {
        toast({ title: 'Authentication Error', description: 'You must be logged in as an agent.', variant: 'destructive' });
        return;
      }

      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        const result = await uploadMachineryImages(formData);
        if (result.error) {
          toast({ title: 'Image Upload Failed', description: result.error, variant: 'destructive' });
          return;
        }
        imageUrls = result.urls || [];
      }

      const generatedHumanReadableId = generateMachineryId();

      const machineryDataToInsert: TablesInsert<'machinery'> = {
        human_readable_id: generatedHumanReadableId,
        title: values.title,
        description: values.description,
        price: values.price,
        category: values.category,
        condition: values.condition,
        location_city: values.location_city,
        state: values.state,
        manufacturer: values.manufacturer || null,
        model: values.model || null,
        year: values.year || null,
        images: imageUrls.length > 0 ? imageUrls : null,
        specifications: values.specifications ? JSON.parse(values.specifications) : null,
        agent_id: user.id,
        status: 'pending',
      };

      const { error } = await supabase.from('machinery').insert(machineryDataToInsert);

      if (error) {
        console.error("Error saving machinery to DB:", error);
        toast({ title: 'Error Adding Machinery', description: `Could not save listing: ${error.message}`, variant: 'destructive' });
        return;
      }

      toast({ title: 'Machinery Submitted for Review!', description: `${values.title} has been submitted.` });
      form.reset();
      setSelectedFiles([]);
      setImagePreviews([]);
      router.push('/agents/dashboard/my-machinery');
    });
  }

  if (authLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <PlusCircle className="mr-3 h-8 w-8 text-primary" /> Add New Machinery
        </h1>
        <p className="text-muted-foreground">Fill in the details for your new machinery listing.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Machinery Information</CardTitle>
          <CardDescription>Enter the specific details for the machinery.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => ( <FormItem className="lg:col-span-3"> <FormLabel className="flex items-center"><Wrench className="w-4 h-4 mr-1"/>Title</FormLabel> <FormControl><Input placeholder="e.g., 2018 Caterpillar 320D Excavator" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <FormControl><Input placeholder="e.g., Construction, Agriculture" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem> <FormLabel>Condition</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl> <SelectContent>{machineryConditions.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><DollarSign className="w-4 h-4 mr-1"/>Price</FormLabel> <FormControl><Input type="number" placeholder="e.g., 15000000" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="location_city" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><MapPin className="w-4 h-4 mr-1"/>Location City</FormLabel> <FormControl><Input placeholder="e.g., Port Harcourt" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="state" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><MapPinIconLucide className="w-4 h-4 mr-1"/>State</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl> <SelectContent>{nigerianStates.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="manufacturer" render={({ field }) => ( <FormItem> <FormLabel>Manufacturer (Optional)</FormLabel> <FormControl><Input placeholder="e.g., Caterpillar" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="model" render={({ field }) => ( <FormItem> <FormLabel>Model (Optional)</FormLabel> <FormControl><Input placeholder="e.g., 320D" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="year" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><CalendarDays className="w-4 h-4 mr-1"/>Year (Optional)</FormLabel> <FormControl><Input type="number" placeholder="e.g., 2018" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea placeholder="Detailed machinery description..." {...field} rows={6} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="specifications" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><FileJson className="w-4 h-4 mr-1"/>Specifications (Optional)</FormLabel> <FormControl><Textarea placeholder='Enter as valid JSON, e.g., { "Horsepower": "200hp", "Operating Weight": "5000kg" }' {...field} value={field.value || ''} rows={4} /></FormControl> <FormDescription>Provide key-value specifications in JSON format.</FormDescription> <FormMessage /> </FormItem> )} />
              
              <FormItem>
                <FormLabel className="flex items-center"><UploadCloud className="w-4 h-4 mr-1"/>Machinery Images (Max 10)</FormLabel>
                <FormControl>
                  <Input type="file" multiple onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </FormControl>
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((previewUrl, index) => (
                      <div key={index} className="relative group aspect-square">
                        <NextImage src={previewUrl} alt={`Preview ${index + 1}`} fill objectFit="cover" className="rounded-md" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`} > <X className="h-4 w-4" /> </Button>
                      </div>
                    ))}
                  </div>
                )}
              </FormItem>

              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || authLoading}>
                {isSubmitting ? 'Submitting for Review...' : 'Submit Machinery for Review'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
