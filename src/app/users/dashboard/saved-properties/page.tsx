
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Property, GeneralUser, Agent, UserRole } from '@/lib/types';
import PropertyCard from '@/components/property/property-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bookmark, SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function SavedPropertiesPage() {
  const { user, loading: authLoading, isPropertySaved, toggleSaveProperty } = useAuth(); // Get user from auth context
  const [savedPropertiesDetails, setSavedPropertiesDetails] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  const fetchSavedPropertiesDetails = useCallback(async (savedIds: string[]) => {
    if (savedIds.length === 0) {
      setSavedPropertiesDetails([]);
      setPageLoading(false);
      return;
    }
    setPageLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select(
        '*, agent:users!properties_agent_id_fkey (id, name, email, avatar_url, role, phone, agency)'
      )
      .in('id', savedIds)
      .eq('status', 'approved'); // Only show approved saved properties

    if (error) {
      console.error('Error fetching saved properties details:', error);
      toast({ title: 'Error', description: 'Could not fetch saved properties details.', variant: 'destructive' });
      setSavedPropertiesDetails([]);
    } else if (data) {
      const formattedProperties = data.map(p => ({
        ...p,
        agent: p.agent ? { ...(p.agent as any), role: 'agent'as UserRole, id: p.agent.id! } as Agent : undefined,
        images: p.images ? (Array.isArray(p.images) ? p.images : [String(p.images)]) : [],
        amenities: p.amenities ? (Array.isArray(p.amenities) ? p.amenities : [String(p.amenities)]) : [],
      })) as Property[];
      setSavedPropertiesDetails(formattedProperties);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'user') {
      const generalUser = user as GeneralUser;
      const savedIds = generalUser.savedPropertyIds || [];
      fetchSavedPropertiesDetails(savedIds);
    } else if (!authLoading) {
      setPageLoading(false); // Not logged in or not a user
    }
  }, [user, authLoading, fetchSavedPropertiesDetails]);


  if (pageLoading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"> <Skeleton className="h-10 w-1/3" /> </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="border bg-card text-card-foreground shadow-sm rounded-lg p-4 space-y-3">
                <Skeleton className="h-48 w-full rounded-md" /> <Skeleton className="h-6 w-3/4 rounded-md" /> <Skeleton className="h-4 w-1/2 rounded-md" /> <Skeleton className="h-4 w-full rounded-md" /> <Skeleton className="h-4 w-2/3 rounded-md" /> <div className="flex justify-between"> <Skeleton className="h-8 w-1/3 rounded-md" /> <Skeleton className="h-8 w-1/3 rounded-md" /> </div> <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!user || user.role !== 'user') {
     return ( <div className="text-center py-12"> <h1 className="text-2xl font-headline">Access Denied</h1> <p className="text-muted-foreground">You need to be logged in as a user to view this page.</p> <Button asChild className="mt-4"> <Link href="/"><span>Go to Homepage</span></Link> </Button> </div> );
  }

  return (
    <div className="space-y-6">
      <div> <h1 className="text-3xl font-headline flex items-center"> <Bookmark className="mr-3 h-8 w-8 text-primary" /> Saved Properties </h1> <p className="text-muted-foreground"> Here are the properties you&apos;ve saved for later. </p> </div>
      {savedPropertiesDetails.length === 0 ? (
        <Card className="text-center py-12 shadow-lg"> <CardHeader> <SearchX className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> <CardTitle className="font-headline text-2xl">No Saved Properties Yet</CardTitle> <CardDescription>You haven&apos;t saved any properties. Start exploring and save your favorites!</CardDescription> </CardHeader> <CardContent> <Button asChild size="lg"> <Link href="/properties"><span>Find Properties</span></Link> </Button> </CardContent> </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPropertiesDetails.map(property => ( <PropertyCard key={property.id} property={property} /> ))}
        </div>
      )}
    </div>
  );
}
