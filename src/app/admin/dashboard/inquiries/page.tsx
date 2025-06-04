
// src/app/admin/dashboard/inquiries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { mockInquiries } from '@/lib/mock-data';
import type { Inquiry, InquiryStatus, Message, PlatformAdmin } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MailQuestion, Search, Filter, User, CalendarDays, Info, MessageSquareText, Phone, BuildingIcon, Mail, Send } from 'lucide-react';
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

export default function InquiryManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const sortedInquiries = [...mockInquiries].sort((a, b) => new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime());
    setAllInquiries(sortedInquiries);
    setFilteredInquiries(sortedInquiries);
  }, []);

  useEffect(() => {
    let inquiries = [...allInquiries];
    if (statusFilter !== 'all') {
      inquiries = inquiries.filter(inquiry => inquiry.status === statusFilter);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      inquiries = inquiries.filter(inquiry =>
        inquiry.propertyName.toLowerCase().includes(lowerSearchTerm) ||
        inquiry.inquirerName.toLowerCase().includes(lowerSearchTerm) ||
        inquiry.inquirerEmail.toLowerCase().includes(lowerSearchTerm) ||
        inquiry.message.toLowerCase().includes(lowerSearchTerm)
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
  
  const inquiryStatuses: InquiryStatus[] = ['new', 'contacted', 'resolved', 'archived'];

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
    setReplyMessage(''); // Clear reply field when opening
  };

  const handleUpdateStatus = (inquiryId: string, newStatus: InquiryStatus) => {
    const updatedMockInquiries = mockInquiries.map(inq =>
      inq.id === inquiryId ? { ...inq, status: newStatus } : inq
    );
    mockInquiries.length = 0;
    mockInquiries.push(...updatedMockInquiries);

    const updatedAllInquiries = allInquiries.map(inq =>
      inq.id === inquiryId ? { ...inq, status: newStatus } : inq
    );
    setAllInquiries(updatedAllInquiries);
    
    if (selectedInquiry && selectedInquiry.id === inquiryId) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
    toast({ title: 'Status Updated', description: `Inquiry status changed to "${newStatus}".` });
  };

  const handleAdminReply = () => {
    if (!selectedInquiry || !replyMessage.trim() || !user || user.role !== 'platform_admin') return;

    const currentAdmin = user as PlatformAdmin;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentAdmin.id,
      senderRole: 'platform_admin',
      senderName: currentAdmin.name,
      content: replyMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = [...(selectedInquiry.conversation || []), newMessage];
    const updatedInquiry = { ...selectedInquiry, conversation: updatedConversation, status: 'contacted' as InquiryStatus };
    
    const inquiryIndexInMock = mockInquiries.findIndex(inq => inq.id === selectedInquiry.id);
    if (inquiryIndexInMock !== -1) {
      mockInquiries[inquiryIndexInMock] = updatedInquiry;
    }

    setAllInquiries(prev => prev.map(inq => inq.id === selectedInquiry.id ? updatedInquiry : inq));
    setSelectedInquiry(updatedInquiry);
    setReplyMessage('');
    toast({ title: 'Reply Sent', description: 'Your reply has been added to the conversation.' });
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <MailQuestion className="mr-3 h-8 w-8 text-primary" /> Inquiry Management
        </h1>
        <p className="text-muted-foreground">View and manage all customer inquiries for properties.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">All Inquiries</CardTitle>
          <CardDescription>A comprehensive list of all inquiries received through the platform.</CardDescription>
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
             <div className="text-center py-10"><p className="text-lg font-medium">No inquiries found.</p><p className="text-muted-foreground">There are currently no inquiries on the platform.</p></div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead><TableHead>Inquirer</TableHead><TableHead>Received</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <Link href={`/properties/${inquiry.propertyId}`} target="_blank" rel="noopener noreferrer" title={`View ${inquiry.propertyName}`} className="font-medium text-primary hover:underline">{inquiry.propertyName}</Link>
                      <div className="text-xs text-muted-foreground">ID: {inquiry.propertyId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center"><User className="h-4 w-4 mr-2 text-muted-foreground" /><div><div>{inquiry.inquirerName}</div><div className="text-xs text-muted-foreground">{inquiry.inquirerEmail}</div>{inquiry.inquirerPhone && <div className="text-xs text-muted-foreground">P: {inquiry.inquirerPhone}</div>}</div></div>
                    </TableCell>
                     <TableCell>
                        <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /><div><div>{format(new Date(inquiry.dateReceived), "MMM d, yyyy")}</div><div className="text-xs text-muted-foreground">{format(new Date(inquiry.dateReceived), "p")}</div></div></div>
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
          <DialogContent className="sm:max-w-2xl"> {/* Increased width for conversation */}
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl flex items-center"><MailQuestion className="mr-2 h-6 w-6 text-primary" /> Inquiry Details</DialogTitle>
              <DialogDescription>
                Full details for inquiry on: <Link href={`/properties/${selectedInquiry.propertyId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">{selectedInquiry.propertyName}</Link>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <InfoRow icon={<User />} label="Inquirer Name" value={selectedInquiry.inquirerName} />
                <InfoRow icon={<Mail />} label="Inquirer Email" value={selectedInquiry.inquirerEmail} />
                {selectedInquiry.inquirerPhone && <InfoRow icon={<Phone />} label="Inquirer Phone" value={selectedInquiry.inquirerPhone} />}
                <InfoRow icon={<CalendarDays />} label="Date Received" value={format(new Date(selectedInquiry.dateReceived), "PPP p")} />
                <InfoRow icon={<BuildingIcon />} label="Property ID" value={selectedInquiry.propertyId} />
                
                <div><Label className="text-sm font-medium text-muted-foreground flex items-center mb-1"><MessageSquareText className="w-4 h-4 mr-1.5"/> Initial Message</Label><p className="text-sm p-3 bg-muted rounded-md whitespace-pre-line">{selectedInquiry.message}</p></div>
                
                <div className="flex items-center space-x-3"><Label className="text-sm font-medium text-muted-foreground">Current Status:</Label><Badge variant={getStatusBadgeVariant(selectedInquiry.status)} className="capitalize text-sm px-3 py-1">{selectedInquiry.status}</Badge></div>
                <div className="space-y-2"><Label htmlFor="status-update" className="text-sm font-medium">Update Status</Label><Select defaultValue={selectedInquiry.status} onValueChange={(newStatus) => handleUpdateStatus(selectedInquiry.id, newStatus as InquiryStatus)}><SelectTrigger id="status-update"><SelectValue placeholder="Change status" /></SelectTrigger><SelectContent>{inquiryStatuses.map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}</SelectContent></Select></div>

                {/* Conversation Thread */}
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-lg">Conversation</h4>
                    {(selectedInquiry.conversation && selectedInquiry.conversation.length > 0) ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto p-2 rounded-md bg-muted/50">
                            {selectedInquiry.conversation.map(msg => (
                                <div key={msg.id} className={cn("p-3 rounded-lg shadow-sm text-sm", msg.senderRole === 'platform_admin' ? 'bg-primary/10 text-primary-foreground ml-auto w-4/5 text-right' : 'bg-secondary/20 text-secondary-foreground mr-auto w-4/5 text-left')}>
                                    <p className="font-semibold">{msg.senderName} <span className="text-xs text-muted-foreground/80">({msg.senderRole.replace('_', ' ')})</span></p>
                                    <p className="whitespace-pre-line">{msg.content}</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">{format(new Date(msg.timestamp), "MMM d, yyyy 'at' p")}</p>
                                </div>
                            ))}
                        </div>
                    ) : (<p className="text-sm text-muted-foreground">No conversation history yet.</p>)}
                    {/* Admin Reply Form */}
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

interface InfoRowProps { icon: React.ReactNode; label: string; value: string | undefined; }
const InfoRow = ({ icon, label, value }: InfoRowProps) => (
    <div>
        <Label className="text-sm font-medium text-muted-foreground flex items-center">
            {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4 mr-1.5" })} {label}
        </Label>
        <p className="text-sm ml-6">{value || 'N/A'}</p>
    </div>
);
