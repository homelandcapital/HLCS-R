
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Home, Wrench, ClipboardList, Users, DollarSign, Search, KeyRound, Building } from 'lucide-react';
import type { HomePageServiceItem, HomePageFindHomeFeature, HomePageContent } from '@/lib/types';
import { homePageContentData as defaultContent } from '@/lib/cms-data';
import type { Icon as LucideIcon } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from '@/lib/supabaseClient';
import { unstable_noStore as noStore } from 'next/cache';


const iconMap: { [key: string]: LucideIcon } = {
  Home, Wrench, ClipboardList, Users, DollarSign, Search, KeyRound, Building, ArrowRight,
};

const renderIcon = (iconName?: string, className?: string) => {
  if (!iconName) return null;
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

async function getHomePageContent(): Promise<HomePageContent> {
  noStore(); // Opt out of caching for this dynamic content
  const { data, error } = await supabase
    .from('page_content')
    .select('content')
    .eq('page_id', 'home')
    .single();

  if (error || !data) {
    console.warn('Error fetching home page content or no content found, using default:', error?.message);
    return defaultContent;
  }
  return data.content as HomePageContent || defaultContent;
}


export default async function HomePageRedesigned() {
  const content = await getHomePageContent();

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section Carousel */}
      <section className="relative rounded-xl overflow-hidden">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {content.hero.slides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center text-center">
                  <Image
                    src={slide.backgroundImageUrl}
                    alt={slide.backgroundImageAlt}
                    fill
                    style={{ objectFit: "cover" }}
                    className="absolute inset-0 z-0"
                    sizes="100vw"
                    data-ai-hint={slide.backgroundImageAiHint}
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-black/50 z-10"></div>
                  <div className="relative z-20 p-6 container mx-auto">
                    {slide.titleLines.map((line, lineIndex) => (
                      <h1 key={lineIndex} className={`text-2xl md:text-4xl lg:text-5xl font-headline font-bold text-white ${lineIndex < slide.titleLines.length -1 ? 'mb-2 md:mb-3' : slide.subtitle ? 'mb-3 md:mb-4' : 'mb-8 md:mb-10'}`}>
                        {line}
                      </h1>
                    ))}
                    {slide.subtitle && (
                       <p className="text-xl md:text-2xl text-gray-200 mb-8 md:mb-10 max-w-3xl mx-auto">{slide.subtitle}</p>
                    )}
                    <Button size="lg" asChild className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold text-lg px-8 py-6 shadow-lg">
                      <Link href={slide.cta.href}>
                        {slide.cta.text} <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden sm:inline-flex" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden sm:inline-flex" />
        </Carousel>
      </section>

      {/* Our Services Section */}
      <section className="py-12 md:py-16 bg-amber-50 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center text-foreground mb-4">{content.ourServices.title}</h2>
          <p className="text-center text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto">{content.ourServices.subtitle}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.ourServices.items.map((service: HomePageServiceItem, index: number) => (
              <Card key={index} className="text-left shadow-lg hover:shadow-xl transition-shadow bg-card flex flex-col">
                <CardHeader className="items-start">
                  <div className="bg-primary/10 p-3 rounded-md mb-3 inline-block">
                    {renderIcon(service.iconName, "w-7 h-7 text-primary")}
                  </div>
                  <CardTitle className="font-headline text-xl text-primary">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Find Your New Home Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full rounded-lg overflow-hidden shadow-xl">
            <Image
              src={content.findYourHome.imageUrl}
              alt={content.findYourHome.imageAlt}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint={content.findYourHome.imageAiHint}
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-headline text-primary">
              {content.findYourHome.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {content.findYourHome.subtitle}
            </p>
            <ul className="space-y-3">
              {content.findYourHome.features.map((feature: HomePageFindHomeFeature, index: number) => (
                <li key={index} className="flex items-center">
                  {renderIcon(feature.iconName, "w-6 h-6 text-accent mr-3 shrink-0")}
                  <div>
                    <span className="font-semibold text-foreground">{feature.text}</span>
                    <span className="text-sm text-muted-foreground ml-2">({feature.subtext})</span>
                  </div>
                </li>
              ))}
            </ul>
            <Button size="lg" asChild className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold text-lg px-8 py-6 shadow-lg">
              <Link href={content.findYourHome.cta.href}>
                {content.findYourHome.cta.text} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Development Projects Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center`}>
          <div className={`space-y-6 ${content.developmentProjects.imagePosition === 'right' ? 'md:order-1' : 'md:order-2'}`}>
            <h2 className="text-3xl md:text-4xl font-headline text-orange-500">
              {content.developmentProjects.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.developmentProjects.subtitle}
            </p>
            <p className="text-foreground leading-relaxed">
              {content.developmentProjects.description}
            </p>
            <Button size="md" asChild className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold">
              <Link href={content.developmentProjects.cta.href}>
                {content.developmentProjects.cta.text} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className={`relative aspect-video md:aspect-auto md:h-[350px] rounded-lg overflow-hidden shadow-xl ${content.developmentProjects.imagePosition === 'right' ? 'md:order-2' : 'md:order-1'}`}>
            <Image
              src={content.developmentProjects.imageUrl}
              alt={content.developmentProjects.imageAlt}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint={content.developmentProjects.imageAiHint}
            />
          </div>
        </div>
      </section>

      {/* Community Outreach Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center`}>
          <div className={`space-y-6 ${content.communityOutreach.imagePosition === 'right' ? 'md:order-1' : 'md:order-2'}`}>
            <h2 className="text-3xl md:text-4xl font-headline text-orange-500">
              {content.communityOutreach.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.communityOutreach.subtitle}
            </p>
            <p className="text-foreground leading-relaxed">
              {content.communityOutreach.description}
            </p>
            <Button size="md" asChild className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold">
              <Link href={content.communityOutreach.cta.href}>
                {content.communityOutreach.cta.text} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className={`relative aspect-video md:aspect-auto md:h-[350px] rounded-lg overflow-hidden shadow-xl ${content.communityOutreach.imagePosition === 'right' ? 'md:order-2' : 'md:order-1'}`}>
            <Image
              src={content.communityOutreach.imageUrl}
              alt={content.communityOutreach.imageAlt}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint={content.communityOutreach.imageAiHint}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

    