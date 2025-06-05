
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
import { useState, useTransition, useEffect, useCallback } from 'react';
import { PlusCircle, UploadCloud, Home, MapPin, BedDouble, Bath, Maximize, CalendarDays, Image as ImageIcon, MapPinIcon as MapPinIconLucide, Building2, Tag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { Agent, NigerianState, ListingType, PlatformSettings as PlatformSettingsType } from '@/lib/types';
import { nigerianStates, listingTypes } from '@/lib/types'; // Removed propertyTypes from here
import { supabase } from '@/lib/supabaseClient';
import type { TablesInsert } from '@/lib/database.types';
import { Skeleton } from '@/components/ui/skeleton';
import NextImage from 'next/image'; // Renamed to avoid conflict with Lucide's Image
import { uploadPropertyImages } from '@/actions/upload-images';

function generatePropertySpecificId(): string {
  const yearDigits = new Date().getFullYear().toString().slice(-2);
  const n1 = Math.floor(Math.random() * 10).toString();
  const a1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const n2 = Math.floor(Math.random() * 10).toString();
  const a2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const a3 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `HLC-R${yearDigits}${n1}${a1}${n2}${a2}${a3}`;
}

// Property type validation is now just a string, as the Select component enforces valid options from platform_settings
const propertyFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  listingType: z.enum(listingTypes, { required_error: "Listing type is required."}),
  propertyType: z.string({ required_error: "Property type is required." }).min(1, { message: "Property type is required."}),
  locationAreaCity: z.string().min(3, { message: 'Location (Area/City) is required.' }),
  state: z.enum(nigerianStates, { required_error: "State is required."}),
  address: z.string().min(5, { message: 'Full Address is required.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  bedrooms: z.coerce.number().min(0, { message: 'Bedrooms must be a non-negative number.' }).default(0),
  bathrooms: z.coerce.number().min(0, { message: 'Bathrooms must be a non-negative number.' }).default(0),
  areaSqFt: z.preprocess(
    val => (val === "" || val === undefined ? undefined : val),
    z.coerce.number().positive({ message: 'Area must be a positive number if provided.' }).optional()
  ),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(5000, {message: "Description must be less than 5000 characters."}),
  yearBuilt: z.preprocess(
    val => (val === "" || val === undefined ? undefined : val),
    z.coerce.number().min(1000, {message: "Year built seems too old."}).max(new Date().getFullYear(), {message: "Year built cannot be in the future."}).optional()
  ),
  amenities: z.string().optional(),
  latitude: z.preprocess(
    val => (val === "" || val === undefined ? undefined : val),
    z.coerce.number().min(-90).max(90).optional()
  ),
  longitude: z.preprocess(
    val => (val === "" || val === undefined ? undefined : val),
    z.coerce.number().min(-180).max(180).optional()
  ),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function AddPropertyPage() {
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsType | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const fetchPlatformSettings = useCallback(async () => {
    setLoadingSettings(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('property_types, predefined_amenities') // Only select what's needed
      .eq('id', 1)
      .single();

    if (error) {
      toast({ title: 'Error Fetching Settings', description: `Could not load platform settings: ${error.message}. Using defaults or placeholders.`, variant: 'destructive' });
      // Fallback to some very basic defaults if absolutely necessary or handle error more gracefully
      setPlatformSettings({
        propertyTypes: ['House', 'Apartment', 'Land'], // Basic fallback
        predefinedAmenities: 'Pool,Garage,Gym', // Basic fallback
        // Other settings not directly used on this page can be omitted or given defaults
        promotionsEnabled: false,
        promotionTiers: [],
        siteName: 'Homeland Capital',
        defaultCurrency: 'NGN',
        maintenanceMode: false,
        notificationEmail: '',
      });
    } else if (data) {
      setPlatformSettings({
        ...data,
        propertyTypes: data.property_types || ['House', 'Apartment', 'Land'],
        predefinedAmenities: data.predefined_amenities || 'Pool,Garage,Gym',
      } as PlatformSettingsType); // Cast assuming other necessary fields might be missing but are not critical here
    }
    setLoadingSettings(false);
  }, [toast]);

  useEffect(() => {
    fetchPlatformSettings();
  }, [fetchPlatformSettings]);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      listingType: undefined,
      propertyType: undefined,
      locationAreaCity: '',
      state: undefined,
      address: '',
      price: undefined,
      bedrooms: 0,
      bathrooms: 0,
      areaSqFt: undefined,
      description: '',
      yearBuilt: undefined,
      amenities: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...filesArray].slice(0, 10)); // Limit to 10 files

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


  async function onSubmit(values: PropertyFormValues) {
    startTransition(async () => {
      if (authLoading || !user || user.role !== 'agent') {
        toast({ title: 'Authentication Error', description: 'You must be logged in as an agent to add a property.', variant: 'destructive' });
        return;
      }

      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        try {
          const result = await uploadPropertyImages(formData);
          if (result.error) {
            toast({ title: 'Image Upload Failed', description: result.error, variant: 'destructive' });
            return;
          }
          imageUrls = result.urls || [];
        } catch (e: any) {
          toast({ title: 'Image Upload Error', description: `An unexpected error occurred during image upload: ${e.message}`, variant: 'destructive' });
          return;
        }
      }
      
      if (selectedFiles.length > 0 && imageUrls.length === 0) {
        toast({ title: 'Image Processing Issue', description: 'Images were selected but no URLs were returned after upload. Using placeholders.', variant: 'default' });
        imageUrls = ['https://placehold.co/600x400.png?text=Upload+Error1', 'https://placehold.co/600x401.png?text=Upload+Error2'];
      } else if (selectedFiles.length === 0) {
        imageUrls = ['https://placehold.co/600x400.png?text=No+Image1', 'https://placehold.co/600x401.png?text=No+Image2'];
      }


      const currentAgent = user as Agent;
      const generatedHumanReadableId = generatePropertySpecificId();

      const propertyDataToInsert: TablesInsert<'properties'> = {
        title: values.title,
        human_readable_id: generatedHumanReadableId,
        description: values.description,
        price: values.price,
        listing_type: values.listingType,
        location_area_city: values.locationAreaCity,
        state: values.state,
        address: values.address,
        property_type: values.propertyType as any, // This is a string; DB expects property_type_enum
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        area_sq_ft: values.areaSqFt ? Number(values.areaSqFt) : null,
        images: imageUrls,
        agent_id: currentAgent.id,
        status: 'pending',
        amenities: values.amenities ? values.amenities.split(',').map(a => a.trim()).filter(Boolean) : null,
        year_built: values.yearBuilt ? Number(values.yearBuilt) : null,
        coordinates_lat: values.latitude ? Number(values.latitude) : null,
        coordinates_lng: values.longitude ? Number(values.longitude) : null,
      };

      console.log("Attempting to insert property data:", JSON.stringify(propertyDataToInsert, null, 2));

      const { data: newProperty, error } = await supabase
        .from('properties')
        .insert(propertyDataToInsert)
        .select()
        .single();

      if (error) {
        console.error("Error saving property to DB. Raw error object:", error); 
        console.error("Data that was attempted to be inserted:", JSON.stringify(propertyDataToInsert, null, 2));
        
        let detailedErrorMessage = `Could not save property.`;
        // Type guard for Supabase PostgrestError
        if (typeof error === 'object' && error !== null && 'message' in error && 'code' in error) {
            const pgError = error as { message: string; code: string; details?: string; hint?: string };
            detailedErrorMessage += ` Supabase: ${pgError.message} (Code: ${pgError.code}).`;
            if (pgError.details) detailedErrorMessage += ` Details: ${pgError.details}.`;

            if (pgError.code === '23502' && pgError.message.includes("property_type")) { // null value in not-null column
                 detailedErrorMessage += ` The property type might be missing or invalid. Please ensure you select a valid property type.`;
            } else if (pgError.message.includes("invalid input value for enum property_type_enum") || pgError.message.includes("property_type_enum")) {
                 detailedErrorMessage += ` The selected property type '${values.propertyType}' is not valid according to the database. Please ensure the admin has configured this type correctly in the system and it matches the database enum.`;
            } else if (pgError.code === '23505' && pgError.message.includes("properties_human_readable_id_key")) { // duplicate key
                detailedErrorMessage += ` A property with a similar ID (${generatedHumanReadableId}) might already exist. Please try submitting again.`;
            }
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
             detailedErrorMessage += ` Message: ${(error as any).message}.`;
        } else if (typeof error === 'string') {
           detailedErrorMessage += ` Details: ${error}.`;
        } else {
          detailedErrorMessage += ` An unknown error occurred. Check console for the full error object.`;
        }

        toast({ title: 'Error Adding Property', description: detailedErrorMessage, variant: 'destructive', duration: 10000 });
        return;
      }

      toast({ title: 'Property Submitted for Review!', description: `${values.title} (ID: ${generatedHumanReadableId}) has been submitted. It will be reviewed by an admin.` });
      form.reset();
      setSelectedFiles([]);
      setImagePreviews([]);
      router.push('/agents/dashboard/my-listings');
    });
  }
  
  const dynamicPropertyTypes = platformSettings?.propertyTypes || [];
  const dynamicAmenitiesHint = platformSettings?.predefinedAmenities 
    ? `Admins have configured standard amenities like: ${platformSettings.predefinedAmenities.split(',').slice(0,3).join(', ')}...`
    : "E.g., Pool, Gym, Borehole.";


  if (loadingSettings || authLoading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-8 w-3/4 mb-6" />
            <Card className="shadow-xl">
                <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-1/3" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <PlusCircle className="mr-3 h-8 w-8 text-primary" /> Add New Property
        </h1>
        <p className="text-muted-foreground">Fill in the details for your new listing. A unique Property ID will be generated automatically.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Property Information</CardTitle>
          <CardDescription>Enter the specific details for the property.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-3">
                      <FormLabel className="flex items-center"><Home className="w-4 h-4 mr-1 text-muted-foreground"/>Property Title</FormLabel>
                      <FormControl><Input placeholder="e.g., Beautiful 3-Bedroom Duplex" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Tag className="w-4 h-4 mr-1 text-muted-foreground"/>Listing Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select listing type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {listingTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Building2 className="w-4 h-4 mr-1 text-muted-foreground"/>Property Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingSettings || dynamicPropertyTypes.length === 0}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dynamicPropertyTypes.length > 0 ? (
                            dynamicPropertyTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="-" disabled>Loading types or none configured</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {dynamicPropertyTypes.length === 0 && !loadingSettings && <FormDescription className="text-xs text-destructive">No property types configured by admin. Please contact them.</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="locationAreaCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-muted-foreground"/>Location (Area/City)</FormLabel>
                      <FormControl><Input placeholder="e.g., Ikeja GRA, Asokoro" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPinIconLucide className="w-4 h-4 mr-1 text-muted-foreground"/>State</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nigerianStates.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-3">
                      <FormLabel className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-muted-foreground"/>Full Street Address</FormLabel>
                      <FormControl><Input placeholder="e.g., 15 Adeola Odeku Street, Victoria Island, Lagos" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><span className="w-4 h-4 mr-1 text-muted-foreground font-bold">₦</span>Price</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 45000000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><BedDouble className="w-4 h-4 mr-1 text-muted-foreground"/>Bedrooms</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 3" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Bath className="w-4 h-4 mr-1 text-muted-foreground"/>Bathrooms</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="areaSqFt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Maximize className="w-4 h-4 mr-1 text-muted-foreground"/>Area (sq ft)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 1800" {...field} /></FormControl>
                       <FormDescription className="text-xs">Optional.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><CalendarDays className="w-4 h-4 mr-1 text-muted-foreground"/>Year Built</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 2005" {...field} /></FormControl>
                       <FormDescription className="text-xs">Optional.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-6 lg:col-span-1">
                    <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center"><MapPinIconLucide className="w-4 h-4 mr-1 text-muted-foreground"/>Latitude</FormLabel>
                        <FormControl><Input type="number" step="any" placeholder="e.g., 6.5244" {...field} /></FormControl>
                        <FormDescription className="text-xs">Optional.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center"><MapPinIconLucide className="w-4 h-4 mr-1 text-muted-foreground"/>Longitude</FormLabel>
                        <FormControl><Input type="number" step="any" placeholder="e.g., 3.3792" {...field} /></FormControl>
                        <FormDescription className="text-xs">Optional.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed property description..." {...field} rows={8} />
                    </FormControl>
                    <FormDescription>Provide a captivating description for the property.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><ImageIcon className="w-4 h-4 mr-1 text-muted-foreground"/>Amenities</FormLabel>
                    <FormControl><Input placeholder="e.g., Pool, Gym, Borehole, Standby Generator" {...field} /></FormControl>
                    <FormDescription>
                      Comma-separated list of amenities. Optional. {dynamicAmenitiesHint}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="flex items-center"><UploadCloud className="w-4 h-4 mr-1 text-muted-foreground"/>Property Images (Max 10)</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </FormControl>
                <FormDescription>Select one or more images for the property (Max 5MB per image, common formats like JPG, PNG).</FormDescription>
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((previewUrl, index) => (
                      <div key={index} className="relative group aspect-square">
                        <NextImage src={previewUrl} alt={`Preview ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={() => removeImage(index)}
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </FormItem>


              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || authLoading || loadingSettings}>
                {isSubmitting ? 'Submitting for Review...' : 'Submit Property for Review'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
