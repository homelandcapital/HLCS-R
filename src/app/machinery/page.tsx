
// src/app/machinery/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Machinery, Agent, UserRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Wrench, MapPin, Tag, ArrowRight, Search, ServerCrash, DollarSign, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function MachineryPage() {
  const [allMachinery, setAllMachinery] = useState<Machinery[]>([]);
  const [filteredMachinery, setFilteredMachinery] = useState<Machinery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchApprovedMachinery = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('machinery')
      .select('*, agent:users!machinery_agent_id_fkey(id, name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching machinery:', error);
      toast({ title: 'Error', description: 'Could not fetch machinery listings.', variant: 'destructive' });
      setAllMachinery([]);
      setFilteredMachinery([]);
    } else if (data) {
      const formattedMachinery = data.map(m => ({
        ...m,
        agent: m.agent ? { ...(m.agent as any), id: m.agent.id! } as Agent : undefined,
        images: m.images ? (Array.isArray(m.images) ? m.images : [String(m.images)]) : [],
      })) as Machinery[];
      
      setAllMachinery(formattedMachinery);
      setFilteredMachinery(formattedMachinery);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchApprovedMachinery();
  }, [fetchApprovedMachinery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allMachinery.filter(m =>
      m.title.toLowerCase().includes(lowerSearchTerm) ||
      m.category.toLowerCase().includes(lowerSearchTerm) ||
      m.description.toLowerCase().includes(lowerSearchTerm) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(lowerSearchTerm)) ||
      (m.model && m.model.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredMachinery(filtered);
  };


  return (
    <div className="space-y-8">
      <header className="text-center py-8 bg-muted rounded-lg">
        <h1 className="text-4xl md:text-5xl font-headline text-primary mb-3 flex items-center justify-center">
          <Wrench className="w-10 h-10 mr-3" />
          Machinery Marketplace
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Browse and find quality industrial, construction, and agricultural machinery.
        </p>
      </header>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>
      

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => <MachineryCardSkeleton key={index} />)}
        </div>
      ) : filteredMachinery.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachinery.map(machinery =>
            <MachineryCard key={machinery.id} machinery={machinery} />
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <ServerCrash className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline mb-2">No Machinery Found</h2>
          <p className="text-muted-foreground">Try adjusting your search filters or check back later.</p>
        </div>
      )}
    </div>
  );
}


interface MachineryCardProps {
  machinery: Machinery;
}

const MachineryCard = ({ machinery }: MachineryCardProps) => {
  const defaultImage = 'https://placehold.co/600x400.png?text=No+Image';
  const displayImage = machinery.images && machinery.images.length > 0 ? machinery.images[0] : defaultImage;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
      <CardHeader className="p-0 relative">
        <Link href={`/machinery/${machinery.id}`} className="block w-full h-48 relative">
          <Image
            src={displayImage}
            alt={machinery.title}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform"
          />
        </Link>
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <Badge variant="secondary" className="text-xs">{machinery.category}</Badge>
        </div>
        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-semibold">
          ₦{machinery.price.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/machinery/${machinery.id}`}>
          <CardTitle className="text-xl font-headline mb-2 hover:text-primary transition-colors line-clamp-2">{machinery.title}</CardTitle>
        </Link>
        <div className="flex items-center text-muted-foreground text-sm mb-1">
          <MapPin className="w-4 h-4 mr-1 shrink-0" />
          {machinery.location_city}, {machinery.state}
        </div>
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <Tag className="w-4 h-4 mr-1 shrink-0" />
          Condition: {machinery.condition}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {machinery.manufacturer && <div className="flex items-center"><Wrench className="w-3 h-3 mr-1"/>{machinery.manufacturer}</div>}
            {machinery.year && <div className="flex items-center"><CalendarDays className="w-3 h-3 mr-1"/>{machinery.year}</div>}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Button asChild className="w-full" variant="default">
          <Link href={`/machinery/${machinery.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};


const MachineryCardSkeleton = () => (
  <Card className="overflow-hidden shadow-lg flex flex-col h-full">
    <Skeleton className="w-full h-48" />
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="flex-grow">
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
  </Card>
);
