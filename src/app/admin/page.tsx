// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingBag, Users, Box, Settings, ArrowRight, BarChart3, Package, FileText, CalendarDays, TrendingUp } from "lucide-react"; // Added BarChart3, Package, FileText, CalendarDays, TrendingUp
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth to welcome the admin
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import type { Order, AdminProduct as Product } from '@/lib/types'; // Import Order and Product types
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartTooltipContent } from '@/components/ui/chart'; // Assuming this is defined or imported correctly

// --- Mock Data Fetching (Copied from statistics page) ---
const ORDERS_STORAGE_KEY = 'sama_boutique_orders';
const PRODUCTS_STORAGE_KEY = 'admin_products'; // Use admin products key

const fetchAllOrdersAPI = async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = stored ? JSON.parse(stored) : [];
    return orders.map(o => ({ ...o, createdAt: new Date(o.createdAt) }));
};

const fetchAllProductsAPI = async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

// --- Data Processing Functions (Copied from statistics page) ---
const calculateTotalRevenue = (orders: Order[]): number => {
    return orders
        .filter(o => ['Payé', 'Expédié', 'Livraison en cours', 'Livré'].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0);
};

const countUniqueCustomers = (orders: Order[]): number => {
    // Using email as proxy for unique customers in this mock setup
    const customerEmails = new Set(orders.map(o => o.customerInfo.email));
    return customerEmails.size;
};

const getMonthlyRevenueData = (orders: Order[], year: number): { month: string; revenue: number }[] => {
    const monthlyData: Record<number, number> = {};
    orders
        .filter(o => o.createdAt.getFullYear() === year && ['Payé', 'Expédié', 'Livraison en cours', 'Livré'].includes(o.status))
        .forEach(o => {
            const month = o.createdAt.getMonth(); // 0 = Jan, 11 = Dec
            monthlyData[month] = (monthlyData[month] || 0) + o.total;
        });

    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    return monthNames.map((name, index) => ({
        month: name,
        revenue: monthlyData[index] || 0,
    }));
};


export default function AdminDashboardPage() {
  const { user } = useAuth(); // Get logged-in user info
  const { t, currentLocale } = useTranslation(); // Use translation hook

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [fetchedOrders, fetchedProducts] = await Promise.all([
                    fetchAllOrdersAPI(),
                    fetchAllProductsAPI(),
                ]);
                setOrders(fetchedOrders);
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                // Add toast notification for error if needed
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

  const totalRevenue = calculateTotalRevenue(orders);
  const totalOrders = orders.length;
  const uniqueCustomers = countUniqueCustomers(orders);
  const totalProducts = products.length;
  const monthlyRevenueData = getMonthlyRevenueData(orders, selectedYear);

  const availableYears = Array.from(new Set(orders.map(o => o.createdAt.getFullYear()))).sort((a, b) => b - a);
   if (!availableYears.includes(new Date().getFullYear())) {
        // Ensure current year is always an option, even if no orders yet
        availableYears.unshift(new Date().getFullYear());
   }

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
            {isLoading ? <Skeleton className="h-8 w-3/5"/> : (
                <div className="text-2xl font-bold">
                {totalRevenue.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
            )}
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
             {isLoading ? <Skeleton className="h-8 w-1/2"/> : (
                 <div className="text-2xl font-bold">+{totalOrders}</div>
             )}
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
             {isLoading ? <Skeleton className="h-8 w-1/2"/> : (
                <div className="text-2xl font-bold">+{uniqueCustomers}</div>
             )}
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
             {isLoading ? <Skeleton className="h-8 w-1/2"/> : (
                <div className="text-2xl font-bold">{totalProducts}</div>
             )}
             <p className="text-xs text-muted-foreground mt-1">
                {t('admin_dashboard_stat_products_desc')}
             </p>
          </CardContent>
        </Card>
      </div>

       {/* Monthly Revenue Chart */}
        <Card className="shadow-md border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="flex items-center gap-2"><TrendingUp /> {t('admin_statistics_monthly_revenue_title')}</CardTitle>
                    <CardDescription>{t('admin_statistics_monthly_revenue_desc')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                    disabled={isLoading || availableYears.length === 0}
                >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue placeholder={t('admin_statistics_year_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                            {year}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[350px] w-full" />
                ) : monthlyRevenueData.reduce((sum, d) => sum + d.revenue, 0) === 0 ? (
                     <p className="text-center text-muted-foreground py-16">{t('admin_statistics_no_revenue_data', { year: selectedYear })}</p>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${(value / 1000).toLocaleString(currentLocale)}k`}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                {t('admin_statistics_chart_month')}
                                                </span>
                                                <span className="font-bold text-muted-foreground">
                                                {payload[0].payload.month}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                 {t('admin_statistics_chart_revenue')}
                                                </span>
                                                <span className="font-bold text-primary">
                                                    {payload[0].value?.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 }) ?? 'N/A'}
                                                </span>
                                            </div>
                                            </div>
                                        </div>
                                        )
                                    }
                                    return null
                                    }}
                            />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                                <LabelList
                                    position="top"
                                    offset={5}
                                    className="fill-foreground"
                                    fontSize={11}
                                    formatter={(value: number) =>
                                        value > 0 ? `${(value / 1000).toFixed(0)}k` : ''
                                    }
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>

       {/* Quick Actions / Navigation */}
       <Card className="shadow-md border border-border">
           <CardHeader>
               <CardTitle>{t('admin_dashboard_quick_actions_title')}</CardTitle>
               <CardDescription>{t('admin_dashboard_quick_actions_description')}</CardDescription>
           </CardHeader>
           <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid */}
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
                {/* Link to separate Statistics page removed as it's integrated */}
                {/* <Link href="/admin/statistics" > ... </Link> */}
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

    </div>
  );
}
