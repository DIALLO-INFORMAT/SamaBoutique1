'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, ShieldCheck, UserX, Briefcase, Loader2 } from "lucide-react"; // Added Briefcase, Loader2
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

// Define AdminUser type extending the base User type if needed, or just use User
type AdminUser = User;
type UserRole = AdminUser['role'];

// Simulate API calls (replace with actual fetch logic)
const fetchUsersFromAPI = async (): Promise<AdminUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // In real app, fetch from '/api/users'
    // Retrieve users from localStorage or wherever AuthContext stores them
    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    // Ensure dates are parsed correctly if stored as strings
    return users.map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) }));
};

const updateUserRoleAPI = async (userId: string, newRole: UserRole): Promise<void> => {
    console.log(`Updating role for user ${userId} to ${newRole} via API`);
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real app: await fetch(`/api/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
    // Update in localStorage or call AuthContext update method
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
    const storedUsers = localStorage.getItem('users');
    let users = storedUsers ? JSON.parse(storedUsers) : [];
    users = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
};


export default function AdminUsersPage() {
  const { user: loggedInUser } = useAuth(); // Get the currently logged-in admin user
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // Track updating user ID
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track deleting user ID
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
            toast({ title: "Erreur", description: "Impossible de charger les utilisateurs.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    loadUsers();
  }, [toast]); // Added toast dependency

  const handleRoleChange = async (userId: string, userName: string, currentRole: UserRole, newRole: UserRole) => {
    if (userId === loggedInUser?.id) {
       toast({ title: "Action non autorisée", description: "Vous ne pouvez pas modifier votre propre rôle.", variant: "destructive" });
       return;
    }
    if (currentRole === 'admin' && userId === 'admin-default') { // Specific check for the default admin
        toast({ title: "Action non autorisée", description: "Le rôle de l'administrateur par défaut ne peut pas être modifié.", variant: "destructive" });
        return;
    }
    // Prevent demoting the last admin? (Add logic if needed)

    setIsUpdating(userId);
    try {
        await updateUserRoleAPI(userId, newRole);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast({ title: "Rôle Modifié", description: `Le rôle de ${userName} est maintenant ${newRole}.`, className: "bg-primary text-primary-foreground border-primary" });
    } catch (error) {
        console.error("Failed to update role:", error);
        toast({ title: "Erreur", description: "Impossible de modifier le rôle.", variant: "destructive" });
    } finally {
        setIsUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
     if (userId === loggedInUser?.id) {
        toast({ title: "Action non autorisée", description: "Vous ne pouvez pas supprimer votre propre compte.", variant: "destructive" });
        return;
     }
     if (userId === 'admin-default') { // Specific check for the default admin
       toast({ title: "Action non autorisée", description: "L'administrateur par défaut ne peut pas être supprimé.", variant: "destructive" });
       return;
     }
     // Prevent deleting the last admin? (Add logic if needed)

     setIsDeleting(userId);
     try {
        await deleteUserAPI(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({ title: "Utilisateur Supprimé", description: `Le compte de ${userName} a été supprimé.`, variant: "destructive" });
     } catch (error) {
         console.error("Failed to delete user:", error);
         toast({ title: "Erreur", description: "Impossible de supprimer l'utilisateur.", variant: "destructive" });
     } finally {
        setIsDeleting(null);
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
             case 'admin': return 'Admin';
             case 'manager': return 'Gestionnaire';
             case 'customer': return 'Client';
             default: return 'Inconnu';
         }
    }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
         <div>
             <h1 className="text-3xl font-bold text-primary">Gestion des Utilisateurs</h1>
             <p className="text-muted-foreground">Gérez les comptes et les permissions.</p>
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
          <CardTitle>Liste des Utilisateurs</CardTitle>
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
             <p className="text-center text-muted-foreground py-12">Aucun utilisateur trouvé.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Nom</TableHead>
                  <TableHead className="px-6">Email</TableHead>
                  <TableHead className="px-6">Rôle</TableHead>
                  <TableHead className="hidden md:table-cell px-6">Date d'inscription</TableHead>
                  <TableHead className="text-right px-6 w-[100px]">Actions</TableHead>
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
                        {user.createdAt.toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right px-6 py-3">
                      <AlertDialog>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button
                               aria-haspopup="true"
                               size="icon"
                               variant="ghost"
                               disabled={isUpdating === user.id || isDeleting === user.id || user.id === loggedInUser?.id || user.id === 'admin-default'} // Disable actions for self, default admin, or during operation
                             >
                               {(isUpdating === user.id || isDeleting === user.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                               <span className="sr-only">Toggle menu</span>
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Modifier le rôle</DropdownMenuLabel>
                              {/* Role Change Options */}
                              {user.role !== 'admin' && (
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.name, user.role, 'admin')} className="cursor-pointer flex items-center text-green-600 focus:text-green-700 focus:bg-green-50">
                                  <ShieldCheck className="mr-2 h-4 w-4" /> Promouvoir Admin
                                </DropdownMenuItem>
                              )}
                              {user.role !== 'manager' && (
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.name, user.role, 'manager')} className="cursor-pointer flex items-center text-blue-600 focus:text-blue-700 focus:bg-blue-50">
                                  <Briefcase className="mr-2 h-4 w-4" /> Promouvoir Gestionnaire
                                </DropdownMenuItem>
                               )}
                               {user.role !== 'customer' && (
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.name, user.role, 'customer')} className="cursor-pointer flex items-center text-orange-600 focus:text-orange-700 focus:bg-orange-50">
                                  <UserX className="mr-2 h-4 w-4" /> Rétrograder Client
                                </DropdownMenuItem>
                              )}
                             <DropdownMenuSeparator />
                             <DropdownMenuLabel>Autres Actions</DropdownMenuLabel>
                              {/* Delete Option */}
                             <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="text-destructive focus:text-destructive hover:bg-destructive/10 w-full justify-start px-2 py-1.5 h-auto text-sm font-normal cursor-pointer relative flex select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                   <Trash2 className="mr-2 h-4 w-4"/>Supprimer le compte
                                </Button>
                             </AlertDialogTrigger>
                           </DropdownMenuContent>
                         </DropdownMenu>

                         {/* Delete Confirmation Dialog */}
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'utilisateur?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer le compte de "{user.name}" ({user.email})? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                 onClick={() => handleDeleteUser(user.id, user.name)}
                                 className={buttonVariants({ variant: "destructive" })}
                                 disabled={isDeleting === user.id}
                              >
                                  {isDeleting === user.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Supprimer
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
    </div>
  );
}
