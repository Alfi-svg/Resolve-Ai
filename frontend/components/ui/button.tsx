import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-upay-800 hover:bg-upay-900 text-white shadow-sm hover:shadow focus:ring-upay-700",
      secondary:
        "bg-upay-100 hover:bg-upay-200 text-upay-900 focus:ring-upay-400",
      outline:
        "border border-surface-border bg-white hover:bg-surface-muted text-gray-800 hover:border-gray-300 focus:ring-upay-500",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500",
      ghost:
        "hover:bg-surface-muted text-gray-700 hover:text-gray-900 focus:ring-gray-300",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
