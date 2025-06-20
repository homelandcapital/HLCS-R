
// src/app/community-projects/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CommunityProject, CommunityProjectCategory, CommunityProjectStatus, NigerianState } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Users2, MapPin, CalendarDays, Target, Filter, Search, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { nigerianStates, communityProjectCategories, communityProjectStatuses } from '@/lib/types';
import { format } from 'date-fns';

export default function CommunityProjectsPage() {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<CommunityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CommunityProjectCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CommunityProjectStatus | 'all'>('all');
  const [stateFilter, setStateFilter] = useState<NigerianState | 'all'>('all');


  const fetchProjects = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('community_projects')
      .select('*, manager:users!community_projects_managed_by_user_id_fkey(id, name, email, role)')
      .in('status', ['Ongoing', 'Funding', 'Planning', 'Completed']) // Only show these statuses publicly
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching community projects:', error);
      toast({ title: 'Error', description: 'Could not fetch community projects.', variant: 'destructive' });
      setProjects([]);
    } else if (data) {
      const formattedProjects = data.map(p => ({
        ...p,
        category: p.category as CommunityProjectCategory,
        status: p.status as CommunityProjectStatus,
        state: p.state as NigerianState,
        images: p.images ? (Array.isArray(p.images) ? p.images : JSON.parse(String(p.images))) : [],
        manager: p.manager ? { ...p.manager, role: p.manager.role as any } : null,
      })) as CommunityProject[];
      setProjects(formattedProjects);
      setFilteredProjects(formattedProjects); // Initialize filtered list
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    let tempProjects = [...projects];
    if (categoryFilter !== 'all') {
      tempProjects = tempProjects.filter(p => p.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      tempProjects = tempProjects.filter(p => p.status === statusFilter);
    }
    if (stateFilter !== 'all') {
      tempProjects = tempProjects.filter(p => p.state === stateFilter);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      tempProjects = tempProjects.filter(p => 
        p.title.toLowerCase().includes(lowerSearch) ||
        p.description.toLowerCase().includes(lowerSearch) ||
        p.location_description.toLowerCase().includes(lowerSearch) ||
        (p.organization_name && p.organization_name.toLowerCase().includes(lowerSearch))
      );
    }
    setFilteredProjects(tempProjects);
  }, [searchTerm, categoryFilter, statusFilter, stateFilter, projects]);

  const publicDisplayStatuses: CommunityProjectStatus[] = ["Ongoing", "Funding", "Planning", "Completed"];

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary mb-3 flex items-center justify-center">
          <Users2 className="w-10 h-10 mr-3" /> Community Impact Projects
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explore initiatives making a difference. Learn how Homeland Capital and partners are fostering growth and development in communities across Nigeria.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Filter className="w-5 h-5 mr-2"/>Filter Projects</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CommunityProjectCategory | 'all')}>
            <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Categories</SelectItem>{communityProjectCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CommunityProjectStatus | 'all')}>
            <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Statuses</SelectItem>{publicDisplayStatuses.map(stat => (<SelectItem key={stat} value={stat} className="capitalize">{stat}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={(value) => setStateFilter(value as NigerianState | 'all')}>
            <SelectTrigger><SelectValue placeholder="Filter by State" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All States</SelectItem>{nigerianStates.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
          </Select>
        </CardContent>
      </Card>


      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline mb-2">No Projects Found</h2>
          <p className="text-muted-foreground">Try adjusting your filters or check back later for new community initiatives.</p>
        </div>
      )}
    </div>
  );
}

const ProjectCardSkeleton = () => (
  <Card className="overflow-hidden shadow-lg flex flex-col h-full">
    <Skeleton className="w-full h-48" />
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="flex-grow">
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <div className="flex gap-2 mb-2"> <Skeleton className="h-5 w-20 rounded-full" /> <Skeleton className="h-5 w-24 rounded-full" /> </div>
    </CardContent>
    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
  </Card>
);

interface ProjectCardProps { project: CommunityProject; }
const ProjectCard = ({ project }: ProjectCardProps) => {
  const defaultImage = 'https://placehold.co/600x400.png?text=Project+Image';
  const displayImage = project.images && project.images.length > 0 ? project.images[0] : defaultImage;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
      <CardHeader className="p-0 relative">
        <Link href={`/community-projects/${project.id}`} className="block w-full h-48 relative">
          <Image src={displayImage} alt={project.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform" />
        </Link>
         <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <Badge variant="secondary" className="text-xs">{project.category}</Badge>
            <Badge variant={project.status === 'Completed' ? 'outline' : 'default'} className="capitalize text-xs">{project.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/community-projects/${project.id}`}>
          <CardTitle className="text-xl font-headline mb-2 hover:text-primary transition-colors line-clamp-2">{project.title}</CardTitle>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <MapPin className="w-4 h-4 mr-1 shrink-0" /> {project.location_description}, {project.state}
        </div>
        {project.organization_name && <p className="text-xs text-muted-foreground mb-2">By: {project.organization_name}</p>}
        <p className="text-sm text-foreground line-clamp-3 mb-3">{project.description}</p>
        {project.start_date && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarDays className="w-3 h-3 mr-1 shrink-0" />
            Start: {format(new Date(project.start_date), "MMM yyyy")}
            {project.expected_completion_date && ` - Expected End: ${format(new Date(project.expected_completion_date), "MMM yyyy")}`}
          </div>
        )}
        {(project.funding_goal && project.funding_goal > 0) && (
           <div className="mt-2">
             <p className="text-xs text-muted-foreground">Funding: ₦{project.current_funding?.toLocaleString() || 0} / ₦{project.funding_goal.toLocaleString()}</p>
            {/* Basic progress bar - can be enhanced */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, ((project.current_funding || 0) / project.funding_goal) * 100)}%` }}></div>
            </div>
           </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Button asChild className="w-full" variant="default">
          <Link href={`/community-projects/${project.id}`}>Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
