'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, ListChecks, PlusCircle, TrendingUp, MessageSquare, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { mockProperties } from '@/lib/mock-data'; // Assuming properties are linked to agents

export default function AgentDashboardPage() {
  const { agent } = useAuth();
  
  // Filter properties for the current agent - simple simulation
  const agentProperties = agent ? mockProperties.filter(p => p.agent.id === agent.id) : [];
  const totalListings = agentProperties.length;
  // Simulate some stats
  const activeListings = agentProperties.filter(p => p.price > 0).length; // Example criteria
  const totalViews = agentProperties.reduce((sum, p) => sum + (p.price / 1000), 0); // Dummy calculation
  const totalInquiries = Math.floor(totalListings * 1.5); // Dummy calculation

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Listings" value={totalListings.toString()} icon={<Home />} description="All properties you manage." />
        <StatCard title="Active Listings" value={activeListings.toString()} icon={<ListChecks />} description="Currently active on the market." />
        <StatCard title="Total Views" value={Math.floor(totalViews).toLocaleString()} icon={<TrendingUp />} description="Across all your listings." />
        <StatCard title="Inquiries Received" value={totalInquiries.toString()} icon={<MessageSquare />} description="Potential buyer contacts." />
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
            {agentProperties.length > 0 ? (
              <ul className="space-y-3">
                {agentProperties.slice(0, 3).map(prop => (
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

