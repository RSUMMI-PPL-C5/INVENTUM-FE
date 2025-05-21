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
	imageUrl?: string;
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

	return (
		<div className="space-y-6">
			<div className="flex flex-col items-start gap-4">
				<Button
					variant="outline"
					onClick={handleGoBack}
					className="mr-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Kembali
				</Button>
				<span className="text-header-h5 font-bold font-poppins">
					Detail Spare Part
				</span>
			</div>

			{loading ? (
				<div>Loading...</div>
			) : error ? (
				<div className="text-destructive">{error}</div>
			) : sparepart ? (
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div>
								<h3 className="text-sm font-medium text-muted-foreground">Gambar</h3>
								{sparepart.imageUrl ? (
									<img
										src={sparepart.imageUrl}
										alt={sparepart.partsName}
										className="mt-2 w-full max-w-md rounded-lg object-cover"
									/>
								) : (
									<div className="mt-2 w-full max-w-md h-48 bg-muted rounded-lg flex items-center justify-center">
										<span className="text-sm text-muted-foreground">No image available</span>
									</div>
								)}
							</div>
							<div>
								<h3 className="text-sm font-medium text-muted-foreground">Nama Spare Part</h3>
								<p className="mt-1">{sparepart.partsName}</p>
							</div>
							<div>
								<h3 className="text-sm font-medium text-muted-foreground">Tanggal Pembelian</h3>
								<p className="mt-1">{formatDate(sparepart.purchaseDate)}</p>
							</div>
						</div>
						<div className="space-y-4">
							<div>
								<h3 className="text-sm font-medium text-muted-foreground">Harga</h3>
								<p className="mt-1">{formatCurrency(sparepart.price)}</p>
							</div>
							<div>
								<h3 className="text-sm font-medium text-muted-foreground">Lokasi Alat</h3>
								<p className="mt-1">{sparepart.toolLocation}</p>
							</div>
							{sparepart.description && (
								<div>
									<h3 className="text-sm font-medium text-muted-foreground">Deskripsi</h3>
									<p className="mt-1">{sparepart.description}</p>
								</div>
							)}
						</div>
					</div>

					<div className="flex justify-end space-x-4">
						<Button
							variant="outline"
							onClick={handleEdit}
						>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Hapus
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
