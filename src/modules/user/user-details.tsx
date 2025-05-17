"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";
import DeleteDialog from "@/components/general/delete-dialog"; // Import the DeleteDialog component

type User = {
    id: string;
    email: string;
    username: string;
    role: string | null;
    fullname: string | null;
    nokar: string;
    divisiId: number | null;
    divisionName: string;
    waNumber: string | null;
    createdOn: string | null;
    modifiedOn: string;
};

export default function UserDetails() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUser = useCallback(async () => {
        if (!userId) return;

        setLoading(true);

        try {
            const token = Cookies.get("accessToken");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                toast.error("User tidak ditemukan");
                throw new Error("User tidak ditemukan");
            }

            const userData = await response.json();

            setUser(userData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleGoBack = () => {
        router.push("/dashboard/user");
    };

    const handleEdit = () => {
        router.push(`/dashboard/user/${userId}/edit`);
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = Cookies.get("accessToken");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Gagal menghapus pengguna");
            }

            toast.success("Pengguna berhasil dihapus");
            router.push("/dashboard/user?success=delete");
        } catch {
            toast.error("Gagal menghapus pengguna");
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Tidak ada";
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(date);
        } catch (error) {
            console.error(error);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="space-y-6" data-testid="loading-state">
                <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>

                <div className="border rounded-lg p-4 md:p-6 shadow-sm">
                    <div className="h-8 w-1/3 bg-muted animate-pulse rounded mb-6"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                                <div className="h-5 w-40 bg-muted animate-pulse rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !user) {
        return (
            <div className="p-4 md:p-6 space-y-4" data-testid="error-state">
                <Button
                    variant="outline"
                    onClick={handleGoBack}
                    data-testid="back-button"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
            </div>
        );
    }

    // Success state with user details
    return (
        <div className="space-y-6" data-testid="user-detail">
            {/* Back button */}
            <Button
                variant="outline"
                onClick={handleGoBack}
                data-testid="back-button"
                className="w-full sm:w-auto"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>

            {/* User details */}
            <div className="border rounded-lg p-4 md:p-6 shadow-sm max-w-4xl mx-auto w-full">
                <h1
                    className="text-header-h6 font-bold mb-6"
                    data-testid="user-name"
                >
                    {user.fullname ?? user.username}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Email
                        </h3>
                        <p className="text-sm break-words" data-testid="user-email">
                            {user.email}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Username
                        </h3>
                        <p className="text-sm" data-testid="user-username">
                            {user.username}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Role
                        </h3>
                        <p className="text-sm" data-testid="user-role">
                            {user.role ?? "Tidak ada"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            No. Kartu
                        </h3>
                        <p className="text-sm" data-testid="user-nokar">
                            {user.nokar}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Divisi
                        </h3>
                        <p className="text-sm" data-testid="user-divisi">
                            {user.divisionName}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            WhatsApp
                        </h3>
                        <p className="text-sm" data-testid="user-wa">
                            {user.waNumber ?? "Tidak ada"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Dibuat Pada
                        </h3>
                        <p className="text-sm" data-testid="user-created">
                            {formatDate(user.createdOn)}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Dimodifikasi Pada
                        </h3>
                        <p className="text-sm" data-testid="user-modified">
                            {formatDate(user.modifiedOn)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6">
                    <Button 
                        onClick={handleEdit} 
                        data-testid="edit-button"
                        className="w-full sm:w-auto"
                    >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteClick}
                        data-testid="delete-button"
                        className="w-full sm:w-auto"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </Button>
                </div>
            </div>

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
    );
}