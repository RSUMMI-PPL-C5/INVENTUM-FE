"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Select from "@radix-ui/react-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const formSchema = z.object({
  nokar: z.string().min(1, { message: "No. Kar wajib diisi" }),
  fullname: z.string().min(1, { message: "Nama lengkap wajib diisi" }),
  username: z.string().min(1, { message: "Username wajib diisi" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
  divisi_id: z.string().min(1, { message: "Divisi wajib diisi" }),
  role: z.string().min(1, { message: "Role wajib diisi" }),
  wa_number: z.string().min(1, { message: "No. WA wajib diisi" }),
  joinDate: z.string().min(1, { message: "Tanggal masuk wajib diisi" }),
});

const divisions = [
  { id: "1", name: "Unit Medis" },
  { id: "2", name: "Unit Keperawatan" },
  { id: "3", name: "Teknis" },
  // Add more divisions as needed
];

const roles = [
  { id: "1", name: "User" },
  { id: "2", name: "Asesor" },
  { id: "3", name: "Admin" },
];

export default function UserEdit() {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nokar: "12345",
      fullname: "Azmy Arya Rizaldi",
      username: "azmy",
      password: "password",
      divisi_id: "1",
      role: "1",
      wa_number: "08123456789",
      joinDate: format(new Date("2025-02-12"), "dd MMM yyyy"),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    router.push("/users"); // Redirect setelah simpan
  }

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : "";
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Ubah Pengguna</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nokar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Karyawan</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
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
                  <Input {...field} />
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
                  <Input {...field} disabled />
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
                  <Input type="password" {...field} />
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
                <FormControl>
                  <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
                    <Select.Trigger className="inline-flex items-center justify-between w-full px-3 py-2 text-sm leading-none bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <Select.Value placeholder="Pilih Divisi" />
                      <Select.Icon />
                    </Select.Trigger>
                    <Select.Content className="bg-white border border-gray-300 rounded-md shadow-lg">
                      <Select.Viewport>
                        {divisions.map((division) => (
                          <Select.Item key={division.id} value={division.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100">
                            <Select.ItemText>{division.name}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Root>
                </FormControl>
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
                <FormControl>
                  <Input {...field} value={getRoleName(field.value)} disabled />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="joinDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Masuk</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} disabled />
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
    </div>
  );
}