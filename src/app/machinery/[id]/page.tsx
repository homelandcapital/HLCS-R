
// src/app/machinery/[id]/page.tsx
'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Machinery, Agent, UserRole, GeneralUser } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MapPin, CalendarDays, Tag, Users, Mail, Phone, ChevronLeft, ChevronRight, Wrench, ShieldAlert, EyeOff, Hash, AlertTriangle, Building, Info, MailQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MachineryContactForm from '@/components/machinery/machinery-contact-form';


const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function MachineryDetailsPage() {
  const params = useParams();
  const idFromUrl = params.id as string;
  const [machinery, setMachinery] = useState<Machinery | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValidId, setIsValidId] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInquiryDialogOpen, setIsInquiryDialogOpen] = useState(false);
  const { user: authContextUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const fetchMachineryDetails = useCallback(async (machineryId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('machinery')
      .select('*, agent:users!machinery_agent_id_fkey(id, name, email, avatar_url, role, phone, agency)')
      .eq('id', machineryId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching machinery details:', error);
      toast({ title: 'Error', description: 'Could not fetch machinery details.', variant: 'destructive' });
      setMachinery(null);
    } else if (data) {
      const formattedMachinery = {
        ...data,
        agent: data.agent ? { ...(data.agent as any), role: 'agent' as UserRole, id: data.agent.id! } as Agent : undefined,
        images: data.images ? (Array.isArray(data.images) ? data.images : JSON.parse(String(data.images))) : [],
        specifications: data.specifications ? (typeof data.specifications === 'string' ? JSON.parse(data.specifications) : data.specifications) : null,
      } as Machinery;
      setMachinery(formattedMachinery);
    } else {
      setMachinery(null);
    }
    setLoading(false);
    setCurrentImageIndex(0);
  }, [toast]);

  useEffect(() => {
    if (idFromUrl) {
      if (UUID_REGEX.test(idFromUrl)) {
        setIsValidId(true);
        fetchMachineryDetails(idFromUrl);
      } else {
        setIsValidId(false);
        setMachinery(null);
        setLoading(false);
      }
    }
  }, [idFromUrl, fetchMachineryDetails]);
  
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


  if (loading || authLoading) {
    return <MachineryDetailsSkeleton />;
  }

  if (!isValidId) {
    return ( <div className="text-center py-20"> <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" /> <h1 className="text-4xl font-headline mb-4">Invalid Machinery Link</h1> <p className="text-muted-foreground mb-6">The link is invalid.</p> <Button asChild><Link href="/machinery">Back to Listings</Link></Button> </div> );
  }

  if (!machinery) {
    return ( <div className="text-center py-20"> <EyeOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> <h1 className="text-4xl font-headline mb-4">Machinery Not Found</h1> <p className="text-muted-foreground mb-6">This machinery does not exist or may have been removed.</p> <Button asChild><Link href="/machinery">Back to Listings</Link></Button> </div> );
  }

  const isAdmin = authContextUser?.role === 'platform_admin';
  if (machinery.status !== 'approved' && !isAdmin) {
    return ( <div className="text-center py-20"> <EyeOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> <h1 className="text-4xl font-headline mb-4">Machinery Not Available</h1> <p className="text-muted-foreground mb-6">This listing is not available for public viewing.</p> <Button asChild><Link href="/machinery">Back to Listings</Link></Button> </div> );
  }

  const images = machinery.images || [];
  const prevImage = () => setCurrentImageIndex((prevIndex) => prevIndex === 0 ? images.length - 1 : prevIndex - 1);
  const nextImage = () => setCurrentImageIndex((prevIndex) => prevIndex === images.length - 1 ? 0 : prevIndex + 1);
  const defaultImage = 'https://placehold.co/1200x800.png';
  const mainDisplayImage = images.length > 0 ? images[currentImageIndex] : defaultImage;
  
  let contactFormInitialData: { name?: string; email?: string; phone?: string } = {};
  if (authContextUser) {
    contactFormInitialData.name = authContextUser.name;
    contactFormInitialData.email = authContextUser.email;
    if (authContextUser.role === 'agent' || authContextUser.role === 'user') {
      contactFormInitialData.phone = (authContextUser as Agent | GeneralUser).phone || undefined;
    }
  }

  return (
    <div className="space-y-8">
       {isAdmin && machinery.status !== 'approved' && (
        <Card className={cn( "border-2 p-4", machinery.status === 'pending' && "border-yellow-500 bg-yellow-50/50", machinery.status === 'rejected' && "border-destructive bg-destructive/10" )}>
            <CardContent className="flex items-center gap-3 p-0"> <AlertTriangle className={cn("h-6 w-6", machinery.status === 'pending' && "text-yellow-600", machinery.status === 'rejected' && "text-destructive")} /> <div> <CardTitle className={cn("text-base font-semibold", machinery.status === 'pending' && "text-yellow-700", machinery.status === 'rejected' && "text-destructive")}> Admin View: This machinery is currently <span className="font-bold uppercase">{machinery.status}</span>. </CardTitle> <CardDescription className={cn("text-sm", machinery.status === 'pending' && "text-yellow-600", machinery.status === 'rejected' && "text-destructive-foreground/80")}> {machinery.status === 'rejected' && `Reason: ${machinery.rejection_reason || 'Not specified'}`} </CardDescription> </div> </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-headline text-primary mb-1">{machinery.title}</h1>
              {machinery.human_readable_id && <div className="text-sm text-muted-foreground mb-1 flex items-center"><Hash className="w-4 h-4 mr-1" /> ID: {machinery.human_readable_id}</div>}
              <div className="flex items-center text-muted-foreground text-sm mb-2"><MapPin className="w-4 h-4 mr-1" /> {machinery.location_city}, {machinery.state}</div>
            </div>
             <div className="flex flex-col items-stretch md:items-end gap-2 self-start md:self-center mt-4 md:mt-0">
                <div className="text-3xl font-bold text-accent whitespace-nowrap bg-secondary px-4 py-2 rounded-lg text-center md:text-right"> ₦{machinery.price.toLocaleString()} </div>
                 {machinery.status === 'approved' && (
                    <Button variant="default" size="default" className="w-full md:w-auto" onClick={handleInquireClick} disabled={authLoading}>
                    <MailQuestion className="mr-2 h-5 w-5" /> {authLoading ? 'Loading...' : 'Inquire Now'}
                    </Button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
      
       <Dialog open={isInquiryDialogOpen} onOpenChange={setIsInquiryDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Inquire about: {machinery.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Fill out the form below. Your details will be sent to the platform administrators.
            </p>
          </DialogHeader>
          <MachineryContactForm
            machineryTitle={machinery.title}
            machineryId={machinery.id}
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
            {images.length > 0 ? ( <> <Image src={mainDisplayImage} alt={`${machinery.title} - Image ${currentImageIndex + 1}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{objectFit:"cover"}} priority={true} /> {images.length > 1 && ( <> <Button variant="outline" size="icon" className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full" onClick={prevImage}> <ChevronLeft className="h-6 w-6" /> </Button> <Button variant="outline" size="icon" className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full" onClick={nextImage}> <ChevronRight className="h-6 w-6" /> </Button> </> )} </>
            ) : ( <div className="w-full h-full bg-muted flex flex-col items-center justify-center"> <Image src={defaultImage} alt="No image available" fill style={{objectFit:"contain"}} /> <p className="absolute bottom-4 text-muted-foreground">No images available</p> </div> )}
          </div>
          {images.length > 1 && ( <div className="mt-3"> <ScrollArea className="w-full whitespace-nowrap rounded-md"> <div className="flex space-x-2 p-1"> {images.map((img, index) => ( <button key={index} onClick={() => setCurrentImageIndex(index)} className={cn( "block rounded-md overflow-hidden w-20 h-14 md:w-24 md:h-16 relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background", currentImageIndex === index ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-75 transition-opacity" )} > <Image src={img} alt={`Thumbnail ${machinery.title} ${index + 1}`} fill style={{objectFit:"cover"}} /> </button> ))} </div> <ScrollBar orientation="horizontal" /> </ScrollArea> </div> )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader> <CardTitle className="font-headline">Machinery Details</CardTitle> </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-foreground">
                <DetailItem icon={<Tag />} label="Category" value={machinery.category} />
                <DetailItem icon={<Info />} label="Condition" value={machinery.condition} />
                <DetailItem icon={<Tag />} label="Listing Type" value={machinery.listing_type} />
                {machinery.manufacturer && <DetailItem icon={<Wrench />} label="Manufacturer" value={machinery.manufacturer} />}
                {machinery.model && <DetailItem icon={<Wrench />} label="Model" value={machinery.model} />}
                {machinery.year && <DetailItem icon={<CalendarDays />} label="Year" value={machinery.year.toString()} />}
              </div>
              <Separator className="my-6" />
              <h3 className="text-xl font-headline mb-2">Description</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{machinery.description}</p>
              {machinery.specifications && Object.keys(machinery.specifications).length > 0 && ( <> <Separator className="my-6" /> <h3 className="text-xl font-headline mb-3">Specifications</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2"> {Object.entries(machinery.specifications).map(([key, value]) => ( <div key={key} className="flex justify-between border-b py-1"> <span className="text-muted-foreground">{key}:</span> <span className="font-medium text-right">{String(value)}</span> </div> ))} </div> </> )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader> <CardTitle className="font-headline">Interested?</CardTitle> </CardHeader>
                <CardContent>
                    <Button variant="default" size="lg" className="w-full" onClick={handleInquireClick} disabled={authLoading}>
                        <MailQuestion className="mr-2 h-5 w-5" /> {authLoading ? 'Loading...' : 'Inquire Now'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined | null }) => {
  if (value === undefined || value === null) return null;
  return ( <div className="flex items-start"> <span className="text-accent mr-2 mt-1 shrink-0">{React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}</span> <div> <p className="text-sm text-muted-foreground">{label}</p> <p className="font-semibold">{value}</p> </div> </div> );
};

const MachineryDetailsSkeleton = () => (
  <div className="space-y-8">
    <Card><CardContent className="p-6"><div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><div><Skeleton className="h-10 w-3/4 mb-2" /><Skeleton className="h-6 w-1/2" /></div><Skeleton className="h-12 w-1/4 md:w-1/6" /></div></CardContent></Card>
    <Card><CardContent className="p-2 md:p-4"><Skeleton className="aspect-[16/10] w-full rounded-md" /><div className="mt-3 flex space-x-2 p-1">{[...Array(4)].map((_, i) => ( <Skeleton key={i} className="h-14 w-20 md:h-16 md:w-24 rounded-md shrink-0" /> ))}</div></CardContent></Card>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8"> <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div><Skeleton className="h-px w-full my-6" /><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-20 w-full" /></CardContent></Card> </div>
      <div className="space-y-8"><Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card></div>
    </div>
  </div>
);
