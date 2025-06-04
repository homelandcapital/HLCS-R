
// src/app/admin/dashboard/analytics/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Home, Activity } from 'lucide-react'; // Removed DollarSign
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart as RechartsBarChart } from 'recharts'; // Renamed BarChart to RechartsBarChart to avoid conflict

// Mock data for charts
const mockUserSignupsData = [
  { name: 'Jan', users: 30 },
  { name: 'Feb', users: 45 },
  { name: 'Mar', users: 60 },
  { name: 'Apr', users: 50 },
  { name: 'May', users: 70 },
  { name: 'Jun', users: 85 },
];

const mockPropertyListingsData = [
  { name: 'Jan', listings: 10 },
  { name: 'Feb', listings: 12 },
  { name: 'Mar', listings: 15 },
  { name: 'Apr', listings: 13 },
  { name: 'May', listings: 18 },
  { name: 'Jun', listings: 22 },
];

export default function PlatformAnalyticsPage() {
  // In a real app, this data would be fetched from a backend
  const totalUsers = 1250;
  const totalProperties = 350;
  const totalSalesVolume = 150000000;
  const siteEngagementRate = 65.5;


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-primary" /> Platform Analytics
        </h1>
        <p className="text-muted-foreground">
          Overview of Homeland Capital platform performance and user engagement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers.toLocaleString()} icon={<Users />} description="Registered users and agents." />
        <StatCard title="Total Properties" value={totalProperties.toLocaleString()} icon={<Home />} description="Active listings on platform." />
        <StatCard title="Total Sales Volume" value={`₦${totalSalesVolume.toLocaleString()}`} icon={<span className="font-bold text-xl">₦</span>} description="Completed transactions value." />
        <StatCard title="Engagement Rate" value={`${siteEngagementRate}%`} icon={<Activity />} description="Average user activity." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">User Signups Over Time</CardTitle>
            <CardDescription>Monthly trend of new user registrations.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockUserSignupsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="var(--primary)" activeDot={{ r: 8 }} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Property Listings Over Time</CardTitle>
            <CardDescription>Monthly trend of new property listings.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
             <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={mockPropertyListingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="listings" fill="var(--accent)" name="New Listings" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">More Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            More detailed analytics and reporting features are under development. This section will include insights into:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
            <li>Traffic sources and user demographics</li>
            <li>Property views and lead generation statistics</li>
            <li>Agent performance metrics</li>
            <li>Revenue and transaction trends</li>
          </ul>
        </CardContent>
      </Card>
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
    <Card className="shadow-md">
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
