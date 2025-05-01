import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize state as undefined
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // This function now runs only on the client
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    checkDevice();

    // Listener for window resize
    window.addEventListener("resize", checkDevice);

    // Cleanup listener
    return () => window.removeEventListener("resize", checkDevice);
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  return isMobile;
}
