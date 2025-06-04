
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { servicesPageContentData as content } from '@/lib/cms-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: content.pageTitle,
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Briefcase className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">{content.headerTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            {content.introParagraph}
          </p>
          <div className="text-left space-y-3 pt-4">
            {content.services.map((service, index) => (
              <div key={index}>
                <h3 className="font-semibold text-xl text-primary">{service.title}</h3>
                <p className="text-foreground">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground pt-4">
            {content.conclusionParagraph}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
