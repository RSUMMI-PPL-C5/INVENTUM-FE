"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface HistoryFilterBadgeProps {
  label: string
  value: string | Date | null
  onRemove: () => void
}

export default function HistoryFilterBadge({ label, value, onRemove }: HistoryFilterBadgeProps) {
  if (!value) return null

  let displayValue = value
  if (value instanceof Date) {
    displayValue = format(value, "dd MMM yyyy")
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs">
      <span className="font-medium">{label}:</span>
      <span>{displayValue as string}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 rounded-full hover:bg-muted-foreground/20"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Remove filter</span>
      </Button>
    </div>
  )
}
