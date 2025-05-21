"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  UserIcon,
  Shield,
  CreditCard,
  Building,
  Phone,
  Calendar,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Cookies from "js-cookie"
import DeleteDialog from "@/components/general/delete-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type User = {
  id: string
  email: string
  username: string
  role: string | null
  fullname: string | null
  nokar: string
  divisiId: number | null
  divisionName: string
  waNumber: string | null
  createdOn: string | null
  modifiedOn: string
}

export default function UserDetails() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUser = useCallback(async () => {
    if (!userId) return

    setLoading(true)

    try {
      const token = Cookies.get("accessToken")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        toast.error("User tidak ditemukan")
        throw new Error("User tidak ditemukan")
      }

      const userData = await response.json()

      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleGoBack = () => {
    router.push("/dashboard/user")
  }

  const handleEdit = () => {
    router.push(`/dashboard/user/${userId}/edit`)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const token = Cookies.get("accessToken")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Gagal menghapus pengguna")
      }

      toast.success("Pengguna berhasil dihapus")
      router.push("/dashboard/user?success=delete")
    } catch {
      toast.error("Gagal menghapus pengguna")
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tidak ada"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error(error)
      return "Format tanggal tidak valid"
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6" data-testid="loading-state">
        <Button variant="outline" onClick={handleGoBack} className="mb-6 w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        <Card>
          <CardHeader className="pb-4">
            <div className="h-8 w-1/3 bg-muted animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                  <div className="h-5 w-40 bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-4 gap-4">
            <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
            <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !user) {
    return (
      <div className="space-y-6" data-testid="error-state">
        <Button variant="outline" onClick={handleGoBack} data-testid="back-button" className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

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
            <p className="text-muted-foreground mb-6">{error || "Pengguna tidak ditemukan atau telah dihapus"}</p>
            <Button onClick={handleGoBack}>Kembali ke Daftar Pengguna</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state with user details
  return (
    <div className="space-y-6" data-testid="user-detail">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleGoBack} data-testid="back-button" className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit} data-testid="edit-button" className="w-fit">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick} data-testid="delete-button" className="w-fit">
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </Button>
        </div>
      </div>

      {/* User details */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-2xl" data-testid="user-name">
                    {user.fullname ?? user.username}
                </CardTitle>
                <Badge variant="outline" className="mr-2 h-fit">
                  {user.role ?? "User"}
                </Badge>
              </div>

                <span className="text-sm text-muted-foreground">ID: {user.id}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Separator className="mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="font-medium break-words" data-testid="user-email">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                <p className="font-medium break-words" data-testid="user-username">
                  {user.username}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                <p className="font-medium" data-testid="user-role">
                  {user.role ?? "Tidak ada"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">No. Kartu</h3>
                <p className="font-medium" data-testid="user-nokar">
                  {user.nokar}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Divisi</h3>
                <p className="font-medium" data-testid="user-divisi">
                  {user.divisionName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">WhatsApp</h3>
                <p className="font-medium" data-testid="user-wa">
                  {user.waNumber ?? "Tidak ada"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Dibuat Pada</h3>
                <p className="font-medium" data-testid="user-created">
                  {formatDate(user.createdOn)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Dimodifikasi Pada</h3>
                <p className="font-medium" data-testid="user-modified">
                  {formatDate(user.modifiedOn)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Konfirmasi Hapus Pengguna"
        description="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        deleteButtonText="Hapus"
        cancelButtonText="Batal"
      />
    </div>
  )
}
