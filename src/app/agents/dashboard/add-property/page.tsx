
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
import { useState, useTransition } from 'react';
import { PlusCircle, UploadCloud, Home, MapPin, BedDouble, Bath, Maximize, CalendarDays, Image as ImageIcon, MapPinIcon as MapPinIconLucide } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { mockProperties } from '@/lib/mock-data';
import type { Property, Agent } from '@/lib/types';


const propertyFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  propertyType: z.enum(['House', 'Apartment', 'Condo', 'Townhouse', 'Land'], { required_error: "Property type is required."}),
  location: z.string().min(5, { message: 'Location (Area/City) is required.' }),
  address: z.string().min(5, { message: 'Full Address is required.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  bedrooms: z.coerce.number().min(0, { message: 'Bedrooms must be a non-negative number.' }),
  bathrooms: z.coerce.number().min(0, { message: 'Bathrooms must be a non-negative number.' }),
  areaSqFt: z.coerce.number().positive({ message: 'Area must be a positive number.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(5000, {message: "Description must be less than 5000 characters."}),
  yearBuilt: z.coerce.number().min(1000, {message: "Year built seems too old."}).max(new Date().getFullYear(), {message: "Year built cannot be in the future."}).optional().or(z.literal('')),
  amenities: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal('')),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal('')),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

// Helper functions for new ID format
function generateRandomDigit(): string {
  return Math.floor(Math.random() * 10).toString();
}

function generateRandomLetter(): string {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
}

function generatePropertyId(): string {
  const prefix = "HLCS-R"; // Removed curly braces
  const part1 = generateRandomDigit();
  const part2 = generateRandomLetter();
  const part3 = generateRandomDigit();
  const part4 = generateRandomLetter();
  const part5 = generateRandomDigit();
  const part6 = generateRandomLetter();
  return `${prefix}${part1}${part2}${part3}${part4}${part5}${part6}`;
}

export default function AddPropertyPage() {
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      propertyType: undefined,
      location: '',
      address: '',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      areaSqFt: 0,
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

      const newProperty: Property = {
        id: generatePropertyId(), // Use new ID generation function
        title: values.title,
        description: values.description,
        price: values.price,
        location: values.location,
        address: values.address,
        type: values.propertyType,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        areaSqFt: values.areaSqFt,
        images: [
          'https://placehold.co/600x400.png',
          'https://placehold.co/600x400.png'
        ],
        agent: currentAgent,
        amenities: values.amenities ? values.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
        yearBuilt: values.yearBuilt && values.yearBuilt !== '' ? Number(values.yearBuilt) : undefined,
        coordinates: {
          lat: values.latitude && values.latitude !== '' ? Number(values.latitude) : 6.5244, // Default to Lagos
          lng: values.longitude && values.longitude !== '' ? Number(values.longitude) : 3.3792, // Default to Lagos
        },
      };

      mockProperties.push(newProperty);
      
      toast({
        title: 'Property Listed!',
        description: `${values.title} has been successfully added to your listings with ID: ${newProperty.id}.`,
      });
      form.reset();
      router.push('/agents/dashboard/my-listings');
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <PlusCircle className="mr-3 h-8 w-8 text-primary" /> Add New Property
        </h1>
        <p className="text-muted-foreground">Fill in the details for your new listing.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Home className="w-4 h-4 mr-1 text-muted-foreground"/>Property Title</FormLabel>
                      <FormControl><Input placeholder="e.g., Beautiful 3-Bedroom Duplex" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Home className="w-4 h-4 mr-1 text-muted-foreground"/>Property Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="House">House</SelectItem>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="Condo">Condo</SelectItem>
                          <SelectItem value="Townhouse">Townhouse</SelectItem>
                          <SelectItem value="Land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-muted-foreground"/>Location (Area/City)</FormLabel>
                      <FormControl><Input placeholder="e.g., Lekki Phase 1, Lagos" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-muted-foreground"/>Full Address</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><CalendarDays className="w-4 h-4 mr-1 text-muted-foreground"/>Year Built (Optional)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 2005" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPinIconLucide className="w-4 h-4 mr-1 text-muted-foreground"/>Latitude (Optional)</FormLabel>
                      <FormControl><Input type="number" step="any" placeholder="e.g., 6.5244" {...field} /></FormControl>
                      <FormDescription>If blank, defaults to Lagos.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPinIconLucide className="w-4 h-4 mr-1 text-muted-foreground"/>Longitude (Optional)</FormLabel>
                      <FormControl><Input type="number" step="any" placeholder="e.g., 3.3792" {...field} /></FormControl>
                       <FormDescription>If blank, defaults to Lagos.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    <FormLabel className="flex items-center"><ImageIcon className="w-4 h-4 mr-1 text-muted-foreground"/>Amenities (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Pool, Gym, Borehole, Standby Generator" {...field} /></FormControl>
                    <FormDescription>Comma-separated list of amenities.</FormDescription>
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


              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || authLoading}>
                {isSubmitting ? 'Submitting...' : 'Add Property'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
