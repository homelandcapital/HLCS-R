
// src/app/admin/dashboard/property-oversight/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Property, PropertyStatus, ListingType, NigerianState, UserRole, Agent } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Home as HomeIcon, Edit2, CheckCircle, XCircle, MessageSquare, Tag, Download, Hash } from 'lucide-react';
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
import { convertToCSV, downloadCSV } from '@/lib/export-utils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { propertyStatuses as propertyStatusesList, listingTypes as listingTypesList } from '@/lib/types';


type PropertyTypeFilter = string | 'all'; // Changed from Property['property_type'] to string
type StatusFilter = PropertyStatus | 'all';
type ListingTypeFilter = ListingType | 'all';

export default function PropertyOversightPage() {
  const { user: adminUser, loading: authLoading } = useAuth();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingTypeFilter>('all');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [propertyToReject, setPropertyToReject] = useState<Property | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  const fetchProperties = useCallback(async () => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        agent:users!properties_agent_id_fkey (id, name, email, avatar_url, role, phone, agency)
      `)
      .order('status', { ascending: true }) 
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      toast({ title: 'Error', description: 'Could not fetch properties.', variant: 'destructive' });
      setAllProperties([]);
    } else if (data) {
      const formattedProperties = data.map(p => ({
        ...p,
        agent: p.agent ? {
            ...(p.agent as any), 
            role: 'agent' as UserRole, 
            id: p.agent.id!, 
        } as Agent : undefined, 
        images: p.images ? (Array.isArray(p.images) ? p.images : JSON.parse(String(p.images))) : [],
        amenities: p.amenities ? (Array.isArray(p.amenities) ? p.amenities : JSON.parse(String(p.amenities))) : [],
        property_type: p.property_type as string, // Ensure property_type is string
      })) as Property[];
      setAllProperties(formattedProperties);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && adminUser?.role === 'platform_admin') {
      fetchProperties();
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [adminUser, authLoading, fetchProperties]);

  useEffect(() => {
    let properties = [...allProperties];

    if (typeFilter !== 'all') {
      properties = properties.filter(property => property.property_type === typeFilter);
    }
    if (statusFilter !== 'all') {
      properties = properties.filter(property => property.status === statusFilter);
    }
    if (listingTypeFilter !== 'all') {
      properties = properties.filter(property => property.listing_type === listingTypeFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      properties = properties.filter(property =>
        property.title.toLowerCase().includes(lowerSearchTerm) ||
        (property.human_readable_id && property.human_readable_id.toLowerCase().includes(lowerSearchTerm)) ||
        property.id.toLowerCase().includes(lowerSearchTerm) ||
        property.location_area_city.toLowerCase().includes(lowerSearchTerm) ||
        property.state.toLowerCase().includes(lowerSearchTerm) ||
        property.address.toLowerCase().includes(lowerSearchTerm) ||
        (property.agent && property.agent.name.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredProperties(properties);
  }, [searchTerm, typeFilter, statusFilter, listingTypeFilter, allProperties]);

  const availablePropertyTypes = useMemo(() => {
    const uniqueTypes = new Set(allProperties.map(p => p.property_type));
    return Array.from(uniqueTypes).filter(Boolean) as string[]; // Changed from PropertyTypeEnum[]
  }, [allProperties]);


  const getStatusBadgeVariant = (status: PropertyStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const handleUpdateStatus = async (propertyId: string, newStatus: PropertyStatus, reason?: string) => {
    const { error } = await supabase
      .from('properties')
      .update({ status: newStatus, rejection_reason: reason || null, updated_at: new Date().toISOString() })
      .eq('id', propertyId);

    if (error) {
      toast({ title: "Error Updating Status", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: `Property ${newStatus}`, description: `The property listing status has been updated.` });
    fetchProperties(); 
    return true;
  };

  const handleApprove = (propertyId: string) => {
    handleUpdateStatus(propertyId, 'approved');
  };

  const openRejectModal = (property: Property) => {
    setPropertyToReject(property);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!propertyToReject || !rejectionReason.trim()) {
      toast({ title: "Error", description: "Rejection reason cannot be empty.", variant: "destructive" });
      return;
    }
    const success = await handleUpdateStatus(propertyToReject.id, 'rejected', rejectionReason);
    if (success) {
      setIsRejectModalOpen(false);
      setPropertyToReject(null);
    }
  };

  const handleExportProperties = () => {
    const dataToExport = filteredProperties.map(p => ({
      uuid: p.id,
      humanReadableId: p.human_readable_id || 'N/A',
      title: p.title,
      price: p.price,
      listingType: p.listing_type,
      propertyType: p.property_type,
      location: p.location_area_city,
      state: p.state,
      address: p.address,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      areaSqFt: p.area_sq_ft || '',
      status: p.status,
      agentName: p.agent?.name || 'N/A',
      agentEmail: p.agent?.email || 'N/A',
      isPromoted: p.is_promoted ? 'Yes' : 'No',
      promotionTierName: p.promotion_tier_name || '',
      rejectionReason: p.rejection_reason || '',
      yearBuilt: p.year_built || '',
    }));
    const headers = ['uuid', 'humanReadableId', 'title', 'price', 'listingType', 'propertyType', 'location', 'state', 'address', 'bedrooms', 'bathrooms', 'areaSqFt', 'status', 'agentName', 'agentEmail', 'isPromoted', 'promotionTierName', 'rejectionReason', 'yearBuilt'];
    const csvString = convertToCSV(dataToExport, headers);
    downloadCSV(csvString, 'homeland-capital-properties.csv');
    toast({ title: 'Export Started', description: 'Property data CSV download has started.' });
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
          <HomeIcon className="mr-3 h-8 w-8 text-primary" /> Property Oversight
        </h1>
        <p className="text-muted-foreground">Review, approve, or reject property listings.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">All Platform Properties</CardTitle>
              <CardDescription>Manage all properties listed on the platform.</CardDescription>
            </div>
            <Button onClick={handleExportProperties} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export Properties
            </Button>
          </div>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by ID, title, location, agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={listingTypeFilter} onValueChange={(value) => setListingTypeFilter(value as ListingTypeFilter)}>
              <SelectTrigger><SelectValue placeholder="Filter by Listing Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Listing Types</SelectItem>{listingTypesList.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as PropertyTypeFilter)}>
              <SelectTrigger><SelectValue placeholder="Filter by Prop. Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Prop. Types</SelectItem>{availablePropertyTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem>{propertyStatusesList.map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProperties.length === 0 && (searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || listingTypeFilter !== 'all') ? (
            <div className="text-center py-10"> <p className="text-lg font-medium">No properties match your filters.</p> <p className="text-muted-foreground">Try adjusting your search or filters.</p> </div>
          ) : allProperties.length === 0 ? (
             <div className="text-center py-10"> <p className="text-lg font-medium">No properties found.</p> <p className="text-muted-foreground">There are currently no properties listed.</p> </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title & ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Listing Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listed By (Agent)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Image src={(property.images && property.images.length > 0) ? property.images[0] : 'https://placehold.co/64x64.png'} alt={property.title} width={64} height={64} className="rounded-md object-cover" data-ai-hint="house exterior thumbnail"/>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Hash className="w-3 h-3 mr-1" /> {property.human_readable_id || property.id.substring(0,8) + '...'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{property.location_area_city}</div>
                      <div className="text-xs text-muted-foreground">{property.state}</div>
                    </TableCell>
                    <TableCell> <Badge variant="secondary" className="text-base"> ₦{property.price.toLocaleString()} </Badge> </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs"><Tag className="h-3 w-3 mr-1"/>{property.listing_type}</Badge></TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(property.status)} className="capitalize text-sm px-3 py-1">{property.status}</Badge>
                        {property.status === 'rejected' && property.rejection_reason && (
                            <p className="text-xs text-destructive mt-1 w-40 truncate" title={property.rejection_reason}><MessageSquare className="inline h-3 w-3 mr-1"/>{property.rejection_reason}</p>
                        )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                         {property.agent?.avatar_url && <img src={property.agent.avatar_url} alt={property.agent.name} className="w-6 h-6 rounded-full mr-2 object-cover" data-ai-hint="professional person" />}
                         {!property.agent?.avatar_url && property.agent && <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 text-muted-foreground text-xs">{property.agent.name.substring(0,2).toUpperCase()}</span>}
                         {!property.agent && <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 text-muted-foreground text-xs">N/A</span>}
                        <div> <div>{property.agent?.name || 'N/A'}</div> <div className="text-xs text-muted-foreground">{property.agent?.email || 'N/A'}</div> </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" asChild title="View Public Listing (if approved)">
                        <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer"><span><Eye className="h-4 w-4" /></span></Link>
                      </Button>
                      {property.status === 'pending' && (
                        <>
                          <Button variant="default" size="icon" onClick={() => handleApprove(property.id)} title="Approve Property" className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => openRejectModal(property)} title="Reject Property">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                       {(property.status === 'approved' || property.status === 'rejected') && (
                         <Button variant="outline" size="icon" disabled title="Edit Property (Admin - Not Implemented)"> <Edit2 className="h-4 w-4" /> </Button>
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

      {propertyToReject && (
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline">Reject Property: {propertyToReject.title}</DialogTitle>
              <DialogDescription>Please provide a reason for rejecting this property listing. This reason will be visible to the agent.</DialogDescription>
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

