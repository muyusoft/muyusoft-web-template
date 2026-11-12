import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn.utils";

const VARIANTS = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  secondary: "border border-border bg-surface text-foreground hover:bg-divider",
  danger: "bg-error-600 text-white hover:bg-error-700",
  ghost: "text-foreground hover:bg-divider",
} as const;

// md and lg meet the 44px minimum target size.
const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-12 px-6 text-lg",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
