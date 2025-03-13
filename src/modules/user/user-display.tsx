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
import UserFilterModal, {
	type Filters,
} from "@/components/general/filter-modal";
import { toast } from "sonner";

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
	divisi?: {
		name: string;
	};
};

const divisionMapping: Record<string, number> = {
	"Divisi A": 1,
	"Divisi B": 2,
	"Divisi C": 3,
};

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState("");
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [filters, setFilters] = useState<Filters>({
		role: [],
		division: [],
		createdOnStart: null,
		createdOnEnd: null,
		modifiedOnStart: null,
		modifiedOnEnd: null,
	});
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const params = new URLSearchParams();
    const searchParams = useSearchParams();

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const queryParams = buildQueryParams(filters);
			let url = `${process.env.NEXT_PUBLIC_API_URL}/user`;

			if (queryParams || search) {
				const searchParam = search ? `search=${search}` : "";
				url += `?${[queryParams, searchParam]
					.filter(Boolean)
					.join("&")}`;
			}

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error("Failed to fetch users");
			}

			const data = await response.json();
			setUsers(data);
		} catch (err) {
			console.error("Error fetching users:", err);
		} finally {
			setLoading(false);
		}
	};

	const buildQueryParams = (filters: Filters): string => {
		filters.role.forEach((role) => {
			params.append("role", role);
		});

		filters.division.forEach((div) => {
			const id = divisionMapping[div];
			if (id) {
				params.append("divisiId", id.toString());
			}
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

	const handleDelete = async (userId: string) => {
		if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
			return;
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				throw new Error("Gagal menghapus pengguna");
			}

			fetchUsers();
            toast.info('Pengguna berhasil dihapus')
		} catch {
			alert("Gagal menghapus pengguna");
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [search, filters]);

    const hasRun = useRef(false); 

    useEffect(() => {
        if (hasRun.current) return; 

        const success = searchParams.get("success");

        if (success === "create") {
            setTimeout(() => toast.info("Pengguna berhasil dibuat"), 100);
        }
        if (success === "delete") {
            setTimeout(() => toast.info("Pengguna berhasil dihapus"), 100);
        }
        hasRun.current = true; 
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
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10" // Added left padding to make room for the icon
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
											{user.fullname || user.username}
										</TableCell>
										<TableCell>
											{user.divisi?.name || `-`}
										</TableCell>
										<TableCell>
											{formatDate(user.createdOn)}
										</TableCell>
										<TableCell
											className="text-right"
											onClick={(e) => e.stopPropagation()}
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
														handleDelete(user.id);
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
			)}

			{/* Filter Modal */}
			{showFilterModal && (
				<UserFilterModal
					isOpen={showFilterModal}
					filters={filters}
					onConfirm={(newFilters) => {
						setFilters(newFilters);
						setShowFilterModal(false);
					}}
					onCancel={() => setShowFilterModal(false)}
				/>
			)}
		</div>
	);
}
