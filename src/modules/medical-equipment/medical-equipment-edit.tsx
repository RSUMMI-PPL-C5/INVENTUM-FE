"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

// Schema validasi menggunakan Zod
const formSchema = z.object({
  inventorisId: z.string().min(1, { message: "Inventoris ID wajib diisi" }),
  name: z.string().min(1, { message: "Nama alat wajib diisi" }),
  brandName: z.string().optional(),
  modelName: z.string().optional(),
  purchaseDate: z
    .date({ required_error: "Tanggal pembelian wajib diisi" })
    .refine((date) => date <= new Date(), {
      message: "Tanggal pembelian tidak boleh lebih dari hari ini",
    })
    .optional(),
  purchasePrice: z
    .string()
    .optional()
    .transform((val) => val === "" ? undefined : Number(val))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "Harga pembelian harus berupa angka",
    })
    .refine((val) => val === undefined || val >= 0, {
      message: "Harga tidak boleh kurang dari 0",
    }),
  status: z.string().min(1, { message: "Status wajib diisi" }),
  vendor: z.string().optional(),
  createdOn: z.string().optional(),
  modifiedOn: z.string().optional(),
});

// Daftar status alat medis
const equipmentStatus = [
  { id: "Active", name: "Active" },
  { id: "Inactive", name: "Inactive" },
  { id: "Maintenance", name: "Maintenance" },
];

export default function MedicalEquipmentEdit() {
  const router = useRouter();
  const { id: equipmentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    async function fetchMedicalEquipment() {
      try {
        const token = Cookies.get("token");

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch medical equipment data");
        }

        const equipmentData = await response.json();

        // Convert string dates to Date objects where needed
        const purchaseDate = equipmentData.purchaseDate ? parseISO(equipmentData.purchaseDate) : undefined;

        const createdDate = new Date(equipmentData.createdOn);
        const formattedCreatedDate = isValid(createdDate) ? format(createdDate, "dd MMM yyyy") : "Invalid date";

        const modifiedDate = new Date(equipmentData.modifiedOn);
        const formattedModifiedDate = isValid(modifiedDate) ? format(modifiedDate, "dd MMM yyyy") : "Invalid date";

        form.reset({
          inventorisId: equipmentData.inventorisId,
          name: equipmentData.name,
          brandName: equipmentData.brandName || "",
          modelName: equipmentData.modelName || "",
          purchaseDate: purchaseDate,
          purchasePrice: equipmentData.purchasePrice ? equipmentData.purchasePrice.toString() : "",
          status: equipmentData.status,
          vendor: equipmentData.vendor || "",
          createdOn: formattedCreatedDate,
          modifiedOn: formattedModifiedDate,
        });
      } catch (error) {
        console.error("Error fetching medical equipment data:", error);
        setError("Failed to fetch medical equipment data");
      } finally {
        setLoading(false);
      }
    }

    fetchMedicalEquipment();
  }, [equipmentId, form]);

  async function updateMedicalEquipment(data: z.infer<typeof formSchema>) {
    try {
      const token = Cookies.get("token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          inventorisId: data.inventorisId,
          name: data.name,
          brandName: data.brandName || null,
          modelName: data.modelName || null,
          purchaseDate: data.purchaseDate ? data.purchaseDate.toISOString() : null,
          purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : null,
          status: data.status,
          vendor: data.vendor || null,
          modifiedBy: 1, // Assuming current user ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update medical equipment");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating medical equipment:", error);
      throw error;
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateMedicalEquipment(values);
      router.push("/dashboard/medical-equipment?success=update"); // Redirect setelah simpan
    } catch (error) {
      console.error("Failed to update medical equipment:", error);
      setUpdateError("Gagal mengubah data alat medis. Silakan coba lagi.");
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <span className="text-header-h5 font-bold font-poppins">Ubah Alat Medis</span>

      {updateError && <div className="text-red-500 mt-2">{updateError}</div>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <FormField
            control={form.control}
            name="inventorisId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventoris ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan Inventoris ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Alat</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan nama alat medis" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brandName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan merk (opsional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modelName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan model (opsional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Pembelian</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan harga pembelian (opsional)" type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan vendor (opsional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipmentStatus.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
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
                        {field.value ? format(field.value, "yyyy-MM-dd") : <span>Pilih tanggal</span>}
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
          <FormField
            control={form.control}
            name="modifiedOn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Dimodifikasi</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} aria-label="Tanggal Dimodifikasi" disabled />
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
  );
}