"use client";

import { useState, useEffect } from "react";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface PlansProps {
	type: "MAINTENANCE" | "CALIBRATION";
}

interface PlanItem {
	id: string;
	medicalEquipment: string;
	createdOn: string;
	status: string;
	user: {
		fullname: string;
		divisiId: number;
	};
}

export default function MaintenanceCalibrationPlans({
	type,
}: Readonly<PlansProps>) {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<PlanItem[]>([]);
	const [search, setSearch] = useState("");

	useEffect(() => {
		fetchPlans();
	}, [type, search]);

	const fetchPlans = async () => {
		try {
			setLoading(true);
			const token = Cookies.get("accessToken");

			const url = `${process.env.NEXT_PUBLIC_API_URL}/report/plans?type=${type}&search=${search}`;

			console.log(`Fetching ${type} plans data from:`, url);

			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token ? `Bearer ${token}` : "",
				},
			});

			if (!response.ok) {
				// Get more details about the error
				const statusCode = response.status;
				const statusText = response.statusText;

				console.error(`API Error (${statusCode}): ${statusText}`);

				// Show a more specific error message based on the status code
				if (statusCode === 401 || statusCode === 403) {
					toast.error("Akses ditolak. Silakan login kembali.");
				} else if (statusCode === 404) {
					toast.error(
						"API endpoint tidak ditemukan. Hubungi administrator."
					);
				} else if (statusCode >= 500) {
					toast.error("Server sedang bermasalah. Coba lagi nanti.");
				} else {
					toast.error(
						`Gagal memuat data rencana ${
							type === "MAINTENANCE"
								? "pemeliharaan"
								: "kalibrasi"
						} (${statusCode})`
					);
				}

				setData([]);
				return; // Exit the function early to avoid the throw
			}

			const result = await response.json();

			if (result.success && Array.isArray(result.data)) {
				setData(result.data);
			} else {
				console.warn(
					"API returned success=false or non-array data:",
					result
				);
				setData([]);
				toast.error("Format data tidak sesuai");
			}
		} catch (error) {
			console.error("Error fetching plans:", error);
			toast.error("Kesalahan jaringan saat memuat data rencana");
			setData([]);
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "Completed":
				return "default";
			case "Pending":
				return "secondary";
			case "Rejected":
				return "destructive";
			default:
				return "outline";
		}
	};

	return (
		<div>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
				<h2 className="text-base sm:text-lg font-medium">
					Rencana{" "}
					{type === "MAINTENANCE" ? "Pemeliharaan" : "Kalibrasi"}
				</h2>

				<div className="relative w-full sm:w-64">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Cari peralatan..."
						className="pl-8 text-xs sm:text-sm"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			{loading ? (
				<div className="py-8 text-center text-xs sm:text-sm">
					Memuat data...
				</div>
			) : data.length === 0 ? (
				<div className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
					Tidak ada data rencana{" "}
					{type === "MAINTENANCE" ? "pemeliharaan" : "kalibrasi"}
				</div>
			) : (
				<>
					{/* Desktop Table View */}
					<div className="hidden md:block overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-xs sm:text-sm">
										Peralatan
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Tanggal Rencana
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Lokasi
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Status
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-medium text-xs sm:text-sm">
											{item.medicalEquipment}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{formatDate(item.createdOn)}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											Divisi {item.user?.divisiId || "-"}
										</TableCell>
										<TableCell>
											<Badge
												variant={getStatusBadgeVariant(
													item.status
												)}
												className="text-xs"
											>
												{item.status}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Card View */}
					<div className="md:hidden space-y-4">
						{data.map((item) => (
							<div
								key={`card-${item.id}`}
								className="border rounded-lg p-4 shadow-sm"
							>
								<div className="flex justify-between items-start mb-3">
									<h3 className="font-medium text-sm">
										{item.medicalEquipment}
									</h3>
									<Badge
										variant={getStatusBadgeVariant(
											item.status
										)}
										className="text-xs"
									>
										{item.status}
									</Badge>
								</div>

								<div className="space-y-2 text-xs">
									<div className="flex justify-between">
										<span className="text-gray-500">
											Tanggal Rencana:
										</span>
										<span>
											{formatDate(item.createdOn)}
										</span>
									</div>

									<div className="flex justify-between">
										<span className="text-gray-500">
											Lokasi:
										</span>
										<span>
											Divisi {item.user?.divisiId || "-"}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}
