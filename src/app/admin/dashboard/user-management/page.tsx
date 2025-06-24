
// src/app/admin/dashboard/user-management/page.tsx
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { AuthenticatedUser, UserRole, Agent, GeneralUser, PlatformAdmin } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Briefcase, UserCircle, Download, FileCheck2, Edit2, Ban, MoreHorizontal, CheckCircle as ReinstateIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { convertToCSV, downloadCSV } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserByAdmin, updateUserBanStatus } from '@/actions/admin-user-actions';
import { updateUserFormSchema, type UpdateUserFormValues } from '@/lib/schemas';


export default function UserManagementPage() {
  const { user: adminUser, loading: authLoading } = useAuth();
  const [allUsers, setAllUsers] = useState<AuthenticatedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AuthenticatedUser[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthenticatedUser | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [userToManage, setUserToManage] = useState<AuthenticatedUser | null>(null);
  const { toast } = useToast();

  const editForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
  });

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
      const typedUsers = data.map(u => ({
        ...u,
        role: u.role as UserRole,
        avatar_url: u.avatar_url || null,
        banned_until: u.banned_until || null,
      })) as AuthenticatedUser[];
      setAllUsers(typedUsers);
    }
    setPageLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && adminUser?.role === 'platform_admin') {
        fetchUsers();
    } else if (!authLoading) {
        setPageLoading(false);
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
  
  const handleOpenEditModal = (userToEdit: AuthenticatedUser) => {
    setSelectedUser(userToEdit);
    editForm.reset({
      name: userToEdit.name,
      role: userToEdit.role,
      phone: (userToEdit as Agent).phone || '',
      agency: (userToEdit as Agent).agency || '',
    });
    setIsEditModalOpen(true);
  };
  
  async function onEditSubmit(values: UpdateUserFormValues) {
    if (!selectedUser) return;
    startTransition(async () => {
      const result = await updateUserByAdmin(selectedUser.id, values);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  }

  const handleOpenSuspendModal = (user: AuthenticatedUser) => {
    setUserToManage(user);
    setIsSuspendModalOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!userToManage) return;
    startTransition(async () => {
        const result = await updateUserBanStatus(userToManage.id, true);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchUsers();
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setIsSuspendModalOpen(false);
        setUserToManage(null);
    });
  };

  const handleReinstate = async (user: AuthenticatedUser) => {
    startTransition(async () => {
        const result = await updateUserBanStatus(user.id, false);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchUsers();
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    });
  };

  const formatRole = (role: UserRole) => {
    switch (role) {
      case 'user': return 'General User';
      case 'agent': return 'Agent';
      case 'platform_admin': return 'Platform Admin';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (role) {
      case 'platform_admin': return 'destructive'; 
      case 'agent': return 'secondary';
      case 'user': return 'default'; 
      default: return 'outline';
    }
  };
  
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'platform_admin': return <Shield className="h-4 w-4 mr-2" />;
      case 'agent': return <Briefcase className="h-4 w-4 mr-2" />;
      case 'user': return <UserCircle className="h-4 w-4 mr-2" />;
      default: return null;
    }
  }

  const handleExportUsers = () => {
    const dataToExport = filteredUsers.map(user => {
      const phone = (user as Agent)?.phone || ''; 
      const agency = (user as Agent)?.agency || '';
      const government_id_url = (user as Agent)?.government_id_url || '';
      const isSuspended = user.banned_until && new Date(user.banned_until) > new Date();
      
      return { id: user.id, name: user.name, email: user.email, role: formatRole(user.role), status: isSuspended ? 'Suspended' : 'Active', phone, agency, government_id_url };
    });

    const headers = ['id', 'name', 'email', 'role', 'status', 'phone', 'agency', 'government_id_url'];
    const csvString = convertToCSV(dataToExport, headers);
    downloadCSV(csvString, 'homeland-capital-users.csv');
    toast({ title: 'Export Started', description: 'User data CSV download has started.' });
  };

  if (authLoading || pageLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Card className="shadow-xl">
          <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
          <CardContent><Skeleton className="h-64 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (adminUser?.role !== 'platform_admin') {
     return ( <div className="text-center py-12"> <h1 className="text-2xl font-headline">Access Denied</h1> <p className="text-muted-foreground">This dashboard is for platform administrators only.</p> </div> );
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline flex items-center"><Users className="mr-3 h-8 w-8 text-primary" /> User Management</h1>
          <p className="text-muted-foreground">View and manage all users on the Homeland Capital platform.</p>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="font-headline text-2xl">User List</CardTitle>
                <CardDescription>A comprehensive list of all registered users, agents, and administrators.</CardDescription>
              </div>
              <Button onClick={handleExportUsers} variant="outline" disabled={filteredUsers.length === 0}><Download className="mr-2 h-4 w-4" /> Export Users</Button>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by role" /></SelectTrigger>
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
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10"><p className="text-lg font-medium">No users match your filters.</p><p className="text-muted-foreground">Try adjusting your search term or role filter.</p></div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Verification ID</TableHead><TableHead>User ID</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const isSuspended = user.banned_until && new Date(user.banned_until) > new Date();
                    return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium flex items-center">
                            {user.avatar_url && <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full mr-3 object-cover" data-ai-hint="professional person" />}
                            {!user.avatar_url && <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-muted-foreground text-xs">{user.name.substring(0,2).toUpperCase()}</span>}
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell><Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center w-fit">{getRoleIcon(user.role)} {formatRole(user.role)}</Badge></TableCell>
                          <TableCell>
                            {isSuspended ? (
                              <Badge variant="destructive">Suspended</Badge>
                            ) : (
                              <Badge variant="secondary">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.role === 'agent' && (user as Agent).government_id_url ? (
                              <Button variant="outline" size="sm" asChild>
                                <a href={(user as Agent).government_id_url!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1"><FileCheck2 className="h-4 w-4" /> View ID</a>
                              </Button>
                            ) : user.role === 'agent' ? (
                              <Badge variant="outline">No ID</Badge>
                            ) : ( <span className="text-muted-foreground">-</span> )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{user.id}</TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleOpenEditModal(user)}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        <span>Edit User</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {isSuspended ? (
                                        <DropdownMenuItem onClick={() => handleReinstate(user)} className="text-green-600 focus:text-green-700">
                                            <ReinstateIcon className="mr-2 h-4 w-4" />
                                            <span>Reinstate User</span>
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onClick={() => handleOpenSuspendModal(user)} className="text-destructive focus:text-destructive">
                                            <Ban className="mr-2 h-4 w-4" />
                                            <span>Suspend User</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
            <DialogDescription>Modify user details below. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-2">
              <FormField control={editForm.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={editForm.control} name="role" render={({ field }) => ( <FormItem> <FormLabel>Role</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="user">General User</SelectItem> <SelectItem value="agent">Agent</SelectItem> <SelectItem value="platform_admin">Platform Admin</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
              {selectedUser?.role === 'agent' && (
                <>
                  <FormField control={editForm.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={editForm.control} name="agency" render={({ field }) => ( <FormItem> <FormLabel>Agency</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </>
              )}
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to suspend this user?</AlertDialogTitle>
                <AlertDialogDescription>
                    Suspending <strong>{userToManage?.name}</strong> ({userToManage?.email}) will prevent them from logging in indefinitely. They will not be able to access their dashboard or perform any actions.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUserToManage(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmSuspend} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                    {isSubmitting ? 'Suspending...' : 'Confirm Suspension'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
