import type { Metadata } from "next";
// Removed GeistSans import as it's not installed
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/context/CartContext"; // Import CartProvider

export const metadata: Metadata = {
  title: "SamaBoutique",
  description: "Gérez votre boutique et présentez vos produits et services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        // Removed GeistSans.className
        className={cn(
          "antialiased flex flex-col min-h-screen"
        )}
      >
        <CartProvider> {/* Wrap with CartProvider */}
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
            {children}
          </main>
          <Toaster />
        </CartProvider> {/* Close CartProvider */}
      </body>
    </html>
  );
}
