// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, ShieldCheck, UserX, Briefcase, Loader2, KeyRound } from "lucide-react"; // Added KeyRound
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, User } from '@/context/AuthContext'; // Import useAuth and User type
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import { cn } from '@/lib/utils'; // Import cn

// Define AdminUser type extending the base User type if needed, or just use User
type AdminUser = User;
type UserRole = AdminUser['role'];

// Simulate API calls (replace with actual fetch logic)
const fetchUsersFromAPI = async (): Promise<AdminUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // In real app, fetch from '/api/users'
    // Retrieve users from localStorage or wherever AuthContext stores them
    if (typeof window === 'undefined') return [];
    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    // Ensure dates are parsed correctly if stored as strings
    return users.map((u: any) => ({ ...u, createdAt: u.createdAt ? new Date(u.createdAt) : new Date() })); // Added fallback for createdAt
};

const updateUserRoleAPI = async (userId: string, newRole: UserRole): Promise<void> => {
    console.log(`Updating role for user ${userId} to ${newRole} via API`);
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real app: await fetch(`/api/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
    // Update in localStorage or call AuthContext update method
    if (typeof window === 'undefined') return;
    const storedUsers = localStorage.getItem('users');
    let users = storedUsers ? JSON.parse(storedUsers) : [];
    users = users.map((u: any) => u.id === userId ? { ...u, role: newRole } : u);
    localStorage.setItem('users', JSON.stringify(users));
};

const deleteUserAPI = async (userId: string): Promise<void> => {
    console.log("Deleting user via API:", userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real app: await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    // Update in localStorage or call AuthContext delete method
    if (typeof window === 'undefined') return;
    const storedUsers = localStorage.getItem('users');
    let users = storedUsers ? JSON.parse(storedUsers) : [];
    users = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
};


export default function AdminUsersPage() {
  const { user: loggedInUser, resetPassword } = useAuth(); // Get the currently logged-in admin user and resetPassword function
  const { t } = useTranslation(); // Use translation hook
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // Track updating user ID
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track deleting user ID
  const [isResetting, setIsResetting] = useState<string | null>(null); // Track resetting user ID
  const { toast } = useToast();

  // Fetch users on mount
  useEffect(() => {
    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await fetchUsersFromAPI();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast({ title: t('general_error'), description: t('admin_users_toast_load_error_description'), variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    loadUsers();
  }, [toast, t]); // Added t dependency

  const handleRoleChange = async (userId: string, userName: string, currentRole: UserRole, newRole: UserRole) => {
    if (userId === loggedInUser?.id) {
       toast({ title: t('admin_users_toast_role_change_self_error_title'), description: t('admin_users_toast_role_change_self_error_description'), variant: "destructive" });
       return;
    }
    if (currentRole === 'admin' && userId === 'admin-default') { // Specific check for the default admin
        toast({ title: t('admin_users_toast_role_change_default_admin_error_title'), description: t('admin_users_toast_role_change_default_admin_error_description'), variant: "destructive" });
        return;
    }
    // Prevent demoting the last admin? (Add logic if needed)

    setIsUpdating(userId);
    try {
        await updateUserRoleAPI(userId, newRole);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast({ title: t('admin_users_toast_role_change_success_title'), description: t('admin_users_toast_role_change_success_description', { userName, role: getRoleName(newRole) }), className: "bg-primary text-primary-foreground border-primary" });
    } catch (error) {
        console.error("Failed to update role:", error);
        toast({ title: t('general_error'), description: t('admin_users_toast_role_change_error_description'), variant: "destructive" });
    } finally {
        setIsUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
     if (userId === loggedInUser?.id) {
        toast({ title: t('admin_users_toast_delete_self_error_title'), description: t('admin_users_toast_delete_self_error_description'), variant: "destructive" });
        return;
     }
     if (userId === 'admin-default') { // Specific check for the default admin
       toast({ title: t('admin_users_toast_delete_default_admin_error_title'), description: t('admin_users_toast_delete_default_admin_error_description'), variant: "destructive" });
       return;
     }
     // Prevent deleting the last admin? (Add logic if needed)

     setIsDeleting(userId);
     try {
        await deleteUserAPI(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({ title: t('admin_users_toast_delete_success_title'), description: t('admin_users_toast_delete_success_description', { userName }), variant: "destructive" });
     } catch (error) {
         console.error("Failed to delete user:", error);
         toast({ title: t('general_error'), description: t('admin_users_toast_delete_error_description'), variant: "destructive" });
     } finally {
        setIsDeleting(null);
     }
  };

   const handleResetPassword = async (userId: string, userName: string) => {
     if (userId === loggedInUser?.id) {
        toast({ title: t('admin_users_toast_reset_self_error_title', { userName: 'votre' }), description: t('admin_users_toast_reset_self_error_description'), variant: "destructive" });
        return;
     }
     // Optional: Add check if trying to reset default admin's password unnecessarily

     setIsResetting(userId);
     try {
        await resetPassword(userId);
        toast({
            title: t('admin_users_toast_reset_success_title'),
            // WARNING: Do not show the default password in a real application toast.
            // Send an email instead. This is for simulation only.
            description: t('admin_users_toast_reset_success_description', { userName }),
            className: "bg-primary text-primary-foreground border-primary",
            duration: 7000 // Longer duration for important info
        });
     } catch (error: any) {
         console.error("Failed to reset password:", error);
         toast({ title: t('general_error'), description: error.message || t('admin_users_toast_reset_error_description'), variant: "destructive" });
     } finally {
        setIsResetting(null);
     }
  };


   const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "destructive" | "outline" => {
        switch (role) {
            case 'admin': return 'destructive';
            case 'manager': return 'default'; // Use primary color for manager
            case 'customer': return 'secondary';
            default: return 'outline';
        }
    };

    const getRoleName = (role: UserRole): string => {
         switch (role) {
             case 'admin': return t('account_form_role_admin');
             case 'manager': return t('account_form_role_manager');
             case 'customer': return t('account_form_role_customer');
             default: return 'Inconnu';
         }
    }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
         <div>
             <h1 className="text-3xl font-bold text-primary">{t('admin_users_page_title')}</h1>
             <p className="text-muted-foreground">{t('admin_users_description')}</p>
         </div>
        {/* Optional: Button to invite/add new users directly - requires a form/modal */}
        {/* <Link href="/admin/users/new">
            <Button variant="destructive" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
            </Button>
        </Link> */}
      </div>

      <Card className="shadow-md border-border">
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle>{t('admin_users_table_title')}</CardTitle>
           {/* Optional: Add search/filter input */}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="space-y-2 p-6">
                 {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                         <div className="space-y-2 flex-grow">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-4 w-2/5" />
                         </div>
                         <Skeleton className="h-6 w-24" />
                         <Skeleton className="h-6 w-20 hidden md:block" />
                         <Skeleton className="h-8 w-8" />
                     </div>
                 ))}
            </div>
          ) : users.length === 0 ? (
             <p className="text-center text-muted-foreground py-12">{t('admin_users_no_users')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">{t('admin_users_table_name')}</TableHead>
                  <TableHead className="px-6">{t('admin_users_table_email')}</TableHead>
                  <TableHead className="px-6">{t('admin_users_table_role')}</TableHead>
                  <TableHead className="hidden md:table-cell px-6">{t('admin_users_table_registered_date')}</TableHead>
                  <TableHead className="text-right px-6 w-[100px]">{t('admin_users_table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium px-6 py-3">{user.name}</TableCell>
                    <TableCell className="px-6 py-3">{user.email}</TableCell>
                    <TableCell className="px-6 py-3">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell px-6 py-3">
                        {user.createdAt ? user.createdAt.toLocaleDateString('fr-FR') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right px-6 py-3">
                      <AlertDialog>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button
                               aria-haspopup="true"
                               size="icon"
                               variant="ghost"
                               disabled={isUpdating === user.id || isDeleting === user.id || isResetting === user.id || user.id === loggedInUser?.id} // Disable actions for self or during operation
                             >
                               {(isUpdating === user.id || isDeleting === user.id || isResetting === user.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                               <span className="sr-only">Toggle menu</span>
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuLabel>{t('admin_users_action_change_role')}</DropdownMenuLabel>
                              {/* Role Change Options */}
                              {user.role !== 'admin' && (
                                <DropdownMenuItem
                                   onClick={() => handleRoleChange(user.id, user.name, user.role, 'admin')}
                                   disabled={user.id === 'admin-default'} // Disable changing default admin role
                                   className="cursor-pointer flex items-center text-green-600 focus:text-green-700 focus:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <ShieldCheck className="mr-2 h-4 w-4" /> {t('admin_users_action_promote_admin')}
                                </DropdownMenuItem>
                              )}
                              {user.role !== 'manager' && (
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.name, user.role, 'manager')} className="cursor-pointer flex items-center text-blue-600 focus:text-blue-700 focus:bg-blue-50">
                                  <Briefcase className="mr-2 h-4 w-4" /> {t('admin_users_action_promote_manager')}
                                </DropdownMenuItem>
                               )}
                               {user.role !== 'customer' && (
                                <DropdownMenuItem
                                    onClick={() => handleRoleChange(user.id, user.name, user.role, 'customer')}
                                    disabled={user.id === 'admin-default'} // Disable demoting default admin
                                    className="cursor-pointer flex items-center text-orange-600 focus:text-orange-700 focus:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <UserX className="mr-2 h-4 w-4" /> {t('admin_users_action_demote_customer')}
                                </DropdownMenuItem>
                              )}
                             <DropdownMenuSeparator />
                             <DropdownMenuLabel>{t('admin_users_action_other_actions')}</DropdownMenuLabel>
                             {/* Reset Password */}
                             <AlertDialogTrigger asChild>
                                <Button variant="ghost" data-alert-type="reset" className="w-full justify-start px-2 py-1.5 h-auto text-sm font-normal cursor-pointer relative flex select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                     <KeyRound className="mr-2 h-4 w-4"/>{t('admin_users_action_reset_password')}
                                </Button>
                             </AlertDialogTrigger>
                              {/* Delete Option */}
                             <AlertDialogTrigger asChild>
                                <Button variant="ghost" data-alert-type="delete" className="text-destructive focus:text-destructive hover:bg-destructive/10 w-full justify-start px-2 py-1.5 h-auto text-sm font-normal cursor-pointer relative flex select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                   <Trash2 className="mr-2 h-4 w-4"/>{t('admin_users_action_delete_account')}
                                </Button>
                             </AlertDialogTrigger>
                           </DropdownMenuContent>
                         </DropdownMenu>

                         {/* Separate AlertDialogContent for each action type */}
                         {/* Delete Confirmation */}
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle data-alert-type="delete">{t('admin_users_delete_confirm_title')}</AlertDialogTitle>
                              <AlertDialogTitle data-alert-type="reset">{t('admin_users_reset_confirm_title')}</AlertDialogTitle>
                              <AlertDialogDescription data-alert-type="delete">
                                {t('admin_users_delete_confirm_description', { userName: user.name, userEmail: user.email })}
                              </AlertDialogDescription>
                               <AlertDialogDescription data-alert-type="reset">
                                {t('admin_users_reset_confirm_description', { userName: user.name, userEmail: user.email })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('general_cancel')}</AlertDialogCancel>
                              {/* Delete Action */}
                              <AlertDialogAction
                                 data-alert-type="delete"
                                 onClick={() => handleDeleteUser(user.id, user.name)}
                                 className={buttonVariants({ variant: "destructive" })}
                                 disabled={isDeleting === user.id}
                              >
                                  {isDeleting === user.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {t('general_delete')}
                              </AlertDialogAction>
                              {/* Reset Password Action */}
                               <AlertDialogAction
                                 data-alert-type="reset"
                                 onClick={() => handleResetPassword(user.id, user.name)}
                                 className={buttonVariants({ variant: "destructive" })}
                                 disabled={isResetting === user.id}
                              >
                                  {isResetting === user.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {t('admin_users_action_reset_password')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
         {/* Optional: Pagination */}
        {/* <CardFooter className="p-4 border-t"> Pagination Controls </CardFooter> */}
      </Card>

       {/* CSS to conditionally hide AlertDialog parts based on trigger */}
       <style jsx global>{`
        [data-radix-alert-dialog-content]:not([data-triggered-by="delete"]) [data-alert-type="reset"],
        [data-radix-alert-dialog-content]:not([data-triggered-by="reset"]) [data-alert-type="delete"] {
            display: none;
         }
       `}</style>
       <script dangerouslySetInnerHTML={{ __html: `
         document.addEventListener('click', function(event) {
           // Find the closest menu item trigger that has dialog controls
           const trigger = event.target.closest('[data-radix-collection-item][role="menuitem"][aria-haspopup="dialog"]');
           if (trigger) {
             const alertType = trigger.dataset.alertType;
             const contentId = trigger.getAttribute('aria-controls');
             // Find the associated dialog content using the ID
             const content = document.querySelector(\`[data-radix-alert-dialog-content][id='\${contentId}']\`);
             if (content) {
                 console.log("Setting triggeredBy:", alertType, "on", content)
               // Set the triggered-by attribute on the content itself
               content.setAttribute('data-triggered-by', alertType);
             } else {
                console.log("Content not found for id:", contentId);
             }
           }
         }, true);
       `}}/>


    </div>
  );
}
    