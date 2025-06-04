
// src/app/agents/dashboard/profile/page.tsx
'use client';

import { useAuth } from '@/contexts/auth-context';
import type { Agent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, Mail, Phone, Briefcase, Edit2, Lock, Shield } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentProfilePage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || user.role !== 'agent') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-headline">Access Denied</h1>
        <p className="text-muted-foreground">This page is for agents only.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  const agent = user as Agent;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <UserCircle className="mr-3 h-8 w-8 text-primary" /> My Profile
        </h1>
        <p className="text-muted-foreground">View and manage your account details.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 space-y-4 sm:space-y-0">
            <Avatar className="h-28 w-28 border-2 border-primary">
              <AvatarImage src={agent.avatarUrl || 'https://placehold.co/128x128.png'} alt={agent.name} data-ai-hint="professional person" />
              <AvatarFallback>{agent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-headline">{agent.name}</CardTitle>
              <CardDescription className="text-lg">Agent at Homeland Capital</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem icon={<Mail />} label="Email Address" value={agent.email} />
            <InfoItem icon={<Phone />} label="Phone Number" value={agent.phone} />
            {agent.agency && <InfoItem icon={<Briefcase />} label="Agency" value={agent.agency} />}
            <InfoItem icon={<Shield />} label="Account Type" value="Real Estate Agent" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Edit2 className="mr-2 h-5 w-5 text-muted-foreground" /> Account Actions
          </CardTitle>
          <CardDescription>Manage your profile information and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start" disabled>
            <Edit2 className="mr-2 h-4 w-4" /> Edit Profile Information (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            <Lock className="mr-2 h-4 w-4" /> Change Password (Coming Soon)
          </Button>
           <Button variant="outline" className="w-full justify-start" disabled>
            <UserCircle className="mr-2 h-4 w-4" /> Update Profile Picture (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start p-4 border rounded-lg bg-muted/50">
      <span className="text-primary mr-3 mt-1">{icon}</span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold text-lg">{value}</p>
      </div>
    </div>
  );
}
