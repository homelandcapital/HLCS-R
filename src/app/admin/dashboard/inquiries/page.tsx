
// src/app/admin/dashboard/inquiries/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { mockInquiries } from '@/lib/mock-data';
import type { Inquiry, InquiryStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MailQuestion, Search, Filter, MessageSquare, User, CalendarDays, Info } from 'lucide-react'; // Removed Briefcase
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function InquiryManagementPage() {
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');

  useEffect(() => {
    // Sort by date received, newest first
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
        // inquiry.agentName.toLowerCase().includes(lowerSearchTerm) || // Removed agent search
        inquiry.message.toLowerCase().includes(lowerSearchTerm)
      );
    }
    setFilteredInquiries(inquiries);
  }, [searchTerm, statusFilter, allInquiries]);

  const getStatusBadgeVariant = (status: InquiryStatus): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (status) {
      case 'new':
        return 'default'; // Primary color
      case 'contacted':
        return 'secondary';
      case 'resolved':
        return 'outline'; 
      case 'archived':
        return 'destructive'; 
      default:
        return 'outline';
    }
  };
  
  const inquiryStatuses: InquiryStatus[] = ['new', 'contacted', 'resolved', 'archived'];


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
                  {/* <TableHead>Assigned Agent</TableHead> Removed Agent Column */}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <div className="font-medium hover:text-primary transition-colors">
                        <a href={`/properties/${inquiry.propertyId}`} target="_blank" rel="noopener noreferrer" title={`View ${inquiry.propertyName}`}>
                            {inquiry.propertyName}
                        </a>
                      </div>
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
                    {/* <TableCell>
                       <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                            <div>{inquiry.agentName}</div>
                            <div className="text-xs text-muted-foreground">ID: {inquiry.agentId}</div>
                        </div>
                      </div>
                    </TableCell> Removed Agent Cell */}
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(inquiry.status)} className="capitalize text-xs px-2 py-0.5">{inquiry.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" disabled title="View Full Inquiry (Not Implemented)">
                        <Info className="h-4 w-4" />
                      </Button>
                       <Button variant="outline" size="sm" disabled title="Update Status (Not Implemented)">
                         <MessageSquare className="h-4 w-4" />
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
    </div>
  );
}
