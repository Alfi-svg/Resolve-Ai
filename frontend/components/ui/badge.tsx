import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "danger" | "warning" | "neutral" | "info" | "brand";
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = "neutral", children, ...props }) => {
  const variantStyles = {
    brand: "bg-upay-50 text-upay-800 border-upay-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    info: "bg-sky-50 text-sky-800 border-sky-200",
    neutral: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
