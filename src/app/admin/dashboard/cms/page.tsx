
// src/app/admin/dashboard/cms/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Newspaper, Save } from 'lucide-react';
import { homePageContentData } from '@/lib/cms-data'; // Import mutable data

const heroFormSchema = z.object({
  title: z.string().min(5, { message: 'Hero title must be at least 5 characters.' }),
  subtitle: z.string().min(10, { message: 'Hero subtitle must be at least 10 characters.' }),
  ctaText: z.string().min(3, { message: 'CTA text must be at least 3 characters.' }),
  // ctaHref: z.string().url({ message: 'CTA link must be a valid URL.' }), // For simplicity, not making href editable yet
});

type HeroFormValues = z.infer<typeof heroFormSchema>;

export default function CmsManagementPage() {
  const { toast } = useToast();

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      title: homePageContentData.hero.title,
      subtitle: homePageContentData.hero.subtitle,
      ctaText: homePageContentData.hero.cta.text,
    },
  });

  function onSubmit(values: HeroFormValues) {
    // Update the mutable homePageContentData object
    homePageContentData.hero.title = values.title;
    homePageContentData.hero.subtitle = values.subtitle;
    homePageContentData.hero.cta.text = values.ctaText;
    // In a real app, this would be an API call to save to a database.
    // For now, we're directly mutating the imported object.
    // Pages importing this data will see the changes on next render/navigation.

    toast({
      title: 'Content Updated!',
      description: 'Homepage hero section has been updated successfully.',
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <Newspaper className="mr-3 h-8 w-8 text-primary" /> Content Management
        </h1>
        <p className="text-muted-foreground">Edit content for various parts of your website.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Homepage Hero Section</CardTitle>
          <CardDescription>
            Edit the main title, subtitle, and call-to-action button text for the homepage hero.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Welcome to Our Platform" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Subtitle</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Discover amazing things here..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call to Action Button Text</FormLabel>
                    <FormControl><Input placeholder="e.g., Learn More" {...field} /></FormControl>
                    <FormDescription>
                      The link for this button (currently '{homePageContentData.hero.cta.href}') is not editable from this form yet.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Saving...' : 'Save Hero Content'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Add more cards here for About, Services, Contact, Footer sections later */}
      <Card className="shadow-lg mt-8">
        <CardHeader>
            <CardTitle>Other Content Sections</CardTitle>
            <CardDescription>Editing for Services, About, Contact, and Footer content will be available here soon.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Stay tuned for more CMS features!</p>
        </CardContent>
      </Card>
    </div>
  );
}
