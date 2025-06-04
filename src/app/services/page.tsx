
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Briefcase className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Our Services</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            At Homeland Capital, we offer a comprehensive suite of services to meet all your real estate needs.
          </p>
          <div className="text-left space-y-3 pt-4">
            <h3 className="font-semibold text-xl text-primary">Property Sales & Purchases</h3>
            <p className="text-foreground">
              Whether you're buying your dream home or selling your current property, our expert agents are here to guide you through every step of the process, ensuring a smooth and successful transaction.
            </p>
            <h3 className="font-semibold text-xl text-primary">Property Listings</h3>
            <p className="text-foreground">
              We provide a robust platform for agents to list properties, reaching a wide audience of potential buyers. Our tools help showcase your listings in the best possible light.
            </p>
            <h3 className="font-semibold text-xl text-primary">Market Analysis</h3>
            <p className="text-foreground">
              Stay informed with our up-to-date market analysis and insights, helping you make educated decisions whether you're buying, selling, or investing.
            </p>
             <h3 className="font-semibold text-xl text-primary">Personalized Dashboards</h3>
            <p className="text-foreground">
              Tailored dashboards for users, agents, and administrators to manage properties, inquiries, and platform settings efficiently.
            </p>
          </div>
          <p className="text-muted-foreground pt-4">
            More details about our specific service packages and offerings will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
