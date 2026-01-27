import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90 [box-shadow:inset_0px_-2px_0px_0px_rgba(0,0,0,0.1),_0px_1px_6px_0px_rgba(0,0,0,0.1)] hover:translate-y-[1px] hover:scale-[0.98] active:translate-y-[2px] active:scale-[0.97] transition-all duration-200",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 [box-shadow:inset_0px_-2px_0px_0px_rgba(0,0,0,0.05),_0px_1px_6px_0px_rgba(0,0,0,0.05)] hover:translate-y-[1px] hover:scale-[0.98] active:translate-y-[2px] active:scale-[0.97] transition-all duration-200",
        outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground text-foreground [box-shadow:inset_0px_-2px_0px_0px_rgba(0,0,0,0.03),_0px_1px_6px_0px_rgba(0,0,0,0.03)] hover:translate-y-[1px] hover:scale-[0.98] active:translate-y-[2px] active:scale-[0.97] transition-all duration-200",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200",
        code: "bg-[#36322F] dark:bg-zinc-800 text-white hover:opacity-90 transition-all duration-200",
        orange: "bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1 text-sm",
        lg: "h-12 px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "button" : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }