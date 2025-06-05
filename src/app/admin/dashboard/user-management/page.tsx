
// src/app/admin/dashboard/user-management/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuthenticatedUser, UserRole, Agent, GeneralUser, PlatformAdmin } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Briefcase, UserCircle, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { convertToCSV, downloadCSV } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context'; // Ensure admin access

export default function UserManagementPage() {
  const { user: adminUser, loading: authLoading } = useAuth();
  const [allUsers, setAllUsers] = useState<AuthenticatedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AuthenticatedUser[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Error', description: 'Could not fetch users.', variant: 'destructive' });
      setAllUsers([]);
    } else if (data) {
      // Ensure role is correctly typed for AuthenticatedUser union
      const typedUsers = data.map(u => ({
        ...u,
        role: u.role as UserRole, // Cast Supabase enum to our UserRole type
        avatar_url: u.avatar_url || null, // Ensure null if undefined
      })) as AuthenticatedUser[];
      setAllUsers(typedUsers);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && adminUser?.role === 'platform_admin') {
        fetchUsers();
    } else if (!authLoading) {
        setPageLoading(false); // Not an admin or auth still loading
    }
  }, [adminUser, authLoading, fetchUsers]);

  useEffect(() => {
    let users = [...allUsers];

    if (roleFilter !== 'all') {
      users = users.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      users = users.filter(user =>
        user.name.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm)
      );
    }
    setFilteredUsers(users);
  }, [searchTerm, roleFilter, allUsers]);

  const formatRole = (role: UserRole) => {
    switch (role) {
      case 'user':
        return 'General User';
      case 'agent':
        return 'Agent';
      case 'platform_admin':
        return 'Platform Admin';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (role) {
      case 'platform_admin':
        return 'destructive'; 
      case 'agent':
        return 'secondary';
      case 'user':
        return 'default'; 
      default:
        return 'outline';
    }
  };
  
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'platform_admin':
        return <Shield className="h-4 w-4 mr-2" />;
      case 'agent':
        return <Briefcase className="h-4 w-4 mr-2" />;
      case 'user':
        return <UserCircle className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  }

  const handleExportUsers = () => {
    const dataToExport = filteredUsers.map(user => {
      // Access phone and agency directly as they are nullable on the base user type from DB
      const phone = (user as Agent)?.phone || ''; 
      const agency = (user as Agent)?.agency || '';
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: formatRole(user.role),
        phone: phone,
        agency: agency,
      };
    });

    const headers = ['id', 'name', 'email', 'role', 'phone', 'agency'];
    const csvString = convertToCSV(dataToExport, headers);
    downloadCSV(csvString, 'homeland-capital-users.csv');
    toast({ title: 'Export Started', description: 'User data CSV download has started.' });
  };

  if (authLoading || pageLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-6 w-1/2 mt-2" />
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 w-full sm:max-w-sm" />
              <Skeleton className="h-10 w-full sm:w-[180px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(5)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminUser?.role !== 'platform_admin') {
     return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-headline">Access Denied</h1>
          <p className="text-muted-foreground">This dashboard is for platform administrators only.</p>
        </div>
      );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <Users className="mr-3 h-8 w-8 text-primary" /> User Management
        </h1>
        <p className="text-muted-foreground">View and manage all users on the Homeland Capital platform.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">User List</CardTitle>
              <CardDescription>A comprehensive list of all registered users, agents, and administrators.</CardDescription>
            </div>
            <Button onClick={handleExportUsers} variant="outline" disabled={filteredUsers.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export Users
            </Button>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">General User</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="platform_admin">Platform Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 && (searchTerm || roleFilter !== 'all') ? (
            <div className="text-center py-10">
              <p className="text-lg font-medium">No users match your filters.</p>
              <p className="text-muted-foreground">Try adjusting your search term or role filter.</p>
            </div>
          ) : allUsers.length === 0 ? (
             <div className="text-center py-10">
              <p className="text-lg font-medium">No users found.</p>
              <p className="text-muted-foreground">The platform currently has no registered users.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center">
                      {user.avatar_url && <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full mr-3 object-cover" data-ai-hint="professional person" />}
                      {!user.avatar_url && <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-muted-foreground text-xs">{user.name.substring(0,2).toUpperCase()}</span>}
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center w-fit">
                         {getRoleIcon(user.role)}
                         {formatRole(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{user.id}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

