
// src/app/agents/dashboard/my-listings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockPlatformSettings } from '@/lib/mock-data'; 
import type { Property, Agent, PropertyStatus, PromotionTierConfig, UserRole } from '@/lib/types';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabaseClient';

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToPromote, setPropertyToPromote] = useState<Property | null>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const { toast } = useToast();

  const platformSettings = mockPlatformSettings; 

  const fetchAgentProperties = useCallback(async (agentId: string) => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select(\`
        *,
        agent:users!properties_agent_id_fkey (id, name, email, avatar_url, role, phone, agency)
      \`)
      .eq('agent_id', agentId)
      .order('status', { ascending: true }) 
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching agent's properties:", error);
      toast({ title: 'Error', description: 'Could not fetch your listings.', variant: 'destructive' });
      setAgentProperties([]);
    } else if (data) {
       const formattedProperties = data.map(p => ({
        ...p,
        agent: p.agent ? { ...(p.agent as any), role: 'agent' as UserRole, id: p.agent.id! } as Agent : undefined,
        images: p.images ? (Array.isArray(p.images) ? p.images : [String(p.images)]) : [],
        amenities: p.amenities ? (Array.isArray(p.amenities) ? p.amenities : [String(p.amenities)]) : [],
      })) as Property[];
      setAgentProperties(formattedProperties);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'agent') {
      const currentAgent = user as Agent;
      fetchAgentProperties(currentAgent.id);
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [user, authLoading, fetchAgentProperties]);

  const openDeleteDialog = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyToDelete.id);

    if (error) {
      toast({ title: "Error Deleting Listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing Deleted", description: \`\${propertyToDelete.title} has been removed.\` });
      fetchAgentProperties((user as Agent).id); 
    }
    setIsDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };
  
  const handleOpenPromoteDialog = (property: Property) => {
    setPropertyToPromote(property);
    setSelectedTierId(null); 
    setIsPromoteDialogOpen(true);
  };

  const handleConfirmPromotion = async () => {
    if (!propertyToPromote || !selectedTierId) return;

    const selectedTier = platformSettings.promotionTiers.find(t => t.id === selectedTierId);
    if (!selectedTier) {
        toast({ title: "Error", description: "Selected promotion tier not found.", variant: "destructive" });
        return;
    }

    const { error } = await supabase
      .from('properties')
      .update({ 
        is_promoted: true, 
        promotion_tier_id: selectedTier.id,
        promotion_tier_name: selectedTier.name,
        promoted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyToPromote.id);

    if (error) {
      toast({ title: "Error Promoting Listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing Promoted!", description: \`\${propertyToPromote.title} promoted with \${selectedTier.name}.\` });
      fetchAgentProperties((user as Agent).id); 
    }
    setIsPromoteDialogOpen(false);
    setPropertyToPromote(null);
    setSelectedTierId(null);
  };


  const getStatusBadgeVariant = (status: PropertyStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'secondary'; 
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: PropertyStatus) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'approved': return <CheckCircle className="h-3 w-3 mr-1 text-green-600" />;
      case 'rejected': return <XCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };
  
  if (pageLoading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"> <Skeleton className="h-10 w-1/3" /> <Skeleton className="h-10 w-36" /> </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}> <Skeleton className="h-48 w-full" /> <CardHeader> <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-1/2" /> </CardHeader> <CardContent> <Skeleton className="h-4 w-full mb-2" /> <Skeleton className="h-4 w-2/3" /> </CardContent> <CardFooter className="flex justify-end gap-2"> <Skeleton className="h-9 w-20" /> <Skeleton className="h-9 w-20" /> </CardFooter> </Card>
          ))}
        </div>
      </div>
    );
  }

  if (user?.role !== 'agent') {
     return ( <div className="text-center py-12"> <h1 className="text-2xl font-headline">Access Denied</h1> <p className="text-muted-foreground">This page is for agents only.</p> <Button asChild className="mt-4"> <Link href="/"><span>Go to Homepage</span></Link> </Button> </div> );
  }

  const getSelectedTierFee = () => {
    if (!selectedTierId) return 0;
    const tier = platformSettings.promotionTiers.find(t => t.id === selectedTierId);
    return tier ? tier.fee : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div> <h1 className="text-3xl font-headline flex items-center"> <ListChecks className="mr-3 h-8 w-8 text-primary" /> My Listings </h1> <p className="text-muted-foreground">Manage your properties listed on Homeland Capital.</p> </div>
        <Button asChild> 
          <Link href="/agents/dashboard/add-property"> 
            <span className="inline-flex items-center"><PlusCircle className="mr-2 h-5 w-5" /> Add New Listing</span> 
          </Link> 
        </Button>
      </div>

      {!platformSettings.promotionsEnabled && (
        <Card className="bg-yellow-50 border-yellow-300 p-4">
            <CardContent className="flex items-center gap-3 p-0"> <AlertTriangle className="h-6 w-6 text-yellow-600" /> <div> <CardTitle className="text-yellow-700 text-base font-semibold">Property Promotions Disabled</CardTitle> <CardDescription className="text-yellow-600 text-sm">The platform administrator has currently disabled property promotions.</CardDescription> </div> </CardContent>
        </Card>
      )}

      {agentProperties.length === 0 ? (
        <Card className="text-center py-12 shadow-lg"> <CardHeader> <CardTitle className="font-headline">No Listings Yet</CardTitle> <CardDescription>You haven&apos;t added any properties. Start by adding your first listing!</CardDescription> </CardHeader> <CardContent> <Button asChild size="lg"> <Link href="/agents/dashboard/add-property"> <span className="inline-flex items-center"><PlusCircle className="mr-2 h-5 w-5" /> Add Your First Listing</span> </Link> </Button> </CardContent> </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentProperties.map(property => (
            <Card key={property.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 w-full">
                <Image src={(property.images && property.images.length > 0) ? property.images[0] : 'https://placehold.co/600x400.png'} alt={property.title} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint="house exterior"/>
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge variant={getStatusBadgeVariant(property.status)} className="capitalize flex items-center text-xs px-2 py-0.5 w-fit"> {getStatusIcon(property.status)} {property.status} </Badge>
                    {property.is_promoted && property.promotion_tier_name && ( <Badge variant="default" className="bg-yellow-500 text-black hover:bg-yellow-600 capitalize flex items-center text-xs px-2 py-0.5 w-fit"> <Star className="h-3 w-3 mr-1" /> {property.promotion_tier_name} </Badge> )}
                </div>
              </div>
              <CardHeader> <CardTitle className="font-headline text-xl line-clamp-1">{property.title}</CardTitle> <CardDescription className="text-sm">₦{property.price.toLocaleString()} - {property.location_area_city}</CardDescription> {property.status === 'rejected' && property.rejection_reason && ( <p className="text-xs text-destructive mt-1 flex items-start" title={property.rejection_reason}> <MessageSquare className="h-3 w-3 mr-1 mt-0.5 shrink-0"/> <span className="truncate">Rejection: {property.rejection_reason}</span> </p> )} </CardHeader>
              <CardContent className="flex-grow"> <p className="text-sm text-muted-foreground line-clamp-3">{property.description}</p> </CardContent>
              <CardFooter className="grid grid-cols-3 gap-2 border-t pt-4">
                <Button variant="outline" size="sm" asChild title="View Listing" disabled={property.status !== 'approved'}> 
                  <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer"> 
                    <span className="inline-flex items-center"><Eye className="h-4 w-4" /></span> 
                  </Link> 
                </Button>
                <Button variant="outline" size="sm" title="Edit Listing (Not Implemented)" disabled> <Edit3 className="h-4 w-4" /> </Button>
                <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(property)} title="Delete Listing" disabled={property.status === 'pending'}> <Trash2 className="h-4 w-4" /> </Button>
                {!property.is_promoted && ( <Button variant="outline" className="col-span-3 mt-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700" onClick={() => handleOpenPromoteDialog(property)} disabled={property.status !== 'approved' || !platformSettings.promotionsEnabled} title={!platformSettings.promotionsEnabled ? "Promotions are currently disabled" : "Promote this listing"}> <Star className="h-4 w-4 mr-2" /> Promote Listing </Button> )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       {propertyToPromote && ( <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}> <DialogContent className="sm:max-w-lg"> <DialogHeader> <DialogTitle className="font-headline text-xl flex items-center"><Star className="h-5 w-5 mr-2 text-yellow-500" /> Choose Promotion Tier</DialogTitle> <DialogDescription> Select a promotion package for "<strong>{propertyToPromote.title}</strong>". </DialogDescription> </DialogHeader> <div className="py-4 space-y-4"> <RadioGroup value={selectedTierId || ""} onValueChange={setSelectedTierId}> {platformSettings.promotionTiers.map((tier) => ( <Label key={tier.id} htmlFor={tier.id} className={cn( "flex flex-col p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors", selectedTierId === tier.id && "border-primary ring-2 ring-primary" )}> <div className="flex items-center justify-between"> <span className="font-semibold text-foreground">{tier.name}</span> <RadioGroupItem value={tier.id} id={tier.id} className="shrink-0"/> </div> <p className="text-sm text-muted-foreground mt-1">{tier.description}</p> <div className="mt-2 text-sm"> <span className="font-medium text-primary">Fee: NGN {tier.fee.toLocaleString()}</span> <span className="text-muted-foreground mx-1">|</span> <span className="text-muted-foreground">Duration: {tier.duration} days</span> </div> </Label> ))} </RadioGroup> {platformSettings.promotionTiers.length === 0 && ( <p className="text-muted-foreground text-center">No promotion tiers are currently configured by the administrator.</p> )} </div> <DialogFooter> <DialogClose asChild> <Button variant="outline">Cancel</Button> </DialogClose> <Button onClick={handleConfirmPromotion} className="bg-yellow-500 hover:bg-yellow-600 text-black" disabled={!selectedTierId || platformSettings.promotionTiers.length === 0}> {selectedTierId ? \`Promote (NGN \${getSelectedTierFee().toLocaleString()})\` : 'Select a Tier'} </Button> </DialogFooter> </DialogContent> </Dialog> )}
       {propertyToDelete && ( <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}> <DialogContent className="sm:max-w-md"> <DialogHeader> <DialogTitle className="font-headline">Confirm Deletion</DialogTitle> <DialogDescription> Are you sure you want to delete the listing "<strong>{propertyToDelete.title}</strong>"? This action cannot be undone. </DialogDescription> </DialogHeader> <DialogFooter> <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose> <Button variant="destructive" onClick={handleConfirmDelete}>Confirm Delete</Button> </DialogFooter> </DialogContent> </Dialog> )}
    </div>
  );
}
