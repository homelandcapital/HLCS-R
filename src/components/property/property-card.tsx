
'use client';
import type { Property } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, Home, Tag, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { isAuthenticated, user, isPropertySaved, toggleSaveProperty } = useAuth();
  const saved = isAuthenticated && user?.role === 'user' && isPropertySaved(property.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if button is inside Link
    e.stopPropagation();
    toggleSaveProperty(property.id);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
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
          ₦{property.price.toLocaleString()}
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
