'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ShoppingCart, CreditCard, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
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
import { buttonVariants } from "@/components/ui/button"; // Import buttonVariants

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const quantityNum = Number(newQuantity);
    if (!isNaN(quantityNum) && quantityNum >= 1) {
      updateQuantity(productId, quantityNum);
    } else if (!isNaN(quantityNum) && quantityNum < 1) {
       updateQuantity(productId, 1); // Reset to 1 if below 1
    }
  };

  const handleIncrement = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecrement = (productId: string, currentQuantity: number) => {
     if (currentQuantity > 1) {
        updateQuantity(productId, currentQuantity - 1);
     } else {
         // Optionally trigger remove confirmation if decrementing from 1
         // Or just prevent going below 1
     }
  };

  // Removed handleCheckout function as it's replaced by link

  const totalPrice = getTotalPrice();

  return (
    // Added container and max-width here
    <div className="container mx-auto max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary flex items-center justify-center gap-2">
         <ShoppingCart className="h-8 w-8"/> Votre Panier
      </h1>

      {cart.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
           <CardContent className="flex flex-col items-center gap-4">
             <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4"/>
             <p className="text-xl text-muted-foreground">Votre panier est vide.</p>
             <Link href="/" passHref>
                 <Button variant="destructive">Commencer vos achats</Button>
             </Link>
           </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Articles dans le panier</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Image</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-center">Quantité</TableHead>
                  <TableHead className="text-right">Prix Unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="hidden md:table-cell">
                       <Image
                         src={`https://picsum.photos/seed/${item.id}/64/64`}
                         alt={item.name}
                         width={64}
                         height={64}
                         className="rounded-md object-cover"
                         data-ai-hint={item.category === 'Services' ? 'service tech icon' : item.name.toLowerCase().split(' ')[0]}
                       />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-1">
                         <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDecrement(item.id, item.quantity)}
                            disabled={item.quantity <= 1}
                            aria-label="Diminuer la quantité"
                         >
                           <Minus className="h-4 w-4" />
                         </Button>
                         <Input
                           type="number"
                           min="1"
                           value={item.quantity}
                           onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                           className="h-8 w-14 text-center px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                           aria-label={`Quantité pour ${item.name}`}
                         />
                         <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           onClick={() => handleIncrement(item.id, item.quantity)}
                            aria-label="Augmenter la quantité"
                         >
                           <Plus className="h-4 w-4" />
                         </Button>
                       </div>
                    </TableCell>
                    <TableCell className="text-right">{item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</TableCell>
                    <TableCell className="text-right font-semibold">{(item.price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                           <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Supprimer ${item.name}`}>
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Cette action supprimera "{item.name}" de votre panier.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Annuler</AlertDialogCancel>
                               <AlertDialogAction
                                   onClick={() => removeFromCart(item.id)}
                                   className={buttonVariants({ variant: "destructive" })} // Use destructive style from buttonVariants
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
          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-4 pt-6">
            <div className="text-xl font-semibold">
              Total: {totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
            </div>
             <div className="flex gap-2">
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <Button variant="outline">Vider le Panier</Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Vider le panier?</AlertDialogTitle>
                     <AlertDialogDescription>
                       Êtes-vous sûr de vouloir supprimer tous les articles de votre panier? Cette action est irréversible.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel>Annuler</AlertDialogCancel>
                     <AlertDialogAction
                       onClick={clearCart}
                       className={buttonVariants({ variant: "destructive" })}
                     >
                       Vider le Panier
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
               <Link href="/checkout" passHref>
                 <Button variant="destructive" disabled={cart.length === 0}>
                   <CreditCard className="mr-2 h-4 w-4" /> Passer à la caisse
                 </Button>
               </Link>
             </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
