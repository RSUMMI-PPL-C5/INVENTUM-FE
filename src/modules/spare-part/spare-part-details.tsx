"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, MapPin, FileText, Package } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type Sparepart = {
  id: string
  partsName: string
  purchaseDate: string
  price: number
  toolLocation: string
  description?: string | null
  imageUrl?: string
}

export default function SparePartDetails() {
  const router = useRouter()
  const params = useParams()
  const sparepartId = params.id as string

  const [sparepart, setSparepart] = useState<Sparepart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchSparepart = useCallback(async () => {
    if (!sparepartId) return

    setLoading(true)

    try {
      const token = Cookies.get("accessToken")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/spareparts/${sparepartId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        toast.error("Suku cadang tidak ditemukan")
        throw new Error("Suku cadang tidak ditemukan")
      }

      const data = await response.json()
      setSparepart(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }, [sparepartId])

  useEffect(() => {
    fetchSparepart()
  }, [fetchSparepart])

  const handleGoBack = () => {
    router.push("/dashboard/spare-part")
  }

  const handleEdit = () => {
    router.push(`/dashboard/spare-part/${sparepartId}/edit`)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const token = Cookies.get("accessToken")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/spareparts/${sparepartId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Gagal menghapus suku cadang")
      }

      toast.success("Suku cadang berhasil dihapus")
      router.push("/dashboard/spare-part?success=delete")
    } catch (error) {
      console.error(error)
      toast.error("Gagal menghapus suku cadang")
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    } catch (error) {
      console.error(error)
      return "Tanggal tidak valid"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-4">
          <Button variant="outline" onClick={handleGoBack} className="mr-4 w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <span className="text-header-h5 font-bold font-poppins">Detail Spare Part</span>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="h-48 w-full bg-muted animate-pulse rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="h-6 w-40 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                  <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                  <div className="h-20 w-full bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 pt-4 border-t">
            <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
            <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-4">
          <Button variant="outline" onClick={handleGoBack} className="mr-4 w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Data Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleGoBack}>Kembali ke Daftar Suku Cadang</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sparepart) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between w-full">
                <Button variant="outline" onClick={handleGoBack} data-testid="back-button" className="w-fit">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>

                <div className="flex gap-2">
                <Button variant="outline" onClick={handleEdit} data-testid="edit-button" className="w-fit">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus suku cadang ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? (
                            <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Menghapus...
                            </>
                        ) : (
                            "Hapus"
                        )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </div>
            </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col items-start gap-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5" />
              {sparepart.partsName}
            </CardTitle>
            <Badge variant="outline" className="px-3 py-1">
              ID: {sparepart.id}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Separator className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {sparepart.imageUrl ? (
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={sparepart.imageUrl || "/placeholder.svg"}
                    alt={sparepart.partsName}
                    className="w-full h-64 object-cover object-center"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border">
                  <span className="text-muted-foreground flex flex-col items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    Tidak ada gambar
                  </span>
                </div>
              )}
              
              
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Harga</h3>
                  <p className="font-medium text-lg">{formatCurrency(sparepart.price)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Lokasi Alat</h3>
                  <p className="font-medium">{sparepart.toolLocation}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Deskripsi</h3>
                    <p className="whitespace-pre-line">{sparepart.description ?? "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tanggal Pembelian</h3>
                  <p className="font-medium">{formatDate(sparepart.purchaseDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
