// src/app/dashboard/products/page.tsx (Manager's Product Page)
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Percent } from "lucide-react"; // Added Percent
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext'; // To verify role
import { Badge } from '@/components/ui/badge'; // Import Badge
import { cn } from '@/lib/utils'; // Import cn
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

// Reusing Product type from boutique or define here
export interface ManagerProduct {
  id: string;
  name: string;
  description: string;
  price: number; // Assuming price is correct unit for XOF
  category: string;
  imageUrl?: string; // Added imageUrl
  isOnSale?: boolean; // Added isOnSale flag
}

// Mock data fetching/deleting functions (similar to admin page, but potentially scoped)
const storageKey = 'admin_products'; // Use the same key as admin if permissions allow

const fetchManagerProductsFromAPI = async (): Promise<ManagerProduct[]> => {
   await new Promise(resolve => setTimeout(resolve, 1000));
   // In a real app, this might fetch products the manager specifically has rights to edit,
   // or it might be the same endpoint as admin depending on backend logic.
   const storedProducts = localStorage.getItem(storageKey); // Use a separate key or same as admin
   const demoProducts: ManagerProduct[] = []; // Empty array - start fresh
    // Return stored products if they exist, otherwise return demo products
    const products = storedProducts ? JSON.parse(storedProducts) : demoProducts;
    // Ensure imageUrl exists for all products and isOnSale
     // If empty, initialize localStorage
     if (!products) {
        localStorage.setItem(storageKey, JSON.stringify([]));
        return [];
     }

    return products.map((p: any) => ({
        ...p,
        imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id}/64/64`,
        isOnSale: p.isOnSale || false, // Ensure isOnSale defaults to false
    }));
}

const deleteManagerProductFromAPI = async (productId: string): Promise<void> => {
    console.log("Manager attempting to delete product via API:", productId);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Update localStorage or call API
     let products = await fetchManagerProductsFromAPI();
     products = products.filter(p => p.id !== productId);
     localStorage.setItem(storageKey, JSON.stringify(products)); // Example update
}


export default function ManagerProductsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<ManagerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation(); // Get translation function and locale

  // Redirect or show error if not a manager
  useEffect(() => {
    if (!authLoading && user?.role !== 'manager') {
       // Redirect to dashboard or show an error message
       // router.replace('/dashboard'); // Assuming useRouter is imported
        toast({ title: t('dashboard_manager_unauthorized_access_toast_title'), description: "Seuls les gestionnaires peuvent accéder à cette page.", variant: "destructive" });
    }
  }, [user, authLoading, toast, t]);


  // Fetch products on component mount (if user is manager)
  useEffect(() => {
    if (user?.role === 'manager') {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                let fetchedProducts = await fetchManagerProductsFromAPI();
                 setProducts(fetchedProducts.map((p: any) => ({...p, imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id}/64/64`, isOnSale: p.isOnSale || false })));

            } catch (error) {
                console.error("Failed to fetch products:", error);
                toast({ title: t('general_error'), description: "Impossible de charger les produits.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    } else {
        setIsLoading(false); // Stop loading if not manager
    }
  }, [user, toast, t]);


  const handleDeleteProduct = async (productId: string, productName: string) => {
    setIsDeleting(productId);
    try {
        await deleteManagerProductFromAPI(productId);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        toast({
          title: t('dashboard_manage_products_toast_delete_success_title'),
          description: t('dashboard_manage_products_toast_delete_success_description', { productName }),
           className: "bg-primary text-primary-foreground border-primary",
        });
    } catch (error) {
         console.error("Failed to delete product:", error);
         toast({ title: t('general_error'), description: `Impossible de supprimer "${productName}".`, variant: "destructive" });
    } finally {
        setIsDeleting(null);
    }
  };

   // Render loading or unauthorized state
  if (isLoading || authLoading) {
      return <div className="p-6"><Skeleton className="h-10 w-1/2 mb-4" /> <Skeleton className="h-64 w-full" /></div>;
  }

   if (user?.role !== 'manager') {
      return <div className="p-6 text-center text-destructive">Accès réservé aux gestionnaires.</div>;
   }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">{t('dashboard_manage_products_page_title')}</h1>
            <p className="text-muted-foreground">{t('dashboard_manage_products_description')}</p>
        </div>
        <Link href="/dashboard/products/new" > {/* Link to manager's add page */}
          <Button variant="destructive" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('dashboard_manage_products_add_button')}
          </Button>
        </Link>
      </div>

      <Card className="shadow-md border-border">
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle>{t('dashboard_manage_products_table_title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t('dashboard_manage_products_no_products')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[64px] sm:table-cell px-6 text-base">Image</TableHead>
                  <TableHead className="px-6 text-base">{t('dashboard_manage_products_table_name')}</TableHead>
                  <TableHead className="px-6 text-base">{t('dashboard_manage_products_table_category')}</TableHead>
                  <TableHead className="text-center px-6 hidden lg:table-cell text-base">Promo</TableHead>
                  <TableHead className="text-right px-6 text-base">{t('dashboard_manage_products_table_price')}</TableHead>
                  <TableHead className="text-right px-6 w-[100px] text-base">{t('dashboard_manage_products_table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="hidden sm:table-cell px-6 py-3">
                       <Image
                         alt={product.name}
                         className="aspect-square rounded-md object-cover border border-border"
                         height="48"
                         src={product.imageUrl || `https://picsum.photos/seed/${product.id}/64/64`} // Use actual or fallback
                         width="48"
                         data-ai-hint={product.category === 'Services' ? 'service tech icon' : product.name.toLowerCase().split(' ')[0]}
                       />
                    </TableCell>
                    <TableCell className="font-medium px-6 py-3 text-base">{product.name}</TableCell>
                    <TableCell className="px-6 py-3 text-base">{product.category}</TableCell>
                     {/* Promo Status Cell */}
                    <TableCell className="text-center px-6 py-3 hidden lg:table-cell">
                       {product.isOnSale ? (
                         <Badge variant="destructive" className="bg-orange-500 text-white border-orange-600 text-sm">
                           <Percent className="mr-1 h-3 w-3" /> Promo
                         </Badge>
                       ) : (
                         <span className="text-muted-foreground">-</span>
                       )}
                    </TableCell>
                    <TableCell className="text-right px-6 py-3 text-base">{product.price.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                    <TableCell className="text-right px-6 py-3">
                      <AlertDialog>
                           <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                   <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isDeleting === product.id}>
                                       {isDeleting === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                       <span className="sr-only">Toggle menu</span>
                                   </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                   <DropdownMenuLabel>{t('dashboard_manage_products_table_actions')}</DropdownMenuLabel>
                                   <DropdownMenuItem asChild>
                                        {/* Link to manager's edit page */}
                                        <Link href={`/dashboard/products/edit/${product.id}`} className="flex items-center cursor-pointer w-full text-base">
                                            <Edit className="mr-2 h-4 w-4"/>{t('dashboard_manage_products_edit_action')}
                                        </Link>
                                   </DropdownMenuItem>
                                   {/* Manager might not have delete permission, or only for products they added */}
                                    <DropdownMenuSeparator />
                                   <AlertDialogTrigger asChild>
                                      <Button variant="ghost" data-alert-type="delete" className="text-destructive focus:text-destructive hover:bg-destructive/10 w-full justify-start px-2 py-1.5 h-auto text-base font-normal cursor-pointer relative flex select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                         <Trash2 className="mr-2 h-4 w-4"/>{t('dashboard_manage_products_delete_action')}
                                      </Button>
                                   </AlertDialogTrigger>
                               </DropdownMenuContent>
                           </DropdownMenu>

                           {/* Delete Confirmation (If managers can delete) */}
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                      <AlertDialogTitle>{t('dashboard_manage_products_delete_confirm_title', { productName: product.name })}</AlertDialogTitle>
                                      <AlertDialogDescription>{t('dashboard_manage_products_delete_confirm_description')}</AlertDialogDescription>
                                 </AlertDialogHeader>
                                <AlertDialogFooter>
                                     <AlertDialogCancel>{t('general_cancel')}</AlertDialogCancel>
                                     <AlertDialogAction onClick={() => handleDeleteProduct(product.id, product.name)} className={buttonVariants({ variant: "destructive" })} disabled={isDeleting === product.id}>
                                        {isDeleting === product.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('general_delete')}
                                     </AlertDialogAction>
                                 </AlertDialogFooter>
                           </AlertDialogContent>
                       </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
