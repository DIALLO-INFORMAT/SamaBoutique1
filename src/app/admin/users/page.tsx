'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, ShieldCheck, UserX } from "lucide-react";
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

// Mock user data type
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer'; // Example roles
  createdAt: Date;
}

// Mock user data (replace with actual data fetching)
const initialUsers: AdminUser[] = [
  { id: 'u1', name: "Alice Dupont", email: "alice.d@example.com", role: "admin", createdAt: new Date(2023, 10, 15) },
  { id: 'u2', name: "Bob Martin", email: "bob.m@sample.net", role: "customer", createdAt: new Date(2024, 0, 5) },
  { id: 'u3', name: "Charlie Durand", email: "charlie@post.org", role: "customer", createdAt: new Date(2024, 2, 20) },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    // Replace with actual API call to fetch users
    setTimeout(() => {
      setUsers(initialUsers);
      setIsLoading(false);
    }, 800); // Simulate network delay
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'customer') => {
    console.log(`Changing role for user ${userId} to ${newRole}`);
    // Placeholder: API call to update user role
    await new Promise(resolve => setTimeout(resolve, 500));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast({ title: "Rôle Modifié", description: `Le rôle de l'utilisateur a été changé en ${newRole}.` });
  };

  const handleDeleteUser = async (userId: string) => {
     console.log("Attempting to delete user:", userId);
     // Placeholder: API call to delete user
     await new Promise(resolve => setTimeout(resolve, 500));
     setUsers(prev => prev.filter(u => u.id !== userId));
     toast({ title: "Utilisateur Supprimé", variant: "destructive" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Gestion des Utilisateurs</h1>
        {/* Optional: Add button to invite/add new users */}
        {/* <Button variant="destructive">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Utilisateur
        </Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>Gérez les comptes utilisateurs et leurs rôles.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                 {[...Array(3)].map((_, i) => (
                     <div key={i} className="flex items-center space-x-4 p-4 border-b">
                         <div className="space-y-2 flex-grow">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-4 w-2/5" />
                         </div>
                         <Skeleton className="h-6 w-20" />
                         <Skeleton className="h-8 w-24" />
                         <Skeleton className="h-8 w-8" />
                     </div>
                 ))}
            </div>
          ) : users.length === 0 ? (
             <p className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="hidden md:table-cell">Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Client'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {user.createdAt.toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button aria-haspopup="true" size="icon" variant="ghost">
                               <MoreHorizontal className="h-4 w-4" />
                               <span className="sr-only">Toggle menu</span>
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             {/* Role Change Options */}
                             {user.role === 'customer' ? (
                               <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')} className="cursor-pointer flex items-center">
                                 <ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> Promouvoir Admin
                               </DropdownMenuItem>
                             ) : (
                               <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'customer')} className="cursor-pointer flex items-center">
                                 <UserX className="mr-2 h-4 w-4 text-orange-600" /> Rétrograder Client
                               </DropdownMenuItem>
                             )}
                             <DropdownMenuSeparator />
                              {/* Delete Option */}
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center">
                                   <Trash2 className="mr-2 h-4 w-4"/>Supprimer le compte
                                </DropdownMenuItem>
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
                                 onClick={() => handleDeleteUser(user.id)}
                                 className={buttonVariants({ variant: "destructive" })}
                              >
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
      </Card>
    </div>
  );
}
