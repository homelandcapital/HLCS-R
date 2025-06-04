
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Property, GeneralUser } from '@/lib/types';
import { mockProperties } from '@/lib/mock-data';
import PropertyCard from '@/components/property/property-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bookmark, SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavedPropertiesPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role === 'user') {
      const generalUser = user as GeneralUser;
      const savedIds = generalUser.savedPropertyIds || [];
      const userSavedProperties = mockProperties.filter(p => savedIds.includes(p.id));
      setSavedProperties(userSavedProperties);
    }
    setPageLoading(false); 
  }, [user, authLoading]);


  if (pageLoading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="border bg-card text-card-foreground shadow-sm rounded-lg p-4 space-y-3">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-1/3 rounded-md" />
                    <Skeleton className="h-8 w-1/3 rounded-md" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
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
          <Bookmark className="mr-3 h-8 w-8 text-primary" /> Saved Properties
        </h1>
        <p className="text-muted-foreground">
          Here are the properties you&apos;ve saved for later.
        </p>
      </div>

      {savedProperties.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <SearchX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="font-headline text-2xl">No Saved Properties Yet</CardTitle>
            <CardDescription>You haven&apos;t saved any properties. Start exploring and save your favorites!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/">Find Properties</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
