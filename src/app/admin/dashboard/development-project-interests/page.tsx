// src/app/admin/dashboard/development-project-interests/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import type { DevelopmentProjectInterest, DevelopmentProjectInterestStatus, AuthenticatedUser, DevelopmentProjectInterestMessage, PlatformAdmin, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Search, Filter, User, CalendarDays, Info, MessageSquare, MapPin, DollarSign, ExternalLink, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { developmentProjectInterestStatuses } from '@/lib/types';
import { Separator } from "@/components/ui/separator";
import { fetchInterestWithConversation, addAdminReplyToInterest } from '@/actions/admin-interest-actions';

type DevInterestWithConversation = DevelopmentProjectInterest & { conversation: DevelopmentProjectInterestMessage[] };

export default function DevProjectInterestsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [allInterests, setAllInterests] = useState<DevelopmentProjectInterest[]>([]);
  const [filteredInterests, setFilteredInterests] = useState<DevelopmentProjectInterest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DevelopmentProjectInterestStatus | 'all'>('all');
  const [selectedInterest, setSelectedInterest] = useState<DevInterestWithConversation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, startReplyTransition] = useTransition();
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
    } else if (interestsData) {
      const formattedInterests = interestsData.map(item => ({
        ...item,
        status: item.status as DevelopmentProjectInterestStatus,
      })) as DevelopmentProjectInterest[];
      setAllInterests(formattedInterests);
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
        (interest.user_email && interest.user_email.toLowerCase().includes(lowerSearchTerm))
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

  const handleViewDetails = async (interest: DevelopmentProjectInterest) => {
    setIsModalOpen(true);
    setIsDialogLoading(true);
    setReplyMessage('');
    try {
      const fullInterestData = await fetchInterestWithConversation(interest.id, 'development');
      setSelectedInterest(fullInterestData as DevInterestWithConversation);
    } catch (error: any) {
      toast({ title: "Error", description: `Could not fetch conversation: ${error.message}`, variant: "destructive" });
      setSelectedInterest({ ...interest, conversation: [] });
    } finally {
      setIsDialogLoading(false);
    }
  };
  
  const handleUpdateStatus = async (interestId: string, newStatus: DevelopmentProjectInterestStatus) => {
    const { error } = await supabase
      .from('development_project_interests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', interestId);

    if (error) {
      toast({ title: 'Error Updating Status', description: error.message, variant: 'destructive' });
      return false;
    }
    fetchInterests();
    if (selectedInterest?.id === interestId) {
      setSelectedInterest({ ...selectedInterest, status: newStatus });
    }
    toast({ title: 'Status Updated', description: `Interest status changed to "${newStatus}".` });
    return true;
  };

  const handleAdminReply = () => {
    if (!selectedInterest || !replyMessage.trim() || !user || user.role !== 'platform_admin') return;
    
    startReplyTransition(async () => {
      const result = await addAdminReplyToInterest(selectedInterest.id, 'development', user as PlatformAdmin, replyMessage);
      if (result.success && result.newMessage) {
        toast({ title: 'Reply Sent', description: 'Your reply has been added to the conversation.' });
        setSelectedInterest(prev => prev ? { ...prev, conversation: [...prev.conversation, result.newMessage], status: 'contacted' } : null);
        setReplyMessage('');
        fetchInterests(); // Refresh the main list to update status
      } else {
        toast({ title: 'Error Sending Reply', description: result.message, variant: 'destructive' });
      }
    });
  };

  if (authLoading || pageLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }
  
  if (user?.role !== 'platform_admin') {
     return ( <div className="text-center py-12"> <h1 className="text-2xl font-headline">Access Denied</h1> <p className="text-muted-foreground">This dashboard is for platform administrators only.</p> </div> );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center"><Zap className="mr-3 h-8 w-8 text-primary" /> Development Project Interests</h1>
        <p className="text-muted-foreground">View and manage expressions of interest for development projects.</p>
      </div>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">All Interest Submissions</CardTitle>
          <CardDescription>A list of all development project interests received.</CardDescription>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Search interests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DevelopmentProjectInterestStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem>{developmentProjectInterestStatuses.map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInterests.length === 0 ? (
            <div className="text-center py-10"><p className="text-lg font-medium">No Interests Found.</p><p className="text-muted-foreground">There are currently no development project interests submitted.</p></div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Original Project</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredInterests.map((interest) => (
                  <TableRow key={interest.id}>
                    <TableCell><div className="font-medium">{interest.user_name || 'N/A'}</div><div className="text-xs text-muted-foreground">{interest.user_email || 'N/A'}</div></TableCell>
                    <TableCell>{interest.project_id && interest.project_title ? (<Link href={`/development-projects/${interest.project_id}`} target="_blank" rel="noopener noreferrer" title={`View ${interest.project_title}`} className="font-medium text-primary hover:underline">{interest.project_title} <ExternalLink className="inline h-3 w-3 ml-0.5" /></Link>) : (<span className="text-xs text-muted-foreground">General Interest</span>)}</TableCell>
                    <TableCell><div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /><div><div>{format(new Date(interest.created_at), "MMM d, yyyy")}</div><div className="text-xs text-muted-foreground">{format(new Date(interest.created_at), "p")}</div></div></div></TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(interest.status)} className="capitalize text-xs px-2 py-0.5">{interest.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2"><Button variant="outline" size="sm" onClick={() => handleViewDetails(interest)} title="View Full Interest"><Info className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle className="font-headline text-xl flex items-center"><Zap className="mr-2 h-6 w-6 text-primary" /> Interest Details</DialogTitle><DialogDescription>Submitted on: {selectedInterest ? format(new Date(selectedInterest.created_at), "PPP p") : '...'}</DialogDescription></DialogHeader>
          {isDialogLoading ? <div className="py-4"><Skeleton className="h-64 w-full" /></div> : selectedInterest && (
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <InfoRow icon={<User />} label="User Name" value={selectedInterest.user_name} />
              <InfoRow icon={<User />} label="User Email" value={selectedInterest.user_email} />
              <InfoRow icon={<User />} label="User ID" value={selectedInterest.user_id} />
              {selectedInterest.project_title && <InfoRow icon={<Zap />} label="Original Project" value={selectedInterest.project_title} />}
              <Separator />
              <div className="p-3 rounded-md bg-muted/30 border"><p className="text-sm font-semibold text-muted-foreground">Initial message from user:</p><p className="text-sm whitespace-pre-line">{selectedInterest.message || "No initial message provided."}</p></div>
              <Separator />
              <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold text-lg">Conversation</h4>
                  {(selectedInterest.conversation && selectedInterest.conversation.length > 0) ? (<div className="space-y-3 max-h-96 overflow-y-auto p-2 rounded-md bg-muted/50">{selectedInterest.conversation.map(msg => (<div key={msg.id} className={cn("p-3 rounded-lg shadow-sm text-sm", msg.sender_role === 'platform_admin' ? 'bg-primary/10 text-foreground ml-auto w-4/5 text-right' : 'bg-secondary/20 text-foreground mr-auto w-4/5 text-left')}><p className="font-semibold">{msg.sender_name} <span className="text-xs text-muted-foreground/80">({msg.sender_role.replace('_', ' ')})</span></p><p className="whitespace-pre-line">{msg.content}</p><p className="text-xs text-muted-foreground/70 mt-1">{format(new Date(msg.timestamp), "MMM d, yyyy 'at' p")}</p></div>))}</div>) : (<p className="text-sm text-muted-foreground">No conversation history yet.</p>)}
                  <div className="pt-4 space-y-2"><Label htmlFor="admin-reply" className="font-medium">Your Reply</Label><Textarea id="admin-reply" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type your reply here..." rows={3} /><Button onClick={handleAdminReply} disabled={!replyMessage.trim() || isReplying}>{isReplying ? 'Sending...' : 'Send Reply'}</Button></div>
              </div>
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface InfoRowProps { icon: React.ReactNode; label: string; value: string | undefined | null; className?: string; }
const InfoRow = ({ icon, label, value, className }: InfoRowProps) => (<div className={cn("pt-1", className)}><Label className="text-xs font-medium text-muted-foreground flex items-center">{React.cloneElement(icon as React.ReactElement, { className: "w-3 h-3 mr-1.5" })} {label}</Label><p className="text-sm ml-5">{value || 'N/A'}</p></div>);
