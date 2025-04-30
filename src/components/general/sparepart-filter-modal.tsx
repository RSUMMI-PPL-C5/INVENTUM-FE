"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export type SparepartFilters = {
  purchaseDateStart: Date | null
  purchaseDateEnd: Date | null
  priceMin: number | null
  priceMax: number | null
  createdOnStart: Date | null
  createdOnEnd: Date | null
  modifiedOnStart: Date | null
  modifiedOnEnd: Date | null
}

interface FilterDialogProps {
  onApplyFilter: (filters: Record<string, string>) => void
  currentFilters?: URLSearchParams
}

export function FilterDialog({ onApplyFilter, currentFilters }: FilterDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SparepartFilters>({
    purchaseDateStart: currentFilters?.get("purchaseDateStart")
      ? new Date(currentFilters.get("purchaseDateStart") as string)
      : null,
    purchaseDateEnd: currentFilters?.get("purchaseDateEnd")
      ? new Date(currentFilters.get("purchaseDateEnd") as string)
      : null,
    priceMin: currentFilters?.get("priceMin") ? Number.parseFloat(currentFilters.get("priceMin") as string) : null,
    priceMax: currentFilters?.get("priceMax") ? Number.parseFloat(currentFilters.get("priceMax") as string) : null,
    createdOnStart: currentFilters?.get("createdOnStart")
      ? new Date(currentFilters.get("createdOnStart") as string)
      : null,
    createdOnEnd: currentFilters?.get("createdOnEnd") ? new Date(currentFilters.get("createdOnEnd") as string) : null,
    modifiedOnStart: currentFilters?.get("modifiedOnStart")
      ? new Date(currentFilters.get("modifiedOnStart") as string)
      : null,
    modifiedOnEnd: currentFilters?.get("modifiedOnEnd")
      ? new Date(currentFilters.get("modifiedOnEnd") as string)
      : null,
  })

  const handleDateChange = (
    type: keyof Pick<
      SparepartFilters,
      "purchaseDateStart" | "purchaseDateEnd" | "createdOnStart" | "createdOnEnd" | "modifiedOnStart" | "modifiedOnEnd"
    >,
    date: Date | undefined,
  ) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev }

      if (date) {
        updatedFilters[type] = date
        // Ensure end dates are not before start dates
        if (type === "purchaseDateStart" && prev.purchaseDateEnd && date > prev.purchaseDateEnd) {
          updatedFilters.purchaseDateEnd = date
        }
        if (type === "createdOnStart" && prev.createdOnEnd && date > prev.createdOnEnd) {
          updatedFilters.createdOnEnd = date
        }
        if (type === "modifiedOnStart" && prev.modifiedOnEnd && date > prev.modifiedOnEnd) {
          updatedFilters.modifiedOnEnd = date
        }
      } else {
        updatedFilters[type] = null
      }

      return updatedFilters
    })
  }

  const handlePriceChange = (type: "priceMin" | "priceMax", value: string) => {
    const numValue = value === "" ? null : Number.parseFloat(value)
    setFilters((prev) => ({
      ...prev,
      [type]: numValue,
    }))
  }

  const resetFilters = () => {
    setFilters({
      purchaseDateStart: null,
      purchaseDateEnd: null,
      priceMin: null,
      priceMax: null,
      createdOnStart: null,
      createdOnEnd: null,
      modifiedOnStart: null,
      modifiedOnEnd: null,
    })
  }

  const handleApplyFilter = () => {
    const filterParams: Record<string, string> = {}

    // Convert dates to ISO format and add to params if they exist
    if (filters.purchaseDateStart) {
      filterParams.purchaseDateStart = filters.purchaseDateStart.toISOString()
    }
    if (filters.purchaseDateEnd) {
      filterParams.purchaseDateEnd = filters.purchaseDateEnd.toISOString()
    }

    // Add price filters if they exist
    if (filters.priceMin !== null && filters.priceMin !== undefined) {
      filterParams.priceMin = filters.priceMin.toString()
    }
    if (filters.priceMax !== null && filters.priceMax !== undefined) {
      filterParams.priceMax = filters.priceMax.toString()
    }

    // Add created/modified date filters if they exist
    if (filters.createdOnStart) {
      filterParams.createdOnStart = filters.createdOnStart.toISOString()
    }
    if (filters.createdOnEnd) {
      filterParams.createdOnEnd = filters.createdOnEnd.toISOString()
    }
    if (filters.modifiedOnStart) {
      filterParams.modifiedOnStart = filters.modifiedOnStart.toISOString()
    }
    if (filters.modifiedOnEnd) {
      filterParams.modifiedOnEnd = filters.modifiedOnEnd.toISOString()
    }

    onApplyFilter(filterParams)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.purchaseDateStart) count++
    if (filters.purchaseDateEnd) count++
    if (filters.priceMin !== null) count++
    if (filters.priceMax !== null) count++
    if (filters.createdOnStart) count++
    if (filters.createdOnEnd) count++
    if (filters.modifiedOnStart) count++
    if (filters.modifiedOnEnd) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="relative">
      <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsOpen(true)}>
        <Filter className="mr-2 h-4 w-4" /> Filter
      </Button>
      {activeFiltersCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {activeFiltersCount}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="w-fit max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Filter Suku Cadang</DialogTitle>
            <DialogDescription>Pilih filter untuk menyaring daftar suku cadang</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-8 py-4">
            <div className="flex flex-col gap-8">
              {/* Price Filter */}
              <div className="space-y-2">
                <h3 className="font-medium">Harga</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="priceMin">Minimum</Label>
                    <Input
                      id="priceMin"
                      type="number"
                      value={filters.priceMin?.toString() || ""}
                      onChange={(e) => handlePriceChange("priceMin", e.target.value)}
                      placeholder="Rp 0"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="priceMax">Maksimum</Label>
                    <Input
                      id="priceMax"
                      type="number"
                      value={filters.priceMax?.toString() || ""}
                      onChange={(e) => handlePriceChange("priceMax", e.target.value)}
                      placeholder="Rp 1.000.000"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[1px] h-full bg-border hidden md:block" />

            <div className="flex flex-col gap-8">
              {/* Purchase Date Filter */}
              <div className="space-y-2">
                <h3 className="font-medium">Tanggal Pembelian</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="purchaseDateStart">Dari</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="purchaseDateStart"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.purchaseDateStart && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.purchaseDateStart ? (
                            format(filters.purchaseDateStart, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.purchaseDateStart || undefined}
                          onSelect={(date) => handleDateChange("purchaseDateStart", date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="purchaseDateEnd">Sampai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="purchaseDateEnd"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.purchaseDateEnd && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.purchaseDateEnd ? (
                            format(filters.purchaseDateEnd, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.purchaseDateEnd || undefined}
                          onSelect={(date) => handleDateChange("purchaseDateEnd", date)}
                          disabled={(date) =>
                            date > new Date() || (filters.purchaseDateStart ? date < filters.purchaseDateStart : false)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Created On Filter */}
              <div className="space-y-2">
                <h3 className="font-medium">Tanggal Pembuatan</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="createdOnStart">Dari</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="createdOnStart"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.createdOnStart && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.createdOnStart ? format(filters.createdOnStart, "PPP") : <span>Pilih tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.createdOnStart || undefined}
                          onSelect={(date) => handleDateChange("createdOnStart", date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="createdOnEnd">Sampai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="createdOnEnd"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.createdOnEnd && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.createdOnEnd ? format(filters.createdOnEnd, "PPP") : <span>Pilih tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.createdOnEnd || undefined}
                          onSelect={(date) => handleDateChange("createdOnEnd", date)}
                          disabled={(date) =>
                            date > new Date() || (filters.createdOnStart ? date < filters.createdOnStart : false)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Modified On Filter */}
              <div className="space-y-2">
                <h3 className="font-medium">Tanggal Modifikasi</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="modifiedOnStart">Dari</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="modifiedOnStart"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.modifiedOnStart && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.modifiedOnStart ? (
                            format(filters.modifiedOnStart, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.modifiedOnStart || undefined}
                          onSelect={(date) => handleDateChange("modifiedOnStart", date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="modifiedOnEnd">Sampai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="modifiedOnEnd"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.modifiedOnEnd && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.modifiedOnEnd ? format(filters.modifiedOnEnd, "PPP") : <span>Pilih tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.modifiedOnEnd || undefined}
                          onSelect={(date) => handleDateChange("modifiedOnEnd", date)}
                          disabled={(date) =>
                            date > new Date() || (filters.modifiedOnStart ? date < filters.modifiedOnStart : false)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex w-full justify-between">
            <Button variant="outline" onClick={resetFilters} type="button">
              Reset
            </Button>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleCancel}>
                Batal
              </Button>
              <Button onClick={handleApplyFilter}>Terapkan</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
