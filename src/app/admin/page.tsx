// src/app/admin/page.tsx
'use client'; // Required for potential future interactions or data fetching hooks

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingBag, Users, Box, Settings, ArrowRight, BarChart3, Package, FileText } from "lucide-react"; // Added BarChart3, Package, FileText
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth to welcome the admin
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

// Placeholder data - reset to zero
const stats = {
  revenue: 0,
  orders: 0,
  customers: 0,
  products: 0, // Also reset product count, assuming it's a placeholder
};

export default function AdminDashboardPage() {
  const { user } = useAuth(); // Get logged-in user info
  const { t, currentLocale } = useTranslation(); // Use translation hook

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
             <h1 className="text-3xl font-bold text-primary">{t('admin_dashboard_title')}</h1>
             <p className="text-muted-foreground">
                 {t('admin_dashboard_welcome', { name: user?.name || 'Admin' })} {t('admin_dashboard_description')}
             </p>
          </div>
           {/* Optional: Add a quick action button like "View Site" */}
           {/* <Button variant="outline" size="sm">Voir le site</Button> */}
      </div>


      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('admin_dashboard_stat_revenue')}
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.revenue.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
             <p className="text-xs text-muted-foreground mt-1">
               {t('admin_dashboard_stat_revenue_desc')}
             </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin_dashboard_stat_orders')}</CardTitle>
            <ShoppingBag className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.orders}</div>
             <p className="text-xs text-muted-foreground mt-1">
                {t('admin_dashboard_stat_orders_desc')}
             </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin_dashboard_stat_customers')}</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.customers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                 {t('admin_dashboard_stat_customers_desc')}
              </p>
          </CardContent>
        </Card>
         <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin_dashboard_stat_products')}</CardTitle>
            <Box className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
             <p className="text-xs text-muted-foreground mt-1">
                {t('admin_dashboard_stat_products_desc')}
             </p>
          </CardContent>
        </Card>
      </div>

       {/* Quick Actions / Navigation */}
       <Card className="shadow-md border border-border">
           <CardHeader>
               <CardTitle>{t('admin_dashboard_quick_actions_title')}</CardTitle>
               <CardDescription>{t('admin_dashboard_quick_actions_description')}</CardDescription>
           </CardHeader>
           <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Adjusted grid for more items */}
               <Link href="/admin/products" >
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <Box className="h-5 w-5 text-primary" />
                       <div>
                           <span className="font-medium">{t('admin_dashboard_manage_products_title')}</span>
                           <p className="text-xs text-muted-foreground">{t('admin_dashboard_manage_products_description')}</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
                <Link href="/admin/orders" >
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <Package className="h-5 w-5 text-primary" />
                        <div>
                           <span className="font-medium">{t('admin_dashboard_manage_orders_title')}</span>
                            <p className="text-xs text-muted-foreground">{t('admin_dashboard_manage_orders_description')}</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
                 <Link href="/admin/invoices" >
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <FileText className="h-5 w-5 text-primary" />
                        <div>
                           <span className="font-medium">{t('admin_dashboard_manage_invoices_title')}</span>
                            <p className="text-xs text-muted-foreground">{t('admin_dashboard_manage_invoices_description')}</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
               <Link href="/admin/users" >
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <Users className="h-5 w-5 text-primary" />
                        <div>
                           <span className="font-medium">{t('admin_dashboard_manage_users_title')}</span>
                            <p className="text-xs text-muted-foreground">{t('admin_dashboard_manage_users_description')}</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
                {/* Statistics Link */}
                <Link href="/admin/statistics" >
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <BarChart3 className="h-5 w-5 text-primary" />
                        <div>
                           <span className="font-medium">{t('admin_dashboard_statistics_title')}</span>
                            <p className="text-xs text-muted-foreground">{t('admin_dashboard_statistics_description')}</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
                <Link href="/admin/settings" >
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <Settings className="h-5 w-5 text-primary" />
                       <div>
                           <span className="font-medium">{t('admin_dashboard_manage_settings_title')}</span>
                            <p className="text-xs text-muted-foreground">{t('admin_dashboard_manage_settings_description')}</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
           </CardContent>
       </Card>

      {/* Placeholder for recent activity or reports */}
      <Card className="shadow-md border border-border">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary"/> {t('admin_dashboard_recent_activity_title')}</CardTitle>
              <CardDescription>{t('admin_dashboard_recent_activity_description')}</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-center text-muted-foreground py-8">{t('admin_dashboard_recent_activity_placeholder')}</p>
             {/* Future: Display recent orders chart, new users list, etc. */}
             {/* Example: <RecentOrdersChart /> */}
          </CardContent>
      </Card>

    </div>
  );
}
