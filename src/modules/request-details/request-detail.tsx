"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  text: string;
  userId: string;
  requestId: string;
  createdAt: string;
  modifiedAt: string;
  user: {
    username: string;
    fullname: string;
  };
}

interface Request {
  id: string;
  userId: string;
  medicalEquipment: string;
  complaint: string;
  status: string;
  createdBy: string;
  createdOn: string;
  modifiedBy: string;
  modifiedOn: string;
  requestType: string;
  user: {
    username: string;
    fullname: string;
  };
}

export default function RequestDetail({ id, requestType }: { 
  id: string; 
  requestType: 'CALIBRATION' | 'MAINTENANCE'
}) {
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "on progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Selesai";
      case "pending":
        return "Menunggu";
      case "on progress":
        return "Diproses";
      default:
        return status;
    }
  };

  useEffect(() => {
    async function fetchRequestDetails() {
      try {
        const token = Cookies.get("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/request/${id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil detail permintaan");
        }

        const responseData = await response.json();
        
        if (responseData.success && responseData.data) {
          setRequest(responseData.data);
          
          if (responseData.data.comments && Array.isArray(responseData.data.comments)) {
            setComments(responseData.data.comments);
            setLoading(false); // Lewati pengambilan komentar jika sudah ada
          }
        } else {
          throw new Error("Format respons tidak valid");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error("Gagal memuat detail permintaan");
      }
    }

    fetchRequestDetails();
  }, [id]);

  useEffect(() => {
    if (!loading || comments.length > 0) return;
    
    async function fetchComments() {
      try {
        const token = Cookies.get("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/comment/request/${id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil komentar");
        }

        const responseData = await response.json();
        
        if (responseData.success && Array.isArray(responseData.data)) {
          setComments(responseData.data);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          setComments(responseData.data);
        } else if (responseData.data?.comments && Array.isArray(responseData.data.comments)) {
          setComments(responseData.data.comments);
        } else {
          console.error("Format data komentar tidak sesuai:", responseData);
          setComments([]);
        }
      } catch (error) {
        console.error("Error mengambil komentar:", error);
        toast.error("Gagal memuat komentar: " + error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [id, loading, comments.length]);

  const handleBack = () => {
    router.back();
  };

  // Fungsi untuk mengirim komentar
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const token = Cookies.get("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: newComment,
            requestId: id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengirim komentar");
      }

      const responseData = await response.json();
      
      // Ekstrak data komentar dari respons
      const newCommentData = responseData.data ?? responseData;
      
      // Tambahkan komentar yang terformat dengan baik ke daftar
      setComments(prev => [...prev, newCommentData]);
      setNewComment("");
      toast.success("Komentar berhasil ditambahkan");
      
    } catch (error) {
      console.error("Error mengirim komentar:", error);
      toast.error("Gagal mengirim komentar: " + error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-state">
        <p>Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleBack}>Kembali</Button>
      </div>
    );
  }

  const requestTypeText = requestType === 'CALIBRATION' ? 'Kalibrasi' : 'Pemeliharaan';

  return (
    <div className="space-y-6 font-plus-jakarta-sans">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handleBack} className="p-0 h-auto">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-header-h5 font-bold font-poppins">
          Detail Permintaan {requestTypeText}
        </h1>
      </div>

      {request && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Request Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">ID Permintaan</p>
              <p className="font-medium" data-testid="request-id">{request.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(request.status)}`}
                  data-testid="request-status"
                >
                  {getStatusText(request.status)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Pengaju</p>
              <p className="font-medium" data-testid="request-user">
                {request.user?.fullname || request.user?.username || "Tidak diketahui"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Tanggal Pengajuan</p>
              <p className="font-medium" data-testid="request-date">
                {formatDate(request.createdOn)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Alat Medis</p>
              <p className="font-medium" data-testid="request-equipment">
                {request.medicalEquipment}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Terakhir Diperbarui</p>
              <p className="font-medium" data-testid="request-modified">
                {formatDate(request.modifiedOn)}
              </p>
            </div>
          </div>

          {/* Complaint */}
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-2">Keluhan</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <p data-testid="request-complaint">
                {request.complaint || "Tidak ada keluhan yang ditentukan"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Komentar</h2>

        {/* Comments List */}
        <div className="space-y-4 mb-6" data-testid="comments-list">
          {comments.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada komentar</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 p-4 rounded-md space-y-2"
                data-testid={`comment-${comment.id}`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    {comment.user?.fullname || comment.user?.username || "Pengguna Tidak Diketahui"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
                <p>{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="mt-6">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Tambahkan komentar..."
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                className="resize-none"
                disabled={submitting}
                data-testid="comment-input"
              />
            </div>
            <Button 
              type="submit" 
              disabled={submitting || !newComment.trim()}
              data-testid="submit-comment"
            >
              {submitting ? "Mengirim..." : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}