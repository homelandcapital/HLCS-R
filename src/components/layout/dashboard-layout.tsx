// src/components/layout/dashboard-layout.tsx
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, PlusCircle, ListChecks, LogOut, LayoutDashboard } from 'lucide-react';
import Logo from '@/components/common/logo';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/agents/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/agents/dashboard/my-listings', label: 'My Listings', icon: <ListChecks className="h-5 w-5" /> },
  { href: '/agents/dashboard/add-property', label: 'Add Property', icon: <PlusCircle className="h-5 w-5" /> },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, loading, logout, agent } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/agents/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    // You can return a loading spinner here
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
            <h2 className="text-xl font-headline font-semibold">{agent?.name}</h2>
            <p className="text-sm text-muted-foreground">{agent?.email}</p>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'default' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            </Button>
          ))}
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
