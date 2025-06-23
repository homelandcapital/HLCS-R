
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MachineryInquiry, InquiryStatus, PlatformAdmin, MachineryInquiryMessage, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Search, Filter, User, CalendarDays, Info, MessageSquareText, Phone, BuildingIcon, Mail, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { inquiryStatuses } from '@/lib/types';

export default function MachineryInquiryManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [allInquiries, setAllInquiries] = useState<MachineryInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<MachineryInquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<MachineryInquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  const fetchInquiries = useCallback(async () => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('machinery_inquiries')
      .select(`
        *,
        conversation:machinery_inquiry_messages(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching machinery inquiries:', error);
      toast({ title: 'Error', description: 'Could not fetch machinery inquiries.', variant: 'destructive' });
      setAllInquiries([]);
    } else {
      const formattedInquiries = data.map(inq => ({
        ...inq,
        conversation: inq.conversation.map(msg => ({
            ...msg,
        })) as MachineryInquiryMessage[],
      })) as MachineryInquiry[];
      setAllInquiries(formattedInquiries);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    let inquiries = [...allInquiries];
    if (statusFilter !== 'all') {
      inquiries = inquiries.filter(inquiry => inquiry.status === statusFilter);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      inquiries = inquiries.filter(inquiry =>
        inquiry.machinery_title.toLowerCase().includes(lowerSearchTerm) ||
        inquiry.inquirer_name.toLowerCase().includes(lowerSearchTerm) ||
        inquiry.inquirer_email.toLowerCase().includes(lowerSearchTerm) ||
        inquiry.initial_message.toLowerCase().includes(lowerSearchTerm)
      );
    }
    setFilteredInquiries(inquiries);
  }, [searchTerm, statusFilter, allInquiries]);

  const getStatusBadgeVariant = (status: InquiryStatus): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'resolved': return 'outline';
      case 'archived': return 'destructive';
      default: return 'outline';
    }
  };
  
  const handleViewDetails = (inquiry: MachineryInquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
    setReplyMessage('');
  };

  const handleUpdateStatus = async (inquiryId: string, newStatus: InquiryStatus) => {
    const { error } = await supabase
      .from('machinery_inquiries')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', inquiryId);

    if (error) {
      toast({ title: 'Error Updating Status', description: error.message, variant: 'destructive' });
      return;
    }
    
    setAllInquiries(prev => prev.map(inq =>
      inq.id === inquiryId ? { ...inq, status: newStatus, updated_at: new Date().toISOString() } : inq
    ));
    
    if (selectedInquiry && selectedInquiry.id === inquiryId) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus, updated_at: new Date().toISOString() });
    }
    toast({ title: 'Status Updated', description: `Inquiry status changed to "${newStatus}".` });
  };

  const handleAdminReply = async () => {
    if (!selectedInquiry || !replyMessage.trim() || !user || user.role !== 'platform_admin') return;

    const currentAdmin = user as PlatformAdmin;
    const newMessageData = {
      inquiry_id: selectedInquiry.id,
      sender_id: currentAdmin.id,
      sender_role: 'platform_admin' as UserRole,
      sender_name: currentAdmin.name,
      content: replyMessage.trim(),
    };

    const { data: savedMessage, error: messageError } = await supabase
      .from('machinery_inquiry_messages')
      .insert(newMessageData)
      .select()
      .single();

    if (messageError) {
      toast({ title: 'Error Sending Reply', description: messageError.message, variant: 'destructive' });
      return;
    }
    
    const newStatus = selectedInquiry.status === 'new' ? 'contacted' : selectedInquiry.status;
    if (selectedInquiry.status === 'new') {
       await handleUpdateStatus(selectedInquiry.id, 'contacted');
    }

    const updatedConversation = [...(selectedInquiry.conversation || []), savedMessage as MachineryInquiryMessage];
    const updatedInquiry = { ...selectedInquiry, conversation: updatedConversation, status: newStatus, updated_at: new Date().toISOString() };
    
    setAllInquiries(prev => prev.map(inq => inq.id === selectedInquiry.id ? updatedInquiry : inq));
    setSelectedInquiry(updatedInquiry);
    setReplyMessage('');
    toast({ title: 'Reply Sent', description: 'Your reply has been added to the conversation.' });
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <Wrench className="mr-3 h-8 w-8 text-primary" /> Machinery Inquiry Management
        </h1>
        <p className="text-muted-foreground">View and manage all customer inquiries for machinery.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">All Machinery Inquiries</CardTitle>
          <CardDescription>A list of all inquiries received for machinery listings.</CardDescription>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search inquiries..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InquiryStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {inquiryStatuses.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length === 0 && (searchTerm || statusFilter !== 'all') ? (
            <div className="text-center py-10"><p className="text-lg font-medium">No inquiries match your filters.</p><p className="text-muted-foreground">Try adjusting your search term or status filter.</p></div>
          ) : allInquiries.length === 0 ? (
             <div className="text-center py-10"><p className="text-lg font-medium">No Inquiries Found.</p><p className="text-muted-foreground">There are currently no machinery inquiries on the platform.</p></div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machinery</TableHead><TableHead>Inquirer</TableHead><TableHead>Received</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <Link href={`/machinery/${inquiry.machinery_id}`} target="_blank" rel="noopener noreferrer" title={`View ${inquiry.machinery_title}`} className="font-medium text-primary hover:underline">{inquiry.machinery_title}</Link>
                      <div className="text-xs text-muted-foreground">ID: {inquiry.machinery_id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center"><User className="h-4 w-4 mr-2 text-muted-foreground" /><div><div>{inquiry.inquirer_name}</div><div className="text-xs text-muted-foreground">{inquiry.inquirer_email}</div>{inquiry.inquirer_phone && <div className="text-xs text-muted-foreground">P: {inquiry.inquirer_phone}</div>}</div></div>
                    </TableCell>
                     <TableCell>
                        <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /><div><div>{format(new Date(inquiry.created_at), "MMM d, yyyy")}</div><div className="text-xs text-muted-foreground">{format(new Date(inquiry.created_at), "p")}</div></div></div>
                    </TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(inquiry.status)} className="capitalize text-xs px-2 py-0.5">{inquiry.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2"><Button variant="outline" size="sm" onClick={() => handleViewDetails(inquiry)} title="View Full Inquiry"><Info className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {selectedInquiry && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl flex items-center"><Wrench className="mr-2 h-6 w-6 text-primary" /> Inquiry Details</DialogTitle>
              <DialogDescription>
                Full details for inquiry on: <Link href={`/machinery/${selectedInquiry.machinery_id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">{selectedInquiry.machinery_title}</Link>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4 border-b pb-4">
                    <InfoRow icon={<User />} label="Inquirer Name" value={selectedInquiry.inquirer_name} />
                    <InfoRow icon={<Mail />} label="Inquirer Email" value={selectedInquiry.inquirer_email} />
                    {selectedInquiry.inquirer_phone && <InfoRow icon={<Phone />} label="Inquirer Phone" value={selectedInquiry.inquirer_phone} className="md:col-span-1" />}
                    <InfoRow icon={<CalendarDays />} label="Date Received" value={format(new Date(selectedInquiry.created_at), "PPP p")} />
                    <InfoRow icon={<BuildingIcon />} label="Machinery ID" value={selectedInquiry.machinery_id} />
                    
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center">Current Status:</Label>
                        <Badge variant={getStatusBadgeVariant(selectedInquiry.status)} className="capitalize text-sm px-3 py-1">{selectedInquiry.status}</Badge>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="status-update-dialog" className="text-sm font-medium">Update Status</Label>
                        <Select defaultValue={selectedInquiry.status} onValueChange={(newStatus) => handleUpdateStatus(selectedInquiry.id, newStatus as InquiryStatus)}>
                            <SelectTrigger id="status-update-dialog"><SelectValue placeholder="Change status" /></SelectTrigger>
                            <SelectContent>{inquiryStatuses.map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div><Label className="text-sm font-medium text-muted-foreground flex items-center mb-1"><MessageSquareText className="w-4 h-4 mr-1.5"/> Initial Message</Label><p className="text-sm p-3 bg-muted rounded-md whitespace-pre-line">{selectedInquiry.initial_message}</p></div>
                
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-lg">Conversation</h4>
                    {(selectedInquiry.conversation && selectedInquiry.conversation.length > 0) ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto p-2 rounded-md bg-muted/50">
                            {selectedInquiry.conversation.map(msg => (
                                <div key={msg.id} className={cn("p-3 rounded-lg shadow-sm text-sm", msg.sender_role === 'platform_admin' ? 'bg-primary/10 text-foreground ml-auto w-4/5 text-right' : 'bg-secondary/20 text-foreground mr-auto w-4/5 text-left')}>
                                    <p className="font-semibold">{msg.sender_name} <span className="text-xs text-muted-foreground/80">({msg.sender_role.replace('_', ' ')})</span></p>
                                    <p className="whitespace-pre-line">{msg.content}</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">{format(new Date(msg.timestamp), "MMM d, yyyy 'at' p")}</p>
                                </div>
                            ))}
                        </div>
                    ) : (<p className="text-sm text-muted-foreground">No conversation history yet.</p>)}
                    
                    {!authLoading && user && user.role === 'platform_admin' && (
                        <div className="pt-4 space-y-2">
                            <Label htmlFor="admin-reply" className="font-medium">Your Reply</Label>
                            <Textarea id="admin-reply" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type your reply here..." rows={3} />
                            <Button onClick={handleAdminReply} disabled={!replyMessage.trim()}>
                                <Send className="mr-2 h-4 w-4" /> Send Reply
                            </Button>
                        </div>
                    )}
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
    <div className={cn(className)}>
        <Label className="text-sm font-medium text-muted-foreground flex items-center">
            {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4 mr-1.5" })} {label}
        </Label>
        <p className="text-sm ml-6">{value || 'N/A'}</p>
    </div>
);
