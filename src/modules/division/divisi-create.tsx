/* eslint-disable */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

interface Division {
  id: number
  divisi: string
  parentId: number | null
  children?: Division[]
}

const formSchema = z.object({
  divisi: z.string().min(1, { message: "Nama divisi wajib diisi" }),
  parentId: z.string().optional(),
})

export default function AddDivisi() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [parentDivisions, setParentDivisions] = useState<Division[]>([])
  const [loadingParents, setLoadingParents] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      divisi: "",
      parentId: undefined,
    },
  })

  useEffect(() => {
    fetchParentDivisions()
  }, [])

  async function fetchParentDivisions() {
    try {
      setLoadingParents(true)
      const token = Cookies.get("token")
      
      // Change the API endpoint to fetch all divisions
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/divisi/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      // Flatten the division hierarchy to get all divisions in a single array
      const allDivisions = flattenDivisions(data)
      setParentDivisions(allDivisions)
    } catch (err) {
      console.error("Error fetching parent divisions:", err)
      toast({
        title: "Error",
        description: "Failed to load parent divisions",
        variant: "destructive",
      })
    } finally {
      setLoadingParents(false)
    }
  }

  // Function to flatten the division hierarchy
  function flattenDivisions(divisions: Division[]): Division[] {
    let result: Division[] = []
    
    for (const division of divisions) {
      result.push(division)
      if (division.children && division.children.length > 0) {
        result = [...result, ...flattenDivisions(division.children)]
      }
    }
    
    return result
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const token = Cookies.get("token");
  
      const payload = {
        divisi: values.divisi,
        parentId: values.parentId 
          ? parseInt(values.parentId) 
          : null,
      };
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/divisi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
  
      toast({
        title: "Success",
        description: "Divisi berhasil dibuat",
      });
  
      router.push("/dashboard/division");
    } catch (err: any) {
      console.error("Error creating division:", err);
      setErrorMessage("Gagal membuat divisi, Silahkan cek kembali nama divisi dan parent divisi yang dipilih.");
      setErrorModalOpen(true); // Buka modal error
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-start gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push("/dashboard/division")}
          className="mr-4"
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
        </Button>
        <span className="text-header-h5 font-bold font-poppins">Tambah Divisi</span>
      </div>
  
      <Card>
        <CardHeader>
          <CardTitle>Form Divisi Baru</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingParents ? (
            <div className="flex justify-center items-center">
              <span>Loading parent divisions...</span>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="divisi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Divisi</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama divisi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Divisi</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih parent divisi (opsional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Tidak Ada Parent</SelectItem>
                          {parentDivisions.map((division) => (
                            <SelectItem key={division.id} value={division.id.toString()}>
                              {division.divisi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Pilih parent divisi jika merupakan sub divisi
                      </FormDescription>
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
          )}
        </CardContent>
      </Card>
  
      {errorModalOpen && (
        <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>{errorMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setErrorModalOpen(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}