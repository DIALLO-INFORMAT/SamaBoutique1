// src/app/dashboard/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import { User, Package, LogOut, LayoutDashboard, Box, Settings, FileText } from 'lucide-react'; // Added FileText
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname
import { Button } from '@/components/ui/button'; // Import Button
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { useNotificationListener } from '@/hooks/useNotificationListener.tsx'; // Import notification hook

interface UserDashboardLayoutProps {
    children: ReactNode;
}

export default function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname(); // Get current path
    const { toast } = useToast();

    // Only listen if the user is a manager
    useNotificationListener(user?.role === 'manager' ? ['manager'] : []);

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

    // Define common links
     const commonLinks = (
        <>
            <SidebarMenuItem>
                <Link href="/dashboard/orders" passHref legacyBehavior>
                    <SidebarMenuButton tooltip="Mes Commandes" className="text-sm" isActive={pathname === '/dashboard/orders'}>
                        <Package />
                        <span>Mes Commandes</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/dashboard/invoices" passHref legacyBehavior>
                    <SidebarMenuButton tooltip="Mes Factures" className="text-sm" isActive={pathname === '/dashboard/invoices'}>
                        <FileText />
                        <span>Mes Factures</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/dashboard/profile" passHref legacyBehavior>
                    <SidebarMenuButton tooltip="Mon Profil" className="text-sm" isActive={pathname === '/dashboard/profile'}>
                        <User />
                        <span>Mon Profil</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </>
     );

     // Define manager specific links
     const managerLinks = (
         <>
             <SidebarMenuItem>
                 <Link href="/dashboard/products" passHref legacyBehavior>
                     <SidebarMenuButton tooltip="Gérer Produits" className="text-sm" isActive={pathname?.startsWith('/dashboard/products')}>
                         <Box />
                         <span>Gérer Produits</span>
                     </SidebarMenuButton>
                 </Link>
             </SidebarMenuItem>
             <SidebarMenuItem>
                 <Link href="/dashboard/manage-orders" passHref legacyBehavior>
                     <SidebarMenuButton tooltip="Gérer Commandes" className="text-sm" isActive={pathname?.startsWith('/dashboard/manage-orders')}>
                         <Package />
                         <span>Gérer Commandes</span>
                     </SidebarMenuButton>
                 </Link>
             </SidebarMenuItem>
              {/* The Invoices link for manager is intentionally the same as customer's for now */}
         </>
     );


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
                                    <SidebarMenuButton tooltip="Tableau de bord" className="text-sm" isActive={pathname === '/dashboard'}>
                                        <LayoutDashboard />
                                        <span>Tableau de bord</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>

                            {/* Show Manager links first if manager */}
                            {user.role === 'manager' && managerLinks}

                            {/* Show Common links (includes invoices) */}
                            {commonLinks}

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
