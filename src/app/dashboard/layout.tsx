// src/app/dashboard/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import { User, Package, LogOut, LayoutDashboard, Box, Settings } from 'lucide-react'; // Added Box, Settings
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button'; // Import Button
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface UserDashboardLayoutProps {
    children: ReactNode;
}

export default function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

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
            <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
                <p>Chargement...</p>
            </div>
        );
    }

    // Redirect if not logged in or not a customer/manager
    if (!user || (user.role !== 'customer' && user.role !== 'manager')) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
                <p className="text-xl text-destructive mb-4">Accès non autorisé.</p>
                <p className="mb-6 text-muted-foreground">Veuillez vous connecter pour accéder à votre tableau de bord.</p>
                <Link href="/account">
                    <Button variant="destructive">Connexion / Inscription</Button>
                </Link>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-[calc(100vh-150px)]"> {/* Adjust min-height based on header/footer */}
                <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-border">
                    <SidebarHeader className="items-center justify-between p-2 border-b border-border">
                         <SidebarTrigger className="md:hidden"/>
                         <span className="font-semibold text-lg hidden group-data-[state=expanded]:inline text-primary">Mon Espace</span>
                    </SidebarHeader>
                    <SidebarContent className="p-2">
                        <SidebarMenu>
                             <SidebarMenuItem>
                                <Link href="/dashboard" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Tableau de bord" className="text-sm" isActive={router.pathname === '/dashboard'}>
                                        <LayoutDashboard />
                                        <span>Tableau de bord</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             {/* Manager Specific Links */}
                             {user.role === 'manager' && (
                                <>
                                    <SidebarMenuItem>
                                        <Link href="/dashboard/products" passHref legacyBehavior>
                                            <SidebarMenuButton tooltip="Gérer Produits" className="text-sm" isActive={router.pathname?.startsWith('/dashboard/products')}>
                                                <Box />
                                                <span>Gérer Produits</span>
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                    {/* Potentially add Orders Management for Manager if different from Admin */}
                                    {/* <SidebarMenuItem>
                                        <Link href="/dashboard/manage-orders" passHref legacyBehavior> ... </Link>
                                    </SidebarMenuItem> */}
                                </>
                             )}
                            {/* Links for both Customer and Manager */}
                            <SidebarMenuItem>
                                <Link href="/dashboard/orders" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Mes Commandes" className="text-sm" isActive={router.pathname === '/dashboard/orders'}>
                                        <Package />
                                        <span>Mes Commandes</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/dashboard/profile" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Mon Profil" className="text-sm" isActive={router.pathname === '/dashboard/profile'}>
                                        <User />
                                        <span>Mon Profil</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
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
                    {/* Main content area for user dashboard pages */}
                    <div className="p-4 md:p-8 bg-background min-h-full"> {/* Ensure background color */}
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
