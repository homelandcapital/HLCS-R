
'use client';

import type { Property } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, Home as HomeIcon, Tag, ArrowRight } from 'lucide-react';

interface PropertyListItemProps {
  property: Property;
}

const PropertyListItem = ({ property }: PropertyListItemProps) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-1/3 h-48 sm:h-auto rounded-md overflow-hidden shrink-0">
          <Link href={`/properties/${property.id}`}>
            <Image
              src={property.images[0]}
              alt={property.title}
              layout="fill"
              objectFit="cover"
              className="hover:scale-105 transition-transform"
              data-ai-hint="house exterior building"
            />
          </Link>
        </div>
        <div className="flex flex-col flex-grow">
          <Link href={`/properties/${property.id}`}>
            <h2 className="text-xl font-headline mb-1 hover:text-primary transition-colors line-clamp-2">
              {property.title}
            </h2>
          </Link>
          <div className="flex items-center text-muted-foreground text-sm mb-1">
            <MapPin className="w-4 h-4 mr-1 shrink-0" />
            {property.location}
          </div>
          <div className="flex items-center text-muted-foreground text-sm mb-2">
            <HomeIcon className="w-4 h-4 mr-1 shrink-0" />
            {property.type} - <span className="font-semibold text-accent ml-1">${property.price.toLocaleString()}</span>
          </div>
          <p className="text-sm text-foreground line-clamp-2 mb-3 flex-grow">
            {property.description}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground mb-3">
            <div className="flex items-center">
              <BedDouble className="w-4 h-4 mr-1 text-accent shrink-0" /> {property.bedrooms} Beds
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1 text-accent shrink-0" /> {property.bathrooms} Baths
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-1 text-accent shrink-0" /> {property.areaSqFt} sq ft
            </div>
          </div>
           <div className="mt-auto">
            <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
              <Link href={`/properties/${property.id}`}>
                View Details <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyListItem;
