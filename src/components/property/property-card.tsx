import type { Property } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, Home, Tag } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Link href={`/properties/${property.id}`}>
          <Image
            src={property.images[0]}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-56 object-cover"
            data-ai-hint="house exterior"
          />
        </Link>
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-semibold">
          ${property.price.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/properties/${property.id}`}>
          <CardTitle className="text-xl font-headline mb-2 hover:text-primary transition-colors">
            {property.title}
          </CardTitle>
        </Link>
        <div className="flex items-center text-muted-foreground text-sm mb-1">
          <MapPin className="w-4 h-4 mr-1" />
          {property.location}
        </div>
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <Home className="w-4 h-4 mr-1" />
          {property.type}
        </div>
        <p className="text-sm text-foreground line-clamp-3 mb-3">{property.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-foreground">
          <div className="flex items-center">
            <BedDouble className="w-4 h-4 mr-1 text-accent" /> {property.bedrooms} Beds
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1 text-accent" /> {property.bathrooms} Baths
          </div>
          <div className="flex items-center">
            <Tag className="w-4 h-4 mr-1 text-accent" /> {property.areaSqFt} sq ft
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full" variant="default">
          <Link href={`/properties/${property.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
