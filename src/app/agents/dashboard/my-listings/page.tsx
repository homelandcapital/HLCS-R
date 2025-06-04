
// src/app/agents/dashboard/my-listings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { mockProperties } from '@/lib/mock-data';
import type { Property, Agent, PropertyStatus } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Edit3, Trash2, Eye, PlusCircle, ListChecks, AlertTriangle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role === 'agent') {
      const currentAgent = user as Agent;
      // Simulate fetching agent's properties - ensure we get the latest from mockProperties
      // The mockProperties array can be mutated by admin actions, so re-filter it.
      const properties = mockProperties.filter(p => p.agent.id === currentAgent.id)
                                     .sort((a,b) => new Date(b.id.slice(-10)).getTime() - new Date(a.id.slice(-10)).getTime()); // crude sort by creation
      setAgentProperties(properties);
      setPageLoading(false);
    } else if (!authLoading && (!user || user.role !== 'agent')) {
      setPageLoading(false);
    }
  }, [user, authLoading, mockProperties]); // Add mockProperties to dependency array to re-run if it changes

  const handleDelete = (propertyId: string) => {
    // Simulate deletion - In a real app, call API.
    // For mock, filter out from mockProperties array directly. This is tricky with shared mutable mock data.
    // For this demo, we'll just update local state. A proper solution would involve backend.
    setAgentProperties(prev => prev.filter(p => p.id !== propertyId));
    // Ideally, also update mockProperties array if this action should be globally reflected in the mock.
    const indexToRemove = mockProperties.findIndex(p => p.id === propertyId);
    if (indexToRemove > -1) {
        // mockProperties.splice(indexToRemove, 1); // This line can cause issues if other components depend on stable mockProperties
        console.log("Simulated deletion from mockProperties (actual removal commented out for stability)");
    }
  };

  const getStatusBadgeVariant = (status: PropertyStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: PropertyStatus) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'approved': return <CheckCircle className="h-3 w-3 mr-1 text-green-600" />;
      case 'rejected': return <XCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };
  
  if (pageLoading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader> <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-1/2" /> </CardHeader>
              <CardContent> <Skeleton className="h-4 w-full mb-2" /> <Skeleton className="h-4 w-2/3" /> </CardContent>
              <CardFooter className="flex justify-end gap-2"> <Skeleton className="h-9 w-20" /> <Skeleton className="h-9 w-20" /> </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (user?.role !== 'agent') {
     return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-headline">Access Denied</h1>
          <p className="text-muted-foreground">This page is for agents only.</p>
           <Button asChild className="mt-4"> <Link href="/">Go to Homepage</Link> </Button>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline flex items-center"> <ListChecks className="mr-3 h-8 w-8 text-primary" /> My Listings </h1>
          <p className="text-muted-foreground">Manage your properties listed on Homeland Capital.</p>
        </div>
        <Button asChild> <Link href="/agents/dashboard/add-property"> <PlusCircle className="mr-2 h-5 w-5" /> Add New Listing </Link> </Button>
      </div>

      {agentProperties.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader> <CardTitle className="font-headline">No Listings Yet</CardTitle> <CardDescription>You haven&apos;t added any properties. Start by adding your first listing!</CardDescription> </CardHeader>
          <CardContent> <Button asChild size="lg"> <Link href="/agents/dashboard/add-property"> <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Listing </Link> </Button> </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentProperties.map(property => (
            <Card key={property.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 w-full">
                <Image src={property.images[0]} alt={property.title} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint="house exterior"/>
                <Badge variant={getStatusBadgeVariant(property.status)} className="absolute top-2 left-2 capitalize flex items-center text-xs px-2 py-0.5">
                  {getStatusIcon(property.status)} {property.status}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-xl line-clamp-1">{property.title}</CardTitle>
                <CardDescription className="text-sm">${property.price.toLocaleString()} - {property.location}</CardDescription>
                {property.status === 'rejected' && property.rejectionReason && (
                     <p className="text-xs text-destructive mt-1 flex items-start" title={property.rejectionReason}>
                        <MessageSquare className="h-3 w-3 mr-1 mt-0.5 shrink-0"/>
                        <span className="truncate">Rejection: {property.rejectionReason}</span>
                    </p>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{property.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" asChild title="View Listing" disabled={property.status !== 'approved'}>
                  <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer"> <Eye className="h-4 w-4" /> </Link>
                </Button>
                <Button variant="outline" size="sm" title="Edit Listing" disabled> <Edit3 className="h-4 w-4" /> </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(property.id)} title="Delete Listing" disabled={property.status === 'pending'}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
