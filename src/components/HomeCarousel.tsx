
// src/components/HomeCarousel.tsx
'use client';

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CarouselImage } from "@/hooks/useSettings"; // Import the type

interface HomeCarouselProps {
    images: CarouselImage[]; // Accept images as a prop
}

export function HomeCarousel({ images }: HomeCarouselProps) { // Destructure images prop
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  // Handle case where no images are provided
  if (!images || images.length === 0) {
      return (
          <div className="w-full aspect-[12/5] bg-muted flex items-center justify-center text-muted-foreground">
              (No carousel images configured)
          </div>
      );
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{
        loop: true,
      }}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {images.map((image, index) => ( // Use the images prop
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="overflow-hidden border-none shadow-none rounded-lg">
                <CardContent className="flex aspect-[12/5] items-center justify-center p-0">
                   <Image
                     src={image.src}
                     alt={image.alt}
                     width={1200}
                     height={500}
                     className="object-cover w-full h-full"
                     priority={index === 0}
                     data-ai-hint={image.hint}
                     onError={(e) => { // Basic fallback or hide
                          (e.target as HTMLImageElement).style.display = 'none';
                          // Or set a placeholder: e.currentTarget.src = '/placeholder.png';
                     }}
                   />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex" />
    </Carousel>
  );
}
