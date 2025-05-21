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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatDate, formatCurrency } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface PartReportItem {
	id: string;
	equipment: string;
	partName: string;
	quantity: number;
	date: string;
	technician: string;
	cost: number;
}

export default function PartsReport() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<PartReportItem[]>([]);
	const [search, setSearch] = useState("");
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(new Date().getFullYear(), 0, 1), // Jan 1st of current year
		to: new Date(),
	});

	useEffect(() => {
		fetchPartsData();
	}, [search, date]);

	const fetchPartsData = async () => {
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

			// Updated to use the correct endpoint for parts data
			const url =
				`${process.env.NEXT_PUBLIC_API_URL}/report/results?` +
				`type=PARTS&search=${search}&startDate=${startDate}&endDate=${endDate}&page=1&limit=100`;

			console.log("Fetching parts data from:", url);

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
						`Gagal memuat data penggantian suku cadang (${statusCode})`
					);
				}

				setData([]);
				return; // Exit the function early to avoid the throw
			}

			const result = await response.json();

			if (result.success && Array.isArray(result.data)) {
				// Add proper type annotation for the item parameter
				const formattedData = result.data.map((item: any) => ({
					id: item.id,
					equipment: item.medicalEquipment?.name || "Unknown",
					partName: item.sparepart?.partsName || "Unknown Part",
					quantity: 1, // Default to 1 if not specified
					date: item.replacementDate || item.date || "",
					technician: item.technician || "Unknown",
					cost: item.sparepart?.price || 0,
				}));
				setData(formattedData);
			} else {
				console.warn(
					"API returned success=false or non-array data:",
					result
				);
				setData([]);
			}
		} catch (error) {
			console.error("Error fetching parts data:", error);
			toast.error(
				"Kesalahan jaringan saat memuat data penggantian suku cadang"
			);
			setData([]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
				<h2 className="text-base sm:text-lg font-medium">
					Penggantian Suku Cadang
				</h2>

				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative w-full sm:w-64">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Cari peralatan atau parts..."
							className="pl-8 text-xs sm:text-sm"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

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
					Tidak ada data penggantian suku cadang
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
										Nama Suku Cadang
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Jumlah
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Tanggal
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Teknisi
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Biaya
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-medium text-xs sm:text-sm">
											{item.equipment}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{item.partName}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{item.quantity}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{formatDate(item.date)}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{item.technician}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{formatCurrency(item.cost)}
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
										{item.equipment}
									</h3>
									<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
										{formatDate(item.date)}
									</span>
								</div>

								<div className="space-y-2 text-xs">
									<div className="flex justify-between">
										<span className="text-gray-500">
											Suku Cadang:
										</span>
										<span className="font-medium">
											{item.partName}
										</span>
									</div>

									<div className="flex justify-between">
										<span className="text-gray-500">
											Jumlah:
										</span>
										<span>{item.quantity}</span>
									</div>

									<div className="flex justify-between">
										<span className="text-gray-500">
											Teknisi:
										</span>
										<span>{item.technician}</span>
									</div>

									<div className="flex justify-between">
										<span className="text-gray-500">
											Biaya:
										</span>
										<span className="font-medium">
											{formatCurrency(item.cost)}
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
