
'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/components/property/property-card';
import PropertyListItem from '@/components/property/property-list-item';
import PropertySearchFilter from '@/components/property/property-search-filter';
import { mockProperties } from '@/lib/mock-data';
import type { Property } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Simulate API call and filter for approved properties
    setTimeout(() => {
      const approvedProperties = mockProperties.filter(p => p.status === 'approved');
      setProperties(approvedProperties);
      setFilteredProperties(approvedProperties);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (filters: {
    location: string;
    propertyType: string;
    minPrice: string;
    maxPrice: string;
  }) => {
    setLoading(true);
    // Start with all approved properties
    let tempProperties = mockProperties.filter(p => p.status === 'approved');

    if (filters.location) {
      tempProperties = tempProperties.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.propertyType) {
      tempProperties = tempProperties.filter(p => p.type === filters.propertyType);
    }
    if (filters.minPrice) {
      tempProperties = tempProperties.filter(p => p.price >= parseInt(filters.minPrice, 10));
    }
    if (filters.maxPrice) {
      tempProperties = tempProperties.filter(p => p.price <= parseInt(filters.maxPrice, 10));
    }
    
    setTimeout(() => { // Simulate search delay
      setFilteredProperties(tempProperties);
      setLoading(false);
    }, 500);
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
