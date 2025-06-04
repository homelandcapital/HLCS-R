
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Users, Building } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Building className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">About Homeland Capital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-muted-foreground text-center">
            Homeland Capital is dedicated to simplifying the real estate experience through technology and exceptional service.
          </p>
          
          <div className="space-y-4 text-foreground">
            <div>
              <h3 className="font-semibold text-xl text-primary mb-1 flex items-center">
                <Info className="w-5 h-5 mr-2" /> Our Mission
              </h3>
              <p>
                To empower individuals and real estate professionals by providing an intuitive, efficient, and comprehensive platform for all property-related needs. We strive to connect buyers, sellers, and agents seamlessly, fostering a transparent and trustworthy real estate marketplace.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-xl text-primary mb-1 flex items-center">
                <Users className="w-5 h-5 mr-2" /> Who We Are
              </h3>
              <p>
                Homeland Capital was founded by a team of passionate technologists and real estate experts who believe in the power of innovation to transform the property market. We are committed to continuous improvement and delivering value to our users.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-xl text-primary mb-1 flex items-center">
                <Building className="w-5 h-5 mr-2" /> Our Vision
              </h3>
              <p>
                To be the leading online real estate platform, recognized for our cutting-edge technology, user-centric design, and unwavering commitment to integrity and customer satisfaction. We aim to make finding, buying, and selling property an enjoyable and rewarding experience for everyone involved.
              </p>
            </div>
          </div>

          <p className="text-muted-foreground pt-4 text-center">
            More detailed information about our company history, team, and values will be added soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
