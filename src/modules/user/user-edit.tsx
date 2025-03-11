"use client";

import { useEffect, useState } from "react";
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
import { useRouter, useParams } from "next/navigation";
import { format, isValid } from "date-fns";

const formSchema = z.object({
  nokar: z.string().min(1, { message: "No. Kar wajib diisi" }),
  fullname: z.string().min(1, { message: "Nama lengkap wajib diisi" }),
  username: z.string().min(1, { message: "Username wajib diisi" }),
  password: z.string().optional(),
  divisi_id: z.string().min(1, { message: "Divisi wajib diisi" }),
  role: z.string().min(1, { message: "Role wajib diisi" }),
  wa_number: z.string().min(1, { message: "No. WA wajib diisi" }),
  createdOn: z.string().optional(),
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
  const { id: userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`http://localhost:8000/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        
        // Periksa apakah entryDate adalah tanggal yang valid
        const entryDate = new Date(userData.createdOn);
        const formattedDate = isValid(entryDate) ? format(entryDate, "yyyy-MM-dd") : "Invalid date";

        form.reset({
          nokar: userData.nokar,
          fullname: userData.fullname,
          username: userData.username,
          password: "",
          divisi_id: userData.divisiId.toString(),
          role: userData.role,
          wa_number: userData.waNumber,
          createdOn: formattedDate,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId, form]);

  async function updateUser(data: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const updatedValues = {
        ...values,
        modifiedOn: new Date(),
        modifiedBy: 1,
      };

      // Jika password tidak diubah, hapus field password dari updatedValues
      if (!isPasswordEnabled) {
        delete updatedValues.password;
      }

      await updateUser(updatedValues);
      router.push("/dashboard/user"); // Redirect setelah simpan
    } catch (error) {
      console.error('Failed to update user:', error);
      setUpdateError('Failed to update user');
    }
  }

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : "";
  };

  const handlePasswordToggle = () => {
    setIsPasswordEnabled(!isPasswordEnabled);
    if (isPasswordEnabled) {
      form.setValue("password", "");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Ubah Pengguna</h2>
      {updateError && <div className="text-red-500">{updateError}</div>}
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
          <div className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={!isPasswordEnabled} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" onClick={handlePasswordToggle} className="h-10">
              {isPasswordEnabled ? "Batalkan Ganti Password" : "Ganti Password"}
            </Button>
          </div>
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
            name="createdOn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Akun Dibuat</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} aria-label="Tanggal Akun Dibuat" disabled />
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