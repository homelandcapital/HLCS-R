
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Inquiry, GeneralUser, InquiryMessage as DbInquiryMessage, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListChecks, MessageSquare, SearchX, CalendarDays, Eye, Send } from 'lucide-react';
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

export default function MyInquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  const [userInquiries, setUserInquiries] = useState<Inquiry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedInquiryForDialog, setSelectedInquiryForDialog] = useState<Inquiry | null>(null);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [userReplyMessage, setUserReplyMessage] = useState('');
  const { toast } = useToast();

  const fetchUserInquiries = useCallback(async (currentUserId: string) => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        conversation:inquiry_messages(*)
      `)
      .eq('user_id', currentUserId) // Fetch only inquiries made by the logged-in user
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user inquiries:', error);
      toast({ title: 'Error', description: 'Could not fetch your inquiries.', variant: 'destructive' });
      setUserInquiries([]);
    } else {
       const formattedInquiries = data.map(inq => ({
        ...inq,
        id: inq.id, 
        dateReceived: inq.created_at, 
        conversation: inq.conversation.map(msg => ({
            ...msg,
            id: msg.id,
            inquiry_id: msg.inquiry_id,
            sender_id: msg.sender_id,
            timestamp: msg.timestamp,
        })) as DbInquiryMessage[],
      })) as Inquiry[];
      setUserInquiries(formattedInquiries);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'user') {
      fetchUserInquiries(user.id);
    } else if (!authLoading) {
      setPageLoading(false); // Not logged in or not a user
    }
  }, [user, authLoading, fetchUserInquiries]);


  const getStatusBadgeVariant = (status: Inquiry['status']): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'resolved': return 'outline';
      case 'archived': return 'destructive';
      default: return 'outline';
    }
  };

  const handleViewConversation = (inquiry: Inquiry) => {
    setSelectedInquiryForDialog(inquiry);
    setIsConversationModalOpen(true);
    setUserReplyMessage('');
  };

  const handleUserReply = async () => {
    if (!selectedInquiryForDialog || !userReplyMessage.trim() || !user || user.role !== 'user') return;

    const currentUser = user as GeneralUser;
    const newMessageData = {
      inquiry_id: selectedInquiryForDialog.id,
      sender_id: currentUser.id,
      sender_role: 'user' as UserRole,
      sender_name: currentUser.name,
      content: userReplyMessage.trim(),
      // timestamp is defaulted by DB
    };

    const { data: savedMessage, error: messageError } = await supabase
      .from('inquiry_messages')
      .insert(newMessageData)
      .select()
      .single();

    if (messageError) {
      toast({ title: 'Error Sending Reply', description: messageError.message, variant: 'destructive' });
      return;
    }

    const formattedSavedMessage: DbInquiryMessage = {
        ...savedMessage,
        id: savedMessage.id,
        inquiry_id: savedMessage.inquiry_id,
        sender_id: savedMessage.sender_id,
        timestamp: savedMessage.timestamp,
    };
    
    const updatedConversation = [...(selectedInquiryForDialog.conversation || []), formattedSavedMessage];
    const updatedInquiry = { ...selectedInquiryForDialog, conversation: updatedConversation, updated_at: new Date().toISOString() };
    
    // Also update status to 'contacted' if it was 'new' from user's side
    // This might be an admin action primarily, but user reply indicates continued interest
    if (selectedInquiryForDialog.status === 'new') {
        const { error: statusUpdateError } = await supabase
            .from('inquiries')
            .update({ status: 'contacted', updated_at: new Date().toISOString() })
            .eq('id', selectedInquiryForDialog.id);
        if (statusUpdateError) console.error("Error updating status on user reply:", statusUpdateError.message);
        else updatedInquiry.status = 'contacted';
    }

    setUserInquiries(prev => prev.map(inq => inq.id === selectedInquiryForDialog.id ? updatedInquiry : inq));
    setSelectedInquiryForDialog(updatedInquiry);
    setUserReplyMessage('');
    toast({ title: 'Reply Sent', description: 'Your reply has been added to the conversation.' });
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
      <div><h1 className="text-3xl font-headline flex items-center"><ListChecks className="mr-3 h-8 w-8 text-primary" /> My Inquiries</h1><p className="text-muted-foreground">Track the status of inquiries you&apos;ve submitted and manage conversations.</p></div>
      <Card className="shadow-xl">
        <CardHeader><CardTitle className="font-headline text-2xl">Submitted Inquiries</CardTitle><CardDescription>A list of all property inquiries you have made.</CardDescription></CardHeader>
        <CardContent>
          {userInquiries.length === 0 ? (
            <div className="text-center py-10"><SearchX className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><p className="text-lg font-medium">No Inquiries Yet</p><p className="text-muted-foreground mb-4">You haven&apos;t submitted any inquiries. Explore properties and reach out!</p><Button asChild><Link href="/properties">Explore Properties</Link></Button></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Date Submitted</TableHead><TableHead>Status</TableHead><TableHead>Initial Message</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {userInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell><Link href={`/properties/${inquiry.property_id}`} className="font-medium text-primary hover:underline">{inquiry.property_name}</Link></TableCell>
                      <TableCell><div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /><div><div>{format(new Date(inquiry.dateReceived), "MMM d, yyyy")}</div><div className="text-xs text-muted-foreground">{format(new Date(inquiry.dateReceived), "p")}</div></div></div></TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(inquiry.status)} className="capitalize text-xs px-2 py-0.5">{inquiry.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-xs"><MessageSquare className="inline h-4 w-4 mr-1 align-middle" />{inquiry.initial_message}</TableCell>
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
              <DialogTitle className="font-headline text-xl">Conversation: {selectedInquiryForDialog.property_name}</DialogTitle>
              <DialogDescription>Inquiry submitted on {format(new Date(selectedInquiryForDialog.dateReceived), "PPP")}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="p-3 rounded-md bg-muted/30 border">
                    <p className="text-sm font-semibold text-muted-foreground">Your initial message:</p>
                    <p className="text-sm whitespace-pre-line">{selectedInquiryForDialog.initial_message}</p>
                </div>
                {(selectedInquiryForDialog.conversation && selectedInquiryForDialog.conversation.length > 0) ? (
                    <div className="space-y-3">
                        {selectedInquiryForDialog.conversation.map(msg => (
                            <div key={msg.id} className={cn("p-3 rounded-lg shadow-sm text-sm", msg.sender_role === 'user' ? 'bg-primary/10 text-foreground ml-auto w-4/5 text-right' : 'bg-secondary/20 text-foreground mr-auto w-4/5 text-left')}>
                                <p className="font-semibold">{msg.sender_name} <span className="text-xs text-muted-foreground/80">({msg.sender_role.replace('_', ' ')})</span></p>
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
                        <Button onClick={handleUserReply} disabled={!userReplyMessage.trim()}>
                            <Send className="mr-2 h-4 w-4" /> Send Reply
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
