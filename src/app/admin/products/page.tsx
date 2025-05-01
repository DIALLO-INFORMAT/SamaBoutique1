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

// Reusing Product type - assuming it's globally available or define here
// Define if not imported globally
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number; // Assuming price is in the smallest unit or correctly formatted number for XOF
  category: string;
  brand: string; // Added brand
  // Add other fields like stock, image URL, etc. if needed
}

// Mock product data (replace with actual data fetching - e.g., from a context or API)
const fetchProductsFromAPI = async (): Promise<AdminProduct[]> => {
   // Simulate API call
   await new Promise(resolve => setTimeout(resolve, 1000));
   // In real app, fetch from '/api/products' or similar
   // Assume prices are already in XOF format (e.g., 10000 for 10,000 FCFA)
   return [
      { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 10000, category: "Vêtements", brand: "Marque A" },
      { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 300000, category: "Services", brand: "SamaServices" },
      { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 15000, category: "Accessoires", brand: "Marque B" },
      { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 75000, category: "Services", brand: "SamaServices" },
      { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 25000, category: "Vêtements", brand: "Marque A" },
      { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 8000, category: "Accessoires", brand: "Marque C" },
   ];
}

// Simulate API call to delete a product
const deleteProductFromAPI = async (productId: string): Promise<void> => {
    console.log("Attempting to delete product via API:", productId);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app: await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    // Handle potential errors from API response here
}


export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track deleting product ID
  const { toast } = useToast();

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
                title: "Erreur de chargement",
                description: "Impossible de charger les produits.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    loadProducts();
  }, [toast]); // Added toast as dependency


  const handleDeleteProduct = async (productId: string, productName: string) => {
    setIsDeleting(productId); // Set loading state for the specific delete action
    try {
        await deleteProductFromAPI(productId);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        toast({
          title: "Produit Supprimé",
          description: `Le produit "${productName}" a été supprimé.`,
          // variant: "destructive", // Use default (green check) for success confirmation
           className: "bg-primary text-primary-foreground border-primary", // Or custom success style
        });
    } catch (error) {
         console.error("Failed to delete product:", error);
         toast({
            title: "Erreur de suppression",
            description: `Impossible de supprimer le produit "${productName}".`,
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
            <h1 className="text-3xl font-bold text-primary">Gestion des Produits</h1>
            <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez vos produits et services.</p>
        </div>
        <Link href="/admin/products/new" >
          <Button variant="destructive" size="sm"> {/* Smaller button */}
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
          </Button>
        </Link>
      </div>

      <Card className="shadow-md border-border">
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle>Liste des Produits</CardTitle>
          {/* Optional: Add search/filter inputs here */}
        </CardHeader>
        <CardContent className="p-0"> {/* Remove padding for full-width table */}
          {isLoading ? (
             <div className="space-y-2 p-6"> {/* Add padding back for skeleton */}
                 {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                         <Skeleton className="h-10 w-10 rounded-md hidden sm:block" />
                         <div className="space-y-2 flex-grow">
                             <Skeleton className="h-4 w-3/5" />
                             <Skeleton className="h-4 w-2/5" />
                         </div>
                         <Skeleton className="h-6 w-16 hidden md:block" />
                         <Skeleton className="h-6 w-20 text-right" />
                         <Skeleton className="h-8 w-8" />
                     </div>
                 ))}
             </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Aucun produit trouvé. Commencez par en ajouter un !</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[80px] sm:table-cell px-6">Image</TableHead>
                  <TableHead className="px-6">Nom</TableHead>
                  <TableHead className="px-6">Catégorie</TableHead>
                   <TableHead className="hidden md:table-cell px-6">Marque</TableHead> {/* Added Brand */}
                  {/* <TableHead className="hidden lg:table-cell px-6">Description</TableHead> */}
                  <TableHead className="text-right px-6">Prix</TableHead>
                  <TableHead className="text-right px-6 w-[100px]">Actions</TableHead>
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
                         src={`https://picsum.photos/seed/${product.id}/64/64`} // Placeholder
                         width="48"
                         data-ai-hint={product.category === 'Services' ? 'service tech icon' : product.name.toLowerCase().split(' ')[0]}
                       />
                    </TableCell>
                    <TableCell className="font-medium px-6 py-3">{product.name}</TableCell>
                    <TableCell className="px-6 py-3">{product.category}</TableCell>
                     <TableCell className="hidden md:table-cell px-6 py-3">{product.brand}</TableCell> {/* Added Brand */}
                    {/* <TableCell className="hidden lg:table-cell max-w-xs truncate px-6 py-3">{product.description}</TableCell> */}
                    <TableCell className="text-right px-6 py-3">{product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
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
                                   <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                   <DropdownMenuItem asChild>
                                        <Link href={`/admin/products/edit/${product.id}`} className="flex items-center cursor-pointer w-full">
                                            <Edit className="mr-2 h-4 w-4"/>Modifier
                                        </Link>
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator />
                                   <AlertDialogTrigger asChild>
                                      <Button variant="ghost" className="text-destructive focus:text-destructive hover:bg-destructive/10 w-full justify-start px-2 py-1.5 h-auto text-sm font-normal cursor-pointer relative flex select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                         <Trash2 className="mr-2 h-4 w-4"/>Supprimer
                                      </Button>
                                   </AlertDialogTrigger>
                               </DropdownMenuContent>
                           </DropdownMenu>

                           {/* Delete Confirmation Dialog */}
                           <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible et supprimera définitivement le produit "{product.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                     onClick={() => handleDeleteProduct(product.id, product.name)}
                                     className={buttonVariants({ variant: "destructive" })}
                                     disabled={isDeleting === product.id}
                                  >
                                      {isDeleting === product.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Supprimer
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
