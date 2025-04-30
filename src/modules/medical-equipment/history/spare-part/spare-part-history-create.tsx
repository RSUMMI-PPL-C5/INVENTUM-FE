"use client"

import { Input } from "@/components/ui/input"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CalendarIcon } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface MedicalEquipment {
  id: string
  name: string
  brandName: string
  modelName: string
}

interface Sparepart {
  id: string
  partsName: string
  purchaseDate: string
  price: number
  toolLocation: string
}

const formSchema = z.object({
  sparepartId: z.string().min(1, { message: "Suku cadang wajib diisi" }),
  actionPerformed: z.string().min(1, { message: "Tindakan yang dilakukan wajib diisi" }),
  technician: z.string().min(1, { message: "Nama teknisi wajib diisi" }),
  result: z.string().min(1, { message: "Hasil wajib diisi" }),
  replacementDate: z.date({
    required_error: "Tanggal penggantian wajib diisi",
  }),
})

const resultOptions = [
  { id: "Success", name: "Berhasil" },
  { id: "Partial", name: "Sebagian" },
  { id: "Failed", name: "Gagal" },
]

export default function PartsHistoryCreate() {
  const router = useRouter()
  const params = useParams()
  const medicalEquipmentId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<MedicalEquipment | null>(null)
  const [spareparts, setSpareparts] = useState<Sparepart[]>([])

  useEffect(() => {
    fetchMedicalEquipment()
    fetchSpareparts()
  }, [medicalEquipmentId])

  async function fetchMedicalEquipment() {
    try {
      const token = Cookies.get("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${medicalEquipmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch medical equipment")
      }

      const result = await response.json()
      setEquipment(result.data)
    } catch (err) {
      console.error("Error fetching medical equipment:", err)
      setError("Gagal memuat detail peralatan medis.")
    }
  }

  async function fetchSpareparts() {
    try {
      const token = Cookies.get("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/spareparts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch spare parts")
      }

      const result = await response.json()
      setSpareparts(result.data)
    } catch (err) {
      console.error("Error fetching spare parts:", err)
      setError("Gagal memuat suku cadang.")
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sparepartId: "",
      actionPerformed: "",
      technician: "",
      result: "",
    },
  })

  async function createPartsHistory(data: z.infer<typeof formSchema>) {
    try {
      const token = Cookies.get("accessToken")

      const payload = {
        sparepartId: data.sparepartId,
        actionPerformed: data.actionPerformed,
        technician: data.technician,
        result: data.result,
        replacementDate: data.replacementDate.toISOString(),
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${medicalEquipmentId}/parts-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json()
        toast.error("Error membuat riwayat suku cadang", result.message)
        return
      }

      const result = await response.json()
      return result
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error membuat riwayat suku cadang")
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)

    try {
      await createPartsHistory(values)
      toast.success("Riwayat suku cadang berhasil dibuat")
      router.push(`/dashboard/medical-equipment/${medicalEquipmentId}`)
    } catch (error) {
      console.error("Failed to create parts history:", error)
      setError("Gagal membuat riwayat suku cadang. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col items-start gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/medical-equipment/${medicalEquipmentId}`)}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex flex-col">
          <span className="text-header-h5 font-bold font-poppins">Tambah Riwayat Suku Cadang</span>
          {equipment && (
            <span className="text-muted-foreground">
              {equipment.name} - {equipment.brandName} {equipment.modelName}
            </span>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <FormField
            control={form.control}
            name="sparepartId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suku Cadang</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih suku cadang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {spareparts.map((part) => (
                      <SelectItem key={part.id} value={part.id}>
                        {part.partsName} - {part.toolLocation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="actionPerformed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tindakan yang Dilakukan</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Jelaskan tindakan penggantian suku cadang yang dilakukan"
                    className="min-h-[120px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technician"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teknisi</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan nama teknisi" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="result"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasil</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hasil" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resultOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="replacementDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Penggantian</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="destructive" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
