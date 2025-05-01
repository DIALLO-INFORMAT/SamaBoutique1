'use client'; // Required for interactions like delete confirmation

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react";
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

// Mock product data type (ensure it matches your actual data structure)
interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  // Add other fields like stock, image URL, etc. if needed
}

// Mock product data (replace with actual data fetching)
const initialProducts: AdminProduct[] = [
  { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 19.99, category: "Vêtements" },
  { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 499.00, category: "Services" },
  { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 24.99, category: "Accessoires" },
  { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 150.00, category: "Services" },
  { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 45.00, category: "Vêtements" },
  { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 14.99, category: "Accessoires" },
];


export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const { toast } = useToast();

  // Simulate fetching products on component mount
  useEffect(() => {
    setIsLoading(true);
    // Replace with actual API call to fetch products
    setTimeout(() => {
      setProducts(initialProducts);
      setIsLoading(false);
    }, 1000); // Simulate network delay
  }, []);


  const handleDeleteProduct = async (productId: string) => {
    console.log("Attempting to delete product:", productId);
    // Placeholder: Replace with actual API call to delete the product
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast({
      title: "Produit Supprimé",
      description: "Le produit a été supprimé avec succès.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Gestion des Produits</h1>
        <Link href="/admin/products/new" passHref>
          <Button variant="destructive">
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Produit
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Produits</CardTitle>
          <CardDescription>Gérez vos produits et services ici.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-4">
                 <Skeleton className="h-12 w-full" />
                 {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center space-x-4 p-4 border-b">
                         <Skeleton className="h-12 w-12 rounded-md" />
                         <div className="space-y-2 flex-grow">
                             <Skeleton className="h-4 w-3/5" />
                             <Skeleton className="h-4 w-4/5" />
                         </div>
                         <Skeleton className="h-8 w-20" />
                         <Skeleton className="h-8 w-8" />
                     </div>
                 ))}
             </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun produit trouvé.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                       <Image
                         alt={product.name}
                         className="aspect-square rounded-md object-cover"
                         height="64"
                         src={`https://picsum.photos/seed/${product.id}/64/64`} // Placeholder
                         width="64"
                         data-ai-hint={product.category === 'Services' ? 'service tech icon' : product.name.toLowerCase().split(' ')[0]}
                       />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">{product.description}</TableCell>
                    <TableCell className="text-right">{product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                           <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                   <Button aria-haspopup="true" size="icon" variant="ghost">
                                       <MoreHorizontal className="h-4 w-4" />
                                       <span className="sr-only">Toggle menu</span>
                                   </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                   <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                   <DropdownMenuItem asChild>
                                        <Link href={`/admin/products/edit/${product.id}`} className="flex items-center cursor-pointer"><Edit className="mr-2 h-4 w-4"/>Modifier</Link>
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator />
                                   <AlertDialogTrigger asChild>
                                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center">
                                         <Trash2 className="mr-2 h-4 w-4"/>Supprimer
                                      </DropdownMenuItem>
                                   </AlertDialogTrigger>
                               </DropdownMenuContent>
                           </DropdownMenu>

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
                                     onClick={() => handleDeleteProduct(product.id)}
                                     className={buttonVariants({ variant: "destructive" })}
                                  >
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
      </Card>
    </div>
  );
}
