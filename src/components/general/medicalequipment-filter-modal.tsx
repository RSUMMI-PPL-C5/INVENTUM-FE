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
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export type MedicalEquipmentFilters = {
  status: string[]
  createdOnStart: Date | null
  createdOnEnd: Date | null
  modifiedOnStart: Date | null
  modifiedOnEnd: Date | null
}

type MedicalEquipmentFilterModalProps = {
  isOpen: boolean
  filters: MedicalEquipmentFilters
  onConfirm: (filters: MedicalEquipmentFilters) => void
  onCancel: () => void
}

const statuses = ["Active", "Inactive", "Maintenance"]

export default function MedicalEquipmentFilterModal({ 
  isOpen, 
  filters, 
  onConfirm, 
  onCancel 
}: MedicalEquipmentFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<MedicalEquipmentFilters>({ ...filters })

  const handleStatusToggle = (status: string) => {
    setLocalFilters((prev) => {
      if (prev.status.includes(status)) {
        return {
          ...prev,
          status: prev.status.filter((s) => s !== status),
        }
      } else {
        return {
          ...prev,
          status: [...prev.status, status],
        }
      }
    })
  }

  const handleDateChange = (
    type: "createdOnStart" | "createdOnEnd" | "modifiedOnStart" | "modifiedOnEnd",
    date: Date | undefined
  ) => {
    setLocalFilters((prev) => {
      const updatedFilters = { ...prev }

      if (date) {
        updatedFilters[type] = date
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

  const resetFilters = () => {
    setLocalFilters({
      status: [],
      createdOnStart: null,
      createdOnEnd: null,
      modifiedOnStart: null,
      modifiedOnEnd: null,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Filter Alat Medis</DialogTitle>
          <DialogDescription>Pilih filter untuk menyaring daftar alat medis</DialogDescription>
        </DialogHeader>

        <div className="flex gap-12 py-4">
          <div className="flex flex-col gap-8">
            {/* Status Filter */}
            <div className="space-y-2">
              <h3 className="font-medium">Status</h3>
              <div className="flex flex-col gap-4">
                {statuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={localFilters.status.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <Label htmlFor={`status-${status}`}>{status}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-[1px] h-full bg-black" />

          <div className="flex flex-col gap-8">
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
                          !localFilters.createdOnStart && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters.createdOnStart ? (
                          format(localFilters.createdOnStart, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localFilters.createdOnStart || undefined}
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
                          !localFilters.createdOnEnd && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters.createdOnEnd ? (
                          format(localFilters.createdOnEnd, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localFilters.createdOnEnd || undefined}
                        onSelect={(date) => handleDateChange("createdOnEnd", date)}
                        disabled={(date) =>
                          date > new Date() ||
                          (localFilters.createdOnStart ? date < localFilters.createdOnStart : false)
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
                          !localFilters.modifiedOnStart && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters.modifiedOnStart ? (
                          format(localFilters.modifiedOnStart, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localFilters.modifiedOnStart || undefined}
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
                          !localFilters.modifiedOnEnd && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters.modifiedOnEnd ? (
                          format(localFilters.modifiedOnEnd, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localFilters.modifiedOnEnd || undefined}
                        onSelect={(date) => handleDateChange("modifiedOnEnd", date)}
                        disabled={(date) =>
                          date > new Date() ||
                          (localFilters.modifiedOnStart ? date < localFilters.modifiedOnStart : false)
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
            <Button variant="destructive" onClick={onCancel}>
              Batal
            </Button>
            <Button onClick={() => onConfirm(localFilters)}>Terapkan</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}