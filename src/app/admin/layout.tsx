// src/app/admin/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import { LayoutGrid, Box, Settings, Users, LogOut, Package, FileText, BarChart3, Tags, FolderTree } from 'lucide-react'; // Added FolderTree, Tags
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter, usePathname } from 'next/navigation'; // Import useRouter, usePathname
import { Button } from '@/components/ui/button'; // Import Button for styling
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { useNotificationListener } from '@/hooks/useNotificationListener.tsx'; // Import notification hook

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname(); // Get current path
    const { toast } = useToast();
    useNotificationListener(['admin', 'manager']); // Listen for new orders if admin or manager

    const handleLogout = () => {
        logout();
        toast({
            title: "Déconnexion réussie",
            description: "Vous avez été déconnecté.",
        });
        router.push('/'); // Redirect to home after logout
    };

    // Handle loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Chargement...</p>
            </div>
        );
    }

    // Redirect if not logged in or not an admin
    if (!user || user.role !== 'admin') {
        // Redirect happens in AuthContext, but good to have a fallback message
        return (
            <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
                <p className="text-xl text-destructive mb-4">Accès non autorisé.</p>
                <p className="mb-6 text-muted-foreground">Vous devez être administrateur pour accéder à cette page.</p>
                <Link href="/account">
                    <Button variant="destructive">Connexion</Button>
                </Link>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-border">
                    <SidebarHeader className="items-center justify-between p-2 border-b border-border">
                         <SidebarTrigger className="md:hidden"/>
                         <span className="font-semibold text-xl hidden group-data-[state=expanded]:inline text-primary">Admin</span> {/* Increased font size */}
                    </SidebarHeader>
                    <SidebarContent className="p-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/admin" >
                                    <SidebarMenuButton tooltip="Tableau de bord" className="text-base" isActive={pathname === '/admin'}> {/* Increased font size */}
                                        <LayoutGrid />
                                        <span>Tableau de bord</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/products" >
                                    <SidebarMenuButton tooltip="Produits" className="text-base" isActive={pathname?.startsWith('/admin/products')}> {/* Increased font size */}
                                        <Box />
                                        <span>Produits</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/categories" > {/* Added Categories Link */}
                                    <SidebarMenuButton tooltip="Catégories" className="text-base" isActive={pathname?.startsWith('/admin/categories')}> {/* Increased font size */}
                                        <FolderTree />
                                        <span>Catégories</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/tags" > {/* Added Tags Link */}
                                    <SidebarMenuButton tooltip="Étiquettes" className="text-base" isActive={pathname?.startsWith('/admin/tags')}> {/* Increased font size */}
                                        <Tags />
                                        <span>Étiquettes</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             {/* Orders Link */}
                             <SidebarMenuItem>
                                <Link href="/admin/orders" >
                                    <SidebarMenuButton tooltip="Commandes" className="text-base" isActive={pathname?.startsWith('/admin/orders')}> {/* Increased font size */}
                                        <Package />
                                        <span>Commandes</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             {/* Invoices Link */}
                             <SidebarMenuItem>
                                <Link href="/admin/invoices" >
                                    <SidebarMenuButton tooltip="Factures" className="text-base" isActive={pathname?.startsWith('/admin/invoices')}> {/* Increased font size */}
                                        <FileText />
                                        <span>Factures</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/users" >
                                    <SidebarMenuButton tooltip="Utilisateurs" className="text-base" isActive={pathname === '/admin/users'}> {/* Increased font size */}
                                        <Users />
                                        <span>Utilisateurs</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            {/* Statistics Link Removed - Integrated into Dashboard */}
                            <SidebarMenuItem>
                                <Link href="/admin/settings" >
                                    <SidebarMenuButton tooltip="Paramètres" className="text-base" isActive={pathname === '/admin/settings'}> {/* Increased font size */}
                                        <Settings />
                                        <span>Paramètres</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    {/* Logout Button in Footer */}
                    <SidebarFooter className="p-2 border-t border-border">
                         <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                     tooltip="Déconnexion"
                                     onClick={handleLogout}
                                     className="text-destructive hover:bg-destructive/10 hover:text-destructive text-base" /* Increased font size */
                                >
                                     <LogOut />
                                     <span>Déconnexion</span>
                                 </SidebarMenuButton>
                             </SidebarMenuItem>
                         </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
                 <SidebarInset>
                    {/* Main content area for admin pages */}
                    <div className="p-4 md:p-8 bg-background min-h-screen text-base"> {/* Added text-base for potentially larger content font */}
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
