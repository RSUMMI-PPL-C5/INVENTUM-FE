"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { toast } from "sonner"
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
import { format, isValid } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
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

export default function UserFilterModal({ isOpen, filters, onConfirm, onCancel }: Readonly<UserFilterModalProps>) {
  const [localFilters, setLocalFilters] = useState<Filters>({ ...filters })
  const [divisions, setDivisions] = useState<Division[]>([])

  useEffect(() => {
    fetchAllDivisions()
  }, [])

  const clearDivision = () => {
    setLocalFilters(prev => ({
      ...prev,
      division: ""
    }))
  }

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

  const handleDateChange = (
    type: keyof Pick<Filters, "createdOnStart" | "createdOnEnd" | "modifiedOnStart" | "modifiedOnEnd">,
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
      role: [],
      division: "", // Diubah dari "all" menjadi string kosong
      createdOnStart: null,
      createdOnEnd: null,
      modifiedOnStart: null,
      modifiedOnEnd: null,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-fit max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Filter Pengguna</DialogTitle>
          <DialogDescription>Pilih filter untuk menyaring daftar pengguna</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-8 py-4">
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
              <div className="flex items-center gap-2">
                <Select 
                  onValueChange={handleDivisionChange} 
                  value={localFilters.division || ""}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Semua Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id.toString()}>
                        {division.divisi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {localFilters.division && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={clearDivision}
                    className="h-8 w-8" 
                    type="button"
                    title="Hapus filter divisi"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="w-[1px] h-full bg-border hidden md:block" />

          {/* Right Side */}
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
                        {localFilters.createdOnStart && isValid(localFilters.createdOnStart) ? (
                          format(localFilters.createdOnStart, "dd MMM yyyy", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.createdOnStart || undefined}
                        onSelect={(date) => handleDateChange("createdOnStart", date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        locale={id}
                        weekStartsOn={1}
                        className="rounded-md border"
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
                        {localFilters.createdOnEnd && isValid(localFilters.createdOnEnd) ? (
                          format(localFilters.createdOnEnd, "dd MMM yyyy", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.createdOnEnd || undefined}
                        onSelect={(date) => handleDateChange("createdOnEnd", date)}
                        disabled={(date) =>
                          date > new Date() ||
                          (localFilters.createdOnStart ? date < localFilters.createdOnStart : false)
                        }
                        initialFocus
                        locale={id}
                        weekStartsOn={1}
                        className="rounded-md border"
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
                        {localFilters.modifiedOnStart && isValid(localFilters.modifiedOnStart) ? (
                          format(localFilters.modifiedOnStart, "dd MMM yyyy", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.modifiedOnStart || undefined}
                        onSelect={(date) => handleDateChange("modifiedOnStart", date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        locale={id}
                        weekStartsOn={1}
                        className="rounded-md border"
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
                        {localFilters.modifiedOnEnd && isValid(localFilters.modifiedOnEnd) ? (
                          format(localFilters.modifiedOnEnd, "dd MMM yyyy", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.modifiedOnEnd || undefined}
                        onSelect={(date) => handleDateChange("modifiedOnEnd", date)}
                        disabled={(date) =>
                          date > new Date() ||
                          (localFilters.modifiedOnStart ? date < localFilters.modifiedOnStart : false)
                        }
                        initialFocus
                        locale={id}
                        weekStartsOn={1}
                        className="rounded-md border"
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