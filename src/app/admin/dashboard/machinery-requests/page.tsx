
// src/app/admin/dashboard/machinery-requests/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { MachineryRequest, MachineryRequestStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PackageSearch, Search, Filter, User, CalendarDays, Info, MessageSquare, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { machineryRequestStatuses } from '@/lib/types';
import { Separator } from "@/components/ui/separator";

export default function MachineryRequestsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [allRequests, setAllRequests] = useState<MachineryRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MachineryRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MachineryRequestStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<MachineryRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('machinery_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching machinery requests:', error);
      toast({ title: 'Error', description: 'Could not fetch machinery requests.', variant: 'destructive' });
      setAllRequests([]);
    } else {
      setAllRequests(data as MachineryRequest[]);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (user?.role === 'platform_admin') {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  useEffect(() => {
    let requests = [...allRequests];
    if (statusFilter !== 'all') {
      requests = requests.filter(request => request.status === statusFilter);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      requests = requests.filter(request =>
        (request.machinery_title && request.machinery_title.toLowerCase().includes(lowerSearchTerm)) ||
        (request.user_name && request.user_name.toLowerCase().includes(lowerSearchTerm)) ||
        (request.user_email && request.user_email.toLowerCase().includes(lowerSearchTerm)) ||
        (request.machinery_category && request.machinery_category.toLowerCase().includes(lowerSearchTerm)) ||
        (request.message && request.message.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredRequests(requests);
  }, [searchTerm, statusFilter, allRequests]);

  const getStatusBadgeVariant = (status: MachineryRequestStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  const handleViewDetails = (request: MachineryRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: MachineryRequestStatus) => {
    const { error } = await supabase
      .from('machinery_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Error Updating Status', description: error.message, variant: 'destructive' });
      return;
    }
    
    setAllRequests(prev => prev.map(item =>
      item.id === requestId ? { ...item, status: newStatus } : item
    ));
    
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
    toast({ title: 'Status Updated', description: `Request status changed to "${newStatus}".` });
  };


  if (authLoading || pageLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-3/4" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
          <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (user?.role !== 'platform_admin') {
     return ( <div className="text-center py-12"> <h1 className="text-2xl font-headline">Access Denied</h1> <p className="text-muted-foreground">This dashboard is for platform administrators only.</p> </div> );
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <PackageSearch className="mr-3 h-8 w-8 text-primary" /> Machinery Requests
        </h1>
        <p className="text-muted-foreground">View and manage user requests for machinery not available on the platform.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">All Machinery Requests</CardTitle>
          <CardDescription>A list of all machinery requests submitted by users.</CardDescription>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search requests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MachineryRequestStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {machineryRequestStatuses.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 && (searchTerm || statusFilter !== 'all') ? (
            <div className="text-center py-10"><p className="text-lg font-medium">No requests match your filters.</p><p className="text-muted-foreground">Try adjusting your search term or status filter.</p></div>
          ) : allRequests.length === 0 ? (
             <div className="text-center py-10"><p className="text-lg font-medium">No Requests Found.</p><p className="text-muted-foreground">There are currently no machinery requests submitted.</p></div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested Machinery</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.machinery_title}</TableCell>
                    <TableCell>
                      <div className="font-medium">{request.user_name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{request.user_email || 'N/A'}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{request.machinery_category || 'N/A'}</Badge></TableCell>
                    <TableCell>
                        <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /><div><div>{format(new Date(request.created_at), "MMM d, yyyy")}</div><div className="text-xs text-muted-foreground">{format(new Date(request.created_at), "p")}</div></div></div>
                    </TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(request.status)} className="capitalize text-xs px-2 py-0.5">{request.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)} title="View Full Request">
                            <Info className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {selectedRequest && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl flex items-center"><PackageSearch className="mr-2 h-6 w-6 text-primary" /> Machinery Request Details</DialogTitle>
              <DialogDescription>
                Submitted on: {format(new Date(selectedRequest.created_at), "PPP p")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <InfoRow icon={<User />} label="User Name" value={selectedRequest.user_name} />
                <InfoRow icon={<User />} label="User Email" value={selectedRequest.user_email} />
                <InfoRow icon={<User />} label="User ID" value={selectedRequest.user_id} />
                
                <Separator />
                <h4 className="font-medium text-muted-foreground">Request Details</h4>
                <InfoRow icon={<PackageSearch />} label="Requested Machinery Title" value={selectedRequest.machinery_title} />
                <InfoRow icon={<Tag />} label="Requested Category" value={selectedRequest.machinery_category} />
                
                {selectedRequest.message && (
                    <>
                        <Separator />
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground flex items-center mb-1"><MessageSquare className="w-4 h-4 mr-1.5"/> User Message</Label>
                            <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-line">{selectedRequest.message}</p>
                        </div>
                    </>
                )}
                
                <Separator />
                <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center">Current Status:</Label>
                    <Badge variant={getStatusBadgeVariant(selectedRequest.status)} className="capitalize text-sm px-3 py-1">{selectedRequest.status}</Badge>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="status-update-dialog" className="text-sm font-medium">Update Status</Label>
                    <Select defaultValue={selectedRequest.status} onValueChange={(newStatus) => handleUpdateStatus(selectedRequest.id, newStatus as MachineryRequestStatus)}>
                        <SelectTrigger id="status-update-dialog"><SelectValue placeholder="Change status" /></SelectTrigger>
                        <SelectContent>{machineryRequestStatuses.map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface InfoRowProps { icon: React.ReactNode; label: string; value: string | undefined | null; className?: string; }
const InfoRow = ({ icon, label, value, className }: InfoRowProps) => (
    <div className={cn("pt-1", className)}>
        <Label className="text-xs font-medium text-muted-foreground flex items-center">
            {React.cloneElement(icon as React.ReactElement, { className: "w-3 h-3 mr-1.5" })} {label}
        </Label>
        <p className="text-sm ml-5">{value || 'N/A'}</p>
    </div>
);
