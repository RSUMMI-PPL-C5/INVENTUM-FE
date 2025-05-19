"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, isValid } from "date-fns"
import { CalendarIcon } from 'lucide-react'
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

export type MaintenanceHistoryFilters = {
  search: string
  result: string
  maintenanceDateStart: Date | null
  maintenanceDateEnd: Date | null
  createdOnStart: Date | null
  createdOnEnd: Date | null
}

interface MaintenanceHistoryFilterModalProps {
  isOpen: boolean
  filters: MaintenanceHistoryFilters
  onConfirm: (filters: MaintenanceHistoryFilters) => void
  onCancel: () => void
}

export default function MaintenanceHistoryFilterModal({
  isOpen,
  filters,
  onConfirm,
  onCancel,
}: MaintenanceHistoryFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<MaintenanceHistoryFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleChange = (field: keyof MaintenanceHistoryFilters, value: string | Date | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleConfirm = () => {
    onConfirm(localFilters)
  }

  const handleReset = () => {
    setLocalFilters({
      search: "",
      result: "",
      maintenanceDateStart: null,
      maintenanceDateEnd: null,
      createdOnStart: null,
      createdOnEnd: null,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Filter Riwayat Maintenance</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="result" className="text-right">
              Hasil
            </Label>
            <Select value={localFilters.result} onValueChange={(value) => handleChange("result", value)}>
              <SelectTrigger className="col-span-3" id="result">
                <SelectValue placeholder="Pilih hasil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Success">Berhasil</SelectItem>
                <SelectItem value="Partial">Sebagian</SelectItem>
                <SelectItem value="Failed">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tanggal Maintenance</Label>
            <div className="col-span-3 flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.maintenanceDateStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.maintenanceDateStart && isValid(localFilters.maintenanceDateStart) ? (
                      format(localFilters.maintenanceDateStart, "dd MMM yyyy", { locale: id })
                    ) : (
                      <span>Dari tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.maintenanceDateStart || undefined}
                    onSelect={(date) => handleChange("maintenanceDateStart", (date as Date))}
                    initialFocus
                    locale={id}
                    weekStartsOn={1}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.maintenanceDateEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.maintenanceDateEnd && isValid(localFilters.maintenanceDateEnd) ? (
                      format(localFilters.maintenanceDateEnd, "dd MMM yyyy", { locale: id })
                    ) : (
                      <span>Sampai tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.maintenanceDateEnd || undefined}
                    onSelect={(date) => handleChange("maintenanceDateEnd", (date as Date))}
                    initialFocus
                    locale={id}
                    weekStartsOn={1}
                    className="rounded-md border"
                    disabled={(date) => 
                      localFilters.maintenanceDateStart ? date < localFilters.maintenanceDateStart : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tanggal Dibuat</Label>
            <div className="col-span-3 flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.createdOnStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.createdOnStart && isValid(localFilters.createdOnStart) ? (
                      format(localFilters.createdOnStart, "dd MMM yyyy", { locale: id })
                    ) : (
                      <span>Dari tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.createdOnStart || undefined}
                    onSelect={(date) => handleChange("createdOnStart", (date as Date))}
                    initialFocus
                    locale={id}
                    weekStartsOn={1}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.createdOnEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.createdOnEnd && isValid(localFilters.createdOnEnd) ? (
                      format(localFilters.createdOnEnd, "dd MMM yyyy", { locale: id })
                    ) : (
                      <span>Sampai tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.createdOnEnd || undefined}
                    onSelect={(date) => handleChange("createdOnEnd", (date as Date))}
                    initialFocus
                    locale={id}
                    weekStartsOn={1}
                    className="rounded-md border"
                    disabled={(date) => 
                      localFilters.createdOnStart ? date < localFilters.createdOnStart : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="destructive" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={handleConfirm}>Terapkan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}