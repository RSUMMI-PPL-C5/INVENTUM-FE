"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie";

const formSchema = z.object({
  nokar: z.string().min(1, { message: "No. Kar wajib diisi" }),
  fullname: z.string().min(1, { message: "Nama lengkap wajib diisi" }),
  username: z.string().min(1, { message: "Username wajib diisi" }),
  email: z.string().email({ message: "Format email tidak valid" }).min(1, { message: "Email wajib diisi" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  divisi_id: z.string().min(1, { message: "Divisi wajib diisi" }),
  role: z.string().min(1, { message: "Role wajib diisi" }),
  wa_number: z
    .string()
    .min(1, { message: "No. WA wajib diisi" })
    .nullable(),
  entryDate: z.date({
    required_error: "Tanggal masuk wajib diisi",
  }),
})

const divisions = [
  { id: "1", name: "Unit Medis" },
  { id: "2", name: "Unit Keperawatan" },
  { id: "3", name: "Teknis" },
  { id: "4", name: "IT Division" },
  { id: "5", name: "HR Division" },
]

const roles = [
  { id: "1", name: "User" },
  { id: "2", name: "Asesor" },
  { id: "3", name: "Admin" },
]

export default function UserCreate() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nokar: "",
      fullname: "",
      username: "",
      email: "",
      password: "",
      divisi_id: "",
      role: "",
      wa_number: null,
    },
  })

  async function createUser(data: z.infer<typeof formSchema>) {
    try {
        const token = Cookies.get("token");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password,
                role: data.role,
                fullname: data.fullname,
                nokar: data.nokar,
                divisiId: Number.parseInt(data.divisi_id),
                waNumber: data.wa_number,
                createdBy: 1,
                createdOn: data.entryDate.toISOString(),
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create user");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)

    try {
      await createUser(values)
      router.push("/dashboard/user?success=create")
    } catch (error) {
      console.error("Failed to create user:", error)
      setError("Gagal membuat pengguna. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <span className="text-header-h5 font-bold font-poppins">Tambah Pengguna</span>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <FormField
            control={form.control}
            name="nokar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Karyawan</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan nomor karyawan" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan nama lengkap" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="wa_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. WA</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="Masukkan nomor WA" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan username" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} placeholder="Masukkan alamat email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} placeholder="Masukkan password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="divisi_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Divisi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Divisi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
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
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
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
            name="entryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Masuk</FormLabel>
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
  )
}

