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
import { Loader2 } from "lucide-react"

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

interface EditDivisiProps {
  id: number
}

export default function EditDivisi({ id }: EditDivisiProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingDivision, setLoadingDivision] = useState(true)
  const [parentDivisions, setParentDivisions] = useState<Division[]>([])
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      divisi: "",
      parentId: undefined,
    },
  })

  useEffect(() => {
    // Fetch the division to edit and all potential parent divisions
    Promise.all([
      fetchDivision(id),
      fetchAllDivisions()
    ])
  }, [id])

  async function fetchDivision(id: number) {
    try {
      setLoadingDivision(true)
      const token = Cookies.get("token")
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/divisi/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch division")
      }

      const data = await response.json()
      
      // Set form values
      form.setValue("divisi", data.divisi)
      form.setValue("parentId", data.parentId ? data.parentId.toString() : "none")
    } catch (err) {
      console.error("Error fetching division:", err)
      setError("Failed to load division data.")
      toast({
        title: "Error",
        description: "Failed to load division data",
        variant: "destructive",
      })
    } finally {
      setLoadingDivision(false)
    }
  }

  async function fetchAllDivisions() {
    try {
      const token = Cookies.get("token")
      
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
      // Filter out the current division and its children to prevent circular references
      const filteredDivisions = flattenAndFilterDivisions(data, id)
      setParentDivisions(filteredDivisions)
    } catch (err) {
      console.error("Error fetching divisions:", err)
      toast({
        title: "Error",
        description: "Failed to load parent divisions",
        variant: "destructive",
      })
    }
  }

  // Function to flatten divisions and filter out the current one and its descendants
  function flattenAndFilterDivisions(divisions: Division[], currentId: number): Division[] {
    let result: Division[] = []
    
    for (const division of divisions) {
      // Skip the current division and its children
      if (division.id !== currentId) {
        result.push(division)
        if (division.children && division.children.length > 0) {
          result = [...result, ...flattenAndFilterDivisions(division.children, currentId)]
        }
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
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/divisi/${id}`, 
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update division")
      }

      toast({
        title: "Success",
        description: "Division updated successfully",
      })

      // Navigate back to division list
      router.push("/dashboard/division")
    } catch (err) {
      console.error("Error updating division:", err)
      toast({
        title: "Error",
        description: "Failed to update division",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingDivision) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading division data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/division")}>
            Back to Divisions
          </Button>
        </div>
      </div>
    )
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
        <span className="text-header-h5 font-bold font-poppins">Edit Divisi</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Edit Divisi</CardTitle>
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
                      value={field.value}
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
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}