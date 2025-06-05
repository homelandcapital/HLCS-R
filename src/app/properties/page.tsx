
'use client';

import { useState, useEffect, useCallback } from 'react';
import PropertyCard from '@/components/property/property-card';
import PropertyListItem from '@/components/property/property-list-item';
import PropertySearchFilter from '@/components/property/property-search-filter';
import type { Property, Agent, UserRole } from '@/lib/types'; // Agent and UserRole might not be directly needed here but good for consistency
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  location: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
}

export default function PropertiesPage() {
  const [allApprovedProperties, setAllApprovedProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const fetchApprovedProperties = useCallback(async (filters?: SearchFilters) => {
    setLoading(true);
    let query = supabase
      .from('properties')
      .select(`
        *,
        agent:users!properties_agent_id_fkey (id, name, email, avatar_url, role, phone, agency)
      `)
      .eq('status', 'approved');

    if (filters) {
      if (filters.location) {
        // This is a simple text search, for more advanced search (e.g. PostGIS) use rpc
        query = query.or(`title.ilike.%${filters.location}%,location_area_city.ilike.%${filters.location}%,address.ilike.%${filters.location}%`);
      }
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters.minPrice) {
        query = query.gte('price', parseInt(filters.minPrice, 10));
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseInt(filters.maxPrice, 10));
      }
    }
    
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      toast({ title: 'Error', description: 'Could not fetch properties.', variant: 'destructive' });
      setAllApprovedProperties([]);
      setFilteredProperties([]);
    } else if (data) {
      const formattedProperties = data.map(p => ({
        ...p,
        agent: p.agent ? { ...(p.agent as any), role: 'agent' as UserRole, id: p.agent.id! } as Agent : undefined,
        images: p.images ? (Array.isArray(p.images) ? p.images : [String(p.images)]) : [],
        amenities: p.amenities ? (Array.isArray(p.amenities) ? p.amenities : [String(p.amenities)]) : [],
      })) as Property[];
      
      if (!filters) { // Initial load
        setAllApprovedProperties(formattedProperties);
      }
      setFilteredProperties(formattedProperties);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchApprovedProperties(); // Initial fetch without filters
  }, [fetchApprovedProperties]);

  const handleSearch = (filters: SearchFilters) => {
    fetchApprovedProperties(filters);
  };

  return (
    <div className="space-y-8">
      <PropertySearchFilter onSearch={handleSearch} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-headline">
          {loading ? 'Loading Properties...' : `Showing ${filteredProperties.length} Approved Properties`}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            title="Grid view"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            title="List view"
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className={cn(
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'
        )}>
          {[...Array(viewMode === 'grid' ? 6 : 3)].map((_, index) => (
            viewMode === 'grid' 
            ? <CardSkeleton key={index} /> 
            : <ListItemSkeleton key={index} />
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col space-y-4'
        )}>
          {filteredProperties.map(property =>
            viewMode === 'grid' ? (
              <PropertyCard key={property.id} property={property} />
            ) : (
              <PropertyListItem key={property.id} property={property} />
            )
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-headline mb-2">No Approved Properties Found</h2>
          <p className="text-muted-foreground">Try adjusting your search filters or check back later.</p>
        </div>
      )}
    </div>
  );
}

const CardSkeleton = () => (
  <div className="border bg-card text-card-foreground shadow-sm rounded-lg p-4 space-y-3">
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
);

const ListItemSkeleton = () => (
  <div className="border bg-card text-card-foreground shadow-sm rounded-lg p-4 flex flex-col sm:flex-row gap-4">
    <Skeleton className="w-full sm:w-1/3 h-48 sm:h-36 rounded-md shrink-0" />
    <div className="flex flex-col flex-grow space-y-2">
      <Skeleton className="h-6 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-2/3 rounded-md" />
      <div className="flex gap-4 mt-2">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <Skeleton className="h-10 w-full sm:w-32 rounded-md mt-auto" />
    </div>
  </div>
);
