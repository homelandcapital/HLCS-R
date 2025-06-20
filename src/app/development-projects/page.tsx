
// src/app/development-projects/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DevelopmentProject, DevelopmentProjectCategory, CommunityProjectStatus as DevProjectStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Zap, Filter, Search, ArrowRight, DollarSign, Link as LinkIcon, ExternalLink, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { developmentProjectCategories } from '@/lib/types'; 
import { useAuth } from '@/contexts/auth-context'; 

export default function DevelopmentProjectsPage() {
  const { platformSettings, loading: authLoading } = useAuth(); 
  const [projects, setProjects] = useState<DevelopmentProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<DevelopmentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DevelopmentProjectCategory | 'all'>('all');
  
  const publicDisplayStatuses: DevProjectStatus[] = ["Ongoing", "Funding", "Planning", "Completed"];

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('development_projects')
      .select('*, manager:users!development_projects_managed_by_user_id_fkey(id, name, email, role)')
      .in('status', publicDisplayStatuses) 
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching development projects:', error);
      toast({ title: 'Error', description: 'Could not fetch development projects.', variant: 'destructive' });
      setProjects([]);
    } else if (data) {
      const formattedProjects = data.map(p => ({
        ...p,
        category: p.category as DevelopmentProjectCategory,
        status: p.status as DevProjectStatus,
        price: p.price || null,
        images: p.images ? (Array.isArray(p.images) ? p.images : JSON.parse(String(p.images))) : [],
        manager: p.manager ? { ...p.manager, role: p.manager.role as any } : null,
      })) as DevelopmentProject[];
      setProjects(formattedProjects);
      setFilteredProjects(formattedProjects); 
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
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      tempProjects = tempProjects.filter(p => 
        p.title.toLowerCase().includes(lowerSearch) ||
        (p.description && p.description.toLowerCase().includes(lowerSearch)) ||
        (p.location_area_city && p.location_area_city.toLowerCase().includes(lowerSearch)) ||
        (p.state && p.state.toLowerCase().includes(lowerSearch))
      );
    }
    setFilteredProjects(tempProjects);
  }, [searchTerm, categoryFilter, projects]);


  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary mb-3 flex items-center justify-center">
          <Zap className="w-10 h-10 mr-3" /> Development Projects
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explore large-scale development projects in key sectors like manufacturing, energy, agriculture, and real estate.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Filter className="w-5 h-5 mr-2"/>Filter Projects</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search projects by title, description, location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as DevelopmentProjectCategory | 'all')}>
            <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Categories</SelectItem>{developmentProjectCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
          </Select>
        </CardContent>
      </Card>


      {loading || authLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : (
        <div className="text-center py-12">
          <Zap className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline mb-2">No Projects Found</h2>
          <p className="text-muted-foreground">Try adjusting your filters or check back later for new development initiatives.</p>
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

interface ProjectCardProps { project: DevelopmentProject; }
const ProjectCard = ({ project }: ProjectCardProps) => {
  const defaultImage = 'https://placehold.co/600x400.png?text=Project+Image';
  const displayImage = project.images && project.images.length > 0 ? project.images[0] : defaultImage;
  const displayStatus = project.status === 'Ongoing' ? 'Active' : project.status;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
      <CardHeader className="p-0 relative">
        <Link href={`/development-projects/${project.id}`} className="block w-full h-48 relative">
          <Image src={displayImage} alt={project.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform" />
        </Link>
         <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <Badge variant="secondary" className="text-xs">{project.category}</Badge>
            <Badge variant={project.status === 'Completed' ? 'outline' : 'default'} className="capitalize text-xs">{displayStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/development-projects/${project.id}`}>
          <CardTitle className="text-xl font-headline mb-1 hover:text-primary transition-colors line-clamp-2">{project.title}</CardTitle>
        </Link>
        <div className="flex items-center text-muted-foreground text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1 shrink-0" />
            {[project.location_area_city, project.state].filter(Boolean).join(', ')}
        </div>
        {project.price && (
            <div className="flex flex-wrap items-center text-sm font-semibold text-accent mb-2 gap-1">
                <DollarSign className="w-4 h-4 shrink-0" />
                <span>Budget: ₦{project.price.toLocaleString()}</span>
            </div>
        )}
        <p className="text-sm text-foreground line-clamp-3 mb-3">{project.description}</p>
         {project.brochure_link && (
            <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs mb-2">
                <a href={project.brochure_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                    <LinkIcon className="w-3 h-3 mr-1"/> View Brochure <ExternalLink className="w-3 h-3 ml-0.5"/>
                </a>
            </Button>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Button asChild className="w-full" variant="default">
          <Link href={`/development-projects/${project.id}`}>Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
