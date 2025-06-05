
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, ListChecks, PlusCircle, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import type { Agent, Property } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function AgentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [agentPropertiesCount, setAgentPropertiesCount] = useState(0);
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const [pendingListingsCount, setPendingListingsCount] = useState(0);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]); // Property type
  const { toast } = useToast();

  const fetchAgentDashboardStats = useCallback(async (agentId: string) => {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, status, title, created_at, price') // Only select needed fields for dashboard
      .eq('agent_id', agentId);

    if (error) {
      toast({ title: 'Error fetching agent stats', description: error.message, variant: 'destructive' });
      return;
    }

    if (properties) {
      setAgentPropertiesCount(properties.length);
      setActiveListingsCount(properties.filter(p => p.status === 'approved').length);
      setPendingListingsCount(properties.filter(p => p.status === 'pending').length);
      
      const sortedRecent = [...properties]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
      setRecentProperties(sortedRecent as Property[]); // Cast needed if select is partial
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'agent') {
      const currentAgent = user as Agent;
      fetchAgentDashboardStats(currentAgent.id);
    }
  }, [user, authLoading, fetchAgentDashboardStats]);
  
  if (authLoading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  if (!user || user.role !== 'agent') {
     return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-headline">Access Denied</h1>
          <p className="text-muted-foreground">This dashboard is for agents only.</p>
          <Button asChild className="mt-4">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline">Agent Dashboard</h1>
        <Button asChild>
          <Link href="/agents/dashboard/add-property">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Property
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Listings" value={agentPropertiesCount.toString()} icon={<Home />} description="All properties you manage." />
        <StatCard title="Approved Listings" value={activeListingsCount.toString()} icon={<CheckCircle2 />} description="Currently live on the market." />
        <StatCard title="Pending Review" value={pendingListingsCount.toString()} icon={<Clock />} description="Listings awaiting admin approval." />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader> <CardTitle className="font-headline">Quick Actions</CardTitle> </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild> <Link href="/agents/dashboard/my-listings"><ListChecks className="mr-2 h-4 w-4" /> View My Listings</Link> </Button>
            <Button variant="outline" className="w-full justify-start" asChild> <Link href="/agents/dashboard/add-property"><PlusCircle className="mr-2 h-4 w-4" /> Add a New Property</Link> </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader> <CardTitle className="font-headline">Recent Listings</CardTitle> <CardDescription>Your latest additions.</CardDescription> </CardHeader>
          <CardContent>
            {recentProperties.length > 0 ? (
              <ul className="space-y-3">
                {recentProperties.map(prop => (
                  <li key={prop.id} className="text-sm p-2 border rounded-md hover:bg-muted transition-colors">
                    <Link href={`/properties/${prop.id}`} className="font-medium text-primary hover:underline">{prop.title}</Link>
                    <p className="text-xs text-muted-foreground">Added on: {new Date(prop.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground capitalize">Status: {prop.status}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No listings yet. Add some!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
