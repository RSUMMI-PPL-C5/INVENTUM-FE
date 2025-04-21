"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

const formSchema = z.object({
  userId: z.string().min(1),
  medicalEquipment: z.string().min(1),
  complaint: z.string().optional(),
  submissionDate: z.date(),
  createdBy: z.string().min(1),
});

export default function MaintenanceRequestCreate() {
  const router = useRouter()
  const params = useParams()
  const equipmentId = params.id as string

  const userId = localStorage.getItem("userId") || "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
      defaultValues: {
      userId: userId,
      medicalEquipment: equipmentId,
      complaint: "",
      submissionDate: new Date(),
      createdBy: userId,
    },
  });

  const onsubmit = async (values: z.infer<typeof formSchema>) => {

  };

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col items-start gap-4">
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <span className="text-header-h5 font-bold font-poppins">Minta Maintenance</span>
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      {errorModalOpen && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{errorMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setErrorModalOpen(false)}>
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-6 mt-4">
          <FormField
            control={form.control}
            name="medicalEquipment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alat</FormLabel>
                <FormControl>
                    <Input disabled {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complaint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan keluhan" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <input type="hidden" {...form.register("userId")} />
          <input type="hidden" {...form.register("submissionDate")} />
          <input type="hidden" {...form.register("createdBy")} />

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