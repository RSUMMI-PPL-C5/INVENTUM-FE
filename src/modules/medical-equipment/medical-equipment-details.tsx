//medical-equipment-details.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";

type MedicalEquipment = {
	id: string;
	inventorisId: string;
	name: string;
	brandName: string | null;
	modelName: string | null;
	purchaseDate: string | null;
	purchasePrice: number | null;
	status: string;
	vendor: string | null;
	createdOn: string | null;
	modifiedOn: string;
};

export default function MedicalEquipmentDetails() {
	const router = useRouter();
	const params = useParams();
	const equipmentId = params.id as string;

	const [equipment, setEquipment] = useState<MedicalEquipment | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchEquipment = useCallback(async () => {
		if (!equipmentId) return;

		setLoading(true);

		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`,
				{
					headers: {
						Authorization: token ? `Bearer ${token}` : "",
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				toast.error("Alat medis tidak ditemukan");
				throw new Error("Alat medis tidak ditemukan");
			}

			const data = await response.json();
			setEquipment(data.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan");
		} finally {
			setLoading(false);
		}
	}, [equipmentId]);

	useEffect(() => {
		fetchEquipment();
	}, [fetchEquipment]);

	const handleGoBack = () => {
		router.push("/dashboard/medical-equipment");
	};

	const handleEdit = () => {
		router.push(`/dashboard/medical-equipment/${equipmentId}/edit`);
	};

	const handleDelete = async () => {
		if (!confirm("Apakah Anda yakin ingin menghapus alat medis ini?")) {
			return;
		}

		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: token ? `Bearer ${token}` : "",
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Gagal menghapus alat medis");
			}

			router.push("/dashboard/medical-equipment?success=delete");
		} catch {
			toast.error("Gagal menghapus alat medis");
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

	const formatPrice = (price: number | null) => {
		if (price === null) return "Tidak ada";
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const getStatusClass = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
			case "inactive":
				return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
			case "maintenance":
				return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium";
			default:
				return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
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
	if (error || !equipment) {
		return (
			<div className="p-6 space-y-4" data-testid="error-state">
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

	// Success state with equipment details
	return (
		<div className="space-y-6" data-testid="equipment-detail">
			{/* Back button */}
			<Button
				variant="outline"
				onClick={handleGoBack}
				data-testid="back-button"
			>
				<ArrowLeft className="mr-2 h-4 w-4" /> Kembali
			</Button>

			{/* Equipment details */}
			<div className="border rounded-lg p-6 shadow-sm">
				<h1
					className="text-header-h6 font-bold mb-6"
					data-testid="equipment-name"
				>
					{equipment.name}
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Nomor Inventaris
						</h3>
						<p
							className="text-sm"
							data-testid="equipment-inventoris-id"
						>
							{equipment.inventorisId}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Status
						</h3>
						<p data-testid="equipment-status">
							<span className={getStatusClass(equipment.status)}>
								{equipment.status}
							</span>
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Merk
						</h3>
						<p className="text-sm" data-testid="equipment-brand">
							{equipment.brandName ?? "Tidak ada"}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Model
						</h3>
						<p className="text-sm" data-testid="equipment-model">
							{equipment.modelName ?? "Tidak ada"}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Harga
						</h3>
						<p className="text-sm" data-testid="equipment-price">
							{formatPrice(equipment.purchasePrice)}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Vendor
						</h3>
						<p className="text-sm" data-testid="equipment-vendor">
							{equipment.vendor ?? "Tidak ada"}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Tanggal Pembelian
						</h3>
						<p
							className="text-sm"
							data-testid="equipment-purchase-date"
						>
							{formatDate(equipment.purchaseDate)}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Dibuat Pada
						</h3>
						<p className="text-sm" data-testid="equipment-created">
							{formatDate(equipment.createdOn)}
						</p>
					</div>

					<div className="space-y-1">
						<h3 className="text-sm font-medium text-muted-foreground">
							Dimodifikasi Pada
						</h3>
						<p className="text-sm" data-testid="equipment-modified">
							{formatDate(equipment.modifiedOn)}
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
