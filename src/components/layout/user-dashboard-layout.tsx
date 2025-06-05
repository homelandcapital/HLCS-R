
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
  const { isAuthenticated, user, loading, signOut } = useAuth(); // Changed logout to signOut
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
          // Check if the latest message in the conversation is from 'platform_admin'
          // This logic assumes we only count if the *last* message is from admin.
          // A more sophisticated approach might track read receipts or last_read_timestamp.
          if (sortedConversation[0]?.sender_role === 'platform_admin') {
            // This simple check might increment count even if user has seen it.
            // For a true unread count, a more complex system is needed (e.g., tracking last read message per inquiry).
            // For now, this indicates an admin has replied.
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
       // Consider Supabase real-time subscription here too.
    }
  }, [isAuthenticated, user, loading, fetchUnreadCount, pathname]); // Re-fetch on pathname change


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
              <Link key={item.href} href={item.href} passHref legacyBehavior>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  asChild
                >
                  <a className="flex items-center justify-between w-full"> {/* Ensure 'a' tag for legacyBehavior */}
                    <>
                      <div className="flex items-center">
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                      </div>
                      {isMyInquiriesItem && unreadUserMessagesCount > 0 && (
                          <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs rounded-full">
                            {unreadUserMessagesCount}
                          </Badge>
                      )}
                    </>
                  </a>
                </Button>
              </Link>
            );
          })}
        </nav>
        <Button variant="outline" className="w-full mt-auto justify-start" onClick={signOut}> {/* Changed logout to signOut */}
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
