
// src/app/admin/dashboard/property-oversight/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { mockProperties } from '@/lib/mock-data';
import type { Property } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Home, Edit2, AlertCircle } from 'lucide-react'; // Removed DollarSign
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

type PropertyTypeFilter = Property['type'] | 'all';

export default function PropertyOversightPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyTypeFilter>('all');

  useEffect(() => {
    setAllProperties(mockProperties);
    setFilteredProperties(mockProperties);
  }, []);

  useEffect(() => {
    let properties = [...allProperties];

    if (typeFilter !== 'all') {
      properties = properties.filter(property => property.type === typeFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      properties = properties.filter(property =>
        property.title.toLowerCase().includes(lowerSearchTerm) ||
        property.location.toLowerCase().includes(lowerSearchTerm) ||
        property.address.toLowerCase().includes(lowerSearchTerm) ||
        property.agent.name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    setFilteredProperties(properties);
  }, [searchTerm, typeFilter, allProperties]);

  const propertyTypes = useMemo(() => {
    const types = new Set(allProperties.map(p => p.type));
    return Array.from(types);
  }, [allProperties]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <Home className="mr-3 h-8 w-8 text-primary" /> Property Oversight
        </h1>
        <p className="text-muted-foreground">View and manage all properties on the Homeland Capital platform.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">All Platform Properties</CardTitle>
          <CardDescription>A comprehensive list of all properties listed on the platform.</CardDescription>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, location, agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as PropertyTypeFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProperties.length === 0 && (searchTerm || typeFilter !== 'all') ? (
            <div className="text-center py-10">
              <p className="text-lg font-medium">No properties match your filters.</p>
              <p className="text-muted-foreground">Try adjusting your search term or type filter.</p>
            </div>
          ) : allProperties.length === 0 ? (
             <div className="text-center py-10">
              <p className="text-lg font-medium">No properties found.</p>
              <p className="text-muted-foreground">There are currently no properties listed on the platform.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title & Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Listed By (Agent)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Image
                        src={property.images[0] || 'https://placehold.co/64x64.png'}
                        alt={property.title}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                        data-ai-hint="house exterior thumbnail"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-xs text-muted-foreground">{property.location}</div>
                      <div className="text-xs text-muted-foreground">ID: {property.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-base">
                        ₦{property.price.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{property.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                         {property.agent.avatarUrl && <img src={property.agent.avatarUrl} alt={property.agent.name} className="w-6 h-6 rounded-full mr-2 object-cover" data-ai-hint="professional person" />}
                         {!property.agent.avatarUrl && <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 text-muted-foreground text-xs">{property.agent.name.substring(0,2).toUpperCase()}</span>}
                        <div>
                            <div>{property.agent.name}</div>
                            <div className="text-xs text-muted-foreground">{property.agent.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild title="View Public Listing">
                        <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" disabled title="Edit Property (Admin)">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                       <Button variant="destructive" size="sm" disabled title="Take Action">
                         <AlertCircle className="h-4 w-4" />
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
