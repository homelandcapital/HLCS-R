
// src/app/admin/dashboard/inquiries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { mockInquiries } from '@/lib/mock-data';
import type { Inquiry, InquiryStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MailQuestion, Search, Filter, User, CalendarDays, Info, MessageSquareText, Phone, BuildingIcon, Mail } from 'lucide-react'; // Changed MessageText to MessageSquareText and added Mail
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react'; // Added React import for React.cloneElement

export default function InquiryManagementPage() {
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  };

  const handleUpdateStatus = (inquiryId: string, newStatus: InquiryStatus) => {
    const updatedMockInquiries = mockInquiries.map(inq =>
      inq.id === inquiryId ? { ...inq, status: newStatus } : inq
    );
    // This direct mutation is for mock data. In a real app, this would be an API call.
    mockInquiries.length = 0; // Clear array
    mockInquiries.push(...updatedMockInquiries); // Push updated items

    const updatedAllInquiries = allInquiries.map(inq =>
      inq.id === inquiryId ? { ...inq, status: newStatus } : inq
    );
    setAllInquiries(updatedAllInquiries);
    
    if (selectedInquiry && selectedInquiry.id === inquiryId) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }

    toast({
      title: 'Status Updated',
      description: `Inquiry status changed to "${newStatus}".`,
    });
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
              <Input
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
            <div className="text-center py-10">
              <p className="text-lg font-medium">No inquiries match your filters.</p>
              <p className="text-muted-foreground">Try adjusting your search term or status filter.</p>
            </div>
          ) : allInquiries.length === 0 ? (
             <div className="text-center py-10">
              <p className="text-lg font-medium">No inquiries found.</p>
              <p className="text-muted-foreground">There are currently no inquiries on the platform.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Inquirer</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <Link href={`/properties/${inquiry.propertyId}`} target="_blank" rel="noopener noreferrer" title={`View ${inquiry.propertyName}`} className="font-medium text-primary hover:underline">
                          {inquiry.propertyName}
                      </Link>
                      <div className="text-xs text-muted-foreground">ID: {inquiry.propertyId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                            <div>{inquiry.inquirerName}</div>
                            <div className="text-xs text-muted-foreground">{inquiry.inquirerEmail}</div>
                            {inquiry.inquirerPhone && <div className="text-xs text-muted-foreground">P: {inquiry.inquirerPhone}</div>}
                        </div>
                      </div>
                    </TableCell>
                     <TableCell>
                        <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                                <div>{format(new Date(inquiry.dateReceived), "MMM d, yyyy")}</div>
                                <div className="text-xs text-muted-foreground">{format(new Date(inquiry.dateReceived), "p")}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(inquiry.status)} className="capitalize text-xs px-2 py-0.5">{inquiry.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(inquiry)} title="View Full Inquiry">
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

      {selectedInquiry && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl flex items-center">
                <MailQuestion className="mr-2 h-6 w-6 text-primary" /> Inquiry Details
              </DialogTitle>
              <DialogDescription>
                Full details for the inquiry regarding: 
                <Link href={`/properties/${selectedInquiry.propertyId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                    {selectedInquiry.propertyName}
                </Link>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <InfoRow icon={<User className="text-muted-foreground"/>} label="Inquirer Name" value={selectedInquiry.inquirerName} />
                <InfoRow icon={<Mail className="text-muted-foreground"/>} label="Inquirer Email" value={selectedInquiry.inquirerEmail} />
                {selectedInquiry.inquirerPhone && <InfoRow icon={<Phone className="text-muted-foreground"/>} label="Inquirer Phone" value={selectedInquiry.inquirerPhone} />}
                <InfoRow icon={<CalendarDays className="text-muted-foreground"/>} label="Date Received" value={format(new Date(selectedInquiry.dateReceived), "PPP p")} />
                 <InfoRow icon={<BuildingIcon className="text-muted-foreground"/>} label="Property ID" value={selectedInquiry.propertyId} />
                
                <div>
                    <Label className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                        <MessageSquareText className="w-4 h-4 mr-1.5"/> Full Message
                    </Label>
                    <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <Label className="text-sm font-medium text-muted-foreground">Current Status:</Label>
                    <Badge variant={getStatusBadgeVariant(selectedInquiry.status)} className="capitalize text-sm px-3 py-1">{selectedInquiry.status}</Badge>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status-update" className="text-sm font-medium">Update Status</Label>
                    <Select
                        defaultValue={selectedInquiry.status}
                        onValueChange={(newStatus) => handleUpdateStatus(selectedInquiry.id, newStatus as InquiryStatus)}
                    >
                        <SelectTrigger id="status-update">
                            <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                        {inquiryStatuses.map(status => (
                            <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string | undefined;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
    <div>
        <Label className="text-sm font-medium text-muted-foreground flex items-center">
            {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4 mr-1.5" })}
            {label}
        </Label>
        <p className="text-sm ml-6">{value || 'N/A'}</p>
    </div>
);

