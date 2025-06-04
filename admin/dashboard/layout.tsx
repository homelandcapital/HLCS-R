
import AdminDashboardLayout from '@/components/layout/admin-dashboard-layout';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
