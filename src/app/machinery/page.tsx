
// src/app/machinery/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Machinery, Agent, UserRole, MachineryCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Wrench, MapPin, Tag, ArrowRight, Search, ServerCrash, DollarSign, CalendarDays, PackageSearch, Filter as FilterIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import type { TablesInsert } from '@/lib/database.types';


const requestFormSchema = z.object({
  machinery_title: z.string().min(3, "Please provide a more descriptive title."),
  machinery_category: z.string().optional(),
  message: z.string().optional(),
});
type RequestFormValues = z.infer<typeof requestFormSchema>;


export default function MachineryPage() {
  const [allMachinery, setAllMachinery] = useState<Machinery[]>([]);
  const [filteredMachinery, setFilteredMachinery] = useState<Machinery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const { toast } = useToast();
  const { platformSettings, user, isAuthenticated, loading: authLoading } = useAuth();

  const dynamicMachineryCategories = platformSettings?.machineryCategories?.split(',').map(c => c.trim()).filter(Boolean) || [];

  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      machinery_title: '',
      machinery_category: '',
      message: '',
    },
  });

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
    const filtered = allMachinery.filter(m => {
        const matchesSearchTerm = lowerSearchTerm === '' || (
            m.title.toLowerCase().includes(lowerSearchTerm) ||
            m.category.toLowerCase().includes(lowerSearchTerm) ||
            m.description.toLowerCase().includes(lowerSearchTerm) ||
            (m.manufacturer && m.manufacturer.toLowerCase().includes(lowerSearchTerm)) ||
            (m.model && m.model.toLowerCase().includes(lowerSearchTerm))
        );
        const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
        return matchesSearchTerm && matchesCategory;
    });
    setFilteredMachinery(filtered);
  };

  const handleRequestSubmit = async (values: RequestFormValues) => {
    if (!isAuthenticated || !user) {
      toast({ title: "Login Required", description: "You must be logged in to make a request." });
      return;
    }
    const requestData: TablesInsert<'machinery_requests'> = {
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      user_phone: 'phone' in user ? user.phone : null,
      machinery_title: values.machinery_title,
      machinery_category: values.machinery_category || null,
      message: values.message || null,
      status: 'new'
    };

    const { error } = await supabase.from('machinery_requests').insert(requestData);
    if (error) {
      toast({ title: "Request Failed", description: `Could not submit your request: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Request Submitted!", description: "Thank you, we have received your request and will follow up shortly." });
      setIsRequestDialogOpen(false);
      requestForm.reset();
    }
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
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <FilterIcon className="w-5 h-5 mr-2"/>Filter Machinery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="search-machinery" className="sr-only">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search-machinery"
                  placeholder="Search by name, category, manufacturer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Categories</SelectItem>{dynamicMachineryCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
            </Select>
            <Button type="submit" className="w-full md:w-auto md:col-start-3">Search</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg bg-secondary/50 border-primary/20">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-grow">
            <h3 className="text-xl font-headline text-primary flex items-center">
              <PackageSearch className="w-6 h-6 mr-2" />
              Can't find what you're looking for?
            </h3>
            <p className="text-muted-foreground mt-1">Let us know what you need, and our team will help source it for you.</p>
          </div>
          <Button onClick={() => setIsRequestDialogOpen(true)} className="w-full md:w-auto" disabled={authLoading}>
            Request Machinery
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Request Machinery</DialogTitle>
            <DialogDesc>
              Please provide details about the machinery or equipment you need.
            </DialogDesc>
          </DialogHeader>
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit(handleRequestSubmit)} className="space-y-4 py-2">
              <FormField
                control={requestForm.control}
                name="machinery_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machinery Name / Title</FormLabel>
                    <FormControl><Input placeholder="e.g., John Deere 5075E Tractor" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={requestForm.control}
                name="machinery_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a category if known" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dynamicMachineryCategories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={requestForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Include any specific requirements, model numbers, or usage context..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={requestForm.formState.isSubmitting}>
                  {requestForm.formState.isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>


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
          <Badge variant="outline" className="text-xs">{machinery.listing_type}</Badge>
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
