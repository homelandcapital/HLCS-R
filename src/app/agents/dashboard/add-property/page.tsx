'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import DescriptionGenerator from '@/components/ai/description-generator';
import { useState, useTransition } from 'react';
import { PlusCircle, UploadCloud, Home, DollarSign, MapPinIcon, BedDouble, Bath, Maximize, CalendarDays, Image as ImageIcon } from 'lucide-react';

// This schema is for the main property form, not the AI generator part
const propertyFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  propertyType: z.enum(['House', 'Apartment', 'Condo', 'Townhouse', 'Land']),
  location: z.string().min(5, { message: 'Location is required.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  bedrooms: z.coerce.number().min(0, { message: 'Bedrooms must be a non-negative number.' }),
  bathrooms: z.coerce.number().min(0, { message: 'Bathrooms must be a non-negative number.' }),
  areaSqFt: z.coerce.number().positive({ message: 'Area must be a positive number.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  yearBuilt: z.coerce.number().optional(),
  amenities: z.string().optional(), // Comma-separated
  // images: z.custom<FileList>().optional(), // For file uploads, not fully implemented here
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function AddPropertyPage() {
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const [descriptionFromAI, setDescriptionFromAI] = useState('');

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
    },
  });

  const handleDescriptionGenerated = (newDescription: string) => {
    setDescriptionFromAI(newDescription);
    form.setValue('description', newDescription, { shouldValidate: true });
  };

  function onSubmit(values: PropertyFormValues) {
    startTransition(async () => {
      console.log('Property data submitted:', values);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Property Listed!',
        description: `${values.title} has been successfully added to your listings.`,
      });
      form.reset();
      setDescriptionFromAI(''); // Clear AI description from view if needed
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

      <DescriptionGenerator onDescriptionGenerated={handleDescriptionGenerated} />

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Property Information</CardTitle>
          <CardDescription>
            Enter the specific details for the property. You can use the AI-generated description above or write your own.
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
                      <FormControl><Input placeholder="e.g., Beautiful 3-Bedroom Family Home" {...field} /></FormControl>
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
                      <FormLabel className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1 text-muted-foreground"/>Location (Neighborhood/City)</FormLabel>
                      <FormControl><Input placeholder="e.g., Willow Creek, Suburbia" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1 text-muted-foreground"/>Full Address</FormLabel>
                      <FormControl><Input placeholder="e.g., 123 Oak Street, City, State, Zip" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><DollarSign className="w-4 h-4 mr-1 text-muted-foreground"/>Price</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 450000" {...field} /></FormControl>
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
                      {descriptionFromAI ? "Using AI-generated description. Edit as needed." : "Provide a captivating description for the property."}
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
                    <FormControl><Input placeholder="e.g., Pool, Garage, Gym" {...field} /></FormControl>
                    <FormDescription>Comma-separated list of amenities.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Basic Image Upload Placeholder */}
              <FormItem>
                <FormLabel className="flex items-center"><UploadCloud className="w-4 h-4 mr-1 text-muted-foreground"/>Property Images</FormLabel>
                <FormControl>
                  <Input type="file" multiple disabled />
                  {/* File upload logic needs backend handling, so disabled for this scope */}
                </FormControl>
                <FormDescription>Select one or more images for the property. (Feature not fully implemented in this demo)</FormDescription>
              </FormItem>


              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Add Property'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
