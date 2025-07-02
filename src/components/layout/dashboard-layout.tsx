
// src/components/layout/dashboard-layout.tsx
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, PlusCircle, ListChecks, LogOut, LayoutDashboard, UserCircle, Wrench } from 'lucide-react';
import Logo from '@/components/common/logo';
import { useToast } from '@/hooks/use-toast';
import type { Agent, AgentSector } from '@/lib/types';
import React from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const allNavItems = [
  { href: '/agents/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, sector: null },
  { href: '/agents/dashboard/my-listings', label: 'My Listings', icon: <ListChecks className="h-5 w-5" />, sector: 'real_estate' as AgentSector },
  { href: '/agents/dashboard/add-property', label: 'Add Property', icon: <PlusCircle className="h-5 w-5" />, sector: 'real_estate' as AgentSector },
  { href: '/agents/dashboard/my-machinery', label: 'My Machinery', icon: <Wrench className="h-5 w-5" />, sector: 'machinery' as AgentSector },
  { href: '/agents/dashboard/add-machinery', label: 'Add Machinery', icon: <PlusCircle className="h-5 w-5" />, sector: 'machinery' as AgentSector },
  { href: '/agents/dashboard/profile', label: 'My Profile', icon: <UserCircle className="h-5 w-5" />, sector: null },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/agents/login');
      } else if (user && user.role !== 'agent') {
        toast({ 
          title: "Access Denied", 
          description: "This dashboard is for agents only.",
          variant: "destructive"
        });
        router.push('/');
      }
    }
  }, [isAuthenticated, user, loading, router, toast]);

  const currentAgent = user as Agent; 
  
  // Determine visible navigation items based on agent's selected sectors
  const visibleNavItems = React.useMemo(() => {
    const agentSectors = currentAgent?.agent_sectors;
    // If agent_sectors is null, undefined, or empty, show both sectors by default for backward compatibility
    if (!agentSectors || agentSectors.length === 0) {
      return allNavItems;
    }
    return allNavItems.filter(item => {
      // Always show non-sector-specific items
      if (!item.sector) {
        return true;
      }
      // Show item if its sector is included in the agent's selected sectors
      return agentSectors.includes(item.sector);
    });
  }, [currentAgent?.agent_sectors]);

  if (loading || !isAuthenticated || (user && user.role !== 'agent')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-var(--header-height,100px))]">
      <aside className="w-full md:w-64 bg-card text-card-foreground p-4 md:border-r border-border space-y-6 md:sticky md:top-[calc(var(--header-height,68px)+1rem)] md:self-start md:max-h-[calc(100vh-var(--header-height,68px)-2rem)] md:overflow-y-auto">
        <div className="md:hidden">
           <Logo />
        </div>
        <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-xl font-headline font-semibold">{currentAgent?.name}</h2>
            <p className="text-sm text-muted-foreground">{currentAgent?.email}</p>
        </div>
        <nav className="flex flex-col space-y-2">
          {visibleNavItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname.startsWith(item.href) && (item.href !== '/agents/dashboard' || pathname === item.href) ? 'default' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                  <span className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </span>
              </Link>
            </Button>
          ))}
        </nav>
        <Button variant="outline" className="w-full mt-auto justify-start" onClick={signOut}>
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
