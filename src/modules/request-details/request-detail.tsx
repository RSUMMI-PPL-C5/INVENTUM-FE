"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Send, Clock, User, Calendar, Stethoscope, MessageSquare } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Comment {
  id: string
  text: string
  userId: string
  requestId: string
  createdAt: string
  modifiedAt: string
  user: {
    username: string
    fullname: string
  }
}

interface Request {
  id: string
  userId: string
  medicalEquipment: string
  complaint: string
  status: string
  createdBy: string
  createdOn: string
  modifiedBy: string
  modifiedOn: string
  requestType: string
  user: {
    username: string
    fullname: string
  }
}

export default function RequestDetail({
  id,
  requestType,
}: {
  id: string
  requestType: "CALIBRATION" | "MAINTENANCE"
}) {
  const router = useRouter()
  const [request, setRequest] = useState<Request | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "on progress":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Selesai"
      case "pending":
        return "Menunggu"
      case "on progress":
        return "Diproses"
      default:
        return status
    }
  }

  useEffect(() => {
    async function fetchRequestDetails() {
      try {
        const token = Cookies.get("accessToken")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/request/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Gagal mengambil detail permintaan")
        }

        const responseData = await response.json()

        if (responseData.success && responseData.data) {
          setRequest(responseData.data)

          if (responseData.data.comments && Array.isArray(responseData.data.comments)) {
            setComments(responseData.data.comments)
            setLoading(false) // Lewati pengambilan komentar jika sudah ada
          }
        } else {
          throw new Error("Format respons tidak valid")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        toast.error("Gagal memuat detail permintaan")
      }
    }

    fetchRequestDetails()
  }, [id])

  useEffect(() => {
    if (!loading || comments.length > 0) return

    async function fetchComments() {
      try {
        const token = Cookies.get("accessToken")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment/request/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Gagal mengambil komentar")
        }

        const responseData = await response.json()

        if (responseData.success && Array.isArray(responseData.data)) {
          setComments(responseData.data)
        } else if (responseData.data && Array.isArray(responseData.data)) {
          setComments(responseData.data)
        } else if (responseData.data?.comments && Array.isArray(responseData.data.comments)) {
          setComments(responseData.data.comments)
        } else {
          console.error("Format data komentar tidak sesuai:", responseData)
          setComments([])
        }
      } catch (error) {
        console.error("Error mengambil komentar:", error)
        toast.error("Gagal memuat komentar: " + error)
        setComments([])
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [id, loading, comments.length])

  const handleBack = () => {
    router.back()
  }

  // Fungsi untuk mengirim komentar
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const token = Cookies.get("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newComment,
          requestId: id,
        }),
      })

      if (!response.ok) {
        throw new Error("Gagal mengirim komentar")
      }

      const responseData = await response.json()

      // Ekstrak data komentar dari respons
      const newCommentData = responseData.data ?? responseData

      // Tambahkan komentar yang terformat dengan baik ke daftar
      setComments((prev) => [...prev, newCommentData])
      setNewComment("")
      toast.success("Komentar berhasil ditambahkan")
    } catch (error) {
      console.error("Error mengirim komentar:", error)
      toast.error("Gagal mengirim komentar: " + error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-state">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <div className="rounded-full bg-red-100 p-3">
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
          <p className="text-red-500 font-medium">{error}</p>
          <Button onClick={handleBack}>Kembali</Button>
        </CardContent>
      </Card>
    )
  }

  const requestTypeText = requestType === "CALIBRATION" ? "Kalibrasi" : "Pemeliharaan"

  return (
    <div className="space-y-6 font-plus-jakarta-sans">
      {/* Header */}
      <div className="flex flex-col items-start gap-4">
        <Button variant="outline" onClick={handleBack} className="mr-4 w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-header-h5 font-bold font-poppins">Detail Permintaan {requestTypeText}</h1>
          {request && (
            <Badge
              className={`${getStatusClass(request.status)} px-3 py-1.5 text-xs font-medium`}
              data-testid="request-status"
            >
              {getStatusText(request.status)}
            </Badge>
          )}
        </div>
      </div>

      {request && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Informasi Permintaan</span>
              <span className="text-sm font-normal text-muted-foreground">ID: {request.id}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Pengaju</p>
                    <p className="font-medium" data-testid="request-user">
                      {request.user?.fullname || request.user?.username || "Tidak diketahui"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Tanggal Pengajuan</p>
                    <p className="font-medium" data-testid="request-date">
                      {formatDate(request.createdOn)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Alat Medis</p>
                    <p className="font-medium" data-testid="request-equipment">
                      {request.medicalEquipment}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Terakhir Diperbarui</p>
                    <p className="font-medium" data-testid="request-modified">
                      {formatDate(request.modifiedOn)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Complaint */}
            <div>
              <h3 className="text-base font-semibold mb-3">Keluhan</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p data-testid="request-complaint" className="whitespace-pre-line">
                  {request.complaint || "Tidak ada keluhan yang ditentukan"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <CardHeader className="bg-gray-50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>Komentar</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Comments List */}
          <ScrollArea className="h-[300px] pr-4 mb-6" data-testid="comments-list">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-2 opacity-40" />
                <p className="text-muted-foreground">Belum ada komentar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-2"
                    data-testid={`comment-${comment.id}`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">
                        {comment.user?.fullname || comment.user?.username || "Pengguna Tidak Diketahui"}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                    <p className="whitespace-pre-line">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="mt-6">
            <div className="flex flex-col gap-3">
              <Textarea
                placeholder="Tambahkan komentar..."
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                className="resize-none min-h-[100px]"
                disabled={submitting}
                data-testid="comment-input"
              />
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                data-testid="submit-comment"
                className="ml-auto"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Komentar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
