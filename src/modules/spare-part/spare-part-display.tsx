/* eslint-disable */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Plus, Edit, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { PaginationControls } from "@/components/ui/pagination-control";

interface Sparepart {
	id: string;
	partsName: string;
	purchaseDate: string;
	price: number;
	toolLocation: string;
}

interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

interface SparepartResponse {
	data: Sparepart[];
	meta: PaginationMeta;
}

export default function SparepartDisplay() {
	const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
		total: 0,
		page: 1,
		limit: 10,
		totalPages: 1,
	});
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		fetchSpareparts();
	}, [searchParams]);

	const fetchSpareparts = async () => {
		try {
			setLoading(true);
			const token = Cookies.get("accessToken");

			if (!token) {
				toast.error("No authentication token found");
				return;
			}

			// Create a new URLSearchParams object for the API request
			const apiParams = new URLSearchParams();

			// Add pagination parameters
			const currentPage = searchParams.get("page")
				? Number.parseInt(searchParams.get("page") as string)
				: 1;
			apiParams.set("page", currentPage.toString());
			apiParams.set("limit", paginationMeta.limit.toString());

			// Add search param if provided
			if (search) {
				apiParams.set("partsName", search);
			}

			const url = `${
				process.env.NEXT_PUBLIC_API_URL
			}/spareparts?${apiParams.toString()}`;

			const response = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to fetch spare parts"
				);
			}

			const responseData = await response.json();
			console.log("API Response:", responseData);

			// Check if the response has the expected structure
			if (responseData.data && Array.isArray(responseData.data)) {
				setSpareparts(responseData.data);

				// Make sure we're correctly handling the pagination metadata
				if (responseData.meta) {
					setPaginationMeta(responseData.meta);
				}
			} else {
				// If the API returns data directly without the expected structure
				setSpareparts(Array.isArray(responseData) ? responseData : []);
				console.warn(
					"API response doesn't have the expected structure with data and meta fields"
				);
			}
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Apakah Anda yakin ingin menghapus suku cadang ini?")) {
			return;
		}

		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/spareparts/${id}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Gagal menghapus suku cadang");
			}

			// Refresh the list
			fetchSpareparts();
			toast.success("Suku cadang berhasil dihapus");
		} catch (error) {
			toast.error((error as Error).message);
		}
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(value);
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return new Intl.DateTimeFormat("id-ID", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}).format(date);
		} catch (error) {
			console.error(error);
			return "Invalid Date";
		}
	};

	const navigateToViewDetails = (id: string) => {
		router.push(`/dashboard/spare-part/${id}`);
	};

	const navigateToEdit = (id: string) => {
		router.push(`/dashboard/spare-part/${id}/edit`);
	};

	const navigateToCreate = () => {
		router.push("/dashboard/spare-part/create");
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		fetchSpareparts();
	};

	const handlePageChange = (page: number) => {
		// Create a new URLSearchParams object from the current URL
		const params = new URLSearchParams(searchParams.toString());

		// Update the page parameter
		params.set("page", page.toString());

		// Navigate to the new URL
		router.push(`/dashboard/spare-part?${params.toString()}`);
	};

	return (
		<div className="space-y-6">
			<h1 className="text-header-h5 font-bold font-poppins">
				Suku Cadang
			</h1>

			{/* Header Section */}
			<div className="bg-primary-solid items-center p-2 flex gap-3 h-fit text-white rounded-lg overflow-hidden">
				<div className="flex items-center justify-center w-[264px] h-[224px] border border-primary-super-light rounded-lg">
					illustration
				</div>

				<div className="flex flex-col gap-6 py-6 px-6">
					<div className="space-y-2">
						<h2 className="text-header-h6 font-bold font-poppins">
							Suku Cadang
						</h2>
						<p className="text-s-medium">
							Kelola informasi suku cadang untuk peralatan medis,
							termasuk stok, lokasi, dan riwayat penggunaan.
						</p>
					</div>
					<Button
						variant="ghost"
						className="w-fit"
						onClick={() => navigateToCreate()}
					>
						<Plus className="mr-2 h-4 w-4" /> Tambah Suku Cadang
					</Button>
				</div>
			</div>

			{/* Search & Filter */}
			<div className="flex flex-col sm:flex-row items-center gap-4">
				<div className="relative w-full">
					<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
						<Search className="h-4 w-4 text-gray-400" />
					</div>
					<Input
						type="text"
						placeholder="Cari suku cadang..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full pl-10"
					/>
				</div>
				<Button
					variant="outline"
					onClick={() =>
						toast.error("Filter functionality coming soon")
					}
					className="w-full sm:w-auto"
				>
					<Filter className="mr-2 h-4 w-4" /> Filter
				</Button>
			</div>

			{/* Loading State */}
			{loading ? (
				<div className="flex justify-center p-8">
					<p>Loading...</p>
				</div>
			) : (
				<>
					<div className="border rounded-lg overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nama Suku Cadang</TableHead>
									<TableHead>Tanggal Pembelian</TableHead>
									<TableHead>Harga</TableHead>
									<TableHead>Lokasi</TableHead>
									<TableHead className="text-right">
										Aksi
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{spareparts.length > 0 ? (
									spareparts.map((sparepart) => (
										<TableRow
											key={sparepart.id}
											className="cursor-pointer"
											onClick={() =>
												navigateToViewDetails(
													sparepart.id
												)
											}
											data-testid={`sparepart-row-${sparepart.id}`}
										>
											<TableCell className="font-medium">
												{sparepart.partsName}
											</TableCell>
											<TableCell>
												{formatDate(
													sparepart.purchaseDate
												)}
											</TableCell>
											<TableCell>
												{formatCurrency(
													sparepart.price
												)}
											</TableCell>
											<TableCell>
												{sparepart.toolLocation}
											</TableCell>
											<TableCell
												className="text-right"
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												<div className="flex justify-end gap-2">
													<Button
														size="icon"
														variant="outline"
														onClick={(e) => {
															e.stopPropagation();
															navigateToEdit(
																sparepart.id
															);
														}}
														data-testid={`edit-button-${sparepart.id}`}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														size="icon"
														variant="destructive"
														onClick={(e) => {
															e.stopPropagation();
															handleDelete(
																sparepart.id
															);
														}}
														data-testid={`delete-button-${sparepart.id}`}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={5}
											className="text-center"
										>
											{search
												? "Tidak ada suku cadang yang cocok dengan pencarian Anda"
												: "Tidak ada data suku cadang"}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					<PaginationControls
						currentPage={paginationMeta.page}
						totalPages={paginationMeta.totalPages}
						onPageChange={handlePageChange}
					/>
				</>
			)}
		</div>
	);
}
