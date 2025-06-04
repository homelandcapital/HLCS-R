
// src/components/layout/user-dashboard-layout.tsx
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Bookmark, ListChecks, UserCircle } from 'lucide-react';
import Logo from '@/components/common/logo';
import { useToast } from '@/hooks/use-toast';
import type { GeneralUser } from '@/lib/types';

interface UserDashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/users/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/users/dashboard/saved-properties', label: 'Saved Properties', icon: <Bookmark className="h-5 w-5" /> },
  { href: '/users/dashboard/my-inquiries', label: 'My Inquiries', icon: <ListChecks className="h-5 w-5" /> },
  { href: '/users/dashboard/profile', label: 'My Profile', icon: <UserCircle className="h-5 w-5" /> },
];

export default function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/agents/login'); // Or a general login page if you create one
      } else if (user && user.role !== 'user') {
        toast({ 
          title: "Access Denied", 
          description: "This dashboard is for general users only.",
          variant: "destructive"
        });
        router.push('/');
      }
    }
  }, [isAuthenticated, user, loading, router, toast]);

  if (loading || !isAuthenticated || (user && user.role !== 'user')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-muted-foreground">Loading user dashboard...</p>
      </div>
    );
  }
  
  const currentUser = user as GeneralUser;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-var(--header-height,100px))]">
      <aside className="w-full md:w-64 bg-card text-card-foreground p-4 md:border-r border-border space-y-6 md:sticky md:top-[calc(var(--header-height,68px)+1rem)] md:self-start md:max-h-[calc(100vh-var(--header-height,68px)-2rem)] md:overflow-y-auto">
        <div className="md:hidden">
           <Logo />
        </div>
        <div className="text-center border-b pb-4 mb-4">
            <UserCircle className="mx-auto h-10 w-10 text-primary mb-2" />
            <h2 className="text-xl font-headline font-semibold">{currentUser?.name}</h2>
            <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname.startsWith(item.href) && (item.href !== '/users/dashboard' || pathname === item.href) ? 'default' : 'ghost'}
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
