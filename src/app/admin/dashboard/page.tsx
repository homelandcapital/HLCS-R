
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Home, ShieldCheck, Settings, BarChart3, AlertTriangle, CheckCircle, CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import type { PlatformAdmin } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const { toast } = useToast();

  const fetchDashboardStats = useCallback(async () => {
    const { count: propertiesCount, error: propertiesError } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true });
    if (propertiesError) toast({ title: 'Error fetching properties count', description: propertiesError.message, variant: 'destructive' });
    else setTotalProperties(propertiesCount || 0);

    const { count: agentsCount, error: agentsError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'agent');
    if (agentsError) toast({ title: 'Error fetching agents count', description: agentsError.message, variant: 'destructive' });
    else setTotalAgents(agentsCount || 0);
    
    const { count: generalUsersCount, error: usersError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user');
    if (usersError) toast({ title: 'Error fetching users count', description: usersError.message, variant: 'destructive' });
    else setTotalUsers(generalUsersCount || 0);

    const { count: pendingPropsCount, error: pendingPropsError } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (pendingPropsError) toast({ title: 'Error fetching pending properties', description: pendingPropsError.message, variant: 'destructive' });
    else setPendingApprovals(pendingPropsCount || 0);

  }, [toast]);


  useEffect(() => {
    if (!authLoading && user && user.role === 'platform_admin') {
      fetchDashboardStats();
    }
  }, [user, authLoading, fetchDashboardStats]);

  if (authLoading) {
    return <div className="text-center py-10">Loading admin dashboard data...</div>;
  }

  if (!user || user.role !== 'platform_admin') {
     return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-headline">Access Denied</h1>
          <p className="text-muted-foreground">This dashboard is for platform administrators only.</p>
          <Button asChild className="mt-4">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      );
  }
  
  const currentAdmin = user as PlatformAdmin;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-headline flex items-center">
                <ShieldCheck className="mr-3 h-8 w-8 text-primary" /> Platform Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome, {currentAdmin.name}. Oversee and manage Homeland Capital.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Properties" value={totalProperties.toString()} icon={<Home />} description="Active listings on the platform." />
        <StatCard title="Registered Agents" value={totalAgents.toString()} icon={<Users />} description="Agents using the platform." />
        <StatCard title="Registered Users" value={totalUsers.toString()} icon={<Users color="var(--chart-2)" />} description="General users of the platform." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Quick Management Links</CardTitle>
            <CardDescription>Jump to key administrative sections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/dashboard/user-management"><Users className="mr-2 h-4 w-4" /> Manage Users & Agents</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/dashboard/property-oversight"><CheckSquare className="mr-2 h-4 w-4" /> Listing Approval</Link>
            </Button>
             <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/dashboard/analytics"><BarChart3 className="mr-2 h-4 w-4" /> View Platform Analytics</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Platform Settings</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">System Status</CardTitle>
            <CardDescription>Overview of platform health.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    <span>All Systems Operational</span>
                </div>
                <Button variant="ghost" size="sm">Details</Button>
            </div>
             <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                    <span>{pendingApprovals} Pending Approvals</span>
                </div>
                 <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/dashboard/property-oversight">Review</Link>
                </Button>
            </div>
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
