"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CalendarIcon } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { format, isValid, parseISO } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"

const formSchema = z.object({
  partsName: z.string().min(1, { message: "Nama spare part wajib diisi" }),
  purchaseDate: z.date({
    required_error: "Tanggal pembelian wajib diisi",
  }),
  price: z.string().min(1, { message: "Harga wajib diisi" }),
  toolLocation: z.string().min(1, { message: "Lokasi alat wajib diisi" }),
  toolDate: z.date({
    required_error: "Tanggal alat wajib diisi",
  }),
  createdOn: z.string().optional(),
})

export default function SparePartEdit() {
  const router = useRouter()
  const { id: sparePartId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    async function fetchSparePart() {
      try {
        const token = Cookies.get("token")

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        }

        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sparepart/${sparePartId}`, {
          headers,
        })

        if (!response.ok) {
          throw new Error("Failed to fetch spare part data")
        }

        const sparePartData = await response.json()

        const createdDate = new Date(sparePartData.createdOn)
        const formattedDate = isValid(createdDate) ? format(createdDate, "dd-MM-yyy") : "Invalid date"

        const purchaseDate = parseISO(sparePartData.purchaseDate)
        const toolDate = parseISO(sparePartData.toolDate)

        form.reset({
          partsName: sparePartData.partsName,
          purchaseDate: purchaseDate,
          price: sparePartData.price.toString(),
          toolLocation: sparePartData.toolLocation,
          toolDate: toolDate,
          createdOn: formattedDate,
        })
      } catch (error) {
        console.error("Error fetching spare part data:", error)
        setError("Failed to fetch spare part data")
      } finally {
        setLoading(false)
      }
    }

    fetchSparePart()
  }, [sparePartId, form])

  async function updateSparePart(data: z.infer<typeof formSchema>) {
    try {
      const token = Cookies.get("token")

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sparepart/${sparePartId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          partsName: data.partsName,
          purchaseDate: data.purchaseDate.toISOString(),
          price: Number.parseFloat(data.price),
          toolLocation: data.toolLocation,
          toolDate: format(data.toolDate, "dd-MM-yyy"), // Format as string in dd-MM-yyy format
          modifiedBy: 1, // Assuming current user ID
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update spare part")
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error updating spare part:", error)
      throw error
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateSparePart(values)
      router.push("/dashboard/sparepart?success=update") // Redirect setelah simpan
    } catch (error) {
      console.error("Failed to update spare part:", error)
      setUpdateError("Failed to update spare part")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <>
      <span className="text-header-h5 font-bold font-poppins">Ubah Spare Part</span>

      {updateError && <div className="text-red-500">{updateError}</div>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <FormField
            control={form.control}
            name="partsName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Spare Part</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan nama spare part" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Pembelian</FormLabel>
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

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Masukkan harga"
                    type="number"
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toolLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasi Alat</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan lokasi alat" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toolDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Alat</FormLabel>
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

          <FormField
            control={form.control}
            name="createdOn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Dibuat</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} aria-label="Tanggal Dibuat" disabled />
                    <CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="destructive" onClick={() => router.back()}>
              Batalkan
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Form>
    </>
  )
}

