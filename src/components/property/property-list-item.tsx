
'use client';

import type { Property } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Building2, Maximize, ArrowRight, Heart, Star } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface PropertyListItemProps {
  property: Property;
}

const PropertyListItem = ({ property }: PropertyListItemProps) => {
  const { isAuthenticated, user, isPropertySaved, toggleSaveProperty } = useAuth();
  const saved = isAuthenticated && user?.role === 'user' && isPropertySaved(property.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.id) {
      toggleSaveProperty(property.id);
    }
  };

  const defaultImage = 'https://placehold.co/600x400.png?text=No+Image';
  const displayImage = property.images && property.images.length > 0 ? property.images[0] : defaultImage;
  
  const isPromotionActive = property.is_promoted && property.promotion_expires_at && new Date(property.promotion_expires_at) > new Date();

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full group">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-1/3 h-48 sm:h-auto rounded-md overflow-hidden shrink-0">
          <Link href={`/properties/${property.id}`}>
            <Image
              src={displayImage}
              alt={property.title}
              layout="fill"
              objectFit="cover"
              className="hover:scale-105 transition-transform"
              data-ai-hint="house exterior building"
            />
          </Link>
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            <Badge variant="secondary" className="text-xs">{property.listing_type}</Badge>
            {isPromotionActive && (
                <Badge variant="default" className="bg-yellow-500 text-black hover:bg-yellow-600 text-xs flex items-center">
                    <Star className="h-3 w-3 mr-1"/> 
                    {property.promotion_tier_name || 'Promoted'}
                </Badge>
            )}
          </div>
           {isAuthenticated && user?.role === 'user' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveClick}
              className="absolute top-2 left-2 bg-background/70 hover:bg-background text-foreground rounded-full h-8 w-8 z-10"
              aria-label={saved ? "Unsave property" : "Save property"}
            >
              <Heart className={cn("h-4 w-4", saved ? "fill-red-500 text-red-500" : "text-muted-foreground group-hover:text-red-400")} />
            </Button>
          )}
        </div>
        <div className="flex flex-col flex-grow">
          <Link href={`/properties/${property.id}`}>
            <h2 className="text-xl font-headline mb-1 hover:text-primary transition-colors line-clamp-2">
              {property.title}
            </h2>
          </Link>
          <div className="flex items-center text-muted-foreground text-sm mb-1">
            <MapPin className="w-4 h-4 mr-1 shrink-0" />
            {property.location_area_city}, {property.state}
          </div>
          <div className="flex items-center text-muted-foreground text-sm mb-2">
            <Building2 className="w-4 h-4 mr-1 shrink-0" /> 
            {property.property_type} - <span className="font-semibold text-accent ml-1">₦{property.price.toLocaleString()}</span>
          </div>
          <p className="text-sm text-foreground line-clamp-2 mb-3 flex-grow whitespace-pre-line">
            {property.description}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground mb-3">
            <div className="flex items-center">
              <BedDouble className="w-4 h-4 mr-1 text-accent shrink-0" /> {property.bedrooms} Beds
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1 text-accent shrink-0" /> {property.bathrooms} Baths
            </div>
            {property.area_sq_ft && (
              <div className="flex items-center">
                <Maximize className="w-4 h-4 mr-1 text-accent shrink-0" /> {property.area_sq_ft} sq ft
              </div>
            )}
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
