"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, checked, ...props }, ref) => {
    // Use an internal state to manage immediate visual feedback if needed,
    // but primarily rely on the controlled `checked` prop.
    // This helps break potential loops if `onCheckedChange` causes immediate re-renders.
    const [localChecked, setLocalChecked] = React.useState(checked);

    // Update local state only when the controlled prop changes
    React.useEffect(() => {
        setLocalChecked(checked);
    }, [checked]);

    const handleCheckedChange = (newChecked: boolean) => {
        // Update local state for immediate feedback
        setLocalChecked(newChecked);
        // Call the provided callback only if the value actually changed
        if (onCheckedChange && newChecked !== checked) {
            onCheckedChange(newChecked);
        }
    };

    return (
      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className
        )}
        checked={localChecked} // Use local state for rendering the switch's state
        onCheckedChange={handleCheckedChange} // Use the wrapper function
        ref={ref}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          )}
        />
      </SwitchPrimitives.Root>
    );
});
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
