
import UserDashboardLayout from '@/components/layout/user-dashboard-layout';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
