// src/components/WelcomePopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Assuming you have Auth context

const WELCOME_POPUP_SHOWN_KEY = 'sama_welcome_popup_shown';

export function WelcomePopup() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // For internal animation control

    useEffect(() => {
        // Check if user is logged in and if popup has already been shown this session
        if (user && typeof window !== 'undefined') {
            const hasBeenShown = sessionStorage.getItem(WELCOME_POPUP_SHOWN_KEY);
            if (!hasBeenShown) {
                // Show popup after a short delay
                const openTimer = setTimeout(() => {
                    setIsOpen(true);
                     // Mark as shown for this session
                    sessionStorage.setItem(WELCOME_POPUP_SHOWN_KEY, 'true');
                }, 500); // Delay before opening

                return () => clearTimeout(openTimer);
            }
        } else {
            // Reset if user logs out
             if (typeof window !== 'undefined') {
                 sessionStorage.removeItem(WELCOME_POPUP_SHOWN_KEY);
             }
        }
    }, [user]); // Run effect when user state changes

    useEffect(() => {
        // Trigger inner content animation when dialog opens
        if (isOpen) {
            const visibleTimer = setTimeout(() => {
                setIsVisible(true);
            }, 100); // Short delay after dialog opens

             // Auto-close after a few seconds
            const closeTimer = setTimeout(() => {
                 handleClose();
            }, 4000); // Auto-close after 4 seconds

            return () => {
                clearTimeout(visibleTimer);
                 clearTimeout(closeTimer);
            }
        } else {
             // Reset visibility when closing
            setIsVisible(false);
        }
    }, [isOpen]);


    const handleClose = () => {
         setIsVisible(false); // Start fade-out animation
         setTimeout(() => {
             setIsOpen(false); // Close dialog after animation
         }, 300); // Match duration with fade-out
    };


    // Don't render the dialog if it's not open
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                 className={`
                    max-w-md p-8 text-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/30
                    transition-all duration-500 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out
                    data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                    data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
                    ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}
                 onInteractOutside={(e) => e.preventDefault()} // Prevent closing on outside click
                 hideCloseButton // Hide the default 'X' button
            >
                <div className={`flex justify-center mb-6 transition-transform duration-700 ease-out delay-200 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 -rotate-12'}`}>
                    <div className="p-4 bg-primary rounded-full shadow-lg">
                        <Sparkles className="h-12 w-12 text-primary-foreground animate-pulse" />
                    </div>
                </div>
                <h2 className={`text-2xl font-bold text-primary mb-3 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    Bienvenue, {user?.name || 'Utilisateur'} !
                </h2>
                <p className={`text-muted-foreground transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    Heureux de vous revoir sur SamaBoutique.
                </p>
                {/* Optional: Add a small action button or just let it auto-close */}
                 {/* <Button onClick={handleClose} variant="outline" className="mt-6">Continuer</Button> */}
            </DialogContent>
        </Dialog>
    );
}
