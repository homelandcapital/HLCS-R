// src/app/admin/dashboard/project-interests/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import type { CommunityProjectInterest, CommunityProjectInterestStatus, UserRole, PlatformAdmin, CommunityProjectInterestMessage } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileHeart, Search, Filter, User, CalendarDays, Info, MessageSquare, MapPin, DollarSign, ExternalLink, Send } from 'lucide-react';
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
import { communityProjectInterestStatuses } from '@/lib/types';
import { Separator } from "@/components/ui/separator";
import { Textarea } from '@/components/ui/textarea';
import { getCommunityInterestConversation, replyToCommunityInterest } from '@/actions/admin-interest-actions';


export default function ProjectInterestsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [allInterests, setAllInterests] = useState<CommunityProjectInterest[]>([]);
  const [filteredInterests, setFilteredInterests] = useState<CommunityProjectInterest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommunityProjectInterestStatus | 'all'>('all');
  const [selectedInterest, setSelectedInterest] = useState<CommunityProjectInterest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const { toast } = useToast();
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSubmittingReply, startReplyTransition] = useTransition();


  const fetchInterests = useCallback(async () => {
    setPageLoading(true);
    const { data: interestsData, error } = await supabase
      .from('community_project_interests')
      .select('*')
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching project interests:', error);
      toast({ title: 'Error', description: 'Could not fetch project interests.', variant: 'destructive' });
      setAllInterests([]);
    } else if (interestsData) {
        const formattedInterests = interestsData.map(item => ({
        ...item,
        location_type: item.location_type as CommunityProjectInterest['location_type'],
        status: item.status as CommunityProjectInterestStatus,
        conversation: [],
      })) as CommunityProjectInterest[];
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

  const getStatusBadgeVariant = (status: CommunityProjectInterestStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  const handleViewDetails = async (interest: CommunityProjectInterest) => {
    setSelectedInterest(interest);
    setIsModalOpen(true);
    setReplyMessage('');
    setIsLoadingConversation(true);
    
    const result = await getCommunityInterestConversation(interest.id);

    if (result.success && result.data) {
      setSelectedInterest({ ...interest, conversation: result.data as CommunityProjectInterestMessage[] });
    } else {
      toast({ title: 'Error', description: result.message || 'Could not fetch conversation.', variant: 'destructive' });
      setSelectedInterest({ ...interest, conversation: [] });
    }
    setIsLoadingConversation(false);
  };

  const handleUpdateStatus = async (interestId: string, newStatus: CommunityProjectInterestStatus) => {
    const { error } = await supabase
      .from('community_project_interests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', interestId);

    if (error) {
      toast({ title: 'Error Updating Status', description: error.message, variant: 'destructive' });
      return false;
    }
    
    setAllInterests(prev => prev.map(item => 
        item.id === interestId ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item
    ));

    if (selectedInterest && selectedInterest.id === interestId) {
        setSelectedInterest(prev => prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : null);
    }

    toast({ title: 'Status Updated', description: `Interest status changed to "${newStatus}".` });
    return true;
  };

  const handleAdminReply = async () => {
    if (!selectedInterest || !replyMessage.trim() || !user || user.role !== 'platform_admin') return;
  
    startReplyTransition(async () => {
        const result = await replyToCommunityInterest(selectedInterest.id, replyMessage.trim(), selectedInterest.status, user as PlatformAdmin);

        if (result.success && result.data) {
            toast({ title: 'Reply Sent', description: 'Your reply has been added to the conversation.' });
            
            const newStatus = selectedInterest.status === 'new' ? 'contacted' : selectedInterest.status;
            const updatedConversation = [...(selectedInterest.conversation || []), result.data as CommunityProjectInterestMessage];
            const updatedInterest = { ...selectedInterest, conversation: updatedConversation, status: newStatus };
            
            setAllInterests(prev => prev.map(item => item.id === selectedInterest.id ? updatedInterest : item));
            setSelectedInterest(updatedInterest);
            setReplyMessage('');
        } else {
            toast({ title: 'Error Sending Reply', description: result.message, variant: 'destructive' });
        }
    });
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
          <FileHeart className="mr-3 h-8 w-8 text-primary" /> Community Project Interests
        </h1>
        <p className="text-muted-foreground">View and manage expressions of interest submitted by users.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">All Interest Submissions</CardTitle>
          <CardDescription>A list of all project interests received.</CardDescription>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search interests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CommunityProjectInterestStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {communityProjectInterestStatuses.map(status => (
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
             <div className="text-center py-10"><p className="text-lg font-medium">No Interests Found.</p><p className="text-muted-foreground">There are currently no project interests submitted.</p></div>
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
                        <Link href={`/community-projects/${interest.project_id}`} target="_blank" rel="noopener noreferrer" title={`View ${interest.project_title}`} className="font-medium text-primary hover:underline">
                          {interest.project_title} <ExternalLink className="inline h-3 w-3 ml-0.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">General Interest</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{interest.location_type === 'stateCapital' ? interest.state_capital : interest.lga_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{interest.location_type === 'stateCapital' ? 'State Capital' : 'LGA'}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{interest.selected_budget_tier}</Badge></TableCell>
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
              <DialogTitle className="font-headline text-xl flex items-center"><FileHeart className="mr-2 h-6 w-6 text-primary" /> Interest Details</DialogTitle>
              <DialogDescription>
                Submitted on: {format(new Date(selectedInterest.created_at), "PPP p")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <InfoRow icon={<User />} label="User Name" value={selectedInterest.user_name} />
                <InfoRow icon={<User />} label="User Email" value={selectedInterest.user_email} />
                <InfoRow icon={<User />} label="User ID" value={selectedInterest.user_id} />
                {selectedInterest.project_title && <InfoRow icon={<FileHeart />} label="Original Project" value={selectedInterest.project_title} />}
                
                <Separator />
                <h4 className="font-medium text-muted-foreground">Desired Location</h4>
                <InfoRow icon={<MapPin />} label="Location Type" value={selectedInterest.location_type === 'stateCapital' ? 'State Capital' : 'LGA'} />
                {selectedInterest.location_type === 'stateCapital' && <InfoRow icon={<MapPin />} label="State Capital" value={selectedInterest.state_capital} />}
                {selectedInterest.location_type === 'lga' && <InfoRow icon={<MapPin />} label="LGA Name" value={selectedInterest.lga_name} />}
                
                <Separator />
                <InfoRow icon={<DollarSign />} label="Selected Budget Tier" value={selectedInterest.selected_budget_tier} />
                
                <Separator />
                <div className="space-y-4 pt-4">
                  <h4 className="font-semibold text-lg">Conversation</h4>
                  <div className="p-3 rounded-md bg-muted/30 border">
                    <p className="text-sm font-semibold text-muted-foreground">Initial message from user:</p>
                    <p className="text-sm whitespace-pre-line">{selectedInterest.message || "No initial message provided."}</p>
                  </div>
                  {isLoadingConversation ? (
                    <div className="space-y-2"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
                  ) : selectedInterest.conversation && selectedInterest.conversation.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto p-2 rounded-md bg-muted/50">
                          {selectedInterest.conversation.map(msg => (
                              <div key={msg.id} className={cn("p-3 rounded-lg shadow-sm text-sm", msg.sender_role === 'platform_admin' ? 'bg-primary/10 text-foreground ml-auto w-4/5 text-right' : 'bg-secondary/20 text-foreground mr-auto w-4/5 text-left')}>
                                  <p className="font-semibold">{msg.sender_name} <span className="text-xs text-muted-foreground/80">({msg.sender_role.replace('_', ' ')})</span></p>
                                  <p className="whitespace-pre-line">{msg.content}</p>
                                  <p className="text-xs text-muted-foreground/70 mt-1">{format(new Date(msg.timestamp), "MMM d, yyyy 'at' p")}</p>
                              </div>
                          ))}
                      </div>
                  ) : (<p className="text-sm text-muted-foreground text-center py-3">No replies yet.</p>)}
                  
                  {!authLoading && user && user.role === 'platform_admin' && (
                      <div className="pt-4 space-y-2 border-t mt-4">
                          <Label htmlFor="admin-reply" className="font-medium">Your Reply</Label>
                          <Textarea id="admin-reply" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type your reply here..." rows={3} />
                          <Button onClick={handleAdminReply} disabled={!replyMessage.trim() || isLoadingConversation || isSubmittingReply}>
                              {isSubmittingReply ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send Reply</>}
                          </Button>
                      </div>
                  )}
                </div>
                
                <Separator />
                <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center">Current Status:</Label>
                    <Badge variant={getStatusBadgeVariant(selectedInterest.status)} className="capitalize text-sm px-3 py-1">{selectedInterest.status}</Badge>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="status-update-dialog" className="text-sm font-medium">Update Status</Label>
                    <Select defaultValue={selectedInterest.status} onValueChange={(newStatus) => handleUpdateStatus(selectedInterest.id, newStatus as CommunityProjectInterestStatus)}>
                        <SelectTrigger id="status-update-dialog"><SelectValue placeholder="Change status" /></SelectTrigger>
                        <SelectContent>{communityProjectInterestStatuses.map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}</SelectContent>
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