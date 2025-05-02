
'use client'; // Required for interactions like delete confirmation

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
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
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

// Reusing Product type - assuming it's globally available or define here
// Define if not imported globally
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number; // Assuming price is in the smallest unit or correctly formatted number for XOF
  category: string;
  // brand: string; // Removed brand
  imageUrl?: string; // Optional image URL
  // Add other fields like stock, etc. if needed
}

const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products'; // Use a consistent key for admin

// Mock product data (replace with actual data fetching - e.g., from a context or API)
const fetchProductsFromAPI = async (): Promise<AdminProduct[]> => {
   // Simulate API call
   await new Promise(resolve => setTimeout(resolve, 1000));
   // In real app, fetch from '/api/products' or similar
   if (typeof window !== 'undefined') {
       const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
       if (storedProducts) {
            try {
                const products: AdminProduct[] = JSON.parse(storedProducts);
                // Ensure imageUrl exists for fallback
                return products.map(p => ({
                    ...p,
                    imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id}/64/64`
                }));
            } catch (error) {
                 console.error("Error parsing products from localStorage:", error);
                 localStorage.removeItem(ADMIN_PRODUCTS_STORAGE_KEY); // Clear corrupted data
                 return []; // Return empty array on error
            }
       }
   }
   // Fallback mock data if localStorage is empty or SSR
   const mockProducts: AdminProduct[] = [
      // Fallback data is removed as localStorage should be populated by adding products
   ];
   // Initialize localStorage if empty
   if (typeof window !== 'undefined' && !localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY)) {
       localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(mockProducts));
   }
   return mockProducts;
}


// Simulate API call to delete a product
const deleteProductFromAPI = async (productId: string): Promise<void> => {
    console.log("Admin attempting to delete product via API:", productId);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app: await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
        let products: AdminProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
        products = products.filter(p => p.id !== productId);
        localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }
    // Handle potential errors from API response here
}


export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track deleting product ID
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation(); // Use translation hook

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const fetchedProducts = await fetchProductsFromAPI();
            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast({
                title: t('admin_products_toast_load_error_title'),
                description: t('admin_products_toast_load_error_description'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    loadProducts();
  }, [toast, t]); // Added t dependency


  const handleDeleteProduct = async (productId: string, productName: string) => {
    setIsDeleting(productId); // Set loading state for the specific delete action
    try {
        await deleteProductFromAPI(productId);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        toast({
          title: t('admin_products_toast_delete_success_title'),
          description: t('admin_products_toast_delete_success_description', { productName }),
           className: "bg-primary text-primary-foreground border-primary", // Or custom success style
        });
    } catch (error) {
         console.error("Failed to delete product:", error);
         toast({
            title: t('admin_products_toast_delete_error_title'),
            description: t('admin_products_toast_delete_error_description', { productName }),
            variant: "destructive",
         });
    } finally {
        setIsDeleting(null); // Clear loading state
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">{t('admin_products_page_title')}</h1>
            <p className="text-muted-foreground">{t('admin_products_description')}</p>
        </div>
        <Link href="/admin/products/new" >
          <Button variant="destructive" size="sm"> {/* Smaller button */}
            <PlusCircle className="mr-2 h-4 w-4" /> {t('admin_products_add_button')}
          </Button>
        </Link>
      </div>

      <Card className="shadow-md border-border">
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle>{t('admin_products_table_title')}</CardTitle>
          {/* Optional: Add search/filter inputs here */}
        </CardHeader>
        <CardContent className="p-0"> {/* Remove padding for full-width table */}
          {isLoading ? (
             <div className="space-y-2 p-6"> {/* Add padding back for skeleton */}
                 {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                         <Skeleton className="h-10 w-10 rounded-md hidden sm:block bg-muted" />
                         <div className="space-y-2 flex-grow">
                             <Skeleton className="h-4 w-3/5 bg-muted" />
                             <Skeleton className="h-4 w-2/5 bg-muted" />
                         </div>
                         <Skeleton className="h-6 w-16 hidden md:block bg-muted" />
                         <Skeleton className="h-6 w-20 text-right bg-muted" />
                         <Skeleton className="h-8 w-8 bg-muted" />
                     </div>
                 ))}
             </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t('admin_products_no_products')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[80px] sm:table-cell px-6">{t('admin_products_table_image')}</TableHead>
                  <TableHead className="px-6">{t('admin_products_table_name')}</TableHead>
                  <TableHead className="px-6">{t('admin_products_table_category')}</TableHead>
                  {/* <TableHead className="hidden md:table-cell px-6">{t('admin_products_table_brand')}</TableHead> Removed Brand Header */}
                  {/* <TableHead className="hidden lg:table-cell px-6">Description</TableHead> */}
                  <TableHead className="text-right px-6">{t('admin_products_table_price')}</TableHead>
                  <TableHead className="text-right px-6 w-[100px]">{t('admin_products_table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="hidden sm:table-cell px-6 py-3">
                       <Image
                         alt={product.name}
                         className="aspect-square rounded-md object-cover border border-border"
                         height="48" // Smaller image
                         src={product.imageUrl || `https://picsum.photos/seed/${product.id}/64/64`} // Use stored URL or fallback
                         width="48"
                         data-ai-hint={product.category === 'Services' ? 'service tech icon' : product.name.toLowerCase().split(' ')[0]}
                       />
                    </TableCell>
                    <TableCell className="font-medium px-6 py-3">{product.name}</TableCell>
                    <TableCell className="px-6 py-3">{product.category}</TableCell>
                    {/* <TableCell className="hidden md:table-cell px-6 py-3">{product.brand}</TableCell> Removed Brand Cell */}
                    {/* <TableCell className="hidden lg:table-cell max-w-xs truncate px-6 py-3">{product.description}</TableCell> */}
                    <TableCell className="text-right px-6 py-3">{product.price.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
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
                                   <DropdownMenuLabel>{t('admin_products_table_actions')}</DropdownMenuLabel>
                                   <DropdownMenuItem asChild>
                                        <Link href={`/admin/products/edit/${product.id}`} className="flex items-center cursor-pointer w-full">
                                            <Edit className="mr-2 h-4 w-4"/>{t('admin_products_action_edit')}
                                        </Link>
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator />
                                   <AlertDialogTrigger asChild>
                                      <Button variant="ghost" data-alert-type="delete" className="text-destructive focus:text-destructive hover:bg-destructive/10 w-full justify-start px-2 py-1.5 h-auto text-sm font-normal cursor-pointer relative flex select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                         <Trash2 className="mr-2 h-4 w-4"/>{t('admin_products_action_delete')}
                                      </Button>
                                   </AlertDialogTrigger>
                               </DropdownMenuContent>
                           </DropdownMenu>

                           {/* Delete Confirmation Dialog */}
                           <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('admin_products_delete_confirm_title')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('admin_products_delete_confirm_description', { productName: product.name })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('general_cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                     onClick={() => handleDeleteProduct(product.id, product.name)}
                                     className={buttonVariants({ variant: "destructive" })}
                                     disabled={isDeleting === product.id}
                                  >
                                      {isDeleting === product.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      {t('general_delete')}
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
        {/* Optional: Add pagination controls here */}
        {/* <CardFooter className="p-4 border-t"> Pagination </CardFooter> */}
      </Card>
    </div>
  );
}


