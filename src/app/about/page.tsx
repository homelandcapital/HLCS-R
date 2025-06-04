
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Users, Building } from 'lucide-react';
import { aboutPageContentData as content } from '@/lib/cms-data';
import type { Metadata } from 'next';
import type { Icon as LucideIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: content.pageTitle,
};

const iconMap: { [key: string]: LucideIcon } = {
  Info,
  Users,
  Building,
};

const renderIcon = (iconName?: string, className?: string) => {
  if (!iconName) return null;
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          {/* Assuming main icon is Building for About page, can be made dynamic if needed */}
          <Building className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">{content.headerTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-muted-foreground text-center">
            {content.introParagraph}
          </p>
          
          <div className="space-y-4 text-foreground">
            {content.sections.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-xl text-primary mb-1 flex items-center">
                  {renderIcon(section.iconName, "w-5 h-5 mr-2")}
                  {section.title}
                </h3>
                <p>
                  {section.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground pt-4 text-center">
            {content.conclusionParagraph}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
