
// src/app/admin/dashboard/analytics/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Home, Activity, Zap, CreditCard, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart as RechartsBarChart } from 'recharts';
import { mockProperties, mockPlatformSettings } from '@/lib/mock-data';
import type { PromotionTierConfig } from '@/lib/types';
import { useEffect, useState } from 'react';

// Mock data for charts (remains the same)
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

interface TierAnalytics extends PromotionTierConfig {
  promotedCount: number;
  revenue: number;
}

export default function PlatformAnalyticsPage() {
  // In a real app, this data would be fetched from a backend
  const totalUsers = 1250;
  const totalProperties = mockProperties.length; // Use actual mockProperties length
  const totalSalesVolume = 150000000;
  const siteEngagementRate = 65.5;

  const [promotedListingsCount, setPromotedListingsCount] = useState(0);
  const [totalPromotionRevenue, setTotalPromotionRevenue] = useState(0);
  const [promotionsByTier, setPromotionsByTier] = useState<TierAnalytics[]>([]);

  useEffect(() => {
    const promotedProps = mockProperties.filter(p => p.isPromoted && p.promotionDetails);
    setPromotedListingsCount(promotedProps.length);

    let revenue = 0;
    const tierCounts: Record<string, { count: number; revenue: number }> = {};

    mockPlatformSettings.promotionTiers.forEach(tier => {
      tierCounts[tier.id] = { count: 0, revenue: 0 };
    });

    promotedProps.forEach(p => {
      const tierId = p.promotionDetails!.tierId;
      const tierConfig = mockPlatformSettings.promotionTiers.find(t => t.id === tierId);
      if (tierConfig) {
        revenue += tierConfig.fee;
        tierCounts[tierId].count += 1;
        tierCounts[tierId].revenue += tierConfig.fee;
      }
    });
    setTotalPromotionRevenue(revenue);

    const tierAnalyticsData = mockPlatformSettings.promotionTiers.map(tier => ({
      ...tier,
      promotedCount: tierCounts[tier.id]?.count || 0,
      revenue: tierCounts[tier.id]?.revenue || 0,
    }));
    setPromotionsByTier(tierAnalyticsData);

  }, []);


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
        <StatCard title="Total Users" value={totalUsers.toLocaleString()} icon={<Users />} description="Registered users and agents." />
        <StatCard title="Total Properties" value={totalProperties.toLocaleString()} icon={<Home />} description="Active listings on platform." />
        <StatCard title="Total Sales Volume" value={`₦${totalSalesVolume.toLocaleString()}`} icon={<span className="font-bold text-xl">₦</span>} description="Completed transactions value." />
        <StatCard title="Engagement Rate" value={`${siteEngagementRate}%`} icon={<Activity />} description="Average user activity." />
        <StatCard title="Active Promoted Listings" value={promotedListingsCount.toLocaleString()} icon={<Zap />} description="Currently boosted listings." />
        <StatCard title="Total Promotion Revenue" value={`₦${totalPromotionRevenue.toLocaleString()}`} icon={<CreditCard />} description="Revenue from listing promotions." />
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
          <CardTitle className="font-headline flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-500" /> Active Promotions by Tier
          </CardTitle>
          <CardDescription>Breakdown of currently active promoted listings by their promotion package.</CardDescription>
        </CardHeader>
        <CardContent>
          {promotionsByTier.length > 0 ? (
            <div className="space-y-4">
              {promotionsByTier.map(tier => (
                <div key={tier.id} className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-lg text-primary">{tier.name}</h4>
                    <Badge variant="secondary">{tier.promotedCount} {tier.promotedCount === 1 ? 'Listing' : 'Listings'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Fee: ₦{tier.fee.toLocaleString()} per promotion</span>
                    <span className="text-muted-foreground mx-1.5">|</span>
                    <span className="font-medium">Duration: {tier.duration} days</span>
                  </div>
                  <div className="mt-1 font-semibold text-primary-foreground bg-primary/80 px-2 py-1 rounded w-fit text-xs">
                    Revenue from this tier: ₦{tier.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No listings are currently being promoted.</p>
          )}
           {!mockPlatformSettings.promotionsEnabled && (
            <p className="mt-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              Note: Property promotions are currently disabled in platform settings. These analytics reflect the state when promotions were last active or based on historical data.
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

    