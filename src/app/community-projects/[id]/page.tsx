
// src/app/community-projects/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { CommunityProject, AuthenticatedUser } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Users2 as CommunityIcon, ChevronLeft, ChevronRight, DollarSign, Link as LinkIcon, EyeOff, Hash, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

// Basic UUID regex for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function CommunityProjectDetailsPage() {
  const params = useParams();
  const idFromUrl = params.id as string;
  const [project, setProject] = useState<CommunityProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValidId, setIsValidId] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user: authContextUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const fetchProjectDetails = useCallback(async (projectId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_projects')
      .select('*, manager:users!community_projects_managed_by_user_id_fkey(id, name, email, role, avatar_url)')
      .eq('id', projectId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching project details:', error);
      toast({ title: 'Error', description: 'Could not fetch project details.', variant: 'destructive' });
      setProject(null);
    } else if (data) {
      const formattedProject = {
        ...data,
        category: data.category as CommunityProject['category'],
        budget_tier: data.budget_tier as string | null, // budget_tier is now string
        status: data.status as CommunityProject['status'],
        images: data.images ? (Array.isArray(data.images) ? data.images : JSON.parse(String(data.images))) : [],
        manager: data.manager ? { ...data.manager, role: data.manager.role as any } as AuthenticatedUser : null,
      } as CommunityProject;
      setProject(formattedProject);
    } else {
      setProject(null);
    }
    setLoading(false);
    setCurrentImageIndex(0);
  }, [toast]);

  useEffect(() => {
    if (idFromUrl) {
      if (UUID_REGEX.test(idFromUrl)) {
        setIsValidId(true);
        fetchProjectDetails(idFromUrl);
      } else {
        setIsValidId(false);
        setProject(null);
        setLoading(false);
      }
    }
  }, [idFromUrl, fetchProjectDetails]);

  if (loading || authLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (!isValidId) {
    return ( <div className="text-center py-20"> <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" /> <h1 className="text-4xl font-headline mb-4">Invalid Project Link</h1> <p className="text-muted-foreground mb-6">The link you followed seems to be invalid.</p> <Button asChild><Link href="/community-projects">Back to Projects</Link></Button> </div> );
  }

  if (!project) {
    return ( <div className="text-center py-20"> <EyeOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> <h1 className="text-4xl font-headline mb-4">Project Not Found</h1> <p className="text-muted-foreground mb-6">This community project does not exist or may have been removed.</p> <Button asChild><Link href="/community-projects">Back to Projects</Link></Button> </div> );
  }
  
  const isAdmin = authContextUser?.role === 'platform_admin';
  const publiclyViewableStatuses: CommunityProject['status'][] = ['Ongoing', 'Funding', 'Planning', 'Completed'];

  if (!publiclyViewableStatuses.includes(project.status) && !isAdmin) {
    return ( <div className="text-center py-20"> <EyeOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> <h1 className="text-4xl font-headline mb-4">Project Not Available</h1> <p className="text-muted-foreground mb-6">This project is currently not available for public viewing.</p> <Button asChild><Link href="/community-projects">Back to Projects</Link></Button> </div> );
  }


  const images = project.images || [];
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const defaultImage = 'https://placehold.co/1200x800.png?text=Project+Image';
  const mainDisplayImage = images.length > 0 ? images[currentImageIndex] : defaultImage;

  return (
    <div className="space-y-8">
      {isAdmin && !publiclyViewableStatuses.includes(project.status) && (
        <Card className={cn( "border-2 p-4", project.status === 'Pending Approval' && "border-yellow-500 bg-yellow-50/50", (project.status === 'Rejected' || project.status === 'Canceled') && "border-destructive bg-destructive/10" )}>
            <CardContent className="flex items-center gap-3 p-0"> <Info className={cn("h-6 w-6", project.status === 'Pending Approval' && "text-yellow-600", (project.status === 'Rejected' || project.status === 'Canceled') && "text-destructive")} /> <div> <CardTitle className={cn("text-base font-semibold", project.status === 'Pending Approval' && "text-yellow-700", (project.status === 'Rejected' || project.status === 'Canceled') && "text-destructive")}> Admin View: This project is currently <span className="font-bold uppercase">{project.status}</span>. </CardTitle> </div> </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-headline text-primary mb-1">{project.title}</h1>
              <div className="text-sm text-muted-foreground mb-1 flex items-center"> <Hash className="w-4 h-4 mr-1" /> ID: {project.human_readable_id} </div>
              <div className="flex items-center text-muted-foreground text-sm mb-2"> <Badge variant="outline" className="mr-2 capitalize">{project.category}</Badge> </div>
            </div>
            <div className="flex flex-col items-stretch md:items-end gap-2 self-start md:self-center mt-4 md:mt-0">
              <Badge variant={project.status === 'Completed' ? 'outline' : 'default'} className="text-lg px-4 py-2 capitalize">{project.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="p-2 md:p-4">
          <div className="relative w-full aspect-[16/10] rounded-md overflow-hidden group">
            {images.length > 0 ? ( <> <Image src={mainDisplayImage} alt={`${project.title} - Image ${currentImageIndex + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" style={{objectFit:"cover"}} priority={true} /> {images.length > 1 && ( <> <Button variant="outline" size="icon" className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full" onClick={prevImage}> <ChevronLeft className="h-6 w-6" /> </Button> <Button variant="outline" size="icon" className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-background/60 hover:bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full" onClick={nextImage}> <ChevronRight className="h-6 w-6" /> </Button> </> )} </>
            ) : ( <div className="w-full h-full bg-muted flex items-center justify-center"> <Image src={defaultImage} alt="No image available" fill style={{objectFit:"contain"}} /> <p className="absolute bottom-4 text-muted-foreground">No images available</p> </div> )}
          </div>
          {images.length > 1 && ( <div className="mt-3"> <ScrollArea className="w-full whitespace-nowrap rounded-md"> <div className="flex space-x-2 p-1"> {images.map((img, index) => ( <button key={index} onClick={() => setCurrentImageIndex(index)} className={cn("block rounded-md overflow-hidden w-20 h-14 md:w-24 md:h-16 relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background", currentImageIndex === index ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-75 transition-opacity")} > <Image src={img} alt={`Thumbnail ${project.title} ${index + 1}`} fill style={{objectFit:"cover"}} /> </button> ))} </div> <ScrollBar orientation="horizontal" /> </ScrollArea> </div> )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader> <CardTitle className="font-headline">Project Details</CardTitle> </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-foreground">
                <DetailItem icon={<CommunityIcon />} label="Category" value={project.category} />
                <DetailItem icon={<DollarSign />} label="Budget Tier" value={project.budget_tier || "Not Specified"} />
              </div>
              <Separator className="my-6" />
              <h3 className="text-xl font-headline mb-2">Description</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
              {project.brochure_link && (
                <>
                  <Separator className="my-6" />
                  <h3 className="text-xl font-headline mb-2">Resources</h3>
                  <Button variant="outline" asChild>
                    <a href={project.brochure_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                      <LinkIcon className="w-4 h-4 mr-2" /> View Brochure <ExternalLink className="w-3 h-3 ml-1.5"/>
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
           {project.manager && (
            <Card className="shadow-lg">
                <CardHeader><CardTitle className="font-headline">Managed By</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center text-center space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">{project.manager.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.manager.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{project.manager.role.replace('_', ' ')}</p>
                </CardContent>
            </Card>
           )}
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ icon, label, value, className }: { icon: React.ReactNode, label: string, value: string | undefined | null, className?: string }) => {
  if (value === undefined || value === null) return null;
  return ( <div className="flex items-start"> <span className="text-accent mr-2 mt-1 shrink-0">{React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}</span> <div> <p className="text-sm text-muted-foreground">{label}</p> <p className={cn("font-semibold", className)}>{value}</p> </div> </div> );
};

const ProjectDetailsSkeleton = () => (
  <div className="space-y-8">
    <Card><CardContent className="p-6"><div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><div><Skeleton className="h-10 w-3/4 mb-2" /><Skeleton className="h-6 w-1/2" /></div><Skeleton className="h-12 w-1/4 md:w-1/6" /></div></CardContent></Card>
    <Card><CardContent className="p-2 md:p-4"><Skeleton className="aspect-[16/10] w-full rounded-md" /><div className="mt-3 flex space-x-2 p-1">{[...Array(4)].map((_,i) => (<Skeleton key={i} className="h-14 w-20 md:h-16 md:w-24 rounded-md shrink-0" />))}</div></CardContent></Card>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8"> <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(2)].map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}</div><Skeleton className="h-px w-full my-6" /><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-20 w-full" /><Skeleton className="h-px w-full my-6" /><Skeleton className="h-10 w-1/3" /></CardContent></Card> </div>
      <div className="space-y-8"><Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent className="flex flex-col items-center space-y-3"><Skeleton className="w-20 h-20 rounded-full" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent></Card></div>
    </div>
  </div>
);

