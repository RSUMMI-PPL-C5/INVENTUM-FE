"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { toast } from "sonner" // or your toast library
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type Filters = {
  role: string[]
  division: string
  createdOnStart: Date | null
  createdOnEnd: Date | null
  modifiedOnStart: Date | null
  modifiedOnEnd: Date | null
}

type UserFilterModalProps = {
  isOpen: boolean
  filters: Filters
  onConfirm: (filters: Filters) => void
  onCancel: () => void
}

interface Division {
  id: number
  divisi: string
}

const roles = [
  { id: "1", name: "User" },
  { id: "2", name: "Fasum" },
  { id: "3", name: "Admin" },
]

export default function UserFilterModal({ isOpen, filters, onConfirm, onCancel }: UserFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Filters>({ ...filters })
  const [divisions, setDivisions] = useState<Division[]>([])

  useEffect(() => {
    fetchAllDivisions()
  }, [])

  async function fetchAllDivisions() {
    try {
      const token = Cookies.get("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/divisi/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(<>Error fetching divisions:<br />{result.message}</>)
        return
      }

      setDivisions(result)
    } catch (error) {
      console.error("Error fetching divisions:", error)
      toast.error(error instanceof Error ? error.message : 'Error fetching divisions')
    }
  }

  const handleRoleToggle = (roleName: string) => {
    setLocalFilters((prev) => {
      if (prev.role.includes(roleName)) {
        return { ...prev, role: prev.role.filter((r) => r !== roleName) }
      } else {
        return { ...prev, role: [...prev.role, roleName] }
      }
    })
  }

  const handleDivisionChange = (divisionId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      division: divisionId,
    }))
  }

  const handleDateChange = (type: keyof Filters, date: Date | undefined) => {
    setLocalFilters((prev) => {
      const updatedFilters = { ...prev }
      if (date && (type === "createdOnStart" || type === "createdOnEnd" || type === "modifiedOnStart" || type === "modifiedOnEnd")) {
        (updatedFilters[type] as Date | null) = date
        if (type === "createdOnStart" && prev.createdOnEnd && date > prev.createdOnEnd) {
          updatedFilters.createdOnEnd = date
        }
        if (type === "modifiedOnStart" && prev.modifiedOnEnd && date > prev.modifiedOnEnd) {
          updatedFilters.modifiedOnEnd = date
        }
      } else {
        (updatedFilters[type] as Date | null) = null
      }
      return updatedFilters
    })
  }

  const resetFilters = () => {
    setLocalFilters({
      role: [],
      division: "all",
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
          <DialogTitle>Filter Pengguna</DialogTitle>
          <DialogDescription>Pilih filter untuk menyaring daftar pengguna</DialogDescription>
        </DialogHeader>

        <div className="flex gap-12 py-4">
          {/* Left Side */}
          <div className="flex flex-col gap-8">
            {/* Role Filter */}
            <div className="space-y-2">
              <h3 className="font-medium">Role</h3>
              <div className="flex flex-col gap-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.name}`}
                      checked={localFilters.role.includes(role.name)}
                      onCheckedChange={() => handleRoleToggle(role.name)}
                    />
                    <Label htmlFor={`role-${role.name}`}>{role.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Division Filter */}
            <div className="space-y-2">
              <h3 className="font-medium">Divisi</h3>
              <Select onValueChange={handleDivisionChange} value={localFilters.division}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id.toString()}>
                      {division.divisi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-[1px] h-full bg-black" />

          {/* Right Side */}
          <div className="flex flex-col gap-8">
            {/* Created On Filter */}
            <DateRangeFilter
              title="Tanggal Pembuatan"
              startId="createdOnStart"
              endId="createdOnEnd"
              startDate={localFilters.createdOnStart}
              endDate={localFilters.createdOnEnd}
              onChange={(field, date) => handleDateChange(field, date)}
            />

            {/* Modified On Filter */}
            <DateRangeFilter
              title="Tanggal Modifikasi"
              startId="modifiedOnStart"
              endId="modifiedOnEnd"
              startDate={localFilters.modifiedOnStart}
              endDate={localFilters.modifiedOnEnd}
              onChange={(field, date) => handleDateChange(field, date)}
            />
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

// Small subcomponent to make Date filters clean
function DateRangeFilter({
  title,
  startId,
  endId,
  startDate,
  endDate,
  onChange,
}: {
  title: string
  startId: keyof Filters
  endId: keyof Filters
  startDate: Date | null
  endDate: Date | null
  onChange: (field: keyof Filters, date: Date | undefined) => void
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{title}</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor={startId}>Dari</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={startId}
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date) => onChange(startId, date)}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1">
          <Label htmlFor={endId}>Sampai</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={endId}
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate || undefined}
                onSelect={(date) => onChange(endId, date)}
                disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
