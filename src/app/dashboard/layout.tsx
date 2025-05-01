// src/app/dashboard/layout.tsx
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { User, Package, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
// Removed Header import as it might conflict with the main app header structure. Let's rely on the main layout's header.
// import { Header } from '@/components/Header';

interface UserDashboardLayoutProps {
    children: ReactNode;
}

// Simple auth check placeholder - Replace with actual authentication logic
const isAuthenticated = true; // Simulate logged-in user

export default function UserDashboardLayout({ children }: UserDashboardLayoutProps) {

    if (!isAuthenticated) {
        // Redirect to login or show an unauthorized message
        // In a real app, use Next.js middleware or getServerSideProps for protected routes
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                 <div>
                    <p className="text-center mb-4">Veuillez vous connecter pour accéder à votre tableau de bord.</p>
                    <Link href="/account">
                        <button className="block mx-auto px-4 py-2 bg-primary text-primary-foreground rounded">Connexion / Inscription</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            {/* The main Header from RootLayout will likely be above this */}
            <div className="flex min-h-[calc(100vh-150px)]"> {/* Adjust min-height based on header/footer */}
                <Sidebar side="left" variant="sidebar" collapsible="icon">
                    <SidebarHeader className="items-center justify-between">
                        {/* Sidebar Trigger for mobile/collapsible */}
                         <SidebarTrigger className="md:hidden"/>
                         <span className="font-semibold text-lg hidden group-data-[state=expanded]:inline">Mon Espace</span>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                             <SidebarMenuItem>
                                <Link href="/dashboard" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Tableau de bord">
                                        <LayoutDashboard />
                                        <span>Tableau de bord</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/dashboard/orders" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Mes Commandes">
                                        <Package />
                                        <span>Mes Commandes</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/dashboard/profile" passHref legacyBehavior>
                                    <SidebarMenuButton tooltip="Mon Profil">
                                        <User />
                                        <span>Mon Profil</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            {/* Placeholder for Logout */}
                            <SidebarMenuItem>
                                 <SidebarMenuButton tooltip="Déconnexion" onClick={() => alert('Déconnexion simulée')}>
                                     <LogOut />
                                     <span>Déconnexion</span>
                                 </SidebarMenuButton>
                             </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                 <SidebarInset>
                    {/* Main content area for user dashboard pages */}
                    <div className="p-4 md:p-8">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}