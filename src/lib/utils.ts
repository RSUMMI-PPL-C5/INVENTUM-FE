import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumberWithDots = (value: string): string => {
  if (!value) return "";
  const cleanValue = value.replace(/\./g, "");
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date)
  }

export const formatCurrency = (curr: number | null) => {
    if (curr == null) return "-"
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(curr)
  }

export function decodeToken (token: string) {
    try {
  
      const parts = token.split(".")
      if (parts.length !== 3) {
        throw new Error("Invalid token format")
      }
  
      const payload = parts[1]
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
  
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error("Error decoding token:", error)
      return null
    }
  }
