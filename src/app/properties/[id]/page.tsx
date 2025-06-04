
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { mockProperties } from '@/lib/mock-data';
import type { Property } from '@/lib/types';
import PropertyMap from '@/components/property/property-map';
import ContactForm from '@/components/property/contact-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MapPin, BedDouble, Bath, Home as HomeIcon, Maximize, CalendarDays, Tag, Users, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PropertyDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      // Simulate API call
      setTimeout(() => {
        const foundProperty = mockProperties.find(p => p.id === id);
        setProperty(foundProperty || null);
        setLoading(false);
        setCurrentImageIndex(0); // Reset image index when property changes
      }, 500);
    }
  }, [id]);

  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!property) {
    return (
       <div className="text-center py-20">
        <h1 className="text-4xl font-headline mb-4">Property Not Found</h1>
        <p className="text-muted-foreground mb-6">The property you are looking for does not exist or may have been removed.</p>
        <Button asChild>
          <Link href="/properties">Back to Listings</Link>
        </Button>
      </div>
    );
  }

  const { agent } = property;

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Section with Title and Price */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-headline text-primary mb-2">{property.title}</h1>
              <div className="flex items-center text-muted-foreground text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                {property.address}
              </div>
            </div>
            <div className="text-3xl font-bold text-accent whitespace-nowrap bg-secondary px-4 py-2 rounded-lg">
              ${property.price.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery Slider */}
      <Card className="shadow-lg">
        <CardContent className="p-2 md:p-4">
          {/* Main Image Display */}
          <div className="relative w-full aspect-[16/10] rounded-md overflow-hidden group">
            {property.images && property.images.length > 0 ? (
              <>
                <Image
                  src={property.images[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-opacity duration-300 ease-in-out"
                  data-ai-hint="property interior detail"
                  priority={true}
                />
                {property.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                      onClick={prevImage}
                      aria-label="Previous Image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                      onClick={nextImage}
                      aria-label="Next Image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No images available</p>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {property.images && property.images.length > 1 && (
            <div className="mt-3">
              <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex space-x-2 p-1">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "block rounded-md overflow-hidden w-20 h-14 md:w-24 md:h-16 relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background",
                        currentImageIndex === index ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-75 transition-opacity"
                      )}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${property.title} ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                      />
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Main Content: Details, Map, Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Property Details Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-foreground">
                <DetailItem icon={<HomeIcon />} label="Type" value={property.type} />
                <DetailItem icon={<BedDouble />} label="Bedrooms" value={property.bedrooms.toString()} />
                <DetailItem icon={<Bath />} label="Bathrooms" value={property.bathrooms.toString()} />
                <DetailItem icon={<Maximize />} label="Area" value={`${property.areaSqFt} sq ft`} />
                {property.yearBuilt && <DetailItem icon={<CalendarDays />} label="Year Built" value={property.yearBuilt.toString()} />}
              </div>
              <Separator className="my-6" />
              <h3 className="text-xl font-headline mb-2">Description</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
              {property.amenities && property.amenities.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <h3 className="text-xl font-headline mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map(amenity => (
                      <Badge key={amenity} variant="secondary" className="text-sm px-3 py-1">{amenity}</Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          <PropertyMap coordinates={property.coordinates} title={property.title} />
        </div>

        {/* Sidebar: Agent Info & Contact Form */}
        <div className="space-y-8">
          {/* Agent Info Card (Listing Agent) */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Listed By</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-3">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={agent.avatarUrl || `https://placehold.co/100x100.png`} alt={agent.name} data-ai-hint="professional portrait" />
                <AvatarFallback>{agent.name.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-foreground">{agent.name}</h3>
              {agent.agency && <p className="text-sm text-muted-foreground">{agent.agency}</p>}
              {/* Contact details for the listing agent can be shown here if desired */}
              {agent.phone && 
                <div className="flex items-center text-sm text-foreground">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {agent.phone}
                </div>
              }
              {agent.email &&
                <div className="flex items-center text-sm text-foreground">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" /> {agent.email}
                </div>
              }
            </CardContent>
          </Card>

          {/* Contact Form (for platform admin) */}
          <ContactForm
            propertyTitle={property.title}
            propertyId={property.id}
          />
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-start">
    <span className="text-accent mr-2 mt-1 shrink-0">{React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}</span>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

const PropertyDetailsSkeleton = () => (
  <div className="space-y-8">
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-12 w-1/4 md:w-1/6" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-2 md:p-4">
        <Skeleton className="aspect-[16/10] w-full rounded-md" /> {/* Main image skeleton */}
        <div className="mt-3 flex space-x-2 p-1">
          {[...Array(4)].map((_, i) => ( // Show 4 thumbnail skeletons
            <Skeleton key={i} className="h-14 w-20 md:h-16 md:w-24 rounded-md shrink-0" />
          ))}
        </div>
      </CardContent>
    </Card>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
            <Skeleton className="h-px w-full my-6" />
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-px w-full my-6" />
            <Skeleton className="h-6 w-1/3 mb-3" />
            <div className="flex flex-wrap gap-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-20" />)}
            </div>
          </CardContent>
        </Card>
        <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
          <CardContent className="flex flex-col items-center space-y-3">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            {/* Skeletons for email/phone removed */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
