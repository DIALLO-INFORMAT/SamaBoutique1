// src/app/admin/statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, Package, BarChart3, CalendarDays, TrendingUp } from "lucide-react";
import type { Order, AdminProduct as Product } from '@/lib/types'; // Assuming product type is also needed
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartTooltipContent } from '@/components/ui/chart';

// --- Mock Data Fetching (Replace with actual API calls) ---
const ORDERS_STORAGE_KEY = 'sama_boutique_orders';
const PRODUCTS_STORAGE_KEY = 'manager_products'; // Assuming manager/admin use same product data

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

// --- Data Processing Functions ---

// Calculate total revenue from completed orders
const calculateTotalRevenue = (orders: Order[]): number => {
    return orders
        .filter(o => ['Payé', 'Expédié', 'Livraison en cours', 'Livré'].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0);
};

// Count unique customers from orders
const countUniqueCustomers = (orders: Order[]): number => {
    const customerIds = new Set(orders.map(o => o.userId)); // Using userId as proxy
    return customerIds.size;
};

// Prepare data for monthly revenue chart
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

// --- Component ---
export default function AdminStatisticsPage() {
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
                console.error("Failed to load statistics data:", error);
                // Add toast notification for error
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
        availableYears.unshift(new Date().getFullYear());
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <BarChart3 /> Statistiques de la Boutique
            </h1>

            {/* Key Metrics Cards */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-5 w-1/3" /></CardHeader>
                            <CardContent><Skeleton className="h-8 w-1/2" /></CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Revenu Total</CardTitle>
                            <DollarSign className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes Totales</CardTitle>
                            <ShoppingBag className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{totalOrders}</div>
                        </CardContent>
                    </Card>
                     <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Clients Uniques</CardTitle>
                            <Users className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{uniqueCustomers}</div>
                        </CardContent>
                    </Card>
                     <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Produits Actifs</CardTitle>
                            <Package className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalProducts}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Monthly Revenue Chart */}
            <Card className="shadow-md border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                     <div>
                         <CardTitle className="flex items-center gap-2"><TrendingUp /> Revenu Mensuel</CardTitle>
                         <CardDescription>Revenu généré par mois pour l'année sélectionnée.</CardDescription>
                     </div>
                     <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                        <Select
                            value={selectedYear.toString()}
                            onValueChange={(value) => setSelectedYear(parseInt(value))}
                            disabled={isLoading || availableYears.length === 0}
                        >
                           <SelectTrigger className="w-[120px] h-8 text-xs">
                             <SelectValue placeholder="Année" />
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
                                    tickFormatter={(value) => `${(value / 1000).toLocaleString('fr-FR')}k`}
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
                                                    Mois
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                    {payload[0].payload.month}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    Revenu
                                                    </span>
                                                    <span className="font-bold text-primary">
                                                     {payload[0].value?.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 }) ?? 'N/A'}
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

            {/* Future: Add more charts/stats (e.g., Top Selling Products, Orders by Status) */}
            {/*
            <Card>
                 <CardHeader>
                     <CardTitle>Top Produits</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-center text-muted-foreground py-8">(Statistiques produits à venir)</p>
                 </CardContent>
            </Card>
            */}
        </div>
    );
}
