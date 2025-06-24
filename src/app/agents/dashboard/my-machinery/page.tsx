
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Machinery, Agent, UserRole } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Eye, PlusCircle, ListChecks, AlertTriangle, CheckCircle, XCircle, MessageSquare, Hash, Wrench, MapPin, Tag, CalendarDays, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

export default function MyMachineryPage() {
  const { user, loading: authLoading } = useAuth();
  const [agentMachinery, setAgentMachinery] = useState<Machinery[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [machineryToDelete, setMachineryToDelete] = useState<Machinery | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchAgentMachinery = useCallback(async (agentId: string) => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('machinery')
      .select('*, agent:users!machinery_agent_id_fkey(id, name, email, avatar_url, role)')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Could not fetch your machinery listings.', variant: 'destructive' });
      setAgentMachinery([]);
    } else if (data) {
      const formattedMachinery = data.map(m => ({
        ...m,
        agent: m.agent ? { ...(m.agent as any), role: 'agent' as UserRole, id: m.agent.id! } as Agent : undefined,
        images: m.images ? (Array.isArray(m.images) ? m.images : JSON.parse(String(m.images))) : [],
        specifications: m.specifications ? (typeof m.specifications === 'string' ? JSON.parse(m.specifications) : m.specifications) : null,
      })) as Machinery[];
      setAgentMachinery(formattedMachinery);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'agent') {
      fetchAgentMachinery(user.id);
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [user, authLoading, fetchAgentMachinery]);

  const openDeleteDialog = (machinery: Machinery) => {
    setMachineryToDelete(machinery);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!machineryToDelete || !user || user.role !== 'agent' || machineryToDelete.agent_id !== user.id) {
      toast({ title: "Error", description: "You are not authorized to perform this action.", variant: "destructive" });
      return;
    }
    if (machineryToDelete.status !== 'rejected') {
      toast({ title: "Action Not Allowed", description: "Only rejected listings can be deleted.", variant: "destructive" });
      setIsDeleteDialogOpen(false);
      return;
    }

    const { error } = await supabase.from('machinery').delete().eq('id', machineryToDelete.id);

    if (error) {
      toast({ title: "Error Deleting Listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing Deleted", description: `${machineryToDelete.title} has been removed.` });
      fetchAgentMachinery(user.id);
    }
    setIsDeleteDialogOpen(false);
    setMachineryToDelete(null);
  };

  const getStatusBadgeVariant = (status: Machinery['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getStatusIcon = (status: Machinery['status']) => {
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
          {[...Array(3)].map((_, i) => <Card key={i}> <Skeleton className="h-48 w-full" /> <CardHeader> <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-1/2" /> </CardHeader> <CardContent> <Skeleton className="h-4 w-full mb-2" /> <Skeleton className="h-4 w-2/3" /> </CardContent> <CardFooter className="flex justify-end gap-2"> <Skeleton className="h-9 w-20" /> <Skeleton className="h-9 w-20" /> </CardFooter> </Card>)}
        </div>
      </div>
    );
  }

  if (user?.role !== 'agent') {
    return ( <div className="text-center py-12"> <h1 className="text-2xl font-headline">Access Denied</h1> <p className="text-muted-foreground">This page is for agents only.</p> <Button asChild className="mt-4"> <Link href="/"><span>Go to Homepage</span></Link> </Button> </div> );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div> <h1 className="text-3xl font-headline flex items-center"> <Wrench className="mr-3 h-8 w-8 text-primary" /> My Machinery Listings </h1> <p className="text-muted-foreground">Manage your machinery listed on Homeland Capital.</p> </div>
          <Button asChild> <Link href="/agents/dashboard/add-machinery"> <PlusCircle className="mr-2 h-5 w-5" /> Add New Machinery </Link> </Button>
        </div>

        {agentMachinery.length === 0 ? (
          <Card className="text-center py-12 shadow-lg"> <CardHeader> <CardTitle className="font-headline">No Machinery Yet</CardTitle> <CardDescription>You haven&apos;t added any machinery. Start by adding your first listing!</CardDescription> </CardHeader> <CardContent> <Button asChild size="lg"> <Link href="/agents/dashboard/add-machinery"> <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Machinery Listing </Link> </Button> </CardContent> </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentMachinery.map(machinery => (
              <Card key={machinery.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
                <CardHeader className="p-0 relative">
                  <div className="block w-full h-56 relative">
                    <Image src={machinery.images?.[0] || 'https://placehold.co/600x400.png?text=No+Image'} alt={machinery.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                    <Badge variant={getStatusBadgeVariant(machinery.status)} className="capitalize flex items-center text-xs px-2 py-0.5 shadow-md"> {getStatusIcon(machinery.status)} {machinery.status} </Badge>
                    <Badge variant="outline" className="capitalize text-xs px-2 py-0.5 shadow-md">{machinery.listing_type}</Badge>
                  </div>
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-semibold shadow-md z-10"> ₦{machinery.price.toLocaleString()} </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <h3 className="text-xl font-headline mb-1 line-clamp-2">{machinery.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mb-0.5"><Hash className="w-3 h-3 mr-1" /> {machinery.human_readable_id}</div>
                  <div className="flex items-center text-muted-foreground text-sm mb-1"><MapPin className="w-4 h-4 mr-1" /> {machinery.location_city}, {machinery.state}</div>
                  <div className="flex items-center text-muted-foreground text-sm mb-2"><Tag className="w-4 h-4 mr-1" /> {machinery.category} ({machinery.condition})</div>
                  {machinery.status === 'rejected' && machinery.rejection_reason && (
                    <p className="text-xs text-destructive mt-0 mb-2 flex items-start" title={machinery.rejection_reason}><MessageSquare className="h-3 w-3 mr-1 mt-0.5"/> <span className="truncate">Rejection: {machinery.rejection_reason}</span></p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center"><span className="mr-1">Created:</span>{format(new Date(machinery.created_at), "dd MMM yy")}</div>
                    {machinery.year && <div className="flex items-center"><CalendarDays className="w-3 h-3 mr-1"/> Year: {machinery.year}</div>}
                  </div>
                </CardContent>
                <CardFooter className="p-4 border-t mt-auto flex flex-wrap gap-2 justify-start">
                  <Button variant="outline" size="sm" asChild title="View Public Listing (if approved)" disabled> <Link href={`/machinery/${machinery.id}`}> <span className="flex items-center"><Eye className="h-4 w-4 mr-1.5 sm:mr-0" /> <span className="sm:hidden">View</span></span> </Link> </Button>
                  <Button variant="outline" size="sm" title="Edit Listing (Not Implemented)" disabled> <Edit3 className="h-4 w-4" /> </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(machinery)} title="Delete Listing" disabled={machinery.status !== 'rejected'}> <Trash2 className="h-4 w-4" /> </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {machineryToDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md"> <DialogHeader> <DialogTitle className="font-headline">Confirm Deletion</DialogTitle> <DialogDescription> <span>Are you sure you want to delete the listing "<strong>{machineryToDelete.title}</strong>"? This action cannot be undone.</span> </DialogDescription> </DialogHeader> <DialogFooter> <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose> <Button variant="destructive" onClick={handleConfirmDelete}>Confirm Delete</Button> </DialogFooter> </DialogContent>
        </Dialog>
      )}
    </>
  );
}
