
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Wrench, Building2, Users } from 'lucide-react';
import { aboutPageContentData as defaultContent } from '@/lib/cms-data';
import type { Metadata } from 'next';
import type { Icon as LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { AboutPageContent } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// export const metadata: Metadata = { // Cannot export metadata from client component if page is client
//   title: defaultContent.pageTitle, // Fallback or dynamic title
// };

// Updated to fetch metadata dynamically
export async function generateMetadata(): Promise<Metadata> {
  noStore();
  const { data, error } = await supabase
    .from('page_content')
    .select('content')
    .eq('page_id', 'about')
    .single();

  const pageContent = data?.content as AboutPageContent | undefined;
  const title = pageContent?.pageTitle || defaultContent.pageTitle;
  return { title };
}


const iconMap: { [key: string]: LucideIcon } = {
  Home, Wrench, Building2, Users,
};

const renderIcon = (iconName?: string, className?: string) => {
  if (!iconName) return null;
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

async function getAboutPageContent(): Promise<AboutPageContent> {
  noStore();
  const { data, error } = await supabase
    .from('page_content')
    .select('content')
    .eq('page_id', 'about')
    .single();

  if (error || !data) {
    console.warn('Error fetching about page content or no content found, using default:', error?.message);
    return defaultContent;
  }
  return data.content as AboutPageContent || defaultContent;
}

export default async function AboutPage() {
  const content = await getAboutPageContent();

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full rounded-lg overflow-hidden shadow-xl">
            <Image
              src={content.heroSection.imageUrl}
              alt={content.heroSection.imageAlt}
              fill
              style={{objectFit:"cover"}}
              priority
            />
            <div className="absolute bottom-4 right-4 bg-yellow-400 text-yellow-900 p-4 rounded-lg shadow-lg text-center">
              {content.heroSection.badgeText.split('\n').map((line, index) => (
                <p key={index} className={index === 0 ? "text-3xl font-bold" : "text-sm font-semibold"}>
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-headline text-primary">
              {content.heroSection.title}
            </h1>
            {content.heroSection.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="bg-muted py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline text-center text-foreground mb-4">
            {content.servicesSection.title}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {content.servicesSection.subtitle}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.servicesSection.items.map((service, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow bg-card flex flex-col">
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4 inline-block">
                    {renderIcon(service.iconName, "w-8 h-8 text-primary")}
                  </div>
                  <CardTitle className="font-headline text-xl text-primary">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
