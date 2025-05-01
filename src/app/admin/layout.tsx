// src/app/admin/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import { LayoutGrid, Box, Settings, Users, LogOut, Package } from 'lucide-react'; // Added Package
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button'; // Import Button for styling
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { useNotificationListener } from '@/hooks/useNotificationListener.tsx'; // Import notification hook

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
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
                         <span className="font-semibold text-lg hidden group-data-[state=expanded]:inline text-primary">Admin</span>
                    </SidebarHeader>
                    <SidebarContent className="p-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/admin" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Tableau de bord" className="text-sm" isActive={router.pathname === '/admin'}>
                                        <LayoutGrid />
                                        <span>Tableau de bord</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/products" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Produits" className="text-sm" isActive={router.pathname?.startsWith('/admin/products')}>
                                        <Box />
                                        <span>Produits</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             {/* Orders Link */}
                             <SidebarMenuItem>
                                <Link href="/admin/orders" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Commandes" className="text-sm" isActive={router.pathname?.startsWith('/admin/orders')}>
                                        <Package />
                                        <span>Commandes</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/users" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Utilisateurs" className="text-sm" isActive={router.pathname === '/admin/users'}>
                                        <Users />
                                        <span>Utilisateurs</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/admin/settings" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Paramètres" className="text-sm" isActive={router.pathname === '/admin/settings'}>
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
                                     className="text-destructive hover:bg-destructive/10 hover:text-destructive text-sm"
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
                    <div className="p-4 md:p-8 bg-background min-h-screen"> {/* Added bg-background */}
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
