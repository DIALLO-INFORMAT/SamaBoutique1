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
import { buttonVariants } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation(); // Use translation hook

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const quantityNum = Number(newQuantity);
    if (!isNaN(quantityNum) && quantityNum >= 1) {
      updateQuantity(productId, quantityNum);
    } else if (!isNaN(quantityNum) && quantityNum < 1) {
       updateQuantity(productId, 1);
    }
  };

  const handleIncrement = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecrement = (productId: string, currentQuantity: number) => {
     if (currentQuantity > 1) {
        updateQuantity(productId, currentQuantity - 1);
     }
  };

  const totalPrice = getTotalPrice();

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-6 md:py-10">
      <h1 className="text-3xl font-bold text-center text-primary flex items-center justify-center gap-2">
         <ShoppingCart className="h-8 w-8"/> {t('cart_page_title')}
      </h1>

      {cart.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
           <CardContent className="flex flex-col items-center gap-4">
             <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4"/>
             <p className="text-xl text-muted-foreground">{t('cart_page_empty_message')}</p>
             <Link href="/boutique" passHref>
                 <Button variant="destructive">{t('cart_page_start_shopping')}</Button>
             </Link>
           </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('cart_page_items_in_cart')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {/* Responsive Table */}
            <div className="hidden md:block">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">{t('cart_table_image')}</TableHead>
                    <TableHead>{t('cart_table_product')}</TableHead>
                    <TableHead className="text-center w-[150px]">{t('cart_table_quantity')}</TableHead>
                    <TableHead className="text-right">{t('cart_table_unit_price')}</TableHead>
                    <TableHead className="text-right">{t('cart_table_total')}</TableHead>
                    <TableHead className="text-right w-[50px]"> </TableHead>
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
                                aria-label={`Diminuer la quantité pour ${item.name}`} // Keep specific aria-label
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
                            aria-label={`Augmenter la quantité pour ${item.name}`}
                            >
                            <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        </TableCell>
                        <TableCell className="text-right">{item.price.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right font-semibold">{(item.price * item.quantity).toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right">
                           <AlertDialog>
                               <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={t('cart_action_remove') + ` ${item.name}`}>
                                     <Trash2 className="h-4 w-4" />
                                  </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>{t('cart_remove_item_confirm_title')}</AlertDialogTitle>
                                   <AlertDialogDescription>
                                     {t('cart_remove_item_confirm_description', { itemName: item.name })}
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel>{t('general_cancel')}</AlertDialogCancel>
                                   <AlertDialogAction
                                       onClick={() => removeFromCart(item.id)}
                                       className={buttonVariants({ variant: "destructive" })}
                                   >
                                      {t('cart_action_remove')}
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
                            src={`https://picsum.photos/seed/${item.id}/80/80`}
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
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7 -mr-2 -mt-1" aria-label={t('cart_action_remove') + ` ${item.name}`}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('cart_remove_item_confirm_title')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            {t('cart_remove_item_confirm_description', { itemName: item.name })}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('general_cancel')}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => removeFromCart(item.id)}
                                                className={buttonVariants({ variant: "destructive" })}
                                            >
                                            {t('cart_action_remove')}
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
                                        aria-label={`Diminuer la quantité pour ${item.name}`}
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
                                         aria-label={`Augmenter la quantité pour ${item.name}`}
                                    >
                                    <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <span className="font-semibold text-base">{(item.price * item.quantity).toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>
                             <p className="text-xs text-muted-foreground">{item.price.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })} / {t('cart_table_unit_price')}</p>
                        </div>
                    </div>
                ))}
            </div>

          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-4 pt-4 md:pt-6 px-4 md:px-6 pb-6">
            <div className="text-xl font-semibold">
              {t('cart_total_label')}: {totalPrice.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
             <Separator className="my-2" />
             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end">
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">{t('cart_clear_cart')}</Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>{t('cart_clear_cart_confirm_title')}</AlertDialogTitle>
                     <AlertDialogDescription>
                       {t('cart_clear_cart_confirm_description')}
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel>{t('general_cancel')}</AlertDialogCancel>
                     <AlertDialogAction
                       onClick={clearCart}
                       className={buttonVariants({ variant: "destructive" })}
                     >
                       {t('cart_clear_cart')}
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
               <Link href="/checkout" passHref className="w-full sm:w-auto">
                 <Button variant="destructive" disabled={cart.length === 0} className="w-full">
                   <CreditCard className="mr-2 h-4 w-4" /> {t('cart_checkout')}
                 </Button>
               </Link>
             </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
