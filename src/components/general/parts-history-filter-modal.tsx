"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

export type PartsHistoryFilters = {
  search: string
  sparepartId: string
  result: string
  replacementDateStart: Date | null
  replacementDateEnd: Date | null
  createdOnStart: Date | null
  createdOnEnd: Date | null
}

interface PartsHistoryFilterModalProps {
  isOpen: boolean
  filters: PartsHistoryFilters
  onConfirm: (filters: PartsHistoryFilters) => void
  onCancel: () => void
}

export default function PartsHistoryFilterModal({
  isOpen,
  filters,
  onConfirm,
  onCancel,
}: PartsHistoryFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<PartsHistoryFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleChange = (field: keyof PartsHistoryFilters, value: string | Date | null) => {
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
      sparepartId: "",
      result: "",
      replacementDateStart: null,
      replacementDateEnd: null,
      createdOnStart: null,
      createdOnEnd: null,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Filter Riwayat Suku Cadang</DialogTitle>
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
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Success">Berhasil</SelectItem>
                <SelectItem value="Partial">Sebagian</SelectItem>
                <SelectItem value="Failed">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tanggal Penggantian</Label>
            <div className="col-span-3 flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.replacementDateStart ? (
                      format(localFilters.replacementDateStart, "dd MMM yyyy")
                    ) : (
                      <span>Dari tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.replacementDateStart || undefined}
                    onSelect={(date) => handleChange("replacementDateStart", (date as Date))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.replacementDateEnd ? (
                      format(localFilters.replacementDateEnd, "dd MMM yyyy")
                    ) : (
                      <span>Sampai tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.replacementDateEnd || undefined}
                    onSelect={(date) => handleChange("replacementDateEnd", (date as Date))}
                    initialFocus
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
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.createdOnStart ? (
                      format(localFilters.createdOnStart, "dd MMM yyyy")
                    ) : (
                      <span>Dari tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.createdOnStart || undefined}
                    onSelect={(date) => handleChange("createdOnStart", (date as Date))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.createdOnEnd ? (
                      format(localFilters.createdOnEnd, "dd MMM yyyy")
                    ) : (
                      <span>Sampai tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.createdOnEnd || undefined}
                    onSelect={(date) => handleChange("createdOnEnd", (date as Date))}
                    initialFocus
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
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={handleConfirm}>Terapkan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
