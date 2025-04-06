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
  const [loadingParents, setLoadingParents] = useState(true)

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/divisi/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch divisions")
      }

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
      setLoading(true)
      const token = Cookies.get("token")

      // Convert parentId to number or null
      const payload = {
        divisi: values.divisi,
        parentId: values.parentId && values.parentId !== "none" 
          ? parseInt(values.parentId) 
          : null,
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/divisi/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to create division")
      }

      toast({
        title: "Success",
        description: "Division created successfully",
      })

      // Navigate back to division list
      router.push("/dashboard/division")
    } catch (err) {
      console.error("Error creating division:", err)
      toast({
        title: "Error",
        description: "Failed to create division",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push("/dashboard/division")}
          className="mr-4"
        >
          Back
        </Button>
        <span className="text-header-h5 font-bold font-poppins">Tambah Divisi Baru</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Divisi Baru</CardTitle>
        </CardHeader>
        <CardContent>
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

              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Divisi"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}