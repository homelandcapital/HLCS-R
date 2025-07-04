
// src/app/admin/dashboard/analytics/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Home, Activity, Zap, CreditCard, Star, Link as LinkIcon, Download, Hash } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart as RechartsBarChart } from 'recharts';
import { mockPlatformSettings } from '@/lib/mock-data'; // Assuming platform settings for promotions still comes from mock
import type { Property, Agent, UserRole } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { convertToCSV, downloadCSV } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for charts (remains the same for now, could be replaced with DB data later)
const mockUserSignupsData = [
  { name: 'Jan', users: 30 }, { name: 'Feb', users: 45 }, { name: 'Mar', users: 60 },
  { name: 'Apr', users: 50 }, { name: 'May', users: 70 }, { name: 'Jun', users: 85 },
];

const mockPropertyListingsData = [
  { name: 'Jan', listings: 10 }, { name: 'Feb', listings: 12 }, { name: 'Mar', listings: 15 },
  { name: 'Apr', listings: 13 }, { name: 'May', listings: 18 }, { name: 'Jun', listings: 22 },
];

export default function PlatformAnalyticsPage() {
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalPropertiesCount, setTotalPropertiesCount] = useState(0);
  const [promotedListingsCount, setPromotedListingsCount] = useState(0);
  const [totalPromotionRevenue, setTotalPromotionRevenue] = useState(0);
  const [promotedPropertiesList, setPromotedPropertiesList] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  const totalSalesVolume = 150000000; // Example value, not from DB
  const siteEngagementRate = 65.5; // Example value, not from DB

  const fetchAnalyticsData = useCallback(async () => {
    setPageLoading(true);
    try {
      // Fetch total users (agents + general users)
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      if (usersError) throw usersError;
      setTotalUsersCount(usersCount || 0);

      // Fetch properties for promotion details and total count
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, is_promoted, promotion_tier_id, promotion_tier_name, promoted_at, human_readable_id')
        .eq('status', 'approved'); // Consider only approved for some stats
      
      if (propertiesError) throw propertiesError;
      setTotalPropertiesCount(propertiesData?.length || 0);

      const promotedProps = propertiesData?.filter(p => p.is_promoted && p.promotion_tier_id) || [];
      setPromotedPropertiesList(promotedProps as Property[]);
      setPromotedListingsCount(promotedProps.length);

      let revenue = 0;
      promotedProps.forEach(p => {
        const tierConfig = mockPlatformSettings.promotionTiers.find(t => t.id === p.promotion_tier_id);
        if (tierConfig) {
          revenue += tierConfig.fee;
        }
      });
      setTotalPromotionRevenue(revenue);

    } catch (error: any) {
      console.error("Error fetching analytics data:", error);
      toast({ title: 'Error Fetching Analytics', description: error.message, variant: 'destructive' });
    } finally {
      setPageLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);


  const handleExportPromotedListings = () => {
    const dataToExport = promotedPropertiesList.map(p => {
      const tierConfig = mockPlatformSettings.promotionTiers.find(t => t.id === p.promotion_tier_id);
      return {
        propertyUuid: p.id,
        propertyHumanId: p.human_readable_id || 'N/A',
        propertyTitle: p.title,
        tierName: p.promotion_tier_name || 'N/A',
        promotedDate: p.promoted_at ? format(new Date(p.promoted_at), 'yyyy-MM-dd') : 'N/A',
        tierFee: tierConfig?.fee || 0,
        tierDurationDays: tierConfig?.duration || 0,
      };
    });
    const headers = ['propertyUuid', 'propertyHumanId', 'propertyTitle', 'tierName', 'promotedDate', 'tierFee', 'tierDurationDays'];
    const csvString = convertToCSV(dataToExport, headers);
    downloadCSV(csvString, 'homeland-capital-promoted-listings.csv');
    toast({ title: 'Export Started', description: 'Promoted listings CSV download has started.' });
  };

  if (pageLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2" /> <Skeleton className="h-8 w-3/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" /> <Skeleton className="h-80 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value={totalUsersCount.toLocaleString()} icon={<Users />} description="Registered users and agents." />
        <StatCard title="Total Properties" value={totalPropertiesCount.toLocaleString()} icon={<Home />} description="Active listings on platform." />
        <StatCard title="Total Sales Volume" value={`₦${totalSalesVolume.toLocaleString()}`} icon={<span className="font-bold text-xl">₦</span>} description="Completed transactions value (mock)." />
        <StatCard title="Engagement Rate" value={`${siteEngagementRate}%`} icon={<Activity />} description="Average user activity (mock)." />
        <StatCard title="Active Promoted Listings" value={promotedListingsCount.toLocaleString()} icon={<Zap />} description="Currently boosted listings." />
        <StatCard title="Total Promotion Revenue" value={`₦${totalPromotionRevenue.toLocaleString()}`} icon={<CreditCard />} description="Revenue from listing promotions." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">User Signups Over Time</CardTitle>
            <CardDescription>Monthly trend of new user registrations (mock data).</CardDescription>
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
            <CardDescription>Monthly trend of new property listings (mock data).</CardDescription>
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
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="font-headline flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500" /> Promoted Listings Details
            </CardTitle>
            <CardDescription>Details of individual properties currently being promoted.</CardDescription>
          </div>
          <Button onClick={handleExportPromotedListings} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </CardHeader>
        <CardContent>
          {promotedPropertiesList.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Property Title</TableHead>
                    <TableHead>Promotion Tier</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotedPropertiesList.map(property => (
                    <TableRow key={property.id}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center">
                            <Hash className="w-3 h-3 mr-1" /> {property.human_readable_id || property.id.substring(0,8) + '...'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{property.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                           {property.promotion_tier_name || 'N/A'}
                        </Badge>
                      </TableCell>
                       <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild title={`View ${property.title}`}>
                          <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No listings are currently being promoted.</p>
          )}
           {!mockPlatformSettings.promotionsEnabled && (
            <p className="mt-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              Note: Property promotions are currently disabled in platform settings.
            </p>
          )}
        </CardContent>
      </Card>
      
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
            <li>Detailed revenue and transaction trends beyond sales volume and promotions</li>
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
