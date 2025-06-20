'use client'; // Keep as client component due to form interactions

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, MapPin, Send, Building, Briefcase, Clock, Users, ChevronRight } from 'lucide-react';
import { contactPageContentData as defaultContent } from '@/lib/cms-data';
import type { OfficeDetails, ContactPageContentNew } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';


async function getContactPageContent(): Promise<ContactPageContentNew> {
  // noStore(); // Not available in client components. Fetching handled in useEffect.
  const { data, error } = await supabase
    .from('page_content')
    .select('content')
    .eq('page_id', 'contact')
    .single();

  if (error || !data) {
    console.warn('Error fetching contact page content or no content found, using default:', error?.message);
    return defaultContent;
  }
  return data.content as ContactPageContentNew || defaultContent;
}

export default function ContactPageRedesigned() {
  const [content, setContent] = useState<ContactPageContentNew>(defaultContent);
  const [loadingContent, setLoadingContent] = useState(true);
  const [inquiryType, setInquiryType] = useState(content.formSection.inquiryTypes[0]);
  const { toast } = useToast();
  const [activeOffice, setActiveOffice] = useState<OfficeDetails>(content.officesSection.headquarters);

  useEffect(() => {
    const fetchContent = async () => {
      setLoadingContent(true);
      const fetchedContent = await getContactPageContent();
      setContent(fetchedContent);
      setInquiryType(fetchedContent.formSection.inquiryTypes[0]);
      setActiveOffice(fetchedContent.officesSection.headquarters);
      setLoadingContent(false);
    };
    fetchContent();
  }, []);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log({ ...data, inquiryType }); // Demo: Log form data
    toast({
      title: "Message Sent (Demo)",
      description: "Thank you for your message! We will get back to you soon. (This is a placeholder response)",
    });
    (event.target as HTMLFormElement).reset();
    setInquiryType(content.formSection.inquiryTypes[0]);
  };

  const handleTabChange = (value: string) => {
    if (value === content.officesSection.headquarters.tabName.toLowerCase().replace(/\s+/g, '-')) {
      setActiveOffice(content.officesSection.headquarters);
    } else if (content.officesSection.regionalOffice && value === content.officesSection.regionalOffice.tabName.toLowerCase().replace(/\s+/g, '-')) {
      setActiveOffice(content.officesSection.regionalOffice);
    }
  };
  
  const OfficeInfo = ({ office }: { office: OfficeDetails }) => (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold text-primary flex items-center">
        <Building className="w-5 h-5 mr-2" /> {office.name}
      </h4>
      <p className="flex items-start text-sm">
        <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-muted-foreground" /> {office.address.split('\n').map((line, i) => <span key={i} className="block">{line}</span>)}
      </p>
      <p className="flex items-center text-sm">
        <Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {office.phone}
      </p>
      <p className="flex items-center text-sm">
        <Mail className="w-4 h-4 mr-2 text-muted-foreground" /> {office.email}
      </p>
    </div>
  );

  if (loadingContent) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-12">
        <header className="text-center mb-12"><Skeleton className="h-12 w-3/4 mx-auto mb-4" /><Skeleton className="h-6 w-1/2 mx-auto" /></header>
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-8"> <Skeleton className="h-96 w-full" /> <div className="grid md:grid-cols-2 gap-8"> <Skeleton className="h-48 w-full" /> <Skeleton className="h-48 w-full" /> </div> </div>
          <div className="lg:col-span-2 space-y-8"> <Skeleton className="h-80 w-full" /> </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline text-primary mb-4">{content.headerTitle}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{content.headerSubtitle}</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-foreground">{content.formSection.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="mb-2 block font-medium">Inquiry Type</Label>
                  <RadioGroup
                    defaultValue={inquiryType}
                    onValueChange={setInquiryType}
                    className="flex flex-wrap gap-x-4 gap-y-2"
                  >
                    {content.formSection.inquiryTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type} id={`inquiry-${type.toLowerCase()}`} />
                        <Label htmlFor={`inquiry-${type.toLowerCase()}`} className="font-normal cursor-pointer">{type}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="Your name" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="Your email" required className="mt-1" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="Your phone number" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" placeholder="Message subject" required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Your message" rows={5} required className="mt-1" />
                </div>
                <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center text-foreground">
                  <Clock className="w-5 h-5 mr-2 text-primary" /> {content.businessHoursSection.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {content.businessHoursSection.hours.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">{item.day}:</span>
                    <span className="text-foreground font-medium">{item.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center text-foreground">
                  <Users className="w-5 h-5 mr-2 text-primary" /> {content.investorRelationsSection.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">{content.investorRelationsSection.description}</p>
                <a href={`mailto:${content.investorRelationsSection.email}`} className="flex items-center text-primary hover:underline">
                  <Mail className="w-4 h-4 mr-2" /> {content.investorRelationsSection.email}
                </a>
                <a href={`tel:${content.investorRelationsSection.phone.replace(/\s+/g, '')}`} className="flex items-center text-primary hover:underline">
                  <Phone className="w-4 h-4 mr-2" /> {content.investorRelationsSection.phone}
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-foreground">{content.officesSection.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={content.officesSection.headquarters.tabName.toLowerCase().replace(/\s+/g, '-')} 
                    onValueChange={handleTabChange}
                    className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value={content.officesSection.headquarters.tabName.toLowerCase().replace(/\s+/g, '-')}>
                    {content.officesSection.headquarters.tabName}
                  </TabsTrigger>
                  {content.officesSection.regionalOffice && (
                    <TabsTrigger value={content.officesSection.regionalOffice.tabName.toLowerCase().replace(/\s+/g, '-')}>
                      {content.officesSection.regionalOffice.tabName}
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value={content.officesSection.headquarters.tabName.toLowerCase().replace(/\s+/g, '-')}>
                  <OfficeInfo office={content.officesSection.headquarters} />
                </TabsContent>
                {content.officesSection.regionalOffice && (
                  <TabsContent value={content.officesSection.regionalOffice.tabName.toLowerCase().replace(/\s+/g, '-')}>
                    <OfficeInfo office={content.officesSection.regionalOffice} />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
    