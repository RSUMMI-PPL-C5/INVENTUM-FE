/* eslint-disable */
"use client";

import { useState, useEffect, useRef, use } from "react";
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
import RequestFilterModal, {
	type RequestFilters as Filters,
} from "@/components/general/request-filter-modal";
import { toast } from "sonner";
import Cookies from "js-cookie";
import DeleteDialog from "@/components/general/delete-dialog";
import StatusChangeModal from "@/components/general/status-change-modal";
import { PaginationControls } from "@/components/ui/pagination-control";

type MaintenanceRequest = {
	id: string;
	userId: string;
	medicalEquipment: string;
	complaint: string | null;
	status: string;
	createdOn: string | null;
	modifiedOn: string;
};

type PaginationMeta = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export default function MaintenanceRequestDisplay() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// State for status change modal
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [selectedRequest, setSelectedRequest] =
		useState<MaintenanceRequest | null>(null);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	// Initialize state from URL params
	const [maintenanceRequests, setMaintenanceRequests] = useState<
		MaintenanceRequest[]
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
	const [role, setRole] = useState("");

	useEffect(() => {
		const user = Cookies.get("user");

		if (user) {
			const { role } = JSON.parse(user);
			setRole(role);
		}
	}, []);

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
		router.push(`/dashboard/maintenance-request?${params.toString()}`, {
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

	const fetchMaintenanceRequests = async () => {
		try {
			setLoading(true);
			const token = Cookies.get("accessToken");
			const queryParams = buildQueryParams(filters);

			const currentPage = searchParams.get("page")
				? Number.parseInt(searchParams.get("page") as string)
				: 1;

			let url = `${process.env.NEXT_PUBLIC_API_URL}/request/maintenance`;

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
						Error fetching maintenance requests:
						<br />
						{result.message}
					</>
				);
				return;
			}

			setMaintenanceRequests(result.data);
			setPaginationMeta(result.meta);
		} catch (error) {
			console.error("Error fetching maintenance requests:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Error fetching maintenance requests"
			);
		} finally {
			setLoading(false);
		}
	};

	const confirmDelete = (requestId: string) => {
		setRequestToDelete(requestId);
		setShowDeleteDialog(true);
	};

	const handleDelete = async () => {
		if (!requestToDelete) return;

		setIsDeleting(true); // Mulai proses penghapusan
		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/request/maintenance/${requestToDelete}`,
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
						Error deleting maintenance request:
						<br />
						{result.message}
					</>
				);
				return;
			}

			fetchMaintenanceRequests();
			toast.info("Permintaan pemeliharaan berhasil dihapus");
		} catch (error) {
			console.error("Error deleting maintenance request:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Error deleting maintenance request"
			);
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
			setRequestToDelete(null);
		}
	};

	const handleStatusChange = async (newStatus: string) => {
		if (!selectedRequest) return;

		setIsUpdatingStatus(true);
		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/request/${selectedRequest.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
					body: JSON.stringify({ status: newStatus }),
				}
			);

			const result = await response.json();

			if (!response.ok) {
				toast.error(
					<>
						Error updating status:
						<br />
						{result.message}
					</>
				);
				return;
			}

			fetchMaintenanceRequests();
			toast.success("Status berhasil diperbarui");
			setShowStatusModal(false);
			setSelectedRequest(null);
		} catch (error) {
			console.error("Error updating status:", error);
			toast.error(
				error instanceof Error ? error.message : "Error updating status"
			);
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const openStatusChangeModal = (
		e: React.MouseEvent,
		request: MaintenanceRequest
	) => {
		e.stopPropagation();
		setSelectedRequest(request);
		setShowStatusModal(true);
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
		fetchMaintenanceRequests();
	}, [searchParams]);

	const hasRun = useRef(false);

	useEffect(() => {
		if (hasRun.current) return;

		const success = searchParams.get("success");

		if (success === "create") {
			setTimeout(
				() => toast.info("Permintaan pemeliharaan berhasil dibuat"),
				100
			);
		}
		if (success === "delete") {
			setTimeout(
				() => toast.info("Permintaan pemeliharaan berhasil dihapus"),
				100
			);
		}
		hasRun.current = true;
	}, [searchParams]);

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
		switch (status.toLowerCase()) {
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

	const navigateToRequestDetail = (requestId: string) => {
		router.push(
			`/dashboard/detail-request?type=maintenance&id=${requestId}`
		);
	};

	const navigateToRequestCreate = () => {
		toast.info("Pilih alat medis untuk permintaan maintenance");
		router.push(`/dashboard/medical-equipment`);
	};

	return (
		<div className="space-y-6 font-plus-jakarta-sans">
			<h1 className="text-header-h5 font-bold font-poppins">
				Permintaan Pemeliharaan
			</h1>

			{/* Header Section */}
			<div className="bg-primary-solid p-4 md:p-2 flex flex-col md:flex-row items-center gap-3 h-fit text-white rounded-lg overflow-hidden">
				<div className="hidden md:flex items-center justify-center w-[200px] md:w-[264px] h-[150px] md:h-[224px] border border-primary-super-light rounded-lg shrink-0">
					illustration
				</div>

				<div className="flex flex-col gap-4 md:gap-6 py-3 md:py-6 px-2 md:px-6 text-left">
					<div className="space-y-2">
						<h2 className="text-xl md:text-header-h6 font-bold font-poppins">
							Permintaan Pemeliharaan
						</h2>
						<p className="text-sm md:text-s-medium">
							Kelola, pantau, dan atur semua permintaan
							pemeliharaan alat medis dalam sistem, termasuk
							penambahan, pembaruan, status, dan catatan.
						</p>
					</div>
					<Button
						variant="ghost"
						className="w-full md:w-fit"
						onClick={() => navigateToRequestCreate()}
					>
						<Plus className="mr-2 h-4 w-4" /> Tambah Permintaan
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
						placeholder="Cari permintaan pemeliharaan..."
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
						Memuat Permintaan Pemeliharaan...
					</div>
				</div>
			)}

			{/* Maintenance Request Table */}
			{!loading && (
				<>
					{/* Desktop View */}
					<div className="border rounded-lg overflow-hidden hidden md:block">
						<Table data-testid="maintenance-requests-table">
							<TableHeader>
								<TableRow>
									<TableHead>Kode Inventaris</TableHead>
									<TableHead>Nama Alat</TableHead>
									<TableHead>Catatan</TableHead>
									<TableHead>Status</TableHead>
									{["Fasum", "Admin"].includes(role) && (
										<TableHead>Aksi</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{maintenanceRequests.length > 0 ? (
									maintenanceRequests.map((request) => (
										<TableRow
											key={request.id}
											className="cursor-pointer"
											onClick={() =>
												navigateToRequestDetail(
													request.id
												)
											}
											data-testid={`request-row-${request.id}`}
										>
											<TableCell>
												{request.medicalEquipment}
											</TableCell>
											<TableCell>
												{request.medicalEquipment}
											</TableCell>
											<TableCell>
												<div className="max-w-xs truncate">
													{request.complaint || "-"}
												</div>
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													className={`px-4 py-1 rounded-full text-xs font-medium ${getStatusClass(
														request.status
													)}`}
													data-testid={`status-button-${request.id}`}
												>
													{getStatusText(
														request.status
													)}
												</Button>
											</TableCell>
											{["Fasum", "Admin"].includes(
												role
											) && (
												<TableCell>
													<Button
														size="icon"
														variant="outline"
														onClick={(e) =>
															openStatusChangeModal(
																e,
																request
															)
														}
														data-testid={`edit-button-${request.id}`}
													>
														<Edit className="h-4 w-4" />
													</Button>
												</TableCell>
											)}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={5}
											className="text-center"
										>
											{search
												? "Tidak ada permintaan pemeliharaan yang cocok dengan pencarian Anda"
												: "Tidak ada permintaan pemeliharaan yang ditemukan"}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Card View */}
					<div className="md:hidden">
						<div className="grid grid-cols-1 gap-4">
							{maintenanceRequests.length > 0 ? (
								maintenanceRequests.map((request) => (
									<div
										key={`card-${request.id}`}
										className="border rounded-lg p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
										onClick={() =>
											navigateToRequestDetail(request.id)
										}
										data-testid={`request-card-${request.id}`}
									>
										<div className="flex justify-between items-start mb-3">
											<div>
												<h3 className="font-medium text-gray-900">
													{request.medicalEquipment}
												</h3>
												<p className="text-sm text-gray-500">
													Kode:{" "}
													{request.medicalEquipment}
												</p>
											</div>
											<div
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												<Button
													variant="ghost"
													size="sm"
													className={`rounded-full text-xs font-medium ${getStatusClass(
														request.status
													)}`}
													data-testid={`status-button-mobile-${request.id}`}
												>
													{getStatusText(
														request.status
													)}
												</Button>
											</div>
										</div>

										<div className="mt-3">
											<p className="text-sm text-gray-500">
												Catatan:
											</p>
											<p className="text-sm">
												{request.complaint || "-"}
											</p>
										</div>

										{["Fasum", "Admin"].includes(role) && (
											<div className="mt-4 flex justify-end">
												<Button
													size="sm"
													variant="outline"
													onClick={(e) =>
														openStatusChangeModal(
															e,
															request
														)
													}
													data-testid={`edit-button-mobile-${request.id}`}
												>
													<Edit className="h-4 w-4 mr-1" />{" "}
													Ubah Status
												</Button>
											</div>
										)}
									</div>
								))
							) : (
								<div className="text-center p-4 border rounded-lg">
									{search
										? "Tidak ada permintaan pemeliharaan yang cocok dengan pencarian Anda"
										: "Tidak ada permintaan pemeliharaan yang ditemukan"}
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
				<RequestFilterModal
					isOpen={showFilterModal}
					filters={filters}
					onConfirm={handleFilterApply}
					onCancel={() => setShowFilterModal(false)}
				/>
			)}

			<DeleteDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				title="Hapus Permintaan Pemeliharaan"
				description="Apakah Anda yakin ingin menghapus permintaan pemeliharaan ini? Tindakan ini tidak dapat dibatalkan."
				onConfirm={handleDelete}
				isDeleting={isDeleting}
				deleteButtonText="Hapus"
				cancelButtonText="Batal"
			/>

			{showStatusModal && selectedRequest && (
				<StatusChangeModal
					open={showStatusModal}
					onOpenChange={(open) => {
						setShowStatusModal(open);
						if (!open) setSelectedRequest(null);
					}}
					currentStatus={selectedRequest.status}
					onConfirm={handleStatusChange}
					isUpdating={isUpdatingStatus}
					title="Ubah Status Permintaan Pemeliharaan"
					getStatusText={getStatusText}
				/>
			)}
		</div>
	);
}
