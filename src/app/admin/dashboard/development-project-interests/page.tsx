
// src/app/admin/dashboard/development-project-interests/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { DevelopmentProjectInterest, DevelopmentProjectInterestStatus, PlatformAdmin, UserRole, DevelopmentProjectInterestMessage } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Search, Filter, User, CalendarDays, Info, MessageSquare, MapPin, DollarSign, ExternalLink, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { developmentProjectInterestStatuses } from '@/lib/types';
import { Separator } from "@/components/ui/separator";
import { Textarea } from '@/components/ui/textarea';

export default function DevProjectInterestsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [allInterests, setAllInterests] = useState<DevelopmentProjectInterest[]>([]);
  const [filteredInterests, setFilteredInterests] = useState<DevelopmentProjectInterest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DevelopmentProjectInterestStatus | 'all'>('all');
  const [selectedInterest, setSelectedInterest] = useState<DevelopmentProjectInterest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const { toast } = useToast();

  const fetchInterests = useCallback(async () => {
    setPageLoading(true);
    const { data: interestsData, error } = await supabase
      .from('development_project_interests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project interests:', error);
      toast({ title: 'Error', description: 'Could not fetch project interests.', variant: 'destructive' });
      setAllInterests([]);
      setPageLoading(false);
      return;
    }

    if (interestsData) {
      // NOTE: Conversation fetching temporarily disabled to isolate a bug.
      const formattedInterests = interestsData.map(item => ({
        ...item,
        location_type: item.location_type as DevelopmentProjectInterest['location_type'],
        status: item.status as DevelopmentProjectInterestStatus,
        conversation: [], // Temporarily set conversation to empty array
      })) as DevelopmentProjectInterest[];
      setAllInterests(formattedInterests);
    } else {
      setAllInterests([]);
    }

    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (user?.role === 'platform_admin') {
      fetchInterests();
    }
  }, [user, fetchInterests]);

  useEffect(() => {
    let interests = [...allInterests];
    if (statusFilter !== 'all') {
      interests = interests.filter(interest => interest.status === statusFilter);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      interests = interests.filter(interest =>
        (interest.project_title && interest.project_title.toLowerCase().includes(lowerSearchTerm)) ||
        (interest.user_name && interest.user_name.toLowerCase().includes(lowerSearchTerm)) ||
        (interest.user_email && interest.user_email.toLowerCase().includes(lowerSearchTerm)) ||
        (interest.state_capital && interest.state_capital.toLowerCase().includes(lowerSearchTerm)) ||
        (interest.lga_name && interest.lga_name.toLowerCase().includes(lowerSearchTerm)) ||
        (interest.selected_budget_tier && interest.selected_budget_tier.toLowerCase().includes(lowerSearchTerm)) ||
        (interest.message && interest.message.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredInterests(interests);
  }, [searchTerm, statusFilter, allInterests]);

  const getStatusBadgeVariant = (status: DevelopmentProjectInterestStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  const handleViewDetails = (interest: DevelopmentProjectInterest) => {
    setSelectedInterest(interest);
    setIsModalOpen(true);
    setReplyMessage('');
  };

  const handleUpdateStatus = async (interestId: string, newStatus: DevelopmentProjectInterestStatus) => {
    const { error } = await supabase
      .from('development_project_interests')
      .update({ status: newStatus })
      .eq('id', interestId);

    if (error) {
      toast({ title: 'Error Updating Status', description: error.message, variant: 'destructive' });
      return false;
    }
    
    setAllInterests(prev => prev.map(item =>
      item.id === interestId ? { ...item, status: newStatus } : item
    ));
    
    if (selectedInterest && selectedInterest.id === interestId) {
      setSelectedInterest({ ...selectedInterest, status: newStatus });
    }
    toast({ title: 'Status Updated', description: `Interest status changed to "${newStatus}".` });
    return true;
  };
  
  // NOTE: Reply functionality temporarily disabled to isolate a bug.
  // const handleAdminReply = async () => {
  //   if (!selectedInterest || !replyMessage.trim() || !user || user.role !== 'platform_admin') return;
  
  //   const currentAdmin = user as PlatformAdmin;
  //   const newMessageData = {
  //     interest_id: selectedInterest.id,
  //     sender_id: currentAdmin.id,
  //     sender_role: 'platform_admin' as UserRole,
  //     sender_name: currentAdmin.name,
  //     content: replyMessage.trim(),
  //   };
  
  //   const { data: savedMessage, error: messageError } = await supabase
  //     .from('development_project_interest_messages')
  //     .insert(newMessageData)
  //     .select()
  //     .single();
  
  //   if (messageError) {
  //     toast({ title: 'Error Sending Reply', description: messageError.message, variant: 'destructive' });
  //     return;
  //   }
  
  //   if (selectedInterest.status === 'new') {
  //     await handleUpdateStatus(selectedInterest.id, 'contacted');
  //   }
  
  //   fetchInterests();
  //   setIsModalOpen(false);
  //   setTimeout(() => {
  //       const updatedInterest = allInterests.find(i => i.id === selectedInterest.id);
  //       if (updatedInterest) {
  //           setSelectedInterest(updatedInterest);
  //           setIsModalOpen(true);
  //       }
  //   }, 300);

  //   setReplyMessage('');
  //   toast({ title: 'Reply Sent', description: 'Your reply has been sent.' });
  // };


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
          <Zap className="mr-3 h-8 w-8 text-primary" /> Development Project Interests
        </h1>
        <p className="text-muted-foreground">View and manage expressions of interest for development projects.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">All Interest Submissions</CardTitle>
          <CardDescription>A list of all development project interests received.</CardDescription>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search interests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DevelopmentProjectInterestStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {developmentProjectInterestStatuses.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInterests.length === 0 && (searchTerm || statusFilter !== 'all') ? (
            <div className="text-center py-10"><p className="text-lg font-medium">No interests match your filters.</p><p className="text-muted-foreground">Try adjusting your search term or status filter.</p></div>
          ) : allInterests.length === 0 ? (
             <div className="text-center py-10"><p className="text-lg font-medium">No Interests Found.</p><p className="text-muted-foreground">There are currently no development project interests submitted.</p></div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Original Project</TableHead>
                  <TableHead>Desired Location</TableHead>
                  <TableHead>Budget Tier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterests.map((interest) => (
                  <TableRow key={interest.id}>
                    <TableCell>
                      <div className="font-medium">{interest.user_name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{interest.user_email || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      {interest.project_id && interest.project_title ? (
                        <Link href={`/development-projects/${interest.project_id}`} target="_blank" rel="noopener noreferrer" title={`View ${interest.project_title}`} className="font-medium text-primary hover:underline">
                          {interest.project_title} <ExternalLink className="inline h-3 w-3 ml-0.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">General Interest</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{interest.location_type === 'stateCapital' ? interest.state_capital : interest.lga_name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground capitalize">{interest.location_type === 'stateCapital' ? 'State Capital' : (interest.location_type ? 'LGA' : 'N/A')}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{interest.selected_budget_tier || 'N/A'}</Badge></TableCell>
                    <TableCell>
                        <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /><div><div>{format(new Date(interest.created_at), "MMM d, yyyy")}</div><div className="text-xs text-muted-foreground">{format(new Date(interest.created_at), "p")}</div></div></div>
                    </TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(interest.status)} className="capitalize text-xs px-2 py-0.5">{interest.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(interest)} title="View Full Interest">
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

      {selectedInterest && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl flex items-center"><Zap className="mr-2 h-6 w-6 text-primary" /> Interest Details</DialogTitle>
              <DialogDescription>
                Submitted on: {format(new Date(selectedInterest.created_at), "PPP p")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <InfoRow icon={<User />} label="User Name" value={selectedInterest.user_name} />
                <InfoRow icon={<User />} label="User Email" value={selectedInterest.user_email} />
                <InfoRow icon={<User />} label="User ID" value={selectedInterest.user_id} />
                {selectedInterest.project_title && <InfoRow icon={<Zap />} label="Original Project" value={selectedInterest.project_title} />}
                
                <Separator />
                <h4 className="font-medium text-muted-foreground">Desired Location</h4>
                <InfoRow icon={<MapPin />} label="Location Type" value={selectedInterest.location_type === 'stateCapital' ? 'State Capital' : (selectedInterest.location_type ? 'LGA' : 'N/A')} />
                {selectedInterest.location_type === 'stateCapital' && <InfoRow icon={<MapPin />} label="State Capital" value={selectedInterest.state_capital} />}
                {selectedInterest.location_type === 'lga' && <InfoRow icon={<MapPin />} label="LGA Name" value={selectedInterest.lga_name} />}
                
                <Separator />
                <InfoRow icon={<DollarSign />} label="Selected Budget Tier" value={selectedInterest.selected_budget_tier || 'N/A'} />
                
                <Separator />
                <div className="p-3 rounded-md bg-muted/30 border">
                  <p className="text-sm font-semibold text-muted-foreground">Initial message from user:</p>
                  <p className="text-sm whitespace-pre-line">{selectedInterest.message || "No initial message provided."}</p>
                </div>
                
                <Separator />
                <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center">Current Status:</Label>
                    <Badge variant={getStatusBadgeVariant(selectedInterest.status)} className="capitalize text-sm px-3 py-1">{selectedInterest.status}</Badge>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="status-update-dialog" className="text-sm font-medium">Update Status</Label>
                    <Select defaultValue={selectedInterest.status} onValueChange={(newStatus) => handleUpdateStatus(selectedInterest.id, newStatus as DevelopmentProjectInterestStatus)}>
                        <SelectTrigger id="status-update-dialog"><SelectValue placeholder="Change status" /></SelectTrigger>
                        <SelectContent>{developmentProjectInterestStatuses.map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}</SelectContent>
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
