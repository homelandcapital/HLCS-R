
'use client';
import type { Property } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Maximize, Building2, Heart, Star } from 'lucide-react'; // Changed Home to Building2
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
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
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
      <CardHeader className="p-0 relative">
        <Link href={`/properties/${property.id}`}>
          <Image
            src={displayImage}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-56 object-cover"
          />
        </Link>
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-semibold">
          ₦{property.price.toLocaleString()}
        </div>
        <div className="absolute bottom-2 left-2 flex flex-col gap-1 items-start">
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
            className="absolute top-2 left-2 bg-background/70 hover:bg-background text-foreground rounded-full h-9 w-9"
            aria-label={saved ? "Unsave property" : "Save property"}
          >
            <Heart className={cn("h-5 w-5", saved ? "fill-red-500 text-red-500" : "text-muted-foreground group-hover:text-red-400")} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/properties/${property.id}`}>
          <CardTitle className="text-xl font-headline mb-2 hover:text-primary transition-colors">
            {property.title}
          </CardTitle>
        </Link>
        <div className="flex items-center text-muted-foreground text-sm mb-1">
          <MapPin className="w-4 h-4 mr-1" />
          {property.location_area_city}, {property.state}
        </div>
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <Building2 className="w-4 h-4 mr-1" />
          {property.property_type}
        </div>
        <p className="text-sm text-foreground line-clamp-3 mb-3 whitespace-pre-line">{property.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-foreground">
          <div className="flex items-center">
            <BedDouble className="w-4 h-4 mr-1 text-accent" /> {property.bedrooms} Beds
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1 text-accent" /> {property.bathrooms} Baths
          </div>
          {property.area_sq_ft && (
            <div className="flex items-center">
              <Maximize className="w-4 h-4 mr-1 text-accent" /> {property.area_sq_ft} sq ft
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Button asChild className="w-full" variant="default">
          <Link href={`/properties/${property.id}`}>
            <span>View Details</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
