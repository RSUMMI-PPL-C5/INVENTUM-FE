import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, ...props }, ref) => {
    // Ensure value is never undefined for controlled inputs
    const safeValue = value ?? "";
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full bg-[#fff] border-[1px] border-border rounded-lg px-4 py-2 text-base shadow-sm transition-colors file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={safeValue}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }