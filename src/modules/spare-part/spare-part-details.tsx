"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { formatCurrency } from "@/lib/utils";

type Sparepart = {
	id: string;
	partsName: string;
	purchaseDate: string;
	price: number;
	toolLocation: string;
	description?: string | null;
};

export default function SparePartDetails() {
	const router = useRouter();
	const params = useParams();
	const sparepartId = params.id as string;

	const [sparepart, setSparepart] = useState<Sparepart | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSparepart = useCallback(async () => {
		if (!sparepartId) return;

		setLoading(true);

		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/spareparts/${sparepartId}`,
				{
					headers: {
						Authorization: token ? `Bearer ${token}` : "",
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				toast.error("Suku cadang tidak ditemukan");
				throw new Error("Suku cadang tidak ditemukan");
			}

			const data = await response.json();
			setSparepart(data.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan");
		} finally {
			setLoading(false);
		}
	}, [sparepartId]);

	useEffect(() => {
		fetchSparepart();
	}, [fetchSparepart]);

	const handleGoBack = () => {
		router.push("/dashboard/spare-part");
	};

	const handleEdit = () => {
		router.push(`/dashboard/spare-part/${sparepartId}/edit`);
	};

	const handleDelete = async () => {
		if (!confirm("Apakah Anda yakin ingin menghapus suku cadang ini?")) {
			return;
		}

		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/spareparts/${sparepartId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: token ? `Bearer ${token}` : "",
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Gagal menghapus suku cadang");
			}

			router.push("/dashboard/spare-part?success=delete");
		} catch {
			toast.error("Gagal menghapus suku cadang");
		}
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return new Intl.DateTimeFormat("id-ID", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}).format(date);
		} catch (error) {
			console.error(error);
			return "Tanggal tidak valid";
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

				<div className="border rounded-lg p-6 shadow-sm">
					<div className="h-8 w-1/3 bg-muted animate-pulse rounded mb-6"></div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="space-y-2">
								<div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
								<div className="h-5 w-40 bg-muted animate-pulse rounded"></div>
							</div>
						))}
					</div>
				</div>

				<div className="flex justify-center">
					<p>Memuat...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !sparepart) {
		return (
			<div className="p-6 space-y-4" data-testid="error-state">
				<Button
					variant="outline"
					onClick={handleGoBack}
					data-testid="back-button"
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Kembali
				</Button>
				<div className="p-4 rounded-md bg-red-50 text-red-800 mt-4">
					<p>{error || "Suku cadang tidak ditemukan"}</p>
				</div>
			</div>
		);
	}

	// Success state with spare part details
	return (
		<div className="space-y-6" data-testid="spare-part-detail">
			{/* Back button */}
			<Button
				variant="outline"
				onClick={handleGoBack}
				data-testid="back-button"
			>
				<ArrowLeft className="mr-2 h-4 w-4" /> Kembali
			</Button>

			{/* Spare part details */}
			<div className="border rounded-lg p-6 shadow-sm">
				<h1
					className="text-2xl font-bold mb-6"
					data-testid="spare-part-name"
				>
					{sparepart.partsName}
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Tanggal Pembelian
						</h3>
						<p className="text-sm" data-testid="spare-part-date">
							{formatDate(sparepart.purchaseDate)}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Harga
						</h3>
						<p className="text-sm" data-testid="spare-part-price">
							{formatCurrency(sparepart.price)}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Lokasi
						</h3>
						<p
							className="text-sm"
							data-testid="spare-part-location"
						>
							{sparepart.toolLocation}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Deskripsi
						</h3>
						<p
							className="text-sm"
							data-testid="spare-part-description"
						>
							{sparepart.description || "Tidak ada deskripsi"}
						</p>
					</div>
				</div>

				<div className="flex justify-end gap-4 pt-6 mt-6">
					<Button onClick={handleEdit} data-testid="edit-button">
						<Edit className="mr-2 h-4 w-4" /> Edit
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						data-testid="delete-button"
					>
						<Trash2 className="mr-2 h-4 w-4" /> Hapus
					</Button>
				</div>
			</div>
		</div>
	);
}
