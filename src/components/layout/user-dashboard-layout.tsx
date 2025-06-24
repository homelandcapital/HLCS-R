
// src/components/layout/user-dashboard-layout.tsx
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, type ReactNode, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Bookmark, ListChecks, UserCircle } from 'lucide-react';
import Logo from '@/components/common/logo';
import { useToast } from '@/hooks/use-toast';
import type { GeneralUser } from '@/lib/types';
import { Badge } from '@/components/ui/badge'; 
import { supabase } from '@/lib/supabaseClient';

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
  const { isAuthenticated, user, loading, signOut } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [unreadUserMessagesCount, setUnreadUserMessagesCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user || user.role !== 'user') return;

    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('id, conversation:inquiry_messages(sender_role, timestamp)')
      .eq('user_id', user.id);

    if (error) {
      console.error("Error fetching user's unread inquiries count:", error);
      return;
    }

    let count = 0;
    if (inquiries) {
      inquiries.forEach(inq => {
        if (inq.conversation && inq.conversation.length > 0) {
          const sortedConversation = [...inq.conversation].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          if (sortedConversation[0]?.sender_role === 'platform_admin') {
            count++;
          }
        }
      });
    }
    setUnreadUserMessagesCount(count);
  }, [user]);


  useEffect(() => {
    if (!loading && isAuthenticated && user && user.role === 'user') {
      fetchUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, loading, pathname]); 


  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/agents/login'); 
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
          {navItems.map((item) => {
             let isActive = false;
            if (item.href === '/users/dashboard') {
              isActive = pathname === item.href;
            } else {
              isActive = pathname.startsWith(item.href);
            }
            const isMyInquiriesItem = item.href === '/users/dashboard/my-inquiries';
            
            return (
              <Button
                key={item.href}
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <span className="flex w-full items-center justify-between">
                    <span className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                    </span>
                    {isMyInquiriesItem && unreadUserMessagesCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs rounded-full">
                          {unreadUserMessagesCount}
                        </Badge>
                    )}
                  </span>
                </Link>
              </Button>
            );
          })}
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
