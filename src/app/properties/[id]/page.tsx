'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { mockProperties, mockAgents } from '@/lib/mock-data';
import type { Property, Agent } from '@/lib/types';
import PropertyMap from '@/components/property/property-map';
import ContactForm from '@/components/property/contact-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, BedDouble, Bath, Home as HomeIcon, Maximize, CalendarDays, Tag, Users, Mail, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PropertyDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Simulate API call
      setTimeout(() => {
        const foundProperty = mockProperties.find(p => p.id === id);
        setProperty(foundProperty || null);
        setLoading(false);
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
          <Link href="/">Back to Listings</Link>
        </Button>
      </div>
    );
  }

  const { agent } = property;

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

      {/* Image Gallery */}
      <Card className="shadow-lg">
        <CardContent className="p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {property.images.slice(0,4).map((img, index) => (
              <div key={index} className={`relative aspect-video rounded-md overflow-hidden ${index === 0 && property.images.length > 1 ? 'md:col-span-2' : ''}`}>
                <Image 
                  src={img} 
                  alt={`${property.title} - Image ${index + 1}`} 
                  layout="fill"
                  objectFit="cover"
                  className="hover:scale-105 transition-transform duration-300"
                  data-ai-hint="modern interior house"
                />
              </div>
            ))}
          </div>
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
          {/* Agent Info Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Agent Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-3">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={agent.avatarUrl || `https://placehold.co/100x100.png`} alt={agent.name} data-ai-hint="professional portrait" />
                <AvatarFallback>{agent.name.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-foreground">{agent.name}</h3>
              {agent.agency && <p className="text-sm text-muted-foreground">{agent.agency}</p>}
              <div className="space-y-1 text-sm text-foreground">
                <p className="flex items-center justify-center"><Mail className="w-4 h-4 mr-2 text-accent" /> {agent.email}</p>
                <p className="flex items-center justify-center"><Phone className="w-4 h-4 mr-2 text-accent" /> {agent.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <ContactForm propertyTitle={property.title} />
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
      <CardContent className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Skeleton className="aspect-video md:col-span-2" />
          <Skeleton className="aspect-video" />
          <Skeleton className="aspect-video" />
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
            <Skeleton className="h-4 w-2/3 mt-2" />
            <Skeleton className="h-4 w-2/3" />
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
