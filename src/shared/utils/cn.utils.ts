import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Later Tailwind classes override earlier ones, so variants can be overridden by className.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
