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
} from "@/components/ui/carousel"; // Assuming carousel is installed via ShadCN

// Placeholder images - Replace with your actual image paths or URLs
const carouselImages = [
    { src: "https://picsum.photos/seed/carousel1/1200/500", alt: "Promotion 1", hint: "sale discount offer" },
    { src: "https://picsum.photos/seed/carousel2/1200/500", alt: "New Arrivals", hint: "new collection fashion" },
    { src: "https://picsum.photos/seed/carousel3/1200/500", alt: "Featured Service", hint: "web design service" },
    { src: "https://picsum.photos/seed/carousel4/1200/500", alt: "Best Sellers", hint: "popular products clothing" },
    { src: "https://picsum.photos/seed/carousel5/1200/500", alt: "Special Event", hint: "event announcement community" },
];

export function HomeCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }) // Autoplay every 4 seconds
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full" // Take full width of its container
      opts={{
        loop: true, // Enable looping
      }}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {carouselImages.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1"> {/* Optional padding */}
              <Card className="overflow-hidden border-none shadow-none rounded-lg"> {/* No border/shadow for seamless look */}
                <CardContent className="flex aspect-[12/5] items-center justify-center p-0"> {/* Adjusted aspect ratio */}
                   <Image
                     src={image.src}
                     alt={image.alt}
                     width={1200}
                     height={500}
                     className="object-cover w-full h-full" // Ensure image covers the area
                     priority={index === 0} // Prioritize loading the first image
                     data-ai-hint={image.hint}
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
