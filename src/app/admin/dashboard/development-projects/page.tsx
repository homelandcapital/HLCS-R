
// src/app/admin/dashboard/development-projects/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DevelopmentProject, CommunityProjectStatus as DevProjectStatus, DevelopmentProjectCategory } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Search, PlusCircle, Eye, Edit2, CheckCircle, XCircle, Filter, Link as LinkIcon, DollarSign, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { developmentProjectCategories, communityProjectStatuses } from '@/lib/types';

export default function DevelopmentProjectsManagementPage() {
  const { user: adminUser, loading: authLoading, platformSettings } = useAuth();
  const [allProjects, setAllProjects] = useState<DevelopmentProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<DevelopmentProject[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DevProjectStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<DevelopmentProjectCategory | 'all'>('all');
  const [budgetTierFilter, setBudgetTierFilter] = useState<string | 'all'>('all');
  const { toast } = useToast();
  const [availableBudgetTiers, setAvailableBudgetTiers] = useState<string[]>([]);

  useEffect(() => {
    if (platformSettings && typeof platformSettings.configuredCommunityBudgetTiers === 'string') {
      setAvailableBudgetTiers(platformSettings.configuredCommunityBudgetTiers.split(',').map(t => t.trim()).filter(Boolean));
    } else {
      setAvailableBudgetTiers([]);
    }
  }, [platformSettings]);

  const fetchProjects = useCallback(async () => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('development_projects')
      .select('*, manager:users!development_projects_managed_by_user_id_fkey(id, name, email, role, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching development projects:', error);
      toast({ title: 'Error', description: 'Could not fetch development projects.', variant: 'destructive' });
      setAllProjects([]);
    } else if (data) {
      const formattedProjects = data.map(p => ({
        ...p,
        category: p.category as DevelopmentProjectCategory,
        budget_tiers: p.budget_tier ? (Array.isArray(p.budget_tier) ? p.budget_tier : []) : [],
        status: p.status as DevProjectStatus,
        images: p.images ? (Array.isArray(p.images) ? p.images : JSON.parse(String(p.images))) : [],
        manager: p.manager ? { ...p.manager, role: p.manager.role as any } : null,
      })) as DevelopmentProject[];
      setAllProjects(formattedProjects);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && adminUser?.role === 'platform_admin') {
      fetchProjects();
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [adminUser, authLoading, fetchProjects]);

  useEffect(() => {
    let projects = [...allProjects];
    if (statusFilter !== 'all') {
      projects = projects.filter(project => project.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      projects = projects.filter(project => project.category === categoryFilter);
    }
    if (budgetTierFilter !== 'all') {
      projects = projects.filter(project => project.budget_tiers?.includes(budgetTierFilter));
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      projects = projects.filter(project =>
        project.title.toLowerCase().includes(lowerSearchTerm) ||
        project.human_readable_id.toLowerCase().includes(lowerSearchTerm) ||
        (project.description && project.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredProjects(projects);
  }, [searchTerm, statusFilter, categoryFilter, budgetTierFilter, allProjects]);

  const getStatusBadgeVariant = (status: DevProjectStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pending Approval': return 'default';
      case 'Ongoing': case 'Funding': return 'secondary';
      case 'Completed': return 'outline'; 
      case 'Rejected': case 'Canceled': return 'destructive';
      case 'Planning': case 'On Hold': return 'secondary'; 
      default: return 'outline';
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: DevProjectStatus) => {
    const { error } = await supabase
      .from('development_projects')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (error) {
      toast({ title: "Error Updating Status", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: `Project ${newStatus}`, description: `The project status has been updated.` });
    fetchProjects(); 
    return true;
  };


  if (authLoading || pageLoading || (platformSettings === null && !authLoading)) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" /> <Skeleton className="h-8 w-3/4" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
          <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (adminUser?.role !== 'platform_admin') {
     return ( <div className="text-center py-12"> <h1 className="text-2xl font-headline">Access Denied</h1> <p className="text-muted-foreground">This dashboard is for platform administrators only.</p> </div> );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline flex items-center">
            <Zap className="mr-3 h-8 w-8 text-primary" /> Development Projects
          </h1>
          <p className="text-muted-foreground">Oversee and manage all development projects.</p>
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/development-projects/add">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Project
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">All Projects</CardTitle>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search by ID, title, description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as DevelopmentProjectCategory | 'all')}>
              <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Categories</SelectItem>{developmentProjectCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={budgetTierFilter} onValueChange={(value) => setBudgetTierFilter(value as string | 'all')} disabled={availableBudgetTiers.length === 0}>
              <SelectTrigger><SelectValue placeholder="Filter by Budget Tier" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budget Tiers</SelectItem>
                {availableBudgetTiers.map(tierName => (<SelectItem key={tierName} value={tierName}>{tierName}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DevProjectStatus | 'all')}>
              <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem>{communityProjectStatuses.map(stat => (<SelectItem key={stat} value={stat} className="capitalize">{stat === 'Ongoing' ? 'Active' : stat}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 && (searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || budgetTierFilter !== 'all') ? (
            <div className="text-center py-10"><p className="text-lg font-medium">No projects match your filters.</p><p className="text-muted-foreground">Try adjusting your search or filters.</p></div>
          ) : allProjects.length === 0 ? (
            <div className="text-center py-10"><p className="text-lg font-medium">No projects found.</p><p className="text-muted-foreground">There are currently no development projects listed.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title & ID</TableHead><TableHead>Category</TableHead><TableHead>Budget Tiers</TableHead><TableHead>Brochure</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-xs text-muted-foreground">{project.human_readable_id}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{project.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {project.budget_tiers && project.budget_tiers.length > 0 ? (
                            project.budget_tiers.map(tier => (
                              <Badge key={tier} variant="secondary" className="flex items-center w-fit text-xs">
                                <DollarSign className="h-3 w-3 mr-1"/>{tier}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.brochure_link ? (
                          <Button variant="link" size="sm" asChild className="p-0 h-auto">
                            <a href={project.brochure_link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              View Link <ExternalLink className="h-3 w-3 ml-1"/>
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(project.status)} className="capitalize text-sm px-3 py-1">{project.status === 'Ongoing' ? 'Active' : project.status}</Badge></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" asChild title="View Project Details">
                           <Link href={`/development-projects/${project.id}`} target="_blank" rel="noopener noreferrer"><span><Eye className="h-4 w-4" /></span></Link>
                        </Button>
                        <Button variant="outline" size="icon" disabled title="Edit Project (Not Implemented)"> <Edit2 className="h-4 w-4" /> </Button>
                         {project.status !== 'Ongoing' && project.status !== 'Funding' && project.status !== 'Completed' && project.status !== 'Planning' && (
                          <Button variant="destructive" size="icon" onClick={() => handleUpdateStatus(project.id, 'Canceled')} title="Cancel Project (Example Action)">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
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
