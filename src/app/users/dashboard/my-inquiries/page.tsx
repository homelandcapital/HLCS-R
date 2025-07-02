// src/app/users/dashboard/my-inquiries/page.tsx
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Inquiry, GeneralUser, InquiryMessage as DbInquiryMessage, UserRole, MachineryInquiry, CommunityProjectInterest, DevelopmentProjectInterest, MachineryRequest } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListChecks, MessageSquare, SearchX, CalendarDays, Eye, Send, Package, Users2, Zap, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

type UnifiedInquiryType = 'Property' | 'Machinery' | 'Community Project' | 'Development Project' | 'Machinery Request';

interface UnifiedInquiry {
  id: string; // The original inquiry/interest ID
  type: UnifiedInquiryType;
  itemTitle: string;
  itemId: string; // The ID of the property/machinery/project
  itemLink: string;
  dateSubmitted: string;
  status: string;
  initialMessage: string;
  conversation?: any[];
}


export default function MyInquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  const [userInquiries, setUserInquiries] = useState<UnifiedInquiry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedInquiryForDialog, setSelectedInquiryForDialog] = useState<UnifiedInquiry | null>(null);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [userReplyMessage, setUserReplyMessage] = useState('');
  const [isSubmitting, startReplyTransition] = useTransition();
  const { toast } = useToast();

  const fetchUserInquiries = useCallback(async (currentUserId: string) => {
    setPageLoading(true);

    const [propertyResult, machineryResult, communityResult, developmentResult, machineryRequestResult] = await Promise.all([
        supabase.from('inquiries').select('*, conversation:inquiry_messages(*)').eq('user_id', currentUserId),
        supabase.from('machinery_inquiries').select('*, conversation:machinery_inquiry_messages(*)').eq('user_id', currentUserId),
        supabase.from('community_project_interests').select('*, conversation:community_project_interest_messages(*)').eq('user_id', currentUserId),
        supabase.from('development_project_interests').select('*, conversation:development_project_interest_messages(*)').eq('user_id', currentUserId),
        supabase.from('machinery_requests').select('*, conversation:machinery_request_messages(*)').eq('user_id', currentUserId)
    ]);

    let allUnifiedInquiries: UnifiedInquiry[] = [];

    if (propertyResult.data) {
        allUnifiedInquiries.push(...propertyResult.data.map(i => ({
            id: i.id, type: 'Property', itemTitle: i.property_name, itemId: i.property_id, itemLink: `/properties/${i.property_id}`,
            dateSubmitted: i.created_at, status: i.status, initialMessage: i.initial_message, conversation: i.conversation
        })));
    }
    if (machineryResult.data) {
        allUnifiedInquiries.push(...machineryResult.data.map(i => ({
            id: i.id, type: 'Machinery', itemTitle: i.machinery_title, itemId: i.machinery_id, itemLink: `/machinery/${i.machinery_id}`,
            dateSubmitted: i.created_at, status: i.status, initialMessage: i.initial_message, conversation: i.conversation
        })));
    }
    if (communityResult.data) {
        allUnifiedInquiries.push(...communityResult.data.map(i => ({
            id: i.id, type: 'Community Project', itemTitle: i.project_title || 'General Interest', itemId: i.project_id || '', itemLink: i.project_id ? `/community-projects/${i.project_id}` : '#',
            dateSubmitted: i.created_at, status: i.status, initialMessage: i.message || '', conversation: i.conversation
        })));
    }
    if (developmentResult.data) {
        allUnifiedInquiries.push(...developmentResult.data.map(i => ({
            id: i.id, type: 'Development Project', itemTitle: i.project_title || 'General Interest', itemId: i.project_id || '', itemLink: i.project_id ? `/development-projects/${i.project_id}` : '#',
            dateSubmitted: i.created_at, status: i.status, initialMessage: i.message || '', conversation: i.conversation
        })));
    }
    if (machineryRequestResult.data) {
        allUnifiedInquiries.push(...machineryRequestResult.data.map(i => ({
            id: i.id, type: 'Machinery Request', itemTitle: i.machinery_title, itemId: i.id, itemLink: '#',
            dateSubmitted: i.created_at, status: i.status, initialMessage: i.message || '', conversation: i.conversation
        })));
    }

    // Sort all inquiries by submission date
    allUnifiedInquiries.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

    setUserInquiries(allUnifiedInquiries);
    setPageLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.role === 'user') {
      fetchUserInquiries(user.id);
    } else if (!authLoading) {
      setPageLoading(false); // Not logged in or not a user
    }
  }, [user, authLoading, fetchUserInquiries]);


  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'resolved': return 'outline';
      case 'archived': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getTypeIcon = (type: UnifiedInquiryType) => {
    switch(type) {
        case 'Property': return <ListChecks className="h-4 w-4 text-muted-foreground"/>;
        case 'Machinery': return <Package className="h-4 w-4 text-muted-foreground"/>;
        case 'Community Project': return <Users2 className="h-4 w-4 text-muted-foreground"/>;
        case 'Development Project': return <Zap className="h-4 w-4 text-muted-foreground"/>;
        case 'Machinery Request': return <PackageSearch className="h-4 w-4 text-muted-foreground"/>;
        default: return null;
    }
  }

  const handleViewConversation = (inquiry: UnifiedInquiry) => {
    setSelectedInquiryForDialog(inquiry);
    setIsConversationModalOpen(true);
    setUserReplyMessage('');
  };

  const handleUserReply = async () => {
    if (!selectedInquiryForDialog || !userReplyMessage.trim() || !user || user.role !== 'user') return;
    
    startReplyTransition(async () => {
        const { type, id } = selectedInquiryForDialog;
        const currentUser = user as GeneralUser;

        const messageTableMap: Record<UnifiedInquiryType, string> = {
            'Property': 'inquiry_messages',
            'Machinery': 'machinery_inquiry_messages',
            'Community Project': 'community_project_interest_messages',
            'Development Project': 'development_project_interest_messages',
            'Machinery Request': 'machinery_request_messages',
        };
        const interestTableMap: Record<UnifiedInquiryType, string> = {
            'Property': 'inquiries',
            'Machinery': 'machinery_inquiries',
            'Community Project': 'community_project_interests',
            'Development Project': 'development_project_interests',
            'Machinery Request': 'machinery_requests',
        }
        const foreignKeyMap: Record<UnifiedInquiryType, string> = {
            'Property': 'inquiry_id',
            'Machinery': 'inquiry_id',
            'Community Project': 'interest_id',
            'Development Project': 'interest_id',
            'Machinery Request': 'request_id',
        }
        
        const messageTable = messageTableMap[type];
        const interestTable = interestTableMap[type];
        const foreignKey = foreignKeyMap[type];

        const newMessageData = {
            [foreignKey]: id,
            sender_id: currentUser.id,
            sender_role: 'user' as UserRole,
            sender_name: currentUser.name,
            content: userReplyMessage.trim(),
        };

        const { data: savedMessage, error: messageError } = await supabase.from(messageTable).insert(newMessageData as any).select().single();

        if (messageError) {
            toast({ title: 'Error Sending Reply', description: messageError.message, variant: 'destructive' });
            return;
        }

        const newStatus = selectedInquiryForDialog.status === 'new' ? 'contacted' : selectedInquiryForDialog.status;
        if (selectedInquiryForDialog.status === 'new') {
            await supabase.from(interestTable).update({ status: 'contacted', updated_at: new Date().toISOString() }).eq('id', id);
        }

        const updatedConversation = [...(selectedInquiryForDialog.conversation || []), savedMessage];
        const updatedInquiry = { ...selectedInquiryForDialog, conversation: updatedConversation, status: newStatus };

        setUserInquiries(prev => prev.map(inq => inq.id === selectedInquiryForDialog.id ? updatedInquiry : inq));
        setSelectedInquiryForDialog(updatedInquiry);
        setUserReplyMessage('');
        toast({ title: 'Reply Sent', description: 'Your reply has been added to the conversation.' });
    });
  };


  if (pageLoading || authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card><CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader><CardContent><div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div></CardContent></Card>
      </div>
    );
  }

  if (!user || user.role !== 'user') {
    return (
      <div className="text-center py-12"><h1 className="text-2xl font-headline">Access Denied</h1><p className="text-muted-foreground">You need to be logged in as a user to view this page.</p><Button asChild className="mt-4"><Link href="/">Go to Homepage</Link></Button></div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-headline flex items-center"><ListChecks className="mr-3 h-8 w-8 text-primary" /> My Inquiries</h1><p className="text-muted-foreground">Track the status of all your inquiries and manage conversations.</p></div>
      <Card className="shadow-xl">
        <CardHeader><CardTitle className="font-headline text-2xl">Submitted Inquiries</CardTitle><CardDescription>A list of all your inquiries across the platform.</CardDescription></CardHeader>
        <CardContent>
          {userInquiries.length === 0 ? (
            <div className="text-center py-10"><SearchX className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><p className="text-lg font-medium">No Inquiries Yet</p><p className="text-muted-foreground mb-4">You haven't submitted any inquiries. Explore our platform and reach out!</p><Button asChild><Link href="/properties">Explore Properties</Link></Button></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {userInquiries.map((inquiry) => (
                    <TableRow key={`${inquiry.type}-${inquiry.id}`}>
                      <TableCell>
                        {inquiry.itemLink === '#' ? (
                           <span className="font-medium text-foreground">{inquiry.itemTitle}</span>
                        ) : (
                          <Link href={inquiry.itemLink} target={inquiry.itemLink !== '#' ? '_blank' : undefined} rel="noopener noreferrer" className="font-medium text-primary hover:underline">{inquiry.itemTitle}</Link>
                        )}
                        </TableCell>
                      <TableCell><div className="flex items-center gap-2">{getTypeIcon(inquiry.type)} {inquiry.type}</div></TableCell>
                      <TableCell><div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /><div><div>{format(new Date(inquiry.dateSubmitted), "MMM d, yyyy")}</div><div className="text-xs text-muted-foreground">{format(new Date(inquiry.dateSubmitted), "p")}</div></div></div></TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(inquiry.status)} className="capitalize text-xs px-2 py-0.5">{inquiry.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewConversation(inquiry)}>
                          <Eye className="mr-1.5 h-4 w-4" /> View/Reply
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

      {selectedInquiryForDialog && (
        <Dialog open={isConversationModalOpen} onOpenChange={setIsConversationModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">Conversation: {selectedInquiryForDialog.itemTitle}</DialogTitle>
              <DialogDescription>Inquiry submitted on {format(new Date(selectedInquiryForDialog.dateSubmitted), "PPP")}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="p-3 rounded-md bg-muted/30 border">
                    <p className="text-sm font-semibold text-muted-foreground">Your initial message:</p>
                    <p className="text-sm whitespace-pre-line">{selectedInquiryForDialog.initialMessage || 'No initial message provided.'}</p>
                </div>
                {(selectedInquiryForDialog.conversation && selectedInquiryForDialog.conversation.length > 0) ? (
                    <div className="space-y-3">
                        {selectedInquiryForDialog.conversation.map(msg => (
                            <div key={msg.id} className={cn("p-3 rounded-lg shadow-sm text-sm", msg.sender_role === 'user' ? 'bg-primary/10 text-foreground ml-auto w-4/5 text-right' : 'bg-secondary/20 text-foreground mr-auto w-4/5 text-left')}>
                                <p className="font-semibold">{msg.sender_name} <span className="text-xs text-muted-foreground/80">({msg.sender_role.replace(/_/g, ' ')})</span></p>
                                <p className="whitespace-pre-line">{msg.content}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">{format(new Date(msg.timestamp), "MMM d, yyyy 'at' p")}</p>
                            </div>
                        ))}
                    </div>
                ) : (<p className="text-sm text-muted-foreground text-center py-3">No replies yet.</p>)}
                
                {!authLoading && user && user.role === 'user' && (
                    <div className="pt-4 space-y-2 border-t mt-4">
                        <Label htmlFor="user-reply" className="font-medium">Your Reply</Label>
                        <Textarea id="user-reply" value={userReplyMessage} onChange={(e) => setUserReplyMessage(e.target.value)} placeholder="Type your reply here..." rows={3} />
                        <Button onClick={handleUserReply} disabled={!userReplyMessage.trim() || isSubmitting}>
                            {isSubmitting ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send Reply</>}
                        </Button>
                    </div>
                )}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
