// src/app/admin/dashboard/machinery-oversight/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Machinery, Agent, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Edit2, CheckCircle, XCircle, MessageSquare, Tag, Hash, Package as PackageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { propertyStatuses as machineryStatuses, listingTypes } from '@/lib/types';

type StatusFilter = Machinery['status'] | 'all';
type ListingTypeFilter = Machinery['listing_type'] | 'all';

export default function MachineryOversightPage() {
  const { user: adminUser, loading: authLoading } = useAuth();
  const [allMachinery, setAllMachinery] = useState<Machinery[]>([]);
  const [filteredMachinery, setFilteredMachinery] = useState<Machinery[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingTypeFilter>('all');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [machineryToReject, setMachineryToReject] = useState<Machinery | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  const fetchMachinery = useCallback(async () => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('machinery')
      .select('*, agent:users!machinery_agent_id_fkey (id, name, email, avatar_url, role)')
      .order('status', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching machinery:', error);
      toast({ title: 'Error', description: 'Could not fetch machinery listings.', variant: 'destructive' });
      setAllMachinery([]);
    } else if (data) {
      const formattedMachinery = data.map(m => ({
        ...m,
        agent: m.agent ? { ...(m.agent as any), role: 'agent' as UserRole, id: m.agent.id! } as Agent : undefined,
        images: m.images ? (Array.isArray(m.images) ? m.images : JSON.parse(String(m.images))) : [],
        specifications: m.specifications ? (typeof m.specifications === 'string' ? JSON.parse(m.specifications) : m.specifications) : null,
      })) as Machinery[];
      setAllMachinery(formattedMachinery);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && adminUser?.role === 'platform_admin') {
      fetchMachinery();
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [adminUser, authLoading, fetchMachinery]);

  useEffect(() => {
    let machineryItems = [...allMachinery];

    if (statusFilter !== 'all') {
      machineryItems = machineryItems.filter(m => m.status === statusFilter);
    }
    if (listingTypeFilter !== 'all') {
      machineryItems = machineryItems.filter(m => m.listing_type === listingTypeFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      machineryItems = machineryItems.filter(m =>
        m.title.toLowerCase().includes(lowerSearchTerm) ||
        (m.human_readable_id && m.human_readable_id.toLowerCase().includes(lowerSearchTerm)) ||
        m.id.toLowerCase().includes(lowerSearchTerm) ||
        m.location_city.toLowerCase().includes(lowerSearchTerm) ||
        m.state.toLowerCase().includes(lowerSearchTerm) ||
        m.category.toLowerCase().includes(lowerSearchTerm) ||
        (m.agent && m.agent.name.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredMachinery(machineryItems);
  }, [searchTerm, statusFilter, listingTypeFilter, allMachinery]);
  
  const getStatusBadgeVariant = (status: Machinery['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const handleUpdateStatus = async (machineryId: string, newStatus: Machinery['status'], reason?: string) => {
    const { error } = await supabase
      .from('machinery')
      .update({ status: newStatus, rejection_reason: reason || null, updated_at: new Date().toISOString() })
      .eq('id', machineryId);

    if (error) {
      toast({ title: "Error Updating Status", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: `Machinery ${newStatus}`, description: `The machinery listing status has been updated.` });
    fetchMachinery();
    return true;
  };

  const handleApprove = (machineryId: string) => {
    handleUpdateStatus(machineryId, 'approved');
  };

  const openRejectModal = (machinery: Machinery) => {
    setMachineryToReject(machinery);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!machineryToReject || !rejectionReason.trim()) {
      toast({ title: "Error", description: "Rejection reason cannot be empty.", variant: "destructive" });
      return;
    }
    const success = await handleUpdateStatus(machineryToReject.id, 'rejected', rejectionReason);
    if (success) {
      setIsRejectModalOpen(false);
      setMachineryToReject(null);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" /> <Skeleton className="h-8 w-3/4" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
          <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminUser?.role !== 'platform_admin') {
     return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-headline">Access Denied</h1>
          <p className="text-muted-foreground">This dashboard is for platform administrators only.</p>
        </div>
      );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <PackageIcon className="mr-3 h-8 w-8 text-primary" /> Machinery Approval
        </h1>
        <p className="text-muted-foreground">Review, approve, or reject machinery listings submitted by agents.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">All Machinery Listings</CardTitle>
          <CardDescription>Manage all machinery listed on the platform and their approval status.</CardDescription>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by ID, title, category, agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={listingTypeFilter} onValueChange={(value) => setListingTypeFilter(value as ListingTypeFilter)}>
              <SelectTrigger><SelectValue placeholder="Filter by Listing Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Listing Types</SelectItem>{listingTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem>{machineryStatuses.map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMachinery.length === 0 ? (
            <div className="text-center py-10"> <p className="text-lg font-medium">No machinery listings match your filters.</p> <p className="text-muted-foreground">Try adjusting your search or filters.</p> </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title & ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Listed By (Agent)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMachinery.map((machinery) => (
                  <TableRow key={machinery.id}>
                    <TableCell>
                      <Image src={(machinery.images && machinery.images.length > 0) ? machinery.images[0] : 'https://placehold.co/64x64.png'} alt={machinery.title} width={64} height={64} className="rounded-md object-cover" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{machinery.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Hash className="w-3 h-3 mr-1" /> {machinery.human_readable_id || machinery.id.substring(0,8) + '...'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{machinery.category}</Badge>
                      <div className="text-xs text-muted-foreground capitalize mt-1">{machinery.condition}</div>
                    </TableCell>
                    <TableCell> <Badge variant="secondary" className="text-base"> ₦{machinery.price.toLocaleString()} </Badge> </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                         {machinery.agent?.avatar_url && <img src={machinery.agent.avatar_url} alt={machinery.agent.name} className="w-6 h-6 rounded-full mr-2 object-cover" />}
                         {!machinery.agent?.avatar_url && machinery.agent && <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 text-muted-foreground text-xs">{machinery.agent.name.substring(0,2).toUpperCase()}</span>}
                         {!machinery.agent && <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 text-muted-foreground text-xs">N/A</span>}
                        <div> <div>{machinery.agent?.name || 'N/A'}</div> <div className="text-xs text-muted-foreground">{machinery.agent?.email || 'N/A'}</div> </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(machinery.status)} className="capitalize text-sm px-3 py-1">{machinery.status}</Badge>
                        {machinery.status === 'rejected' && machinery.rejection_reason && (
                            <p className="text-xs text-destructive mt-1 w-40 truncate" title={machinery.rejection_reason}><MessageSquare className="inline h-3 w-3 mr-1"/>{machinery.rejection_reason}</p>
                        )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" asChild title="View Public Listing (if approved)">
                        <Link href={`/machinery/${machinery.id}`} target="_blank" rel="noopener noreferrer"><span><Eye className="h-4 w-4" /></span></Link>
                      </Button>
                      {machinery.status === 'pending' && (
                        <>
                          <Button variant="default" size="icon" onClick={() => handleApprove(machinery.id)} title="Approve Machinery" className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => openRejectModal(machinery)} title="Reject Machinery">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                       {(machinery.status === 'approved' || machinery.status === 'rejected') && (
                         <Button variant="outline" size="icon" disabled title="Edit Machinery (Admin - Not Implemented)"> <Edit2 className="h-4 w-4" /> </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {machineryToReject && (
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline">Reject Machinery: {machineryToReject.title}</DialogTitle>
              <DialogDescription>Please provide a reason for rejecting this machinery listing. This reason will be visible to the agent.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter reason for rejection..." rows={4} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectionReason.trim()}>Confirm Rejection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
