'use client'; // Make it a client component

import Image from 'next/image';
import type { Product } from '@/app/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tag, ShoppingCart } from 'lucide-react'; // Added ShoppingCart icon
import { useCart } from '@/context/CartContext'; // Import useCart
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart(); // Get addToCart function
  const { toast } = useToast(); // Get toast function

  // Placeholder image based on category or name
  const imageHint = product.category === 'Services' ? 'service tech' : product.name.toLowerCase().split(' ')[0];

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Produit Ajouté!",
      description: `${product.name} a été ajouté à votre panier.`,
      className: "border-primary bg-primary text-primary-foreground",
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <Image
          src={`https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
          data-ai-hint={imageHint}
        />
         <div className="absolute top-2 right-2 bg-secondary px-2 py-1 rounded-full text-xs font-medium text-secondary-foreground flex items-center gap-1">
           <Tag className="h-3 w-3"/>
           {product.category}
         </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="text-xl font-semibold text-primary">
          {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
        <Button variant="destructive" onClick={handleAddToCart}>
           <ShoppingCart className="mr-2 h-4 w-4" /> Ajouter au Panier
        </Button>
      </CardFooter>
    </Card>
  );
}
