
'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Property, Agent, UserRole, GeneralUser } from '@/lib/types';
import PropertyMap from '@/components/property/property-map';
import ContactForm from '@/components/property/contact-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MapPin, BedDouble, Bath, Building2, Maximize, CalendarDays, Tag, Users, Mail, Phone, ChevronLeft, ChevronRight, MailQuestion, ShieldAlert, EyeOff, Hash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

// Basic UUID regex for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function PropertyDetailsPage() {
  const params = useParams();
  const idFromUrl = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValidId, setIsValidId] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInquiryDialogOpen, setIsInquiryDialogOpen] = useState(false);
  const { user: authContextUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const fetchPropertyDetails = useCallback(async (propertyId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        agent:users!properties_agent_id_fkey (id, name, email, avatar_url, role, phone, agency)
      `)
      .eq('id', propertyId)
      .eq('status', 'approved') 
      .maybeSingle();

    if (error) {
      console.error('Error fetching property details:', error);
      toast({ title: 'Error', description: 'Could not fetch property details.', variant: 'destructive' });
      setProperty(null);
    } else if (data) {
      const formattedProperty = {
        ...data,
        agent: data.agent ? { ...(data.agent as any), role: 'agent' as UserRole, id: data.agent.id! } as Agent : undefined,
        images: data.images ? (Array.isArray(data.images) ? data.images : JSON.parse(String(data.images))) : [], 
        amenities: data.amenities ? (Array.isArray(data.amenities) ? data.amenities : JSON.parse(String(data.amenities))) : [], 
      } as Property;
      setProperty(formattedProperty);
    } else {
      setProperty(null); 
    }
    setLoading(false);
    setCurrentImageIndex(0);
  }, [toast]);

  useEffect(() => {
    if (idFromUrl) {
      if (UUID_REGEX.test(idFromUrl)) {
        setIsValidId(true);
        fetchPropertyDetails(idFromUrl);
      } else {
        setIsValidId(false);
        setProperty(null);
        setLoading(false);
      }
    }
  }, [idFromUrl, fetchPropertyDetails]);

  const handleInquireClick = () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to make an inquiry.",
        variant: "default",
      });
      router.push('/agents/login');
    } else {
      setIsInquiryDialogOpen(true);
    }
  };

  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!isValidId) {
    return (
       <div className="text-center py-20">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-4xl font-headline mb-4">Invalid Property Link</h1>
        <p className="text-muted-foreground mb-6">The link you followed seems to be invalid or uses an outdated format for the property ID.</p>
        <Button asChild>
          <Link href="/properties">Back to Listings</Link>
        </Button>
      </div>
    );
  }

  if (!property) {
    return (
       <div className="text-center py-20">
        <EyeOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-4xl font-headline mb-4">Property Not Found</h1>
        <p className="text-muted-foreground mb-6">The property you are looking for does not exist, is not approved, or may have been removed.</p>
        <Button asChild>
          <Link href="/properties">Back to Listings</Link>
        </Button>
      </div>
    );
  }


  const { agent } = property;
  const images = property.images || [];

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  let contactFormInitialData: { name?: string; email?: string; phone?: string } = {};
  if (authContextUser) {
    contactFormInitialData.name = authContextUser.name;
    contactFormInitialData.email = authContextUser.email;
    if (authContextUser.role === 'agent' || authContextUser.role === 'user') { 
      contactFormInitialData.phone = (authContextUser as Agent | GeneralUser).phone || undefined;
    }
  }
  const defaultImage = 'https://placehold.co/1200x800.png';
  const mainDisplayImage = images.length > 0 ? images[currentImageIndex] : defaultImage;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-headline text-primary mb-1">{property.title}</h1>
              {property.human_readable_id && (
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <Hash className="w-4 h-4 mr-1" /> ID: {property.human_readable_id}
                </div>
              )}
              <div className="flex items-center text-muted-foreground text-sm mb-2">
                <Badge variant="outline" className="mr-2">{property.listing_type}</Badge>
                <MapPin className="w-4 h-4 mr-1" />
                {property.address}, {property.location_area_city}, {property.state}
              </div>
            </div>
            <div className="flex flex-col items-stretch md:items-end gap-2 self-start md:self-center mt-4 md:mt-0">
              <div className="text-3xl font-bold text-accent whitespace-nowrap bg-secondary px-4 py-2 rounded-lg text-center md:text-right">
                ₦{property.price.toLocaleString()}
              </div>
              <Button variant="default" size="default" className="w-full md:w-auto" onClick={handleInquireClick} disabled={authLoading}>
                <MailQuestion className="mr-2 h-5 w-5" /> {authLoading ? 'Loading...' : 'Inquire Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isInquiryDialogOpen} onOpenChange={setIsInquiryDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Inquire about: {property.title}</DialogTitle>
            <DialogDescription>
              Fill out the form below. Your details (if logged in) have been pre-filled. The platform admin will get in touch.
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            propertyTitle={property.title}
            propertyId={property.id} 
            initialName={contactFormInitialData.name}
            initialEmail={contactFormInitialData.email}
            initialPhone={contactFormInitialData.phone}
            onFormSubmit={() => setIsInquiryDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardContent className="p-2 md:p-4">
          <div className="relative w-full aspect-[16/10] rounded-md overflow-hidden group">
            {images.length > 0 ? (
              <>
                <Image
                  src={mainDisplayImage}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                  style={{objectFit:"cover"}} 
                  className="transition-opacity duration-300 ease-in-out"
                  data-ai-hint="property interior detail"
                  priority={true}
                />
                {images.length > 1 && (
                  <>
                    <Button variant="outline" size="icon" className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full" onClick={prevImage} aria-label="Previous Image"> <ChevronLeft className="h-6 w-6" /> </Button>
                    <Button variant="outline" size="icon" className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full" onClick={nextImage} aria-label="Next Image"> <ChevronRight className="h-6 w-6" /> </Button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
                <Image src={defaultImage} alt="No image available" fill style={{objectFit:"contain"}} data-ai-hint="placeholder image"/>
                <p className="absolute bottom-4 text-muted-foreground">No images available</p>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3">
              <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex space-x-2 p-1">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn( "block rounded-md overflow-hidden w-20 h-14 md:w-24 md:h-16 relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background", currentImageIndex === index ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-75 transition-opacity" )}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image src={img} alt={`Thumbnail ${property.title} ${index + 1}`} fill style={{objectFit:"cover"}} />
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader> <CardTitle className="font-headline">Property Details</CardTitle> </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-foreground">
                <DetailItem icon={<Building2 />} label="Property Type" value={property.property_type} />
                <DetailItem icon={<BedDouble />} label="Bedrooms" value={property.bedrooms.toString()} />
                <DetailItem icon={<Bath />} label="Bathrooms" value={property.bathrooms.toString()} />
                {property.area_sq_ft && <DetailItem icon={<Maximize />} label="Area" value={`${property.area_sq_ft} sq ft`} />}
                {property.year_built && <DetailItem icon={<CalendarDays />} label="Year Built" value={property.year_built.toString()} />}
                <DetailItem icon={<Tag />} label="Listing Type" value={property.listing_type} />
              </div>
              <Separator className="my-6" />
              <h3 className="text-xl font-headline mb-2">Description</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
              {property.amenities && property.amenities.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <h3 className="text-xl font-headline mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map(amenity => ( <Badge key={amenity} variant="secondary" className="text-sm px-3 py-1">{amenity}</Badge> ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {property.coordinates_lat && property.coordinates_lng &&
            <PropertyMap coordinates={{lat: property.coordinates_lat, lng: property.coordinates_lng}} title={property.title} />
          }
        </div>
        <div className="space-y-8">
          {agent && (
            <Card className="shadow-lg">
              <CardHeader> <CardTitle className="font-headline">Listed By</CardTitle> </CardHeader>
              <CardContent className="flex flex-col items-center text-center space-y-3">
                <Avatar className="w-24 h-24 border-2 border-primary">
                  <AvatarImage src={agent.avatar_url || `https://placehold.co/100x100.png`} alt={agent.name || 'Agent'} data-ai-hint="professional portrait" />
                  <AvatarFallback>{agent.name ? agent.name.substring(0,2).toUpperCase() : 'AG'}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold text-foreground">{agent.name}</h3>
                {agent.agency && <p className="text-sm text-muted-foreground">{agent.agency}</p>}
                {agent.phone && <div className="flex items-center text-sm text-foreground"> <Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {agent.phone} </div> }
                {agent.email && <div className="flex items-center text-sm text-foreground"> <Mail className="w-4 h-4 mr-2 text-muted-foreground" /> {agent.email} </div> }
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined | null }) => {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex items-start">
      <span className="text-accent mr-2 mt-1 shrink-0">{React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}</span>
      <div> <p className="text-sm text-muted-foreground">{label}</p> <p className="font-semibold">{value}</p> </div>
    </div>
  );
};

const PropertyDetailsSkeleton = () => (
  <div className="space-y-8">
    <Card> <CardContent className="p-6"> <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"> <div> <Skeleton className="h-10 w-3/4 mb-2" /> <Skeleton className="h-6 w-1/2" /> </div> <Skeleton className="h-12 w-1/4 md:w-1/6" /> </div> </CardContent> </Card>
    <Card> <CardContent className="p-2 md:p-4"> <Skeleton className="aspect-[16/10] w-full rounded-md" /> <div className="mt-3 flex space-x-2 p-1"> {[...Array(4)].map((_, i) => ( <Skeleton key={i} className="h-14 w-20 md:h-16 md:w-24 rounded-md shrink-0" /> ))} </div> </CardContent> </Card>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card> <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader> <CardContent className="space-y-4"> <div className="grid grid-cols-2 sm:grid-cols-3 gap-4"> {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)} </div> <Skeleton className="h-px w-full my-6" /> <Skeleton className="h-6 w-1/4 mb-2" /> <Skeleton className="h-20 w-full" /> <Skeleton className="h-px w-full my-6" /> <Skeleton className="h-6 w-1/3 mb-3" /> <div className="flex flex-wrap gap-2"> {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-20" />)} </div> </CardContent> </Card>
        <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
      </div>
      <div className="space-y-8"> <Card> <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader> <CardContent className="flex flex-col items-center space-y-3"> <Skeleton className="w-24 h-24 rounded-full" /> <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-1/2" /> </CardContent> </Card> </div>
    </div>
  </div>
);
