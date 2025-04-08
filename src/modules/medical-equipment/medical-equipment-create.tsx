"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

// ✅ Schema validasi menggunakan Zod
const formSchema = z.object({
    inventorisId: z.string().min(1, { message: "Inventoris ID wajib diisi" }),
    name: z.string().min(1, { message: "Nama alat wajib diisi" }),
    brandName: z.string().optional(),
    modelName: z.string().optional(),
    purchaseDate: z.date({ required_error: "Tanggal pembelian wajib diisi" }).optional(),
    purchasePrice: z.string().optional(),
    status: z.string().min(1, { message: "Status wajib diisi" }),
    vendor: z.string().optional(),
});

// ✅ Daftar status alat medis
const equipmentStatus = [
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
    { id: "under_maintenance", name: "Under Maintenance" },
];

export default function MedicalEquipmentCreate() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inventorisId: "",
            name: "",
            brandName: "",
            modelName: "",
            purchaseDate: undefined,
            purchasePrice: "",
            status: "",
            vendor: "",
        },
    });

    // ✅ Fungsi untuk mengirim data ke backend
    async function createMedicalEquipment(data: z.infer<typeof formSchema>) {
        try {
            const token = Cookies.get("token");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({
                    inventorisId: data.inventorisId,
                    name: data.name,
                    brandName: data.brandName ?? null,
                    modelName: data.modelName ?? null,
                    purchaseDate: data.purchaseDate ? data.purchaseDate.toISOString() : null,
                    purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : null,
                    status: data.status,
                    vendor: data.vendor ?? null,
                    createdBy: 1, // Default user ID
                }),
            });

            if (!response.ok) {
                throw new Error("Gagal menambahkan alat medis");
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error creating medical equipment:", error);
            throw error;
        }
    }

    // ✅ Handle submit form
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);

        try {
            await createMedicalEquipment(values);
            router.push("/dashboard/medical-equipment?success=create");
        } catch (error) {
            setError("Gagal menambahkan alat medis. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <span className="text-header-h5 font-bold font-poppins">Tambah Alat Medis</span>

            {error && <div className="text-red-500 mt-2">{error}</div>}

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
                            Batalkan
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
