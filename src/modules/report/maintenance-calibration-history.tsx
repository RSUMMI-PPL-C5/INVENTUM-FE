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
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface HistoryProps {
	type: "MAINTENANCE" | "CALIBRATION";
}

// Updated interface to match the actual API response structure based on the models
interface HistoryItem {
	id: string;
	medicalEquipmentId: string;
	medicalEquipment: {
		id: string;
		inventorisId: string;
		name: string;
		brandName: string;
		modelName: string;
		// Other equipment properties
	};
	actionPerformed: string;
	technician: string;
	result: string; // Success, Partial, Failed
	// Common fields
	createdBy: string;
	createdOn: string;
	// Maintenance specific fields
	maintenanceDate?: string;
	// Calibration specific fields
	calibrationDate?: string;
	calibrationMethod?: string;
	nextCalibrationDue?: string;
	// For backward compatibility
	completedDate?: string;
	notes?: string;
	status?: string;
	type?: string;
}

export default function MaintenanceCalibrationHistory({
	type,
}: Readonly<HistoryProps>) {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<HistoryItem[]>([]);
	const [search, setSearch] = useState("");
	const [resultFilter, setResultFilter] = useState("all");
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(new Date().getFullYear(), 0, 1), // Jan 1st of current year
		to: new Date(),
	});

	useEffect(() => {
		fetchHistory();
	}, [type, search, date, resultFilter]);

	const fetchHistory = async () => {
		try {
			setLoading(true);
			const token = Cookies.get("accessToken");

			// Format date params
			const startDate = date?.from
				? date.from.toISOString().split("T")[0]
				: "2023-01-01";
			const endDate = date?.to
				? date.to.toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0];

			// Include the result filter
			const apiUrl: string =
				`${process.env.NEXT_PUBLIC_API_URL}/report/results?` +
				`type=${type}&search=${search}` +
				`&result=${resultFilter}&startDate=${startDate}` +
				`&endDate=${endDate}&page=1&limit=100`;

			console.log(`Fetching ${type} history data from:`, apiUrl);

			const apiResponse = await fetch(apiUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token ? `Bearer ${token}` : "",
				},
			});

			if (!apiResponse.ok) {
				// Handle error...
				const statusCode = apiResponse.status;
				console.error(`API Error (${statusCode})`);
				toast.error(`Gagal memuat data hasil (${statusCode})`);
				setData([]);
				return;
			}

			const apiResult = await apiResponse.json();
			console.log("History data:", apiResult);

			if (apiResult.success && Array.isArray(apiResult.data)) {
				setData(apiResult.data);
			} else {
				console.warn(
					"API returned success=false or non-array data:",
					apiResult
				);
				setData([]);
			}
		} catch (error) {
			console.error("Error fetching history:", error);
			toast.error(`Kesalahan jaringan saat memuat data hasil`);
			setData([]);
		} finally {
			setLoading(false);
		}
	};

	const getResultBadgeVariant = (result: string) => {
		// API uses "Success", "Partial", "Failed" values
		switch (result.toLowerCase()) {
			case "success":
				return "default";
			case "partial":
				return "secondary";
			case "failed":
				return "destructive";
			default:
				return "outline";
		}
	};

	// Get the completed date depending on type
	const getCompletedDate = (item: HistoryItem): string => {
		if (type === "MAINTENANCE") {
			return (
				item.maintenanceDate ||
				item.completedDate ||
				item.createdOn ||
				""
			);
		} else {
			return (
				item.calibrationDate ||
				item.completedDate ||
				item.createdOn ||
				""
			);
		}
	};

	// Get notes or action performed
	const getNotes = (item: HistoryItem): string => {
		return item.actionPerformed || item.notes || "";
	};

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
				<h2 className="text-base sm:text-lg font-medium">
					Hasil{" "}
					{type === "MAINTENANCE" ? "Pemeliharaan" : "Kalibrasi"}
				</h2>

				<div className="flex flex-col sm:flex-row gap-3">
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

					<Select
						value={resultFilter}
						onValueChange={setResultFilter}
					>
						<SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm h-9 sm:h-10">
							<SelectValue placeholder="Filter Hasil" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem
								value="all"
								className="text-xs sm:text-sm"
							>
								Semua Hasil
							</SelectItem>
							<SelectItem
								value="success"
								className="text-xs sm:text-sm"
							>
								Sukses
							</SelectItem>
							<SelectItem
								value="partial"
								className="text-xs sm:text-sm"
							>
								Sukses Sebagian
							</SelectItem>
							<SelectItem
								value="failed"
								className="text-xs sm:text-sm"
							>
								Gagal
							</SelectItem>
						</SelectContent>
					</Select>

					<DateRangePicker
						date={date}
						onDateChange={setDate}
						className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
					/>
				</div>
			</div>

			{loading ? (
				<div className="py-8 text-center text-xs sm:text-sm">
					Memuat data...
				</div>
			) : data.length === 0 ? (
				<div className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
					Tidak ada data hasil{" "}
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
										Tanggal Selesai
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Hasil
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Teknisi
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Catatan
									</TableHead>
									{type === "CALIBRATION" && (
										<TableHead className="text-xs sm:text-sm">
											Kalibrasi Berikutnya
										</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-medium text-xs sm:text-sm">
											{item.medicalEquipment?.name || "-"}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{formatDate(getCompletedDate(item))}
										</TableCell>
										<TableCell>
											<Badge
												variant={getResultBadgeVariant(
													item.result ||
														item.status ||
														""
												)}
												className="text-xs"
											>
												{item.result ||
													item.status ||
													"-"}
											</Badge>
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{item.technician || "-"}
										</TableCell>
										<TableCell className="max-w-[200px] truncate text-xs sm:text-sm">
											{getNotes(item)}
										</TableCell>
										{type === "CALIBRATION" && (
											<TableCell className="text-xs sm:text-sm">
												{item.nextCalibrationDue
													? formatDate(
															item.nextCalibrationDue
													  )
													: "-"}
											</TableCell>
										)}
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
										{item.medicalEquipment?.name || "-"}
									</h3>
									<Badge
										variant={getResultBadgeVariant(
											item.result || item.status || ""
										)}
										className="text-xs"
									>
										{item.result || item.status || "-"}
									</Badge>
								</div>

								<div className="space-y-2 text-xs">
									<div className="flex justify-between">
										<span className="text-gray-500">
											Tanggal Selesai:
										</span>
										<span>
											{formatDate(getCompletedDate(item))}
										</span>
									</div>

									<div className="flex justify-between">
										<span className="text-gray-500">
											Teknisi:
										</span>
										<span>{item.technician || "-"}</span>
									</div>

									{type === "CALIBRATION" && (
										<div className="flex justify-between">
											<span className="text-gray-500">
												Kalibrasi Berikutnya:
											</span>
											<span>
												{item.nextCalibrationDue
													? formatDate(
															item.nextCalibrationDue
													  )
													: "-"}
											</span>
										</div>
									)}

									<div className="mt-2">
										<span className="text-gray-500">
											Catatan:
										</span>
										<p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded">
											{getNotes(item)}
										</p>
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
