
// src/app/admin/dashboard/cms/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import type { HomePageContent, AboutPageContent, ServicesPageContent, ContactPageContentNew, OfficeDetails } from '@/lib/types';
import {
  homePageContentData as defaultHomePageContent,
  aboutPageContentData as defaultAboutPageContent,
  servicesPageContentData as defaultServicesPageContent,
  contactPageContentData as defaultContactPageContent,
} from '@/lib/cms-data';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Newspaper, Save, Home, Info, Briefcase, Mail, PlusCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Zod Schemas for Validation
const CmsLinkSchema = z.object({ text: z.string().min(1), href: z.string().min(1) });
const HeroSlideSchema = z.object({
  titleLines: z.array(z.string().min(1)).min(1),
  subtitle: z.string().optional(),
  cta: CmsLinkSchema,
  backgroundImageUrl: z.string().url(),
  backgroundImageAlt: z.string().min(1),
});
const HomePageServiceItemSchema = z.object({
  iconName: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});
const HomePageFindHomeFeatureSchema = z.object({
  iconName: z.string().min(1),
  text: z.string().min(1),
  subtext: z.string().min(1),
});
const HomePageProjectSectionSchema = z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1),
    imageUrl: z.string().url(),
    imageAlt: z.string().min(1),
    cta: CmsLinkSchema,
    imagePosition: z.enum(['left', 'right']),
});

const HomePageContentSchema = z.object({
  hero: z.object({ slides: z.array(HeroSlideSchema).min(1) }),
  ourServices: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    items: z.array(HomePageServiceItemSchema).min(1),
  }),
  findYourHome: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    features: z.array(HomePageFindHomeFeatureSchema).min(1),
    imageUrl: z.string().url(),
    imageAlt: z.string().min(1),
    cta: CmsLinkSchema,
  }),
  developmentProjects: HomePageProjectSectionSchema,
  communityOutreach: HomePageProjectSectionSchema,
});

const AboutPageContentSchema = z.object({
  pageTitle: z.string().min(1),
  heroSection: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    imageUrl: z.string().url(),
    imageAlt: z.string().min(1),
    badgeText: z.string().min(1),
  }),
  servicesSection: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    items: z.array(z.object({
      iconName: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
    })).min(1),
  }),
});

const ServiceGridItemSchema = z.object({
  iconName: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const ServicesPageContentSchema = z.object({
  pageTitle: z.string().min(1),
  headerTitle: z.string().min(1),
  headerSubtitle: z.string().min(1),
  mainCategories: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })).min(1),
  propertyVerificationSection: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    items: z.array(ServiceGridItemSchema).min(1),
  }),
  detailedVerificationSection: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    items: z.array(ServiceGridItemSchema).min(1),
  }),
  cta: CmsLinkSchema,
});

const OfficeDetailsSchema = z.object({
    tabName: z.string().min(1),
    name: z.string().min(1),
    address: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    mapCoordinates: z.object({ lat: z.number(), lng: z.number() }),
    mapTitle: z.string().min(1),
});

const ContactPageContentSchema = z.object({
    pageTitle: z.string().min(1),
    headerTitle: z.string().min(1),
    headerSubtitle: z.string().min(1),
    formSection: z.object({
        title: z.string().min(1),
        inquiryTypes: z.array(z.string().min(1)).min(1),
    }),
    officesSection: z.object({
        title: z.string().min(1),
        headquarters: OfficeDetailsSchema,
        regionalOffice: OfficeDetailsSchema.optional(),
    }),
    businessHoursSection: z.object({
        title: z.string().min(1),
        hours: z.array(z.object({ day: z.string().min(1), time: z.string().min(1) })).min(1),
    }),
    investorRelationsSection: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
    }),
});


type PageId = "home" | "about" | "services" | "contact";

export default function CmsManagementPage() {
  const { toast } = useToast();
  const [isUiBlockingLoading, setIsUiBlockingLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PageId>("home");

  const homeForm = useForm<HomePageContent>({
    resolver: zodResolver(HomePageContentSchema),
    defaultValues: defaultHomePageContent,
  });
  const { fields: heroSlidesFields, append: appendHeroSlide, remove: removeHeroSlide } = useFieldArray({ control: homeForm.control, name: "hero.slides" });
  const { fields: ourServicesItemsFields, append: appendOurServicesItem, remove: removeOurServicesItem } = useFieldArray({ control: homeForm.control, name: "ourServices.items" });
  const { fields: findYourHomeFeaturesFields, append: appendFindYourHomeFeature, remove: removeFindYourHomeFeature } = useFieldArray({ control: homeForm.control, name: "findYourHome.features" });

  const aboutForm = useForm<AboutPageContent>({ resolver: zodResolver(AboutPageContentSchema), defaultValues: defaultAboutPageContent });
  
  const servicesForm = useForm<ServicesPageContent>({ resolver: zodResolver(ServicesPageContentSchema), defaultValues: defaultServicesPageContent });
  const { fields: mainCategoriesFields, append: appendMainCategory, remove: removeMainCategory } = useFieldArray({ control: servicesForm.control, name: "mainCategories" });
  const { fields: propertyVerificationItemsFields, append: appendPropertyVerificationItem, remove: removePropertyVerificationItem } = useFieldArray({ control: servicesForm.control, name: "propertyVerificationSection.items" });
  const { fields: detailedVerificationItemsFields, append: appendDetailedVerificationItem, remove: removeDetailedVerificationItem } = useFieldArray({ control: servicesForm.control, name: "detailedVerificationSection.items" });


  const contactForm = useForm<ContactPageContentNew>({ resolver: zodResolver(ContactPageContentSchema), defaultValues: defaultContactPageContent });


  const loadPageContent = useCallback(async (pageId: PageId) => {
    setIsUiBlockingLoading(true);
    const { data, error } = await supabase
      .from('page_content')
      .select('content')
      .eq('page_id', pageId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: row not found, which is fine
      toast({ title: `Error loading ${pageId} content`, description: error.message, variant: 'destructive' });
    }

    const contentToLoad = data?.content as any;

    switch (pageId) {
      case 'home':
        homeForm.reset(contentToLoad || defaultHomePageContent);
        break;
      case 'about':
        aboutForm.reset(contentToLoad || defaultAboutPageContent);
        break;
      case 'services':
        servicesForm.reset(contentToLoad || defaultServicesPageContent);
        break;
      case 'contact':
        contactForm.reset(contentToLoad || defaultContactPageContent);
        break;
    }
    setIsUiBlockingLoading(false);
  }, [toast, homeForm, aboutForm, servicesForm, contactForm]);

  useEffect(() => {
    loadPageContent(activeTab);
  }, [activeTab, loadPageContent]);

  const performSave = async (pageId: PageId, content: any) => {
    try {
      const { data: upsertData, error } = await supabase
        .from('page_content')
        .upsert({ page_id: pageId, content: content, updated_at: new Date().toISOString() }, { onConflict: 'page_id' })
        .select() // Select the upserted row
        .single(); // Expect a single row

      if (error) {
        console.error(`Error saving ${pageId} content to Supabase:`, error);
        toast({ title: `Error saving ${pageId} content`, description: error.message, variant: 'destructive' });
        throw error; // Re-throw to allow react-hook-form to handle isSubmitting
      } else {
        toast({ title: `${pageId.charAt(0).toUpperCase() + pageId.slice(1)} Content Saved`, description: 'Your changes have been successfully saved.' });
        return upsertData; // Resolve with data for react-hook-form
      }
    } catch (e: any) {
        console.error(`Caught an exception in performSave for ${pageId}:`, e);
        // Ensure a toast if not already shown (e.g., network error before Supabase error object)
        if (!e.message?.includes('PostgrestError') && !e.message?.includes('supabase')) { 
            toast({ title: `Unexpected error during ${pageId} save operation`, description: e.message || 'An unknown error occurred.', variant: 'destructive' });
        }
        throw e; // IMPORTANT: Re-throw ANY caught error so handleSubmit knows the promise rejected.
    }
  };

  const handleDirectSave = async (pageId: PageId, formInstance: any) => {
    setIsUiBlockingLoading(true);
    try {
      await performSave(pageId, formInstance.getValues());
    } catch (e) {
      // Error already toasted in performSave
    } finally {
      setIsUiBlockingLoading(false);
    }
  };


  if (isUiBlockingLoading && !homeForm.formState.isDirty && !aboutForm.formState.isDirty && !servicesForm.formState.isDirty && !contactForm.formState.isDirty) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Card><CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <Newspaper className="mr-3 h-8 w-8 text-primary" /> Content Management
        </h1>
        <p className="text-muted-foreground">Edit content for various public pages of the platform.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PageId)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="home"><Home className="mr-2 h-4 w-4"/>Home Page</TabsTrigger>
          <TabsTrigger value="about"><Info className="mr-2 h-4 w-4"/>About Page</TabsTrigger>
          <TabsTrigger value="services"><Briefcase className="mr-2 h-4 w-4"/>Services Page</TabsTrigger>
          <TabsTrigger value="contact"><Mail className="mr-2 h-4 w-4"/>Contact Page</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-6">
          <form onSubmit={homeForm.handleSubmit(data => performSave('home', data))}>
            <Card>
              <CardHeader><CardTitle>Home Page Content</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible defaultValue="hero-slides" className="w-full">
                  <AccordionItem value="hero-slides">
                    <AccordionTrigger className="text-lg font-semibold">Hero Section Slides</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-3">
                      {heroSlidesFields.map((slideField, index) => (
                        <Card key={slideField.id} className="p-4 space-y-3 bg-muted/50">
                          <Label>Slide {index + 1} Titles (one per line)</Label>
                          <Textarea {...homeForm.register(`hero.slides.${index}.titleLines` as const)} placeholder="Title Line 1&#10;Title Line 2" rows={3} />
                          <Label>Subtitle</Label><Input {...homeForm.register(`hero.slides.${index}.subtitle` as const)} placeholder="Hero Subtitle" />
                          <Label>CTA Text</Label><Input {...homeForm.register(`hero.slides.${index}.cta.text` as const)} placeholder="Explore Now" />
                          <Label>CTA Link</Label><Input {...homeForm.register(`hero.slides.${index}.cta.href` as const)} placeholder="/properties" />
                          <Label>Background Image URL</Label><Input {...homeForm.register(`hero.slides.${index}.backgroundImageUrl` as const)} placeholder="https://placehold.co/..." />
                          <Label>Image Alt Text</Label><Input {...homeForm.register(`hero.slides.${index}.backgroundImageAlt` as const)} placeholder="Alt text for image" />
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeHeroSlide(index)}><Trash2 className="mr-1 h-4 w-4"/>Remove Slide</Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendHeroSlide({ titleLines: ['New Slide Title'], subtitle: '', cta: { text: 'Learn More', href: '#' }, backgroundImageUrl: 'https://placehold.co/1920x1080.png', backgroundImageAlt: 'Placeholder' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Hero Slide
                      </Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="our-services">
                    <AccordionTrigger className="text-lg font-semibold">"Our Services" Section</AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-3">
                      <Label>Section Title</Label><Input {...homeForm.register('ourServices.title')} placeholder="Our Services Title" />
                      <Label>Section Subtitle</Label><Textarea {...homeForm.register('ourServices.subtitle')} placeholder="Our Services Subtitle" />
                      <h4 className="font-medium pt-2">Service Items:</h4>
                      {ourServicesItemsFields.map((itemField, index) => (
                        <Card key={itemField.id} className="p-3 space-y-2 bg-muted/50">
                          <Label>Icon Name (Lucide)</Label><Input {...homeForm.register(`ourServices.items.${index}.iconName` as const)} placeholder="Home" />
                          <Label>Item Title</Label><Input {...homeForm.register(`ourServices.items.${index}.title` as const)} placeholder="Service Title" />
                          <Label>Item Description</Label><Textarea {...homeForm.register(`ourServices.items.${index}.description` as const)} placeholder="Service Description" />
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeOurServicesItem(index)}><Trash2 className="mr-1 h-4 w-4"/>Remove Item</Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendOurServicesItem({ iconName: 'Users', title: 'New Service', description: 'Description for new service.' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Service Item</Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="find-your-home">
                     <AccordionTrigger className="text-lg font-semibold">"Find Your Home" Section</AccordionTrigger>
                     <AccordionContent className="space-y-3 pt-3">
                        <Label>Section Title</Label><Input {...homeForm.register('findYourHome.title')} />
                        <Label>Section Subtitle</Label><Textarea {...homeForm.register('findYourHome.subtitle')} />
                        <Label>Image URL</Label><Input {...homeForm.register('findYourHome.imageUrl')} />
                        <Label>Image Alt Text</Label><Input {...homeForm.register('findYourHome.imageAlt')} />
                        <Label>CTA Text</Label><Input {...homeForm.register('findYourHome.cta.text')} />
                        <Label>CTA Link</Label><Input {...homeForm.register('findYourHome.cta.href')} />
                        <h4 className="font-medium pt-2">Features:</h4>
                        {findYourHomeFeaturesFields.map((itemField, index) => (
                            <Card key={itemField.id} className="p-3 space-y-2 bg-muted/50">
                            <Label>Icon Name (Lucide)</Label><Input {...homeForm.register(`findYourHome.features.${index}.iconName` as const)} />
                            <Label>Feature Text</Label><Input {...homeForm.register(`findYourHome.features.${index}.text` as const)} />
                            <Label>Feature Subtext</Label><Input {...homeForm.register(`findYourHome.features.${index}.subtext` as const)} />
                            <Button type="button" variant="destructive" size="sm" onClick={() => removeFindYourHomeFeature(index)}><Trash2 className="mr-1 h-4 w-4"/>Remove Feature</Button>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendFindYourHomeFeature({ iconName: 'Check', text: 'New Feature', subtext: 'Details' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Feature</Button>
                     </AccordionContent>
                  </AccordionItem>

                    <AccordionItem value="development-projects">
                        <AccordionTrigger className="text-lg font-semibold">"Development Projects" Section</AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-3">
                            <Label>Section Title</Label><Input {...homeForm.register('developmentProjects.title')} />
                            <Label>Section Subtitle</Label><Textarea {...homeForm.register('developmentProjects.subtitle')} />
                            <Label>Description</Label><Textarea {...homeForm.register('developmentProjects.description')} rows={3} />
                            <Label>Image URL</Label><Input {...homeForm.register('developmentProjects.imageUrl')} />
                            <Label>Image Alt Text</Label><Input {...homeForm.register('developmentProjects.imageAlt')} />
                            <Label>CTA Text</Label><Input {...homeForm.register('developmentProjects.cta.text')} />
                            <Label>CTA Link</Label><Input {...homeForm.register('developmentProjects.cta.href')} />
                            <Label>Image Position</Label>
                            <Controller
                                control={homeForm.control}
                                name="developmentProjects.imagePosition"
                                render={({ field }) => (
                                <select {...field} className="w-full p-2 border rounded-md bg-background">
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                                )}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="community-outreach">
                        <AccordionTrigger className="text-lg font-semibold">"Community Outreach" Section</AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-3">
                            <Label>Section Title</Label><Input {...homeForm.register('communityOutreach.title')} />
                            <Label>Section Subtitle</Label><Textarea {...homeForm.register('communityOutreach.subtitle')} />
                            <Label>Description</Label><Textarea {...homeForm.register('communityOutreach.description')} rows={3} />
                            <Label>Image URL</Label><Input {...homeForm.register('communityOutreach.imageUrl')} />
                            <Label>Image Alt Text</Label><Input {...homeForm.register('communityOutreach.imageAlt')} />
                            <Label>CTA Text</Label><Input {...homeForm.register('communityOutreach.cta.text')} />
                            <Label>CTA Link</Label><Input {...homeForm.register('communityOutreach.cta.href')} />
                             <Label>Image Position</Label>
                            <Controller
                                control={homeForm.control}
                                name="communityOutreach.imagePosition"
                                render={({ field }) => (
                                <select {...field} className="w-full p-2 border rounded-md bg-background">
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                                )}
                            />
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
                <Button type="submit" disabled={homeForm.formState.isSubmitting || isUiBlockingLoading} className="mt-6">
                  <Save className="mr-2 h-4 w-4" /> {homeForm.formState.isSubmitting ? "Saving..." : "Save Home Page Content"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
           <form onSubmit={aboutForm.handleSubmit(data => performSave('about', data))}>
            <Card>
              <CardHeader><CardTitle>About Page Content</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <Accordion type="single" collapsible defaultValue="hero-about" className="w-full">
                    <AccordionItem value="hero-about">
                        <AccordionTrigger className="text-lg font-semibold">Hero Section</AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-3">
                            <Label>Page Title (Meta)</Label><Input {...aboutForm.register('pageTitle')} />
                            <Label>Hero Title</Label><Textarea {...aboutForm.register('heroSection.title')} rows={3} />
                            <Label>Paragraph 1</Label><Textarea {...aboutForm.register('heroSection.paragraphs.0')} rows={4} />
                            <Label>Paragraph 2</Label><Textarea {...aboutForm.register('heroSection.paragraphs.1')} rows={4} />
                            <Label>Paragraph 3</Label><Textarea {...aboutForm.register('heroSection.paragraphs.2')} rows={4} />
                            <Label>Image URL</Label><Input {...aboutForm.register('heroSection.imageUrl')} />
                            <Label>Image Alt Text</Label><Input {...aboutForm.register('heroSection.imageAlt')} />
                            <Label>Badge Text (use \n for new line)</Label><Input {...aboutForm.register('heroSection.badgeText')} />
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="services-items-about">
                        <AccordionTrigger className="text-lg font-semibold">Services Section Items</AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-3">
                            <Label>Section Title</Label><Input {...aboutForm.register('servicesSection.title')} />
                            <Label>Section Subtitle</Label><Textarea {...aboutForm.register('servicesSection.subtitle')} />
                            {[0,1,2,3].map(index => ( // Assuming a fixed number of 4 service items for About page based on default data
                                <Card key={index} className="p-3 space-y-2 bg-muted/50 my-2">
                                    <Label>Service {index+1} Icon Name</Label><Input {...aboutForm.register(`servicesSection.items.${index}.iconName` as const)} />
                                    <Label>Service {index+1} Title</Label><Input {...aboutForm.register(`servicesSection.items.${index}.title` as const)} />
                                    <Label>Service {index+1} Description</Label><Textarea {...aboutForm.register(`servicesSection.items.${index}.description` as const)} />
                                </Card>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                 </Accordion>
                <Button type="submit" disabled={aboutForm.formState.isSubmitting || isUiBlockingLoading} className="mt-6">
                  <Save className="mr-2 h-4 w-4" /> {aboutForm.formState.isSubmitting ? "Saving..." : "Save About Page Content"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <form onSubmit={servicesForm.handleSubmit(data => performSave('services', data))}>
            <Card>
              <CardHeader><CardTitle>Services Page Content</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible defaultValue="services-header" className="w-full">
                  <AccordionItem value="services-header">
                    <AccordionTrigger className="text-lg font-semibold">Header &amp; Meta</AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-3">
                      <Label>Page Title (Meta)</Label><Input {...servicesForm.register('pageTitle')} placeholder="Services Page Title" />
                      <Label>Header Title</Label><Input {...servicesForm.register('headerTitle')} placeholder="Main Title on Page" />
                      <Label>Header Subtitle</Label><Textarea {...servicesForm.register('headerSubtitle')} placeholder="Subtitle below main title" />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="main-categories">
                    <AccordionTrigger className="text-lg font-semibold">Main Service Categories</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-3">
                      {mainCategoriesFields.map((categoryField, index) => (
                        <Card key={categoryField.id} className="p-4 space-y-3 bg-muted/50">
                          <Label>Category {index + 1} Title</Label><Input {...servicesForm.register(`mainCategories.${index}.title` as const)} placeholder="Category Title" />
                          <Label>Description</Label><Textarea {...servicesForm.register(`mainCategories.${index}.description` as const)} placeholder="Category Description" rows={3} />
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeMainCategory(index)}><Trash2 className="mr-1 h-4 w-4"/>Remove Category</Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendMainCategory({ title: 'New Category', description: 'Description for new category.' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Main Category</Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="property-verification">
                    <AccordionTrigger className="text-lg font-semibold">Property Verification Section</AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-3">
                      <Label>Section Title</Label><Input {...servicesForm.register('propertyVerificationSection.title')} placeholder="Section Title" />
                      <Label>Section Subtitle</Label><Textarea {...servicesForm.register('propertyVerificationSection.subtitle')} placeholder="Section Subtitle" />
                      <h4 className="font-medium pt-2">Verification Items:</h4>
                      {propertyVerificationItemsFields.map((itemField, index) => (
                        <Card key={itemField.id} className="p-3 space-y-2 bg-muted/50">
                          <Label>Icon Name (Lucide)</Label><Input {...servicesForm.register(`propertyVerificationSection.items.${index}.iconName` as const)} placeholder="FileWarning" />
                          <Label>Item Title</Label><Input {...servicesForm.register(`propertyVerificationSection.items.${index}.title` as const)} placeholder="Item Title" />
                          <Label>Item Description</Label><Textarea {...servicesForm.register(`propertyVerificationSection.items.${index}.description` as const)} placeholder="Item Description" />
                          <Button type="button" variant="destructive" size="sm" onClick={() => removePropertyVerificationItem(index)}><Trash2 className="mr-1 h-4 w-4"/>Remove Item</Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendPropertyVerificationItem({ iconName: 'CheckSquare', title: 'New Verification Item', description: 'Details about this item.' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Verification Item</Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="detailed-verification">
                    <AccordionTrigger className="text-lg font-semibold">Detailed Verification Section</AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-3">
                      <Label>Section Title</Label><Input {...servicesForm.register('detailedVerificationSection.title')} placeholder="Section Title" />
                      <Label>Section Subtitle</Label><Textarea {...servicesForm.register('detailedVerificationSection.subtitle')} placeholder="Section Subtitle" />
                      <h4 className="font-medium pt-2">Detailed Items:</h4>
                      {detailedVerificationItemsFields.map((itemField, index) => (
                        <Card key={itemField.id} className="p-3 space-y-2 bg-muted/50">
                          <Label>Icon Name (Lucide)</Label><Input {...servicesForm.register(`detailedVerificationSection.items.${index}.iconName` as const)} placeholder="ShieldCheck" />
                          <Label>Item Title</Label><Input {...servicesForm.register(`detailedVerificationSection.items.${index}.title` as const)} placeholder="Item Title" />
                          <Label>Item Description</Label><Textarea {...servicesForm.register(`detailedVerificationSection.items.${index}.description` as const)} placeholder="Item Description" />
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeDetailedVerificationItem(index)}><Trash2 className="mr-1 h-4 w-4"/>Remove Item</Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendDetailedVerificationItem({ iconName: 'ScanSearch', title: 'New Detailed Item', description: 'Details about this item.' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Detailed Item</Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="services-cta">
                    <AccordionTrigger className="text-lg font-semibold">Call to Action (CTA)</AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-3">
                      <Label>CTA Text</Label><Input {...servicesForm.register('cta.text')} placeholder="Get Started" />
                      <Label>CTA Link</Label><Input {...servicesForm.register('cta.href')} placeholder="/contact" />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Button type="submit" disabled={servicesForm.formState.isSubmitting || isUiBlockingLoading} className="mt-6">
                  <Save className="mr-2 h-4 w-4" /> {servicesForm.formState.isSubmitting ? "Saving..." : "Save Services Page Content"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Contact Page Content</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Editing for the Contact page. Manage content directly as a JSON object for now.</p>
               <Controller
                name="content" // This should ideally be specific to contactForm's structure
                control={contactForm.control} // Use contactForm.control
                // @ts-ignore
                defaultValue={JSON.stringify(defaultContactPageContent, null, 2)} // Ensure it's stringified
                render={({ field }) => (
                  <Textarea
                    value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        // This is tricky; directly setting field.value might not be enough if not registered.
                        // Best to use form.reset or form.setValue if you parse it.
                        contactForm.reset(parsed); // Reset the whole form with new parsed data
                      } catch (err) {
                        // If JSON is invalid, let Zod catch it on submit.
                        // You might want to provide instant feedback here too.
                        // For now, allow text editing. Zod validates on save.
                         field.onChange(e.target.value); // Allow raw text editing
                      }
                    }}
                    rows={25}
                    placeholder="Enter JSON content for Contact Page"
                    className="font-mono text-xs"
                  />
                )}
              />
              {Object.keys(contactForm.formState.errors).length > 0 && <p className="text-destructive text-sm mt-1">Invalid JSON structure or content. Please check your input.</p>}
              <Button onClick={() => handleDirectSave('contact', contactForm)} disabled={isUiBlockingLoading || contactForm.formState.isSubmitting} className="mt-4">
                <Save className="mr-2 h-4 w-4" /> {isUiBlockingLoading || contactForm.formState.isSubmitting ? "Saving..." : "Save Contact Page Content"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

