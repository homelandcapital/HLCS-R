
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Search, Handshake, BarChartHorizontalBig, Lightbulb, Users, ArrowRight } from 'lucide-react';
import type { CmsFeatureItem } from '@/lib/types';
import { homePageContentData as content } from '@/lib/cms-data';
import type { Icon as LucideIcon } from 'lucide-react';

// Helper to map icon names to Lucide components
const iconMap: { [key: string]: LucideIcon } = {
  Search,
  BarChartHorizontalBig,
  Handshake,
  Lightbulb,
  Users,
  Award,
};

const renderIcon = (iconName?: string, className?: string) => {
  if (!iconName) return null;
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};


export default function InformationalHomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0">
          <Image
            src={content.hero.imageUrl}
            alt={content.hero.imageAlt}
            layout="fill"
            objectFit="cover"
            className="opacity-20"
            data-ai-hint={content.hero.imageAiHint}
            priority
          />
           <div className="absolute inset-0 bg-background/50"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-6">
            {content.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto mb-8">
            {content.hero.subtitle}
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg">
            <Link href={content.hero.cta.href}>
              {content.hero.cta.text} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-headline text-center text-foreground mb-12">{content.servicesSection.title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {content.servicesSection.items.map((service: CmsFeatureItem, index: number) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto flex items-center justify-center">
                  {renderIcon(service.iconName, "w-10 h-10 text-primary mb-4")}
                </div>
                <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                {service.link && service.ctaText && (
                  <Button variant="outline" asChild>
                    <Link href={service.link}>{service.ctaText}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline text-center text-foreground mb-12">{content.whyChooseUsSection.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {content.whyChooseUsSection.items.map((item: CmsFeatureItem, index: number) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
                {renderIcon(item.iconName, "w-8 h-8 text-accent")}
                <h3 className="text-xl font-semibold text-primary mt-3 mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4 text-center py-12">
        <h2 className="text-3xl font-headline text-foreground mb-6">{content.ctaSection.title}</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          {content.ctaSection.subtitle}
        </p>
        <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg">
          <Link href={content.ctaSection.cta.href}>
            {content.ctaSection.cta.text} <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
