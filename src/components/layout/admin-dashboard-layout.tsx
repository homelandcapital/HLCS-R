
// src/components/layout/admin-dashboard-layout.tsx
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Users, ShieldCheck, Settings, BarChart3, LogOut, Eye, MailQuestion, Newspaper } from 'lucide-react';
import Logo from '@/components/common/logo';
import { useToast } from '@/hooks/use-toast';
import type { PlatformAdmin } from '@/lib/types';
import { mockInquiries } from '@/lib/mock-data'; // Import mockInquiries
import { Badge } from '@/components/ui/badge'; // Import Badge

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: <Home className="h-5 w-5" /> },
  { href: '/admin/dashboard/user-management', label: 'User Management', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/dashboard/property-oversight', label: 'Property Oversight', icon: <Eye className="h-5 w-5" /> },
  { href: '/admin/dashboard/inquiries', label: 'Inquiry Management', icon: <MailQuestion className="h-5 w-5" /> },
  { href: '/admin/dashboard/cms', label: 'CMS Management', icon: <Newspaper className="h-5 w-5" /> },
  { href: '/admin/dashboard/analytics', label: 'Platform Analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { href: '/admin/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/agents/login'); 
      } else if (user && user.role !== 'platform_admin') {
        toast({
          title: "Access Denied",
          description: "This dashboard is for platform administrators only.",
          variant: "destructive"
        });
        router.push('/');
      }
    }
  }, [isAuthenticated, user, loading, router, toast]);

  if (loading || !isAuthenticated || (user && user.role !== 'platform_admin')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }
  
  const currentAdmin = user as PlatformAdmin;
  // Calculate new inquiries count directly in the render path for simplicity with mock data
  // This will re-calculate on every render of this component.
  const newInquiriesCount = mockInquiries.filter(inq => inq.status === 'new').length;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-var(--header-height,100px))]">
      <aside className="w-full md:w-72 bg-card text-card-foreground p-4 md:border-r border-border space-y-6 md:sticky md:top-[calc(var(--header-height,68px)+1rem)] md:self-start md:max-h-[calc(100vh-var(--header-height,68px)-2rem)] md:overflow-y-auto">
        <div className="md:hidden">
           <Logo />
        </div>
        <div className="text-center border-b pb-4 mb-4">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary mb-2" />
            <h2 className="text-xl font-headline font-semibold">{currentAdmin?.name}</h2>
            <p className="text-sm text-muted-foreground">Platform Administrator</p>
        </div>
        <nav className="flex flex-col space-y-2">
          {adminNavItems.map((item) => {
            let isActive = false;
            if (item.href === '/admin/dashboard') {
              isActive = pathname === item.href;
            } else {
              isActive = pathname.startsWith(item.href);
            }
            const isMailItem = item.href === '/admin/dashboard/inquiries';

            return (
              <Button
                key={item.href}
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start" // Button itself uses justify-start
                asChild
              >
                <Link href={item.href} className="flex items-center justify-between w-full"> {/* Link uses justify-between */}
                  <div className="flex items-center"> {/* Group icon and label */}
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </div>
                  {isMailItem && newInquiriesCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs rounded-full">
                      {newInquiriesCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            );
          })}
        </nav>
        <Button variant="outline" className="w-full mt-auto justify-start" onClick={logout}>
          <LogOut className="h-5 w-5" />
          <span className="ml-2">Logout</span>
        </Button>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
