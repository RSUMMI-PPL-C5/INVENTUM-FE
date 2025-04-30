/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
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
import UserFilterModal, {
	type Filters,
} from "@/components/general/user-filter-modal";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { PaginationControls } from "@/components/ui/pagination-control";

type User = {
	id: string;
	email: string;
	username: string;
	role: string | null;
	fullname: string | null;
	nokar: string;
	divisiId: number | null;
	waNumber: string | null;
	createdOn: string | null;
	modifiedOn: string;
	divisi: {
		id: string;
		divisi: string;
	};
};

type PaginationMeta = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export default function UsersPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	
	// Initialize state from URL params
	const [users, setUsers] = useState<User[]>([]);
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
		total: 0,
		page: searchParams.get("page") ? parseInt(searchParams.get("page") as string) : 1,
		limit: 10,
		totalPages: 1,
	});
	const [search, setSearch] = useState(searchParams.get("search") || "");
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [loading, setLoading] = useState(true);
	
	// Initialize filters from URL params
	const [filters, setFilters] = useState<Filters>(() => {
		const initialFilters: Filters = {
			role: searchParams.getAll("role"),
			division: searchParams.get("divisiId") || "",
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
	const updateURLParams = (newParams: Record<string, string | string[] | null | undefined>) => {
		const params = new URLSearchParams(searchParams.toString());
		
		// Clear existing filter params to avoid duplicates
		["search", "page", "role", "divisiId", "createdOnStart", "createdOnEnd", "modifiedOnStart", "modifiedOnEnd"].forEach(param => {
			params.delete(param);
		});

		// Add new params
		Object.entries(newParams).forEach(([key, value]) => {
			if (value === null || value === undefined || value === "") {
				return;
			}
			
			if (Array.isArray(value)) {
				value.forEach(val => {
					if (val) params.append(key, val);
				});
			} else {
				params.set(key, value);
			}
		});

		// Update URL without refreshing page
		router.push(`/dashboard/user?${params.toString()}`, { scroll: false });
	};

	const buildQueryParams = (filters: Filters): string => {
		const params = new URLSearchParams();
		
		filters.role.forEach((role) => {
			params.append("role", role);
		});

        if (filters.division) {
			params.append("divisiId", filters.division);
		}

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

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const token = Cookies.get("accessToken");
			const queryParams = buildQueryParams(filters);

			const currentPage = searchParams.get("page")
				? Number.parseInt(searchParams.get("page") as string)
				: 1;

			let url = `${process.env.NEXT_PUBLIC_API_URL}/user`;

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
                toast.error(<>Error fetching users:<br />{result.message}</>);                
                return;
            }

			setUsers(result.data);
			setPaginationMeta(result.meta);

		} catch (error) {
			console.error("Error fetching users:", error);
            toast.error(error instanceof Error ? error.message : 'Error fetching users');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (userId: string) => {
		if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
			return;
		}

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

            const result = await response.json();

			if (!response.ok) {
				toast.error(<>Error deleting user:<br />{result.message}</>);                
                return;
			}

			fetchUsers();
			toast.info("Pengguna berhasil dihapus");
		} catch (error) {
			console.error("Error deleting user:", error);
            toast.error(error instanceof Error ? error.message : 'Error deleting user');
		}
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		updateURLParams({
			search: value || null,
			page: "1"
		});
	};

	const handleFilterApply = (newFilters: Filters) => {
		setFilters(newFilters);
		setShowFilterModal(false);
		
		updateURLParams({
			role: newFilters.role,
			divisiId: newFilters.division || null,
			createdOnStart: newFilters.createdOnStart ? format(newFilters.createdOnStart, "yyyy-MM-dd") : null,
			createdOnEnd: newFilters.createdOnEnd ? format(newFilters.createdOnEnd, "yyyy-MM-dd") : null,
			modifiedOnStart: newFilters.modifiedOnStart ? format(newFilters.modifiedOnStart, "yyyy-MM-dd") : null,
			modifiedOnEnd: newFilters.modifiedOnEnd ? format(newFilters.modifiedOnEnd, "yyyy-MM-dd") : null,
			page: "1", 
		});
	};

	const handlePageChange = (page: number) => {
		updateURLParams({
			page: page.toString(),
		});
	};

	useEffect(() => {
		fetchUsers();
	}, [searchParams]);

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "-";
		try {
			return format(new Date(dateString), "dd MMM yyyy");
		} catch (_error) {
			console.error("Error formatting date:", _error);
			return dateString;
		}
	};

	const navigateToUserEdit = (userId: string) => {
		router.push(`/dashboard/user/${userId}/edit`);
	};

	const navigateToUserDetail = (userId: string) => {
		router.push(`/dashboard/user/${userId}`);
	};

	const navigateToUserCreate = () => {
		router.push(`/dashboard/user/create`);
	};

	return (
		<div className="space-y-6 font-plus-jakarta-sans">
			<h1 className="text-header-h5 font-bold font-poppins">Pengguna</h1>

			{/* Header Section */}
			<div className="bg-primary-solid items-center p-2 flex gap-3 h-fit text-white rounded-lg overflow-hidden">
				<div className="flex items-center justify-center w-[264px] h-[224px] border border-primary-super-light rounded-lg">
					illustration
				</div>

				<div className="flex flex-col gap-6 py-6 px-6">
					<div className="space-y-2">
						<h2 className="text-header-h6 font-bold font-poppins">
							Pengguna
						</h2>
						<p className="text-s-medium">
							Kelola, pantau, dan atur semua akun pengguna dalam
							sistem, termasuk pembuatan, pembaruan, penghapusan,
							serta pengelolaan{" "}
							<span className="italic">role</span> dan izin akses.
						</p>
					</div>
					<Button
						variant="ghost"
						className="w-fit"
						onClick={() => navigateToUserCreate()}
					>
						<Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
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
						placeholder="Cari pengguna ..."
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
						Memuat Pengguna...
					</div>
				</div>
			)}

			{/* Users Table */}
			{!loading && (
				<>
					<div className="border rounded-lg overflow-hidden">
						<Table data-testid="users-table">
							<TableHeader>
								<TableRow>
									<TableHead>Email</TableHead>
									<TableHead>Nama</TableHead>
									<TableHead>Divisi</TableHead>
									<TableHead>Tanggal Pembuatan</TableHead>
									<TableHead className="text-right">
										Aksi
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.length > 0 ? (
									users.map((user) => (
										<TableRow
											key={user.id}
											className="cursor-pointer"
											onClick={() =>
												navigateToUserDetail(user.id)
											}
											data-testid={`user-row-${user.id}`}
										>
											<TableCell>{user.email}</TableCell>
											<TableCell>
												{user.fullname ?? user.username}
											</TableCell>
											<TableCell>
												{user.divisi?.divisi ?? `-`}
											</TableCell>
											<TableCell>
												{formatDate(user.createdOn)}
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
															navigateToUserEdit(
																user.id
															);
														}}
														data-testid={`edit-button-${user.id}`}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														size="icon"
														variant="destructive"
														onClick={(e) => {
															e.stopPropagation();
															handleDelete(
																user.id
															);
														}}
														data-testid={`delete-button-${user.id}`}
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
												? "Tidak ada pengguna yang cocok dengan pencarian Anda"
												: "Tidak ada pengguna yang ditemukan"}
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

			{/* Filter Modal */}
			{showFilterModal && (
				<UserFilterModal
					isOpen={showFilterModal}
					filters={filters}
					onConfirm={handleFilterApply}
					onCancel={() => setShowFilterModal(false)}
				/>
			)}
		</div>
	);
}