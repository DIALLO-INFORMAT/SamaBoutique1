// src/app/dashboard/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import { User, Package, LogOut, LayoutDashboard, Box, Settings, FileText, Tags, FolderTree } from 'lucide-react'; // Added FolderTree, Tags
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
                <Link href="/dashboard/orders" >
                    <SidebarMenuButton tooltip="Mes Commandes" className="text-base" isActive={pathname === '/dashboard/orders'}> {/* Increased font size */}
                        <Package />
                        <span>Mes Commandes</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            {/* Invoices Link Removed for Customer/Manager */}
            {/* <SidebarMenuItem>
                <Link href="/dashboard/invoices" >
                    <SidebarMenuButton tooltip="Mes Factures" className="text-base" isActive={pathname === '/dashboard/invoices'}>
                        <FileText />
                        <span>Mes Factures</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem> */}
             <SidebarMenuItem>
                <Link href="/dashboard/profile" >
                    <SidebarMenuButton tooltip="Mon Profil" className="text-base" isActive={pathname === '/dashboard/profile'}> {/* Increased font size */}
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
                 <Link href="/dashboard/products" >
                     <SidebarMenuButton tooltip="Gérer Produits" className="text-base" isActive={pathname?.startsWith('/dashboard/products')}> {/* Increased font size */}
                         <Box />
                         <span>Gérer Produits</span>
                     </SidebarMenuButton>
                 </Link>
             </SidebarMenuItem>
             <SidebarMenuItem>
                 <Link href="/dashboard/categories" > {/* Added Categories Link */}
                     <SidebarMenuButton tooltip="Catégories" className="text-base" isActive={pathname?.startsWith('/dashboard/categories')}> {/* Increased font size */}
                         <FolderTree />
                         <span>Catégories</span>
                     </SidebarMenuButton>
                 </Link>
             </SidebarMenuItem>
              <SidebarMenuItem>
                 <Link href="/dashboard/tags" > {/* Added Tags Link */}
                     <SidebarMenuButton tooltip="Étiquettes" className="text-base" isActive={pathname?.startsWith('/dashboard/tags')}> {/* Increased font size */}
                         <Tags />
                         <span>Étiquettes</span>
                     </SidebarMenuButton>
                 </Link>
             </SidebarMenuItem>
             <SidebarMenuItem>
                 <Link href="/dashboard/manage-orders" >
                     <SidebarMenuButton tooltip="Gérer Commandes" className="text-base" isActive={pathname?.startsWith('/dashboard/manage-orders')}> {/* Increased font size */}
                         <Package />
                         <span>Gérer Commandes</span>
                     </SidebarMenuButton>
                 </Link>
             </SidebarMenuItem>
              {/* The Invoices link for manager is intentionally the same as customer's for now - REMOVED */}
         </>
     );


    return (
        <SidebarProvider>
            <div className="flex min-h-[calc(100vh-150px)]"> {/* Adjust min-height based on header/footer */}
                <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-border">
                    <SidebarHeader className="items-center justify-between p-2 border-b border-border">
                         <SidebarTrigger className="md:hidden"/>
                         <span className="font-semibold text-xl hidden group-data-[state=expanded]:inline text-primary">Mon Espace</span> {/* Increased font size */}
                    </SidebarHeader>
                    {/* Added pt-4 for top padding */}
                    <SidebarContent className="p-2 pt-4">
                        <SidebarMenu>
                             <SidebarMenuItem>
                                <Link href="/dashboard" >
                                    <SidebarMenuButton tooltip="Tableau de bord" className="text-base" isActive={pathname === '/dashboard'}> {/* Increased font size */}
                                        <LayoutDashboard />
                                        <span>Tableau de bord</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>

                            {/* Show Manager links first if manager */}
                            {user.role === 'manager' && managerLinks}

                            {/* Show Common links */}
                            {commonLinks}

                        </SidebarMenu>
                    </SidebarContent>
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
                    {/* Main content area for user dashboard pages */}
                    <div className="p-4 md:p-8 bg-background min-h-full text-base"> {/* Ensure background color, added text-base */}
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
