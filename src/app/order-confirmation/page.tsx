
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

export default function OrderConfirmationPage() {
  const { t } = useTranslation(); // Use the translation hook
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Example of getting order number from URL (client-side only)
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  useEffect(() => {
      if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          setOrderNumber(params.get('orderNumber')); // This will get the SB-XXXXXX number
      }
  }, []);

  return (
    <div className="container mx-auto max-w-4xl flex justify-center items-center py-16">
      <Card className={`w-full max-w-lg shadow-xl transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <CardHeader className="text-center items-center pt-8 pb-4">
          <div className={`p-3 rounded-full bg-primary mb-4 transition-transform duration-500 delay-200 ${isVisible ? 'scale-100' : 'scale-0'}`}>
             <CheckCircle className={`h-16 w-16 text-primary-foreground transition-transform duration-500 delay-300 ${isVisible ? 'rotate-0 scale-100' : '-rotate-45 scale-0'}`} />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">{t('order_confirmation_title')}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            {t('order_confirmation_success')}
            {orderNumber && <><br/>Commande #{orderNumber}</>} {/* Display the order number */}
            <br/>
            {t('order_confirmation_contact_soon')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8 space-y-6">
          <Link href="/" >
            <Button variant="destructive" size="lg" className="w-full sm:w-auto">
              {t('order_confirmation_back_home')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
