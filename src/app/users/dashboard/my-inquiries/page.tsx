
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Inquiry, GeneralUser } from '@/lib/types';
import { mockInquiries } from '@/lib/mock-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListChecks, MessageSquare, SearchX, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyInquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  const [userInquiries, setUserInquiries] = useState<Inquiry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role === 'user') {
      const generalUser = user as GeneralUser;
      const inquiries = mockInquiries.filter(
        inq => inq.inquirerEmail.toLowerCase() === generalUser.email.toLowerCase()
      ).sort((a,b) => new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime());
      setUserInquiries(inquiries);
    }
    setPageLoading(false);
  }, [user, authLoading]);

  const getStatusBadgeVariant = (status: Inquiry['status']): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'resolved': return 'outline';
      case 'archived': return 'destructive';
      default: return 'outline';
    }
  };

  if (pageLoading || authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || user.role !== 'user') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-headline">Access Denied</h1>
        <p className="text-muted-foreground">You need to be logged in as a user to view this page.</p>
         <Button asChild className="mt-4">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <ListChecks className="mr-3 h-8 w-8 text-primary" /> My Inquiries
        </h1>
        <p className="text-muted-foreground">
          Track the status of inquiries you&apos;ve submitted.
        </p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Submitted Inquiries</CardTitle>
          <CardDescription>A list of all property inquiries you have made.</CardDescription>
        </CardHeader>
        <CardContent>
          {userInquiries.length === 0 ? (
            <div className="text-center py-10">
              <SearchX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No Inquiries Yet</p>
              <p className="text-muted-foreground mb-4">You haven&apos;t submitted any inquiries. Explore properties and reach out!</p>
              <Button asChild>
                <Link href="/">Explore Properties</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <Link href={`/properties/${inquiry.propertyId}`} className="font-medium text-primary hover:underline">
                          {inquiry.propertyName}
                        </Link>
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
                        <Badge variant={getStatusBadgeVariant(inquiry.status)} className="capitalize text-xs px-2 py-0.5">
                          {inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                        <MessageSquare className="inline h-4 w-4 mr-1 align-middle" />
                        {inquiry.message}
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
