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
  divisions: Division[]
  onConfirm: (filters: Filters) => void
  onCancel: () => void
}

interface Division {
  id: number;
  divisi: string;
}

const roles = [
  { id: "1", name: "User" },
  { id: "2", name: "Fasum" },
  { id: "3", name: "Admin" },
]

export default function UserFilterModal({ isOpen, filters, divisions, onConfirm, onCancel }: UserFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Filters>({ ...filters })

  const handleRoleToggle = (roleName: string) => {
    setLocalFilters((prev) => {
      if (prev.role.includes(roleName)) {
        return {
          ...prev,
          role: prev.role.filter((r) => r !== roleName),
        }
      } else {
        return {
          ...prev,
          role: [...prev.role, roleName],
        }
      }
    })
  }

  const handleDivisionChange = (divisionId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      division: divisionId
    }))
  }

  const handleDateChange = (type: "createdOnStart" | "createdOnEnd" | "modifiedOnStart" | "modifiedOnEnd", date: Date | undefined) => {
    setLocalFilters((prev) => {
      const updatedFilters = { ...prev };
  
      if (date) {
        updatedFilters[type] = date;
        if (type === "createdOnStart" && prev.createdOnEnd && date > prev.createdOnEnd) {
          updatedFilters.createdOnEnd = date;
        }
        if (type === "modifiedOnStart" && prev.modifiedOnEnd && date > prev.modifiedOnEnd) {
          updatedFilters.modifiedOnEnd = date;
        }
      } else {
        updatedFilters[type] = null;
      }
  
      return updatedFilters;
    });
  };

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
                                !localFilters.createdOnStart && "text-muted-foreground",
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
                                !localFilters.createdOnEnd && "text-muted-foreground",
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
                                date > new Date() || (localFilters.createdOnStart ? date < localFilters.createdOnStart : false)
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
                                !localFilters.modifiedOnStart && "text-muted-foreground",
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
                                !localFilters.modifiedOnEnd && "text-muted-foreground",
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
                                date > new Date() || (localFilters.modifiedOnStart ? date < localFilters.modifiedOnStart : false)
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
