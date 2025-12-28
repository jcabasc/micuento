import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(priceInCents / 100);
}

export function generateOrderReference(): string {
  return `MC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
