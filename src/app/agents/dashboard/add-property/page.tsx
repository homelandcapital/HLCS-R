
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
import { PlusCircle, UploadCloud, Home, MapPin, BedDouble, Bath, Maximize, CalendarDays, Image as ImageIcon, MapPinIcon as MapPinIconLucide, Building2, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { Agent, NigerianState, ListingType, PlatformSettings } from '@/lib/types';
import { nigerianStates, listingTypes } from '@/lib/types'; // Removed static propertyTypes import
import { supabase } from '@/lib/supabaseClient';
import type { TablesInsert } from '@/lib/database.types';
import { Skeleton } from '@/components/ui/skeleton';

function generatePropertySpecificId(): string {
  const yearDigits = new Date().getFullYear().toString().slice(-2);
  const n1 = Math.floor(Math.random() * 10).toString();
  const a1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const n2 = Math.floor(Math.random() * 10).toString();
  const a2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const a3 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `HLC-R${yearDigits}${n1}${a1}${n2}${a2}${a3}`;
}

const propertyFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  listingType: z.enum(listingTypes, { required_error: "Listing type is required."}),
  propertyType: z.string({ required_error: "Property type is required." }).min(1, { message: "Property type is required."}), // Changed from enum
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
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const fetchPlatformSettings = useCallback(async () => {
    setLoadingSettings(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1) // Assuming settings are stored in a single row with id=1
      .single();

    if (error) {
      toast({ title: 'Error Fetching Settings', description: `Could not load platform settings: ${error.message}. Using defaults or placeholders.`, variant: 'destructive' });
      // Set some fallback or indicate error in UI for property types
      setPlatformSettings({ // Minimal fallback
        propertyTypes: ['House', 'Apartment', 'Land'], // Basic fallback
        predefinedAmenities: 'Pool,Garage,Gym',
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
        propertyTypes: data.property_types || ['House', 'Apartment', 'Land'], // Ensure it's an array
        predefinedAmenities: data.predefined_amenities || 'Pool,Garage,Gym',
      });
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

  function onSubmit(values: PropertyFormValues) {
    startTransition(async () => {
      if (authLoading || !user || user.role !== 'agent') {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in as an agent to add a property.',
          variant: 'destructive',
        });
        return;
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
        property_type: values.propertyType as any, // Cast as any since DB enum will handle it
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        area_sq_ft: values.areaSqFt ? Number(values.areaSqFt) : null,
        images: [
          'https://placehold.co/600x400.png',
          'https://placehold.co/600x401.png'
        ],
        agent_id: currentAgent.id,
        status: 'pending',
        amenities: values.amenities ? values.amenities.split(',').map(a => a.trim()).filter(Boolean) : null,
        year_built: values.yearBuilt ? Number(values.yearBuilt) : null,
        coordinates_lat: values.latitude ? Number(values.latitude) : null,
        coordinates_lng: values.longitude ? Number(values.longitude) : null,
      };

      const { data: newProperty, error } = await supabase
        .from('properties')
        .insert(propertyDataToInsert)
        .select()
        .single();

      if (error) {
        console.error("Error saving property to DB:", error);
        toast({
          title: 'Error Adding Property',
          description: `Could not save property: ${error.message}. This could be due to a duplicate generated Property ID or invalid property type. Please try submitting again.`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Property Submitted for Review!',
        description: `${values.title} (ID: ${generatedHumanReadableId}) has been submitted. It will be reviewed by an admin.`,
      });
      form.reset();
      router.push('/agents/dashboard/my-listings');
    });
  }
  
  const dynamicPropertyTypes = platformSettings?.propertyTypes || [];

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
        <p className="text-muted-foreground">Fill in the details for your new listing. It will be reviewed by an admin before publishing. A unique Property ID will be generated automatically.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Property Information</CardTitle>
          <CardDescription>
            Enter the specific details for the property.
          </CardDescription>
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
                            <SelectItem value="-" disabled>No types configured</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {dynamicPropertyTypes.length === 0 && !loadingSettings && <FormDescription className="text-xs text-destructive">No property types configured by admin.</FormDescription>}
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
                    <FormDescription>
                      Provide a captivating description for the property.
                    </FormDescription>
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
                      Comma-separated list of amenities. Optional.
                      {platformSettings?.predefinedAmenities && ` Admins have configured standard amenities like: ${platformSettings.predefinedAmenities.split(',').slice(0,3).join(', ')}...`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="flex items-center"><UploadCloud className="w-4 h-4 mr-1 text-muted-foreground"/>Property Images</FormLabel>
                <FormControl>
                  <Input type="file" multiple disabled />
                </FormControl>
                <FormDescription>Select one or more images for the property. (Backend file upload not implemented; default images will be used.)</FormDescription>
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
