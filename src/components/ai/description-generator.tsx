'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from '@/ai/flows/generate-property-description';
import { useState, useTransition } from 'react';
import { Sparkles, Bot, Home, MapPinIcon, BedDouble, Bath, Maximize, Info, List } from 'lucide-react';

const formSchema = z.object({
  propertyType: z.string().min(2, { message: 'Property type is required.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  bedrooms: z.coerce.number().min(0, { message: 'Bedrooms must be a positive number.' }),
  bathrooms: z.coerce.number().min(0, { message: 'Bathrooms must be a positive number.' }),
  squareFootage: z.coerce.number().min(1, { message: 'Square footage must be greater than 0.' }),
  keyFeatures: z.string().min(5, { message: 'Please list some key features.' }),
  additionalDetails: z.string().optional(),
});

type DescriptionFormValues = z.infer<typeof formSchema>;

interface DescriptionGeneratorProps {
  onDescriptionGenerated?: (description: string) => void;
}

const DescriptionGenerator = ({ onDescriptionGenerated }: DescriptionGeneratorProps) => {
  const { toast } = useToast();
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<DescriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyType: '',
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      squareFootage: 0,
      keyFeatures: '',
      additionalDetails: '',
    },
  });

  async function onSubmit(values: DescriptionFormValues) {
    startTransition(async () => {
      try {
        setGeneratedDescription(''); // Clear previous description
        const result = await generatePropertyDescription(values as GeneratePropertyDescriptionInput);
        if (result.description) {
          setGeneratedDescription(result.description);
          if (onDescriptionGenerated) {
            onDescriptionGenerated(result.description);
          }
          toast({
            title: 'Description Generated!',
            description: 'The AI has crafted a property description for you.',
          });
        } else {
          throw new Error('No description returned from AI.');
        }
      } catch (error) {
        console.error('Error generating description:', error);
        toast({
          title: 'Error Generating Description',
          description: (error as Error).message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-primary" /> AI Property Description Generator
        </CardTitle>
        <CardDescription>
          Enter property details and let our AI craft a compelling description for your listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Home className="w-4 h-4 mr-1 text-muted-foreground"/>Property Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., House, Apartment, Condo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1 text-muted-foreground"/>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sunnyvale, CA or Downtown" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Maximize className="w-4 h-4 mr-1 text-muted-foreground"/>Square Footage</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="keyFeatures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><List className="w-4 h-4 mr-1 text-muted-foreground"/>Key Features</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Hardwood floors, Granite countertops, Stainless steel appliances, Large backyard" {...field} rows={3}/>
                    </FormControl>
                    <FormDescription>Comma-separated list of key features.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Info className="w-4 h-4 mr-1 text-muted-foreground"/>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Recently renovated, Quiet neighborhood, Near public transport" {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
              {isPending ? (
                <>
                  <Bot className="animate-spin mr-2 h-4 w-4" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Description
                </>
              )}
            </Button>
          </form>
        </Form>

        {generatedDescription && (
          <div className="mt-8 p-4 border border-primary/20 rounded-lg bg-primary/5">
            <h3 className="text-lg font-headline mb-2 flex items-center text-primary">
              <Bot className="w-5 h-5 mr-2" /> Generated Description:
            </h3>
            <Textarea
              value={generatedDescription}
              readOnly
              rows={8}
              className="bg-background focus-visible:ring-primary"
            />
             <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                    navigator.clipboard.writeText(generatedDescription);
                    toast({title: "Copied!", description: "Description copied to clipboard."});
                }}
            >
                Copy to Clipboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DescriptionGenerator;
