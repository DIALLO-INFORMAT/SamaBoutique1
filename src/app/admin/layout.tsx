import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { LayoutGrid, Box, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header'; // Reuse existing header if needed, or create a specific admin header

interface AdminLayoutProps {
    children: ReactNode;
}

// Simple auth check placeholder - Replace with actual authentication logic
const isAuthenticated = true; // Simulate logged-in admin

export default function AdminLayout({ children }: AdminLayoutProps) {

    if (!isAuthenticated) {
        // Redirect to login or show an unauthorized message
        // In a real app, use Next.js middleware or getServerSideProps for protected routes
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Accès non autorisé. Veuillez vous connecter.</p>
                {/* Optionally add a link to the login page */}
                <Link href="/account">
                    <button className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded">Connexion</button>
                </Link>
            </div>
        );
    }

    return (
        <SidebarProvider>
            {/* Optional: Reuse main Header or create a specific AdminHeader */}
            {/* <Header /> */}
            <div className="flex min-h-screen">
                <Sidebar side="left" variant="sidebar" collapsible="icon">
                    <SidebarHeader className="items-center justify-between">
                        {/* Sidebar Trigger for mobile/collapsible */}
                         <SidebarTrigger className="md:hidden"/>
                         <span className="font-semibold text-lg hidden group-data-[state=expanded]:inline">Admin</span>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/admin" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Tableau de bord">
                                        <LayoutGrid />
                                        <span>Tableau de bord</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/products" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Produits">
                                        <Box />
                                        <span>Produits</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             {/* Add more admin links as needed */}
                             <SidebarMenuItem>
                                <Link href="/admin/users" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Utilisateurs">
                                        <Users />
                                        <span>Utilisateurs</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/admin/settings" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Paramètres">
                                        <Settings />
                                        <span>Paramètres</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    {/* Optional Footer */}
                    {/* <SidebarFooter>...</SidebarFooter> */}
                </Sidebar>
                 <SidebarInset>
                    {/* Main content area for admin pages */}
                    <div className="p-4 md:p-8">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}