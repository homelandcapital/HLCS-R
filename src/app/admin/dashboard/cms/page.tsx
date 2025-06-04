
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Newspaper, Save, Home, Info, Briefcase, Mail, List } from 'lucide-react';
import {
  homePageContentData,
  servicesPageContentData,
  aboutPageContentData,
  contactPageContentData,
  footerContentData
} from '@/lib/cms-data';

// --- Zod Schemas ---
const heroFormSchema = z.object({
  title: z.string().min(5, { message: 'Hero title must be at least 5 characters.' }),
  subtitle: z.string().min(10, { message: 'Hero subtitle must be at least 10 characters.' }),
  ctaText: z.string().min(3, { message: 'CTA text must be at least 3 characters.' }),
});
const homeServicesSectionSchema = z.object({ title: z.string().min(5) });
const homeWhyChooseUsSectionSchema = z.object({ title: z.string().min(5) });
const homeCtaSectionSchema = z.object({
  title: z.string().min(5),
  subtitle: z.string().min(10),
  ctaText: z.string().min(3),
});

const aboutPageSchema = z.object({
  pageTitle: z.string().min(5),
  headerTitle: z.string().min(5),
  introParagraph: z.string().min(10),
  conclusionParagraph: z.string().min(10),
});

const servicesPageSchema = z.object({
  pageTitle: z.string().min(5),
  headerTitle: z.string().min(5),
  introParagraph: z.string().min(10),
  conclusionParagraph: z.string().min(10),
});

const contactPageSchema = z.object({
  pageTitle: z.string().min(5),
  headerTitle: z.string().min(5),
  headerDescription: z.string().min(10),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(10),
  officeHoursWeekdays: z.string().min(5),
  officeHoursSaturday: z.string().min(5),
  officeHoursSunday: z.string().min(5),
});

const footerSchema = z.object({
  tagline: z.string().min(5),
  copyrightText: z.string().min(5),
  builtWithText: z.string().min(5),
});

// --- Form Value Types ---
type HeroFormValues = z.infer<typeof heroFormSchema>;
type HomeServicesSectionValues = z.infer<typeof homeServicesSectionSchema>;
type HomeWhyChooseUsSectionValues = z.infer<typeof homeWhyChooseUsSectionSchema>;
type HomeCtaSectionValues = z.infer<typeof homeCtaSectionSchema>;
type AboutPageValues = z.infer<typeof aboutPageSchema>;
type ServicesPageValues = z.infer<typeof servicesPageSchema>;
type ContactPageValues = z.infer<typeof contactPageSchema>;
type FooterValues = z.infer<typeof footerSchema>;


export default function CmsManagementPage() {
  const { toast } = useToast();

  const heroForm = useForm<HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      title: homePageContentData.hero.title,
      subtitle: homePageContentData.hero.subtitle,
      ctaText: homePageContentData.hero.cta.text,
    },
  });

  const homeServicesForm = useForm<HomeServicesSectionValues>({
    resolver: zodResolver(homeServicesSectionSchema),
    defaultValues: { title: homePageContentData.servicesSection.title },
  });

  const homeWhyChooseUsForm = useForm<HomeWhyChooseUsSectionValues>({
    resolver: zodResolver(homeWhyChooseUsSectionSchema),
    defaultValues: { title: homePageContentData.whyChooseUsSection.title },
  });
  
  const homeCtaForm = useForm<HomeCtaSectionValues>({
    resolver: zodResolver(homeCtaSectionSchema),
    defaultValues: {
      title: homePageContentData.ctaSection.title,
      subtitle: homePageContentData.ctaSection.subtitle,
      ctaText: homePageContentData.ctaSection.cta.text,
    },
  });

  const aboutPageForm = useForm<AboutPageValues>({
    resolver: zodResolver(aboutPageSchema),
    defaultValues: {
      pageTitle: aboutPageContentData.pageTitle,
      headerTitle: aboutPageContentData.headerTitle,
      introParagraph: aboutPageContentData.introParagraph,
      conclusionParagraph: aboutPageContentData.conclusionParagraph,
    },
  });

  const servicesPageForm = useForm<ServicesPageValues>({
    resolver: zodResolver(servicesPageSchema),
    defaultValues: {
      pageTitle: servicesPageContentData.pageTitle,
      headerTitle: servicesPageContentData.headerTitle,
      introParagraph: servicesPageContentData.introParagraph,
      conclusionParagraph: servicesPageContentData.conclusionParagraph,
    },
  });
  
  const contactPageForm = useForm<ContactPageValues>({
    resolver: zodResolver(contactPageSchema),
    defaultValues: {
      pageTitle: contactPageContentData.pageTitle,
      headerTitle: contactPageContentData.headerTitle,
      headerDescription: contactPageContentData.headerDescription,
      email: contactPageContentData.contactInfo.email,
      phone: contactPageContentData.contactInfo.phone,
      address: contactPageContentData.contactInfo.address,
      officeHoursWeekdays: contactPageContentData.contactInfo.officeHours.weekdays,
      officeHoursSaturday: contactPageContentData.contactInfo.officeHours.saturday,
      officeHoursSunday: contactPageContentData.contactInfo.officeHours.sunday,
    },
  });

  const footerForm = useForm<FooterValues>({
    resolver: zodResolver(footerSchema),
    defaultValues: {
      tagline: footerContentData.tagline,
      copyrightText: footerContentData.copyrightText,
      builtWithText: footerContentData.builtWithText,
    },
  });


  function onHeroSubmit(values: HeroFormValues) {
    homePageContentData.hero.title = values.title;
    homePageContentData.hero.subtitle = values.subtitle;
    homePageContentData.hero.cta.text = values.ctaText;
    toast({ title: 'Homepage Hero Updated!' });
  }

  function onHomeServicesSubmit(values: HomeServicesSectionValues) {
    homePageContentData.servicesSection.title = values.title;
    toast({ title: 'Homepage Services Section Title Updated!' });
  }

  function onHomeWhyChooseUsSubmit(values: HomeWhyChooseUsSectionValues) {
    homePageContentData.whyChooseUsSection.title = values.title;
    toast({ title: 'Homepage Why Choose Us Section Title Updated!' });
  }

  function onHomeCtaSubmit(values: HomeCtaSectionValues) {
    homePageContentData.ctaSection.title = values.title;
    homePageContentData.ctaSection.subtitle = values.subtitle;
    homePageContentData.ctaSection.cta.text = values.ctaText;
    toast({ title: 'Homepage CTA Section Updated!' });
  }
  
  function onAboutPageSubmit(values: AboutPageValues) {
    aboutPageContentData.pageTitle = values.pageTitle;
    aboutPageContentData.headerTitle = values.headerTitle;
    aboutPageContentData.introParagraph = values.introParagraph;
    aboutPageContentData.conclusionParagraph = values.conclusionParagraph;
    toast({ title: 'About Page Content Updated!' });
  }

  function onServicesPageSubmit(values: ServicesPageValues) {
    servicesPageContentData.pageTitle = values.pageTitle;
    servicesPageContentData.headerTitle = values.headerTitle;
    servicesPageContentData.introParagraph = values.introParagraph;
    servicesPageContentData.conclusionParagraph = values.conclusionParagraph;
    toast({ title: 'Services Page Content Updated!' });
  }

  function onContactPageSubmit(values: ContactPageValues) {
    contactPageContentData.pageTitle = values.pageTitle;
    contactPageContentData.headerTitle = values.headerTitle;
    contactPageContentData.headerDescription = values.headerDescription;
    contactPageContentData.contactInfo.email = values.email;
    contactPageContentData.contactInfo.phone = values.phone;
    contactPageContentData.contactInfo.address = values.address;
    contactPageContentData.contactInfo.officeHours.weekdays = values.officeHoursWeekdays;
    contactPageContentData.contactInfo.officeHours.saturday = values.officeHoursSaturday;
    contactPageContentData.contactInfo.officeHours.sunday = values.officeHoursSunday;
    toast({ title: 'Contact Page Content Updated!' });
  }

  function onFooterSubmit(values: FooterValues) {
    footerContentData.tagline = values.tagline;
    footerContentData.copyrightText = values.copyrightText;
    footerContentData.builtWithText = values.builtWithText;
    toast({ title: 'Footer Content Updated!' });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <Newspaper className="mr-3 h-8 w-8 text-primary" /> Content Management
        </h1>
        <p className="text-muted-foreground">Edit content for various parts of your website.</p>
      </div>

      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
          <TabsTrigger value="homepage"><Home className="mr-2 h-4 w-4" />Homepage</TabsTrigger>
          <TabsTrigger value="about"><Info className="mr-2 h-4 w-4" />About Page</TabsTrigger>
          <TabsTrigger value="services"><Briefcase className="mr-2 h-4 w-4" />Services Page</TabsTrigger>
          <TabsTrigger value="contact"><Mail className="mr-2 h-4 w-4" />Contact Page</TabsTrigger>
          <TabsTrigger value="footer"><List className="mr-2 h-4 w-4" />Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="space-y-6">
          <Card className="shadow-xl">
            <CardHeader><CardTitle className="font-headline text-2xl">Hero Section</CardTitle></CardHeader>
            <CardContent>
              <Form {...heroForm}>
                <form onSubmit={heroForm.handleSubmit(onHeroSubmit)} className="space-y-6">
                  <FormField control={heroForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Hero Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={heroForm.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Hero Subtitle</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={heroForm.control} name="ctaText" render={({ field }) => (<FormItem><FormLabel>CTA Button Text</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Link (href) not editable here.</FormDescription><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={heroForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Hero</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardHeader><CardTitle className="font-headline text-2xl">Services Section</CardTitle></CardHeader>
            <CardContent>
              <Form {...homeServicesForm}>
                <form onSubmit={homeServicesForm.handleSubmit(onHomeServicesSubmit)} className="space-y-6">
                  <FormField control={homeServicesForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Section Title</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Individual service items are not editable here yet.</FormDescription><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={homeServicesForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Section Title</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardHeader><CardTitle className="font-headline text-2xl">Why Choose Us Section</CardTitle></CardHeader>
            <CardContent>
              <Form {...homeWhyChooseUsForm}>
                <form onSubmit={homeWhyChooseUsForm.handleSubmit(onHomeWhyChooseUsSubmit)} className="space-y-6">
                  <FormField control={homeWhyChooseUsForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Section Title</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Individual items are not editable here yet.</FormDescription><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={homeWhyChooseUsForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Section Title</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardHeader><CardTitle className="font-headline text-2xl">Call to Action Section</CardTitle></CardHeader>
            <CardContent>
              <Form {...homeCtaForm}>
                <form onSubmit={homeCtaForm.handleSubmit(onHomeCtaSubmit)} className="space-y-6">
                  <FormField control={homeCtaForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Section Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={homeCtaForm.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Section Subtitle</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={homeCtaForm.control} name="ctaText" render={({ field }) => (<FormItem><FormLabel>CTA Button Text</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Link (href) not editable here.</FormDescription><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={homeCtaForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" /> Save CTA Section</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
           <Card className="shadow-xl">
            <CardHeader><CardTitle className="font-headline text-2xl">About Page Content</CardTitle></CardHeader>
            <CardContent>
              <Form {...aboutPageForm}>
                <form onSubmit={aboutPageForm.handleSubmit(onAboutPageSubmit)} className="space-y-6">
                  <FormField control={aboutPageForm.control} name="pageTitle" render={({ field }) => (<FormItem><FormLabel>Page Title (Browser Tab)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={aboutPageForm.control} name="headerTitle" render={({ field }) => (<FormItem><FormLabel>Header Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={aboutPageForm.control} name="introParagraph" render={({ field }) => (<FormItem><FormLabel>Introductory Paragraph</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={aboutPageForm.control} name="conclusionParagraph" render={({ field }) => (<FormItem><FormLabel>Conclusion Paragraph</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                  <FormDescription>Individual sections (Our Mission, Who We Are, etc.) are not editable from this UI yet.</FormDescription>
                  <Button type="submit" disabled={aboutPageForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" /> Save About Page</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card className="shadow-xl">
            <CardHeader><CardTitle className="font-headline text-2xl">Services Page Content</CardTitle></CardHeader>
            <CardContent>
              <Form {...servicesPageForm}>
                <form onSubmit={servicesPageForm.handleSubmit(onServicesPageSubmit)} className="space-y-6">
                  <FormField control={servicesPageForm.control} name="pageTitle" render={({ field }) => (<FormItem><FormLabel>Page Title (Browser Tab)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={servicesPageForm.control} name="headerTitle" render={({ field }) => (<FormItem><FormLabel>Header Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={servicesPageForm.control} name="introParagraph" render={({ field }) => (<FormItem><FormLabel>Introductory Paragraph</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={servicesPageForm.control} name="conclusionParagraph" render={({ field }) => (<FormItem><FormLabel>Conclusion Paragraph</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                  <FormDescription>Individual service descriptions are not editable from this UI yet.</FormDescription>
                  <Button type="submit" disabled={servicesPageForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Services Page</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card className="shadow-xl">
            <CardHeader><CardTitle className="font-headline text-2xl">Contact Page Content</CardTitle></CardHeader>
            <CardContent>
              <Form {...contactPageForm}>
                <form onSubmit={contactPageForm.handleSubmit(onContactPageSubmit)} className="space-y-6">
                  <FormField control={contactPageForm.control} name="pageTitle" render={({ field }) => (<FormItem><FormLabel>Page Title (Browser Tab)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={contactPageForm.control} name="headerTitle" render={({ field }) => (<FormItem><FormLabel>Header Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={contactPageForm.control} name="headerDescription" render={({ field }) => (<FormItem><FormLabel>Header Description</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={contactPageForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={contactPageForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={contactPageForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={contactPageForm.control} name="officeHoursWeekdays" render={({ field }) => (<FormItem><FormLabel>Office Hours (Weekdays)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={contactPageForm.control} name="officeHoursSaturday" render={({ field }) => (<FormItem><FormLabel>Office Hours (Saturday)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={contactPageForm.control} name="officeHoursSunday" render={({ field }) => (<FormItem><FormLabel>Office Hours (Sunday)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={contactPageForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Contact Page</FormButton>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
           <Card className="shadow-xl">
            <CardHeader><CardTitle className="font-headline text-2xl">Footer Content</CardTitle></CardHeader>
            <CardContent>
              <Form {...footerForm}>
                <form onSubmit={footerForm.handleSubmit(onFooterSubmit)} className="space-y-6">
                  <FormField control={footerForm.control} name="tagline" render={({ field }) => (<FormItem><FormLabel>Tagline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={footerForm.control} name="copyrightText" render={({ field }) => (<FormItem><FormLabel>Copyright Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={footerForm.control} name="builtWithText" render={({ field }) => (<FormItem><FormLabel>Built With Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormDescription>Footer links and column titles are not editable from this UI yet.</FormDescription>
                  <Button type="submit" disabled={footerForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Footer</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    