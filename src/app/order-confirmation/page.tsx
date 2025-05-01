'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Short delay to ensure CSS transition applies

    return () => clearTimeout(timer);
  }, []);

  // In a real app, you might fetch order details based on an ID from the URL
  // const router = useRouter();
  // const { order } = router.query; // Example if using query params
  // const orderDetails = order ? JSON.parse(order as string) : null;

  return (
     // Added container and max-width here
    <div className="container mx-auto max-w-4xl flex justify-center items-center py-16">
      <Card className={`w-full max-w-lg shadow-xl transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <CardHeader className="text-center items-center pt-8 pb-4">
          <div className={`p-3 rounded-full bg-primary mb-4 transition-transform duration-500 delay-200 ${isVisible ? 'scale-100' : 'scale-0'}`}>
             <CheckCircle className={`h-16 w-16 text-primary-foreground transition-transform duration-500 delay-300 ${isVisible ? 'rotate-0 scale-100' : '-rotate-45 scale-0'}`} />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Merci pour votre commande !</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Votre commande a été passée avec succès.
            <br/>
            Nous vous contacterons bientôt pour la livraison.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8 space-y-6">
           {/* Placeholder for order summary - fetch details if needed */}
           {/* {orderDetails && (
               <div className="text-left border p-4 rounded-md bg-secondary">
                   <h3 className="font-semibold mb-2">Détails de la commande :</h3>
                   <p><strong>Client:</strong> {orderDetails.customerName}</p>
                   <p><strong>Total:</strong> {orderDetails.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                   <ul className="list-disc list-inside mt-2">
                       {orderDetails.items.map((item: any, index: number) => (
                           <li key={index}>{item.name} (Qté: {item.quantity})</li>
                       ))}
                   </ul>
               </div>
           )} */}

          <Link href="/" passHref>
            <Button variant="destructive" size="lg" className="w-full sm:w-auto">
              Retourner à l'accueil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
