'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/components/property/property-card';
import PropertySearchFilter from '@/components/property/property-search-filter';
import { mockProperties } from '@/lib/mock-data';
import type { Property } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperties(mockProperties);
      setFilteredProperties(mockProperties);
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
    let tempProperties = [...properties];

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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-headline mb-2">No Properties Found</h2>
          <p className="text-muted-foreground">Try adjusting your search filters.</p>
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
