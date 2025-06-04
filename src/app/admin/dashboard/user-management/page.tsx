
// src/app/admin/dashboard/user-management/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { mockAgents, mockGeneralUsers, mockPlatformAdmins } from '@/lib/mock-data';
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

export default function UserManagementPage() {
  const [allUsers, setAllUsers] = useState<AuthenticatedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AuthenticatedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const { toast } = useToast();

  useEffect(() => {
    const combinedUsers: AuthenticatedUser[] = [
      ...mockGeneralUsers,
      ...mockAgents,
      ...mockPlatformAdmins,
    ];
    setAllUsers(combinedUsers);
    setFilteredUsers(combinedUsers);
  }, []);

  useEffect(() => {
    let users = [...allUsers];

    if (roleFilter !== 'all') {
      users = users.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      users = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    const dataToExport = filteredUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: formatRole(user.role),
      phone: (user as Agent).phone || '', // Only agents have phone
      agency: (user as Agent).agency || '', // Only agents have agency
    }));

    const headers = ['id', 'name', 'email', 'role', 'phone', 'agency'];
    const csvString = convertToCSV(dataToExport, headers);
    downloadCSV(csvString, 'homeland-capital-users.csv');
    toast({ title: 'Export Started', description: 'User data CSV download has started.' });
  };

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
            <Button onClick={handleExportUsers} variant="outline">
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
                      {user.avatarUrl && <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3 object-cover" data-ai-hint="professional person" />}
                      {!user.avatarUrl && <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-muted-foreground text-xs">{user.name.substring(0,2).toUpperCase()}</span>}
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
