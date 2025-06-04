
// src/app/agents/dashboard/my-listings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { mockProperties } from '@/lib/mock-data';
import type { Property, Agent, PropertyStatus } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Edit3, Trash2, Eye, PlusCircle, ListChecks, AlertTriangle, CheckCircle, XCircle, MessageSquare, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [propertyToPromote, setPropertyToPromote] = useState<Property | null>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user && user.role === 'agent') {
      const currentAgent = user as Agent;
      const properties = mockProperties.filter(p => p.agent.id === currentAgent.id)
                                     .sort((a,b) => {
                                       // Sort by status first (pending, then others), then by a pseudo date
                                        if (a.status === 'pending' && b.status !== 'pending') return -1;
                                        if (a.status !== 'pending' && b.status === 'pending') return 1;
                                        return new Date(b.id.slice(-10)).getTime() - new Date(a.id.slice(-10)).getTime()
                                     }); 
      setAgentProperties(properties);
      setPageLoading(false);
    } else if (!authLoading && (!user || user.role !== 'agent')) {
      setPageLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // mockProperties removed from deps to prevent re-sort on promote/delete

  const handleDelete = (propertyId: string) => {
    setAgentProperties(prev => prev.filter(p => p.id !== propertyId));
    const indexToRemove = mockProperties.findIndex(p => p.id === propertyId);
    if (indexToRemove > -1) {
        // mockProperties.splice(indexToRemove, 1); // Commented out to prevent direct mock data mutation affecting other sessions/tests
        console.log("Simulated deletion from mockProperties (actual removal commented out for stability)");
        toast({ title: "Listing Deleted (Simulated)", description: "The listing has been removed from your view." });
    }
  };

  const handleOpenPromoteDialog = (property: Property) => {
    setPropertyToPromote(property);
    setIsPromoteDialogOpen(true);
  };

  const handleConfirmPromotion = () => {
    if (!propertyToPromote) return;

    const updatedProperties = agentProperties.map(p =>
      p.id === propertyToPromote.id ? { ...p, isPromoted: true } : p
    );
    setAgentProperties(updatedProperties);

    const mockPropertyIndex = mockProperties.findIndex(p => p.id === propertyToPromote.id);
    if (mockPropertyIndex !== -1) {
      mockProperties[mockPropertyIndex].isPromoted = true;
    }
    
    toast({ title: "Listing Promoted!", description: `${propertyToPromote.title} is now a promoted listing.` });
    setIsPromoteDialogOpen(false);
    setPropertyToPromote(null);
  };


  const getStatusBadgeVariant = (status: PropertyStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'secondary'; // Changed for better contrast with promoted
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: PropertyStatus) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'approved': return <CheckCircle className="h-3 w-3 mr-1 text-green-600" />; // Explicitly green
      case 'rejected': return <XCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };
  
  if (pageLoading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader> <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-1/2" /> </CardHeader>
              <CardContent> <Skeleton className="h-4 w-full mb-2" /> <Skeleton className="h-4 w-2/3" /> </CardContent>
              <CardFooter className="flex justify-end gap-2"> <Skeleton className="h-9 w-20" /> <Skeleton className="h-9 w-20" /> </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (user?.role !== 'agent') {
     return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-headline">Access Denied</h1>
          <p className="text-muted-foreground">This page is for agents only.</p>
           <Button asChild className="mt-4"> <Link href="/"><span>Go to Homepage</span></Link> </Button>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline flex items-center"> <ListChecks className="mr-3 h-8 w-8 text-primary" /> My Listings </h1>
          <p className="text-muted-foreground">Manage your properties listed on Homeland Capital.</p>
        </div>
        <Button asChild>
          <Link href="/agents/dashboard/add-property">
            <span><PlusCircle className="mr-2 h-5 w-5" /> Add New Listing</span>
          </Link>
        </Button>
      </div>

      {agentProperties.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader> <CardTitle className="font-headline">No Listings Yet</CardTitle> <CardDescription>You haven&apos;t added any properties. Start by adding your first listing!</CardDescription> </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/agents/dashboard/add-property">
                <span><PlusCircle className="mr-2 h-5 w-5" /> Add Your First Listing</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentProperties.map(property => (
            <Card key={property.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 w-full">
                <Image src={property.images[0]} alt={property.title} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint="house exterior"/>
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge variant={getStatusBadgeVariant(property.status)} className="capitalize flex items-center text-xs px-2 py-0.5 w-fit">
                    {getStatusIcon(property.status)} {property.status}
                    </Badge>
                    {property.isPromoted && (
                        <Badge variant="default" className="bg-yellow-500 text-black hover:bg-yellow-600 capitalize flex items-center text-xs px-2 py-0.5 w-fit">
                            <Star className="h-3 w-3 mr-1" /> Promoted
                        </Badge>
                    )}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-xl line-clamp-1">{property.title}</CardTitle>
                <CardDescription className="text-sm">₦{property.price.toLocaleString()} - {property.location}</CardDescription>
                {property.status === 'rejected' && property.rejectionReason && (
                     <p className="text-xs text-destructive mt-1 flex items-start" title={property.rejectionReason}>
                        <MessageSquare className="h-3 w-3 mr-1 mt-0.5 shrink-0"/>
                        <span className="truncate">Rejection: {property.rejectionReason}</span>
                    </p>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{property.description}</p>
              </CardContent>
              <CardFooter className="grid grid-cols-3 gap-2 border-t pt-4">
                <Button variant="outline" size="sm" asChild title="View Listing" disabled={property.status !== 'approved'}>
                  <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
                    <span><Eye className="h-4 w-4" /></span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" title="Edit Listing" disabled> <Edit3 className="h-4 w-4" /> </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(property.id)} title="Delete Listing (Simulated)" disabled={property.status === 'pending'}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                {!property.isPromoted && (
                  <Button 
                    variant="outline" 
                    className="col-span-3 mt-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                    onClick={() => handleOpenPromoteDialog(property)} 
                    disabled={property.status !== 'approved'}
                    title="Promote this listing"
                  >
                    <Star className="h-4 w-4 mr-2" /> Promote Listing
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       {propertyToPromote && (
        <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl flex items-center"><Star className="h-5 w-5 mr-2 text-yellow-500" /> Promote Listing</DialogTitle>
              <DialogDescription>
                Promote "<strong>{propertyToPromote.title}</strong>"?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>A simulated fee of <strong className="text-primary">NGN 5,000</strong> will be applied to promote this listing.</p>
              <p className="text-sm text-muted-foreground mt-1">This will increase its visibility on the platform.</p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleConfirmPromotion} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Confirm Promotion (NGN 5,000)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
