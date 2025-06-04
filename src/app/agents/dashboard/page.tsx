
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, ListChecks, PlusCircle, TrendingUp } from 'lucide-react'; // Removed MessageSquare
import { useAuth } from '@/contexts/auth-context';
import { mockProperties } from '@/lib/mock-data'; 
import type { Agent } from '@/lib/types'; // For casting and property.agent
import { useEffect, useState } from 'react';

export default function AgentDashboardPage() {
  const { user, loading: authLoading } = useAuth(); // Changed agent to user
  const [agentPropertiesCount, setAgentPropertiesCount] = useState(0);
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const [totalViewsCount, setTotalViewsCount] = useState(0);
  // Removed totalInquiriesCount state
  const [recentProperties, setRecentProperties] = useState<typeof mockProperties>([]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'agent') {
      const currentAgent = user as Agent;
      const properties = mockProperties.filter(p => p.agent.id === currentAgent.id);
      setAgentPropertiesCount(properties.length);
      setActiveListingsCount(properties.filter(p => p.price > 0).length); // Example criteria
      setTotalViewsCount(properties.reduce((sum, p) => sum + (p.price / 1000), 0)); // Dummy calculation
      // Removed totalInquiriesCount calculation
      setRecentProperties(properties.slice(0,3));
    }
  }, [user, authLoading]);
  
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid to 3 columns */}
        <StatCard title="Total Listings" value={agentPropertiesCount.toString()} icon={<Home />} description="All properties you manage." />
        <StatCard title="Active Listings" value={activeListingsCount.toString()} icon={<ListChecks />} description="Currently active on the market." />
        <StatCard title="Total Views" value={Math.floor(totalViewsCount).toLocaleString()} icon={<TrendingUp />} description="Across all your listings." />
        {/* Removed Inquiries Received StatCard */}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/agents/dashboard/my-listings"><ListChecks className="mr-2 h-4 w-4" /> View My Listings</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/agents/dashboard/add-property"><PlusCircle className="mr-2 h-4 w-4" /> Add a New Property</Link>
            </Button>
            {/* Future actions can be added here */}
            {/* <Button variant="outline" className="w-full justify-start"><UserCircle className="mr-2 h-4 w-4" /> Update Profile</Button> */}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>Overview of recent events.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProperties.length > 0 ? (
              <ul className="space-y-3">
                {recentProperties.map(prop => (
                  <li key={prop.id} className="text-sm p-2 border rounded-md hover:bg-muted transition-colors">
                    <Link href={`/properties/${prop.id}`} className="font-medium text-primary hover:underline">{prop.title}</Link>
                    <p className="text-xs text-muted-foreground">Added/Updated recently</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent activity. Add some listings!</p>
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
