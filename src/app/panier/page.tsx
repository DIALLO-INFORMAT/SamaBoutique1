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
import { Separator } from '@/components/ui/separator'; // Import Separator

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

  const totalPrice = getTotalPrice();

  return (
    // Added container and max-width here
    <div className="container mx-auto max-w-4xl space-y-8 py-6 md:py-10">
      <h1 className="text-3xl font-bold text-center text-primary flex items-center justify-center gap-2">
         <ShoppingCart className="h-8 w-8"/> Votre Panier
      </h1>

      {cart.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
           <CardContent className="flex flex-col items-center gap-4">
             <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4"/>
             <p className="text-xl text-muted-foreground">Votre panier est vide.</p>
             <Link href="/boutique" passHref> {/* Changed link to /boutique */}
                 <Button variant="destructive">Commencer vos achats</Button>
             </Link>
           </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Articles dans le panier</CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6"> {/* Remove padding on small screens */}
            {/* Responsive Table - Hide on small, show stacked list */}
            <div className="hidden md:block">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-center w-[150px]">Quantité</TableHead> {/* Added width */}
                    <TableHead className="text-right">Prix Unitaire</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right w-[50px]"> </TableHead> {/* Adjusted width */}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cart.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                           <Image
                             src={`https://picsum.photos/seed/${item.id}/64/64`}
                             alt={item.name}
                             width={64}
                             height={64}
                             className="rounded-md object-cover border"
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
            </div>

            {/* Stacked List for small screens */}
            <div className="md:hidden divide-y divide-border">
                {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4">
                        <Image
                            src={`https://picsum.photos/seed/${item.id}/80/80`} // Slightly larger image
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-md object-cover border"
                            data-ai-hint={item.category === 'Services' ? 'service tech icon' : item.name.toLowerCase().split(' ')[0]}
                        />
                        <div className="flex-grow space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="font-medium leading-tight">{item.name}</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7 -mr-2 -mt-1" aria-label={`Supprimer ${item.name}`}>
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
                                                className={buttonVariants({ variant: "destructive" })}
                                            >
                                            Supprimer
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => handleDecrement(item.id, item.quantity)}
                                        disabled={item.quantity <= 1}
                                        aria-label="Diminuer la quantité"
                                    >
                                    <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                                        className="h-7 w-12 text-center px-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        aria-label={`Quantité pour ${item.name}`}
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => handleIncrement(item.id, item.quantity)}
                                        aria-label="Augmenter la quantité"
                                    >
                                    <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <span className="font-semibold text-base">{(item.price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                            </div>
                             <p className="text-xs text-muted-foreground">{item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })} / unité</p>
                        </div>
                    </div>
                ))}
            </div>

          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-4 pt-4 md:pt-6 px-4 md:px-6 pb-6">
            <div className="text-xl font-semibold">
              Total: {totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
            </div>
             <Separator className="my-2" />
             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end">
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Vider le Panier</Button>
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
               <Link href="/checkout" passHref className="w-full sm:w-auto">
                 <Button variant="destructive" disabled={cart.length === 0} className="w-full">
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
