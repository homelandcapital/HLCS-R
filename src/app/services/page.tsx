
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { servicesPageContentData as defaultContent } from '@/lib/cms-data';
import type { Metadata } from 'next';
import {
  Briefcase, FileWarning, SearchX, ShieldOff, HardHat, Waves, KeyRound,
  ClipboardList, FileCheck2, LocateFixed, FileText, Landmark, ScanSearch,
  ShieldCheck, Coins, Users2, ClipboardCheck, CloudRain, FileArchive,
  MapPinned, Building, Ruler, Scale, Leaf, LandPlot, Handshake, UserCheck,
  FileSignature, Library, ChevronRight, Server, HelpCircle, BarChart, Anchor, Lightbulb, Home, Wrench
} from 'lucide-react';
import type { Icon as LucideIcon } from 'lucide-react';
import type { ServiceGridItem, ServicesPageContent } from "@/lib/types";
import { supabase } from '@/lib/supabaseClient';
import { unstable_noStore as noStore } from 'next/cache';


export async function generateMetadata(): Promise<Metadata> {
  noStore();
  const { data, error } = await supabase
    .from('page_content')
    .select('content')
    .eq('page_id', 'services')
    .single();

  const pageContent = data?.content as ServicesPageContent | undefined;
  const title = pageContent?.pageTitle || defaultContent.pageTitle;
  return { title };
}


const iconMap: { [key: string]: LucideIcon } = {
  Briefcase, FileWarning, SearchX, ShieldOff, HardHat, Waves, KeyRound,
  ClipboardList, FileCheck2, LocateFixed, FileText, Landmark, ScanSearch,
  ShieldCheck, Coins, Users2, ClipboardCheck, CloudRain, FileArchive,
  MapPinned, Building, Ruler, Scale, Leaf, LandPlot, Handshake, UserCheck,
  FileSignature, Library, ChevronRight, Server, HelpCircle, BarChart, Anchor, Lightbulb, Home, Wrench
};

const renderIcon = (iconName?: string, className?: string) => {
  if (!iconName) return null;
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

async function getServicesPageContent(): Promise<ServicesPageContent> {
  noStore();
  const { data, error } = await supabase
    .from('page_content')
    .select('content')
    .eq('page_id', 'services')
    .single();

  if (error || !data) {
    console.warn('Error fetching services page content or no content found, using default:', error?.message);
    return defaultContent;
  }
  return data.content as ServicesPageContent || defaultContent;
}


export default async function ServicesPage() {
  const content = await getServicesPageContent();

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Header Section */}
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary mb-3">
          {content.headerTitle}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto whitespace-pre-line">
          {content.headerSubtitle}
        </p>
      </header>

      {/* Main Service Categories Accordion */}
      <section>
        <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto space-y-4">
          {content.mainCategories.map((category, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="border bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <AccordionTrigger className="px-6 py-4 text-xl font-semibold text-primary hover:no-underline">
                <span className="flex items-center">
                  {category.title === "Real Estate" && <Home className="w-5 h-5 mr-3 text-primary/80" />}
                  {category.title === "Machinery Marketplace" && <Wrench className="w-5 h-5 mr-3 text-primary/80" />}
                  {category.title === "Development Project" && <Building className="w-5 h-5 mr-3 text-primary/80" />}
                  {category.title === "Community Project" && <Users2 className="w-5 h-5 mr-3 text-primary/80" />}
                  {category.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-foreground leading-relaxed whitespace-pre-line">
                {category.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Property Verification Section */}
      <section className="py-12 bg-muted rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline text-center text-foreground mb-4">
            {content.propertyVerificationSection.title}
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto whitespace-pre-line">
            {content.propertyVerificationSection.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.propertyVerificationSection.items.map((item: ServiceGridItem, index: number) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow bg-card flex flex-col">
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-3 inline-block">
                    {renderIcon(item.iconName, "w-8 h-8 text-primary")}
                  </div>
                  <CardTitle className="font-semibold text-lg text-primary">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Verification Services Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline text-center text-foreground mb-2">
            {content.detailedVerificationSection.title}
          </h2>
          <p className="text-center text-muted-foreground font-semibold mb-10 whitespace-pre-line">
            {content.detailedVerificationSection.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.detailedVerificationSection.items.map((item: ServiceGridItem, index: number) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow bg-card flex flex-col">
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-2 inline-block">
                     {renderIcon(item.iconName, "w-7 h-7 text-primary")}
                  </div>
                  <CardTitle className="font-semibold text-md text-primary">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <section className="text-center mt-12">
        <Button size="lg" asChild className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-10 py-6 shadow-lg">
          <Link href={content.cta.href}>
            {content.cta.text} <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
