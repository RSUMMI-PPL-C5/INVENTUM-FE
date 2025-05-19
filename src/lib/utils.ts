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

// Format date string to localized format
export function formatDate(dateString: string): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    return dateString
  }
}

// Format currency number to IDR
export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return 'Rp -'
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
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
