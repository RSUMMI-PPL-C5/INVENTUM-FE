/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit, Search, Trash2 } from "lucide-react";
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
import DeleteDialog from "@/components/general/delete-dialog";
import { FilterDialog } from "@/components/general/sparepart-filter-modal";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Sparepart {
	id: string;
	partsName: string;
	purchaseDate: string;
	price: number;
	toolLocation: string;
	imageUrl?: string;
}

interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export default function SparepartDisplay() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Initialize state from URL params
	const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
		total: 0,
		page: searchParams.get("page")
			? Number.parseInt(searchParams.get("page") as string)
			: 1,
		limit: 10,
		totalPages: 1,
	});
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState(searchParams.get("search") || "");

	// Delete dialog state
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [sparepartToDelete, setSparepartToDelete] = useState<string | null>(
		null
	);
	const [isDeleting, setIsDeleting] = useState(false);

	// Function to update URL with current search and pagination
	const updateURLParams = (
		newParams: Record<string, string | string[] | null | undefined>
	) => {
		const params = new URLSearchParams(searchParams.toString());

		// Clear existing params to avoid duplicates
		["search", "page", "partsName"].forEach((param) => {
			params.delete(param);
		});

		// Add new params
		Object.entries(newParams).forEach(([key, value]) => {
			if (value === null || value === undefined || value === "") {
				return;
			}

			if (Array.isArray(value)) {
				value.forEach((val) => {
					if (val) params.append(key, val);
				});
			} else {
				params.set(key, value);
			}
		});

		// Update URL without refreshing page
		router.push(`/dashboard/spare-part?${params.toString()}`, {
			scroll: false,
		});
	};

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
			const searchParam = searchParams.get("search");
			if (searchParam) {
				apiParams.set("partsName", searchParam);
			}

			// Add filter params
			const filterParams = [
				"purchaseDateStart",
				"purchaseDateEnd",
				"priceMin",
				"priceMax",
				"createdOnStart",
				"createdOnEnd",
				"modifiedOnStart",
				"modifiedOnEnd",
			];

			filterParams.forEach((param) => {
				const value = searchParams.get(param);
				if (value) {
					apiParams.set(param, value);
				}
			});

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

	const confirmDelete = (id: string) => {
		setSparepartToDelete(id);
		setShowDeleteDialog(true);
	};

	const handleDelete = async () => {
		if (!sparepartToDelete) return;

		setIsDeleting(true);
		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/spareparts/${sparepartToDelete}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				toast.error(
					<>
						Error deleting spare part:
						<br />
						{errorData.message || "Unknown error"}
					</>
				);
				return;
			}

			// Refresh the list
			fetchSpareparts();
			toast.success("Suku cadang berhasil dihapus");
		} catch (error) {
			console.error("Error deleting spare part:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Error deleting spare part"
			);
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
			setSparepartToDelete(null);
		}
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		updateURLParams({
			search: value || null,
			page: "1",
		});
	};

	const handleApplyFilter = (filters: Record<string, string>) => {
		if (Object.keys(filters).length === 0) {
			const params = new URLSearchParams();
			if (search) {
				params.set("search", search);
			}
			params.set("page", "1");

			router.push(`/dashboard/spare-part?${params.toString()}`, {
				scroll: false,
			});
		} else {
			updateURLParams({
				...filters,
				search: search || null,
				page: "1",
			});
		}
	};

	const handlePageChange = (page: number) => {
		updateURLParams({
			page: page.toString(),
		});
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

	return (
		<div className="space-y-6">
			<h1 className="text-header-h5 font-bold font-poppins">
				Suku Cadang
			</h1>

			{/* Header Section */}
			<div className="bg-primary-solid p-4 md:p-2 flex flex-col md:flex-row items-center gap-3 h-fit text-white rounded-lg overflow-hidden">
				<div className="hidden md:flex items-center justify-center w-[200px] md:w-[264px] h-[150px] md:h-[224px] border border-primary-super-light rounded-lg shrink-0">
					illustration
				</div>

				<div className="flex flex-col gap-4 md:gap-6 py-3 md:py-6 px-2 md:px-6 text-left">
					<div className="space-y-2">
						<h2 className="text-xl md:text-header-h6 font-bold font-poppins">
							Suku Cadang
						</h2>
						<p className="text-sm md:text-s-medium">
							Kelola informasi suku cadang untuk peralatan medis,
							termasuk stok, lokasi, dan riwayat penggunaan.
						</p>
					</div>
					<Button
						variant="ghost"
						className="w-full md:w-fit"
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
						onChange={(e) => handleSearchChange(e.target.value)}
						className="w-full pl-10"
						data-testid="search-input"
					/>
				</div>
				<div className="w-full sm:w-auto">
					<FilterDialog
						onApplyFilter={handleApplyFilter}
						currentFilters={searchParams}
					/>
				</div>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="flex justify-center p-8">
					<div className="animate-pulse text-center">
						Memuat Suku Cadang...
					</div>
				</div>
			)}

			{/* Spareparts Table */}
			{!loading && (
				<>
					{/* Desktop View */}
					<div className="border rounded-lg overflow-hidden hidden md:block">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Gambar</TableHead>
									<TableHead>Nama Spare Part</TableHead>
									<TableHead>Tanggal Pembelian</TableHead>
									<TableHead>Harga</TableHead>
									<TableHead>Lokasi Alat</TableHead>
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
											<TableCell>
												{sparepart.imageUrl ? (
													<img
														src={sparepart.imageUrl}
														alt={
															sparepart.partsName
														}
														className="w-12 h-12 object-cover rounded-lg"
													/>
												) : (
													<div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
														<span className="text-xs text-muted-foreground">
															No image
														</span>
													</div>
												)}
											</TableCell>
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
															confirmDelete(
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
											{search ||
											searchParams.has(
												"purchaseDateStart"
											) ||
											searchParams.has(
												"purchaseDateEnd"
											) ||
											searchParams.has("priceMin") ||
											searchParams.has("priceMax") ||
											searchParams.has(
												"createdOnStart"
											) ||
											searchParams.has("createdOnEnd") ||
											searchParams.has(
												"modifiedOnStart"
											) ||
											searchParams.has("modifiedOnEnd")
												? "Tidak ada suku cadang yang cocok dengan pencarian atau filter Anda"
												: "Tidak ada data suku cadang"}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Card View */}
					<div className="md:hidden">
						<div className="grid grid-cols-1 gap-4">
							{spareparts.length > 0 ? (
								spareparts.map((sparepart) => (
									<div
										key={`card-${sparepart.id}`}
										className="border rounded-lg p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
										onClick={() =>
											navigateToViewDetails(sparepart.id)
										}
										data-testid={`sparepart-card-${sparepart.id}`}
									>
										<div className="flex gap-3">
											{sparepart.imageUrl ? (
												<img
													src={sparepart.imageUrl}
													alt={sparepart.partsName}
													className="w-16 h-16 object-cover rounded-lg"
												/>
											) : (
												<div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
													<span className="text-xs text-muted-foreground">
														No image
													</span>
												</div>
											)}
											<div className="flex-1">
												<h3 className="font-medium text-gray-900">
													{sparepart.partsName}
												</h3>
												<p className="text-sm text-gray-500">
													Lokasi:{" "}
													{sparepart.toolLocation}
												</p>
											</div>
										</div>

										<div className="mt-3 flex flex-col gap-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-500">
													Tanggal Pembelian:
												</span>
												<span>
													{formatDate(
														sparepart.purchaseDate
													)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-500">
													Harga:
												</span>
												<span>
													{formatCurrency(
														sparepart.price
													)}
												</span>
											</div>
										</div>

										<div
											className="mt-4 flex justify-end gap-2"
											onClick={(e) => e.stopPropagation()}
										>
											<Button
												size="sm"
												variant="outline"
												onClick={(e) => {
													e.stopPropagation();
													navigateToEdit(
														sparepart.id
													);
												}}
											>
												<Edit className="h-4 w-4" />{" "}
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={(e) => {
													e.stopPropagation();
													confirmDelete(sparepart.id);
												}}
											>
												<Trash2 className="h-4 w-4" />{" "}
											</Button>
										</div>
									</div>
								))
							) : (
								<div className="text-center p-4 border rounded-lg">
									{search ||
									searchParams.has("purchaseDateStart") ||
									searchParams.has("purchaseDateEnd") ||
									searchParams.has("priceMin") ||
									searchParams.has("priceMax") ||
									searchParams.has("createdOnStart") ||
									searchParams.has("createdOnEnd") ||
									searchParams.has("modifiedOnStart") ||
									searchParams.has("modifiedOnEnd")
										? "Tidak ada suku cadang yang cocok dengan pencarian atau filter Anda"
										: "Tidak ada data suku cadang"}
								</div>
							)}
						</div>
					</div>

					<PaginationControls
						currentPage={paginationMeta.page}
						totalPages={paginationMeta.totalPages}
						onPageChange={handlePageChange}
					/>
				</>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				title="Hapus Suku Cadang"
				description="Apakah Anda yakin ingin menghapus suku cadang ini? Tindakan ini tidak dapat dibatalkan."
				onConfirm={handleDelete}
				isDeleting={isDeleting}
				deleteButtonText="Hapus"
				cancelButtonText="Batal"
			/>
		</div>
	);
}
