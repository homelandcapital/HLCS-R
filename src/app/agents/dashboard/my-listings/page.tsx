
// src/app/agents/dashboard/my-listings/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Property, Agent, PromotionTierConfig, UserRole, PlatformSettings } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Script from 'next/script';
import { Edit3, Trash2, Eye, PlusCircle, ListChecks, AlertTriangle, Star, LayoutGrid, List, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabaseClient';
import AgentPropertyGridItem from '@/components/property/agent-property-grid-item';
import AgentPropertyListItem from '@/components/property/agent-property-list-item';
import { initializePayment, verifyPayment } from '@/actions/paystack-actions';
import type { InitializePaymentInput } from '@/actions/paystack-actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';


declare global {
  interface Window {
    PaystackPop?: any;
  }
}

function generateCustomPaystackReference(propertyIdSuffix: string, tierId: string): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); 
  const day = now.getDate().toString().padStart(2, '0'); 
  const hours = now.getHours().toString().padStart(2, '0'); 
  const minutes = now.getMinutes().toString().padStart(2, '0'); 
  const seconds = now.getSeconds().toString().padStart(2, '0'); 
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
  
  const shortPropId = propertyIdSuffix.substring(0, 8); 
  return `Promo-${year}${day}${hours}${minutes}${seconds}${month}_${shortPropId}_${tierId}`;
}


export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToPromote, setPropertyToPromote] = useState<Property | null>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isVerifyingViaUrl, setIsVerifyingViaUrl] = useState(false); 
  const [paystackScriptLoaded, setPaystackScriptLoaded] = useState(false);


  const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const fetchPlatformSettings = useCallback(async () => {
    const { data: dbSettings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1) 
      .single();

    if (settingsError || !dbSettings) {
      console.warn("[MyListingsPage] Error fetching platform settings or no settings found:", settingsError?.message);
    } else {
        const promotionTiersFromDb = Array.isArray(dbSettings.promotion_tiers) 
            ? dbSettings.promotion_tiers as PromotionTierConfig[]
            : [];
        setPlatformSettings({
            ...dbSettings,
            promotionsEnabled: dbSettings.promotions_enabled ?? true,
            promotionTiers: promotionTiersFromDb,
        } as PlatformSettings);
    }
  }, []);


  const fetchAgentProperties = useCallback(async (agentId: string) => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*, promotion_expires_at, agent:users!properties_agent_id_fkey(id, name, email, avatar_url, role, phone, agency)')
      .eq('agent_id', agentId)
      .order('status', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Could not fetch your listings.', variant: 'destructive' });
      setAgentProperties([]);
    } else if (data) {
       const formattedProperties = data.map(p => ({
        ...p,
        agent: p.agent ? { ...(p.agent as any), role: 'agent' as UserRole, id: p.agent.id! } as Agent : undefined,
        images: p.images ? (Array.isArray(p.images) ? p.images : JSON.parse(String(p.images))) : [],
        amenities: p.amenities ? (Array.isArray(p.amenities) ? p.amenities : JSON.parse(String(p.amenities))) : [],
      })) as Property[];
      setAgentProperties(formattedProperties);
    }
    setPageLoading(false);
  }, [toast]);

  const handleVerifyPayment = useCallback(async (reference: string) => {
    if (!user || user.role !== 'agent') return;
    setIsProcessingPayment(true);

    const response = await verifyPayment(reference);

    if (response.success && response.paymentSuccessful) {
      toast({ title: 'Promotion Activated!', description: response.message });
      fetchAgentProperties(user.id);
    } else {
      toast({ title: 'Promotion Verification Failed', description: response.message || 'Could not verify payment.', variant: 'destructive' });
    }
    setIsProcessingPayment(false);
    setIsVerifyingViaUrl(false); 
    router.replace('/agents/dashboard/my-listings', undefined); 
  }, [user, fetchAgentProperties, toast, router]);


  useEffect(() => {
    fetchPlatformSettings();
    if (!authLoading && user && user.role === 'agent') {
      fetchAgentProperties(user.id);
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [user, authLoading, fetchAgentProperties, fetchPlatformSettings]);

   useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (reference && !isProcessingPayment && !isVerifyingViaUrl) {
      setIsVerifyingViaUrl(true); 
      handleVerifyPayment(reference);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isProcessingPayment, handleVerifyPayment]);


  const openDeleteDialog = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete || !user || user.role !== 'agent') return;
    if (propertyToDelete.agent_id !== user.id) {
        toast({ title: "Unauthorized", description: "You can only delete your own listings.", variant: "destructive" });
        setIsDeleteDialogOpen(false);
        setPropertyToDelete(null);
        return;
    }
    if (propertyToDelete.status === 'approved' || propertyToDelete.status === 'pending') {
        toast({ title: "Action Not Allowed", description: "Approved or pending listings cannot be deleted by agents. Only rejected listings can be deleted.", variant: "destructive" });
        setIsDeleteDialogOpen(false);
        setPropertyToDelete(null);
        return;
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyToDelete.id);

    if (error) {
      toast({ title: "Error Deleting Listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing Deleted", description: `${propertyToDelete.title} has been removed.` });
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

  const handleInitiatePromotionPayment = async () => {
    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes('PLACEHOLDER')) {
        toast({
            title: "Paystack Key Missing",
            description: "The Paystack public key is not configured. Please ask the site administrator to set it up.",
            variant: "destructive",
        });
        return;
    }
    if (!propertyToPromote) {
        toast({ title: "Error", description: "No property selected. Please close the dialog and try again.", variant: "destructive" });
        return;
    }
    if (!selectedTierId) {
        toast({ title: "Error", description: "Please select a promotion tier before proceeding.", variant: "destructive" });
        return;
    }
    if (!user || user.role !== 'agent') {
        toast({ title: "Authentication Error", description: "You must be logged in as an agent.", variant: "destructive" });
        return;
    }
    if (!platformSettings) {
        toast({ title: "Configuration Error", description: "Platform promotion settings could not be loaded.", variant: "destructive" });
        return;
    }

    if (propertyToPromote.agent_id !== user.id) {
      toast({ title: "Unauthorized", description: "You can only promote your own listings.", variant: "destructive" }); return;
    }

    const selectedTier = platformSettings.promotionTiers.find(t => t.id === selectedTierId);
    if (!selectedTier) {
      toast({ title: "Error", description: "Selected promotion tier not found.", variant: "destructive" }); return;
    }

    setIsProcessingPayment(true);
    const uniqueReference = generateCustomPaystackReference(propertyToPromote.id, selectedTier.id);

    const metadataForPaystack = {
        custom_fields: [
            { display_name: "Property ID", variable_name: "property_id", value: propertyToPromote.id },
            { display_name: "Tier ID", variable_name: "tier_id", value: selectedTier.id },
            { display_name: "Tier Name", variable_name: "tier_name", value: selectedTier.name },
            { display_name: "Tier Fee NGN", variable_name: "tier_fee", value: selectedTier.fee.toString() },
            { display_name: "Tier Duration Days", variable_name: "tier_duration", value: selectedTier.duration.toString() },
            { display_name: "Agent ID", variable_name: "agent_id", value: user.id },
            { display_name: "Purpose", variable_name: "purpose", value: "property_promotion" }
        ],
        property_title_for_display: propertyToPromote.title 
    };
    
    const paymentDetailsForServerAction: InitializePaymentInput = {
      email: user.email,
      amountInKobo: selectedTier.fee * 100,
      reference: uniqueReference,
      metadata: metadataForPaystack,
      callbackUrl: `${window.location.origin}${window.location.pathname}` 
    };

    const initResponse = await initializePayment(paymentDetailsForServerAction);

    if (!initResponse.success || !initResponse.data) {
      toast({ title: "Payment Initialization Failed", description: initResponse.message, variant: "destructive" });
      setIsProcessingPayment(false);
      return;
    }
    
    if (window.PaystackPop && paystackScriptLoaded) {
      setIsPromoteDialogOpen(false); 
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: selectedTier.fee * 100,
        ref: initResponse.data.reference, 
        metadata: metadataForPaystack,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        callback: function(response: any) {
          handleVerifyPayment(response.reference);
        },
        onClose: function() {
          toast({ title: "Payment Canceled", description: "You closed the payment window.", variant: "default" });
          setIsProcessingPayment(false);
        },
      });
      handler.openIframe();
    } else {
      toast({ title: "Paystack Not Ready", description: "Paystack script not loaded or public key missing.", variant: "destructive" });
      setIsProcessingPayment(false);
    }
  };


  if (pageLoading || authLoading || !platformSettings) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"> <Skeleton className="h-10 w-1/3" /> <Skeleton className="h-10 w-36" /> </div>
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4')}>
          {[...Array(3)].map((_, i) => (
            viewMode === 'grid' ?
            <Card key={i}> <Skeleton className="h-48 w-full" /> <CardHeader> <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-1/2" /> </CardHeader> <CardContent> <Skeleton className="h-4 w-full mb-2" /> <Skeleton className="h-4 w-2/3" /> </CardContent> <CardFooter className="flex justify-end gap-2"> <Skeleton className="h-9 w-20" /> <Skeleton className="h-9 w-20" /> </CardFooter> </Card>
            : <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (user?.role !== 'agent') {
     return ( <div className="text-center py-12"> <h1 className="text-2xl font-headline">Access Denied</h1> <p className="text-muted-foreground">This page is for agents only.</p> <Button asChild className="mt-4"> <Link href="/">Go to Homepage</Link> </Button> </div> );
  }

  const getSelectedTierFee = () => {
    if (!selectedTierId || !platformSettings) return 0;
    const tier = platformSettings.promotionTiers.find(t => t.id === selectedTierId);
    return tier ? tier.fee : 0;
  };

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="lazyOnload"
        onLoad={() => {
          setPaystackScriptLoaded(true);
        }}
        onError={(e) => {
          console.error('Error loading Paystack script:', e);
          setPaystackScriptLoaded(false);
          toast({title: "Error", description: "Could not load payment script. Promotions may not work.", variant: "destructive"});
        }}
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div> <h1 className="text-3xl font-headline flex items-center"> <ListChecks className="mr-3 h-8 w-8 text-primary" /> My Listings </h1> <p className="text-muted-foreground">Manage your properties listed on Homeland Capital.</p> </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view" title="Grid view"> <LayoutGrid className="h-5 w-5" /> </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="List view" title="List view"> <List className="h-5 w-5" /> </Button>
            <Button asChild>
              <Link href="/agents/dashboard/add-property">
                <span className="inline-flex items-center">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Listing
                </span>
              </Link>
            </Button>
          </div>
        </div>

        {platformSettings && !platformSettings.promotionsEnabled && (
          <Card className="bg-yellow-50 border-yellow-300 p-4">
              <CardContent className="flex items-center gap-3 p-0"> <AlertTriangle className="h-6 w-6 text-yellow-600" /> <div> <CardTitle className="text-yellow-700 text-base font-semibold">Property Promotions Disabled</CardTitle> <CardDescription className="text-yellow-600 text-sm">The platform administrator has currently disabled property promotions.</CardDescription> </div> </CardContent>
          </Card>
        )}

        {agentProperties.length === 0 ? (
          <Card className="text-center py-12 shadow-lg"> <CardHeader> <CardTitle className="font-headline">No Listings Yet</CardTitle> <CardDescription>You haven&apos;t added any properties. Start by adding your first listing!</CardDescription> </CardHeader> <CardContent> 
            <Button asChild size="lg">
              <Link href="/agents/dashboard/add-property">
                <span className="inline-flex items-center">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Listing
                </span>
              </Link>
            </Button> </CardContent> </Card>
        ) : (
          <div className={cn( viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col space-y-4' )}>
            {agentProperties.map(property =>
              viewMode === 'grid' ? (
                <AgentPropertyGridItem key={property.id} property={property} onOpenDeleteDialog={openDeleteDialog} onOpenPromoteDialog={handleOpenPromoteDialog} platformSettings={platformSettings} />
              ) : (
                <AgentPropertyListItem key={property.id} property={property} onOpenDeleteDialog={openDeleteDialog} onOpenPromoteDialog={handleOpenPromoteDialog} platformSettings={platformSettings} />
              )
            )}
          </div>
        )}
        {propertyToPromote && platformSettings && (
          <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader> <DialogTitle className="font-headline text-xl"> <span className="flex items-center"> <Star className="h-5 w-5 mr-2 text-yellow-500" /> Choose Promotion Tier </span> </DialogTitle> <DialogDescription> <span>Select a promotion package for "<strong>{propertyToPromote.title}</strong>".</span> </DialogDescription> </DialogHeader>
              <div className="py-4 space-y-4">
                <RadioGroup value={selectedTierId || ""} onValueChange={setSelectedTierId} className="space-y-3">
                  {platformSettings.promotionTiers.map((tier) => (
                    <div key={tier.id} className={cn( "flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors", selectedTierId === tier.id && "border-primary ring-2 ring-primary bg-primary/5" )} onClick={() => setSelectedTierId(tier.id)} >
                      <RadioGroupItem value={tier.id} id={`promo-tier-item-${tier.id}`} className="mt-1 shrink-0"/>
                      <Label htmlFor={`promo-tier-item-${tier.id}`} className="flex-grow cursor-pointer space-y-1">
                        <div className="flex items-center justify-between"> <span className="font-semibold text-foreground">{tier.name}</span> </div>
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                        <div className="text-sm"> <span className="font-medium text-primary">Fee: NGN {tier.fee.toLocaleString()}</span> <span className="text-muted-foreground mx-1">|</span> <span className="text-muted-foreground">Duration: {tier.duration} days</span> </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {platformSettings.promotionTiers.length === 0 && ( <p className="text-muted-foreground text-center">No promotion tiers are currently configured by the administrator.</p> )}
              </div>
              <form onSubmit={(e) => e.preventDefault()}>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                  <Button onClick={handleInitiatePromotionPayment} className="bg-yellow-500 hover:bg-yellow-600 text-black" disabled={!selectedTierId || platformSettings.promotionTiers.length === 0 || isProcessingPayment || !paystackScriptLoaded} type="button">
                    {isProcessingPayment ? 'Processing...' : (selectedTierId ? `Promote (NGN ${getSelectedTierFee().toLocaleString()})` : 'Select a Tier')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {propertyToDelete && (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md"> <DialogHeader> <DialogTitle className="font-headline">Confirm Deletion</DialogTitle> <DialogDescription> <span>Are you sure you want to delete the listing "<strong>{propertyToDelete.title}</strong>"? This action cannot be undone.</span> </DialogDescription> </DialogHeader> <DialogFooter> <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose> <Button variant="destructive" onClick={handleConfirmDelete}>Confirm Delete</Button> </DialogFooter> </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
