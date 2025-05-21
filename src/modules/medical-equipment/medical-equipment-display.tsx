/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit, Trash2, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import MedicalEquipmentFilterModal, {
	type MedicalEquipmentFilters as Filters,
} from "@/components/general/medicalequipment-filter-modal";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { PaginationControls } from "@/components/ui/pagination-control";
import DeleteDialog from "@/components/general/delete-dialog";
import { formatDate } from "@/lib/utils";

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

interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export default function MedicalEquipmentPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(
		null
	);
	const [isDeleting, setIsDeleting] = useState(false);

	// Initialize state from URL params
	const [medicalEquipments, setMedicalEquipments] = useState<
		MedicalEquipment[]
	>([]);
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
		total: 0,
		page: searchParams.get("page")
			? parseInt(searchParams.get("page") as string)
			: 1,
		limit: 10,
		totalPages: 1,
	});
	const [search, setSearch] = useState(searchParams.get("search") || "");
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [loading, setLoading] = useState(true);

	// Initialize filters from URL params
	const [filters, setFilters] = useState<Filters>(() => {
		const initialFilters: Filters = {
			status: searchParams.getAll("status"),
			createdOnStart: searchParams.get("createdOnStart")
				? new Date(searchParams.get("createdOnStart") as string)
				: null,
			createdOnEnd: searchParams.get("createdOnEnd")
				? new Date(searchParams.get("createdOnEnd") as string)
				: null,
			modifiedOnStart: searchParams.get("modifiedOnStart")
				? new Date(searchParams.get("modifiedOnStart") as string)
				: null,
			modifiedOnEnd: searchParams.get("modifiedOnEnd")
				? new Date(searchParams.get("modifiedOnEnd") as string)
				: null,
		};
		return initialFilters;
	});

	// Function to update URL with current filters, search and pagination
	const updateURLParams = (
		newParams: Record<string, string | string[] | null | undefined>
	) => {
		const params = new URLSearchParams(searchParams.toString());

		// Clear existing filter params to avoid duplicates
		[
			"search",
			"page",
			"status",
			"createdOnStart",
			"createdOnEnd",
			"modifiedOnStart",
			"modifiedOnEnd",
		].forEach((param) => {
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
		router.push(`/dashboard/medical-equipment?${params.toString()}`, {
			scroll: false,
		});
	};

	const buildQueryParams = (filters: Filters): string => {
		const params = new URLSearchParams();

		filters.status.forEach((status) => {
			params.append("status", status);
		});

		if (filters.createdOnStart) {
			params.append(
				"createdOnStart",
				format(filters.createdOnStart, "yyyy-MM-dd")
			);
		}
		if (filters.createdOnEnd) {
			params.append(
				"createdOnEnd",
				format(filters.createdOnEnd, "yyyy-MM-dd")
			);
		}

		if (filters.modifiedOnStart) {
			params.append(
				"modifiedOnStart",
				format(filters.modifiedOnStart, "yyyy-MM-dd")
			);
		}

		if (filters.modifiedOnEnd) {
			params.append(
				"modifiedOnEnd",
				format(filters.modifiedOnEnd, "yyyy-MM-dd")
			);
		}

		return params.toString();
	};

	const fetchMedicalEquipments = async () => {
		try {
			setLoading(true);
			const token = Cookies.get("accessToken");
			const queryParams = buildQueryParams(filters);

			const currentPage = searchParams.get("page")
				? Number.parseInt(searchParams.get("page") as string)
				: 1;

			let url = `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment`;

			const paginationParams = `page=${currentPage}&limit=${paginationMeta.limit}`;

			if (queryParams || search || paginationParams) {
				const searchParam = search ? `search=${search}` : "";
				url += `?${[queryParams, searchParam, paginationParams]
					.filter(Boolean)
					.join("&")}`;
			}

			const response = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					Authorization: token ? `Bearer ${token}` : "",
				},
			});

			const result = await response.json();

			if (!response.ok) {
				toast.error(
					<>
						Error fetching medical equipment:
						<br />
						{result.message}
					</>
				);
				return;
			}

			setMedicalEquipments(result.data);
			setPaginationMeta(result.meta);
		} catch (error) {
			console.error("Error fetching medical equipment:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Error fetching medical equipment"
			);
		} finally {
			setLoading(false);
		}
	};

	const confirmDelete = (equipmentId: string) => {
		setEquipmentToDelete(equipmentId);
		setShowDeleteDialog(true);
	};

	const handleDelete = async () => {
		if (!equipmentToDelete) return;

		setIsDeleting(true); // Start deletion process
		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentToDelete}`,
				{
					method: "DELETE",
					headers: {
						Authorization: token ? `Bearer ${token}` : "",
						"Content-Type": "application/json",
					},
				}
			);

			const result = await response.json();

			if (!response.ok) {
				toast.error(
					<>
						Error deleting medical equipment:
						<br />
						{result.message}
					</>
				);
				return;
			}

			fetchMedicalEquipments();
			toast.info("Alat medis berhasil dihapus");
		} catch (error) {
			console.error("Error deleting medical equipment:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Error deleting medical equipment"
			);
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
			setEquipmentToDelete(null);
		}
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		updateURLParams({
			search: value || null,
			page: "1",
		});
	};

	const handleFilterApply = (newFilters: Filters) => {
		setFilters(newFilters);
		setShowFilterModal(false);

		updateURLParams({
			status: newFilters.status,
			createdOnStart: newFilters.createdOnStart
				? format(newFilters.createdOnStart, "yyyy-MM-dd")
				: null,
			createdOnEnd: newFilters.createdOnEnd
				? format(newFilters.createdOnEnd, "yyyy-MM-dd")
				: null,
			modifiedOnStart: newFilters.modifiedOnStart
				? format(newFilters.modifiedOnStart, "yyyy-MM-dd")
				: null,
			modifiedOnEnd: newFilters.modifiedOnEnd
				? format(newFilters.modifiedOnEnd, "yyyy-MM-dd")
				: null,
			page: "1",
		});
	};

	const handlePageChange = (page: number) => {
		updateURLParams({
			page: page.toString(),
		});
	};

	useEffect(() => {
		fetchMedicalEquipments();
	}, [searchParams]);

	const hasRun = useRef(false);

	useEffect(() => {
		if (hasRun.current) return;

		const success = searchParams.get("success");

		if (success === "create") {
			setTimeout(() => toast.info("Alat medis berhasil dibuat"), 100);
		}
		if (success === "delete") {
			setTimeout(() => toast.info("Alat medis berhasil dihapus"), 100);
		}
		hasRun.current = true;
	}, [searchParams]);

	const formatPrice = (price: number | null) => {
		if (price === null) return "-";
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const getStatusClass = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "bg-green-100 text-green-800";
			case "inactive":
				return "bg-red-100 text-red-800";
			case "maintenance":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusText = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "Aktif";
			case "inactive":
				return "Tidak Aktif";
			case "maintenance":
				return "Pemeliharaan";
			default:
				return status;
		}
	};

	const navigateToEquipmentEdit = (equipmentId: string) => {
		router.push(`/dashboard/medical-equipment/${equipmentId}/edit`);
	};

	const navigateToEquipmentDetail = (equipmentId: string) => {
		router.push(`/dashboard/medical-equipment/${equipmentId}`);
	};

	const navigateToEquipmentCreate = () => {
		router.push(`/dashboard/medical-equipment/create`);
	};

	return (
		<div className="space-y-6 font-plus-jakarta-sans">
			<h1 className="text-header-h5 font-bold font-poppins">
				Alat Medis
			</h1>

			{/* Header Section */}
			<div className="bg-primary-solid p-4 md:p-2 flex flex-col md:flex-row items-center gap-3 h-fit text-white rounded-lg overflow-hidden">
				<div className="hidden md:flex items-center justify-center w-[200px] md:w-[264px] h-[150px] md:h-[224px] border border-primary-super-light rounded-lg shrink-0">
					illustration
				</div>

				<div className="flex flex-col gap-4 md:gap-6 py-3 md:py-6 px-2 md:px-6 text-left">
					<div className="space-y-2">
						<h2 className="text-xl md:text-header-h6 font-bold font-poppins">
							Alat Medis
						</h2>
						<p className="text-sm md:text-s-medium">
							Kelola, pantau, dan atur semua alat medis dalam
							sistem, termasuk penambahan, pembaruan, penghapusan,
							serta pengelolaan status alat medis.
						</p>
					</div>
					<Button
						variant="ghost"
						className="w-full md:w-fit"
						onClick={() => navigateToEquipmentCreate()}
					>
						<Plus className="mr-2 h-4 w-4" /> Tambah Alat Medis
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
						placeholder="Cari alat medis ..."
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="w-full pl-10"
						data-testid="search-input"
					/>
				</div>
				<Button
					variant="outline"
					onClick={() => setShowFilterModal(true)}
					className="w-full sm:w-auto"
				>
					<Filter className="mr-2 h-4 w-4" /> Filter
				</Button>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="flex justify-center p-8">
					<div className="animate-pulse text-center">
						Memuat Alat Medis...
					</div>
				</div>
			)}

			{/* Medical Equipment Table */}
			{!loading && (
				<>
					{/* Desktop View */}
					<div className="border rounded-lg overflow-hidden hidden md:block">
						<Table data-testid="medical-equipments-table">
							<TableHeader>
								<TableRow>
									<TableHead>Nomor Inventaris</TableHead>
									<TableHead>Nama</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Harga</TableHead>
									<TableHead>Tanggal Pembelian</TableHead>
									<TableHead className="text-right">
										Aksi
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{medicalEquipments.length > 0 ? (
									medicalEquipments.map((equipment) => (
										<TableRow
											key={equipment.id}
											className="cursor-pointer"
											onClick={() =>
												navigateToEquipmentDetail(
													equipment.id
												)
											}
											data-testid={`equipment-row-${equipment.id}`}
										>
											<TableCell>
												{equipment.inventorisId}
											</TableCell>
											<TableCell>
												{equipment.name}
											</TableCell>
											<TableCell>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
														equipment.status
													)}`}
												>
													{getStatusText(
														equipment.status
													)}
												</span>
											</TableCell>
											<TableCell>
												{formatPrice(
													equipment.purchasePrice
												)}
											</TableCell>
											<TableCell>
												{formatDate(
													equipment.purchaseDate!
												)}
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
															navigateToEquipmentEdit(
																equipment.id
															);
														}}
														data-testid={`edit-button-${equipment.id}`}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														size="icon"
														variant="destructive"
														onClick={(e) => {
															e.stopPropagation();
															confirmDelete(
																equipment.id
															);
														}}
														data-testid={`delete-button-${equipment.id}`}
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
											colSpan={6}
											className="text-center"
										>
											{search
												? "Tidak ada alat medis yang cocok dengan pencarian Anda"
												: "Tidak ada alat medis yang ditemukan"}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Card View */}
					<div className="md:hidden">
						<div className="grid grid-cols-1 gap-4">
							{medicalEquipments.length > 0 ? (
								medicalEquipments.map((equipment) => (
									<div
										key={`card-${equipment.id}`}
										className="border rounded-lg p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
										onClick={() =>
											navigateToEquipmentDetail(
												equipment.id
											)
										}
										data-testid={`equipment-card-${equipment.id}`}
									>
										<div className="flex justify-between items-start mb-2">
											<div>
												<h3 className="font-medium text-gray-900">
													{equipment.name}
												</h3>
												<p className="text-sm text-gray-500">
													{equipment.inventorisId}
												</p>
											</div>
											<span
												className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
													equipment.status
												)}`}
											>
												{getStatusText(
													equipment.status
												)}
											</span>
										</div>
										<div className="mt-4 flex flex-col gap-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-500">
													Harga:
												</span>
												<span>
													{formatPrice(
														equipment.purchasePrice
													)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-500">
													Tanggal Pembelian:
												</span>
												<span>
													{equipment.purchaseDate
														? formatDate(
																equipment.purchaseDate
														  )
														: "-"}
												</span>
											</div>
										</div>
										<div className="mt-4 flex justify-end gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={(e) => {
													e.stopPropagation();
													navigateToEquipmentEdit(
														equipment.id
													);
												}}
											>
												<Edit className="h-4 w-4 mr-1" />{" "}
												Edit
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={(e) => {
													e.stopPropagation();
													confirmDelete(equipment.id);
												}}
											>
												<Trash2 className="h-4 w-4 mr-1" />{" "}
												Hapus
											</Button>
										</div>
									</div>
								))
							) : (
								<div className="text-center p-4 border rounded-lg">
									{search
										? "Tidak ada alat medis yang cocok dengan pencarian Anda"
										: "Tidak ada alat medis yang ditemukan"}
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

			{/* Filter Modal */}
			{showFilterModal && (
				<MedicalEquipmentFilterModal
					isOpen={showFilterModal}
					filters={filters}
					onConfirm={handleFilterApply}
					onCancel={() => setShowFilterModal(false)}
				/>
			)}

			<DeleteDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				title="Hapus Alat Medis"
				description="Apakah Anda yakin ingin menghapus alat medis ini? Tindakan ini tidak dapat dibatalkan."
				onConfirm={handleDelete}
				isDeleting={isDeleting}
				deleteButtonText="Hapus"
				cancelButtonText="Batal"
			/>
		</div>
	);
}
