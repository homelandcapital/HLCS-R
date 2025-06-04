
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bookmark, ListChecks, LayoutDashboard, Search } from 'lucide-react'; // Changed UserCircle to Search
import { useAuth } from '@/contexts/auth-context';
import type { GeneralUser } from '@/lib/types';
import { mockInquiries } from '@/lib/mock-data';
import { useState, useEffect } from 'react';

export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [inquiriesCount, setInquiriesCount] = useState(0);

  useEffect(() => {
    if (!authLoading && user && user.role === 'user') {
      const currentUser = user as GeneralUser;
      const userSpecificInquiries = mockInquiries.filter(
        inq => inq.inquirerEmail.toLowerCase() === currentUser.email.toLowerCase()
      );
      setInquiriesCount(userSpecificInquiries.length);
    }
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  if (!user || user.role !== 'user') {
     return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-headline">Access Denied</h1>
          <p className="text-muted-foreground">This dashboard is for users only.</p>
          <Button asChild className="mt-4">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      );
  }
  
  const currentUser = user as GeneralUser;
  const savedPropertiesCount = currentUser.savedPropertyIds?.length || 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-headline flex items-center">
                <LayoutDashboard className="mr-3 h-8 w-8 text-primary" /> My Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome back, {currentUser.name}! Manage your activity.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
            title="Saved Properties" 
            value={savedPropertiesCount.toString()} 
            icon={<Bookmark />} 
            description="Properties you've bookmarked." 
            link="/users/dashboard/saved-properties"
            linkText="View Saved"
        />
        <StatCard 
            title="My Inquiries" 
            value={inquiriesCount.toString()} 
            icon={<ListChecks />} 
            description="Inquiries you've submitted."
            link="/users/dashboard/my-inquiries"
            linkText="View Inquiries"
        />
        {/* Example for a future profile page */}
        {/* <StatCard 
            title="My Profile" 
            value="View & Edit" 
            icon={<UserCircle />} 
            description="Update your personal information." 
            link="/users/dashboard/profile"
            linkText="Go to Profile"
            disabled
        /> */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/users/dashboard/saved-properties">
              <span>
                <Bookmark className="mr-2 h-4 w-4" /> View Saved Properties
              </span>
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/users/dashboard/my-inquiries">
              <span>
                <ListChecks className="mr-2 h-4 w-4" /> View My Inquiries
              </span>
            </Link>
          </Button>
           <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/properties">
              <span>
                <Search className="mr-2 h-4 w-4" /> Explore Properties
              </span>
            </Link>
          </Button>
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
  link?: string;
  linkText?: string;
  disabled?: boolean;
}

function StatCard({ title, value, icon, description, link, linkText, disabled }: StatCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {link && linkText && (
          <Button variant="link" asChild className="p-0 h-auto mt-2 text-sm" disabled={disabled}>
            <Link href={link}>{linkText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
