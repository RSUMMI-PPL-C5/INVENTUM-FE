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
import { Button } from "@/components/ui/button";
import { Search, FileDown } from "lucide-react";
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

interface CommentApiResponse {
	id: string;
	request?: {
		medicalEquipment?: string;
		requestType?: string;
	};
	createdAt?: string;
	text?: string;
	user?: {
		fullname?: string;
		role?: string;
	};
}

interface CommentData {
	id: string;
	equipment: string;
	requestType: string;
	date: string;
	comment: string;
	user: string;
	userRole: string;
}

export default function CommentsReport() {
	const [loading, setLoading] = useState(true);
	const [exporting, setExporting] = useState(false);
	const [data, setData] = useState<CommentData[]>([]);
	const [search, setSearch] = useState("");
	const [type, setType] = useState("all");
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(new Date().getFullYear(), 0, 1), // Jan 1st of current year
		to: new Date(),
	});

	useEffect(() => {
		fetchCommentsData();
	}, [search, date, type]);

	const fetchCommentsData = async () => {
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

			// Updated endpoint based on actual API structure
			const url =
				`${process.env.NEXT_PUBLIC_API_URL}/report/summary?` +
				`${type !== "all" ? `type=${type}&` : ""}` +
				`startDate=${startDate}&endDate=${endDate}&page=1&limit=100`;

			console.log("Fetching comments from:", url);

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
					toast.error(`Gagal memuat data tanggapan (${statusCode})`);
				}

				setData([]);
				return; // Exit the function early to avoid the throw
			}

			const result = await response.json();

			if (result.success && Array.isArray(result.data)) {
				// Use the proper CommentApiResponse type for the item parameter
				const formattedComments = result.data.map(
					(item: CommentApiResponse) => ({
						id: item.id,
						equipment: item.request?.medicalEquipment || "Unknown",
						requestType: item.request?.requestType || "Unknown",
						date: item.createdAt || "",
						comment: item.text || "",
						user: item.user?.fullname || "Unknown",
						userRole: item.user?.role || "Unknown",
					})
				);
				setData(formattedComments);
			} else {
				console.warn("API returned unexpected structure:", result);
				setData([]);
			}
		} catch (error) {
			// Handle unexpected errors (network issues, parsing problems, etc.)
			console.error("Error fetching comments data:", error);
			toast.error("Kesalahan jaringan saat memuat data tanggapan");
			setData([]);
		} finally {
			setLoading(false);
		}
	};

	// Function to export data to Excel
	const exportToExcel = async () => {
		try {
			setExporting(true);
			const token = Cookies.get("accessToken");

			// Format date params for the export
			const startDate = date?.from
				? date.from.toISOString().split("T")[0]
				: "2023-01-01";
			const endDate = date?.to
				? date.to.toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0];

			// Construct the export URL with the same filters as the current view
			const exportUrl =
				`${process.env.NEXT_PUBLIC_API_URL}/report/export?` +
				`${type !== "all" ? `type=${type}&` : ""}` +
				`startDate=${startDate}&endDate=${endDate}`;

			console.log("Exporting data from:", exportUrl);

			// Fetch with blob response type for file download
			const response = await fetch(exportUrl, {
				method: "GET",
				headers: {
					Authorization: token ? `Bearer ${token}` : "",
					// No Content-Type header as we're expecting a file
				},
			});

			if (!response.ok) {
				throw new Error(
					`Export failed: ${response.status} ${response.statusText}`
				);
			}

			// Get the file blob
			const blob = await response.blob();

			// Create a URL for the blob
			const downloadUrl = window.URL.createObjectURL(blob);

			// Create a temporary link to trigger download
			const a = document.createElement("a");
			a.href = downloadUrl;

			// Set the filename from Content-Disposition header if available
			const contentDisposition = response.headers.get(
				"Content-Disposition"
			);
			let filename = "tanggapan.xlsx"; // Default filename

			if (contentDisposition) {
				const filenameMatch =
					/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
						contentDisposition
					);
				if (filenameMatch && filenameMatch[1]) {
					filename = filenameMatch[1].replace(/['"]/g, "");
				}
			}

			a.download = filename;
			document.body.appendChild(a);
			a.click();

			// Clean up
			window.URL.revokeObjectURL(downloadUrl);
			document.body.removeChild(a);
			toast.success("Data berhasil diekspor ke Excel");
		} catch (error) {
			console.error("Error exporting to Excel:", error);
			toast.error("Gagal ekspor data ke Excel");
		} finally {
			setExporting(false);
		}
	};

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
				<h2 className="text-base sm:text-lg font-medium">
					Rekap Tanggapan dan Komentar
				</h2>

				<div className="flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:w-64">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Cari komentar atau peralatan..."
							className="pl-8 text-xs sm:text-sm"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<Select value={type} onValueChange={setType}>
						<SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm h-9 sm:h-10">
							<SelectValue placeholder="Jenis Permintaan" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem
								value="all"
								className="text-xs sm:text-sm"
							>
								Semua Permintaan
							</SelectItem>
							<SelectItem
								value="MAINTENANCE"
								className="text-xs sm:text-sm"
							>
								Pemeliharaan
							</SelectItem>
							<SelectItem
								value="CALIBRATION"
								className="text-xs sm:text-sm"
							>
								Kalibrasi
							</SelectItem>
						</SelectContent>
					</Select>

					<DateRangePicker
						date={date}
						onDateChange={setDate}
						className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
					/>

					{/* Export button moved to upper section */}
					<Button
						variant="default"
						size="sm"
						className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-xs sm:text-sm"
						onClick={exportToExcel}
						disabled={exporting || loading || data.length === 0}
					>
						<FileDown className="h-4 w-4 mr-1" />
						{exporting ? "Mengekspor..." : "Ekspor Excel"}
					</Button>
				</div>
			</div>

			{loading ? (
				<div className="py-8 text-center text-xs sm:text-sm">
					Memuat data...
				</div>
			) : data.length === 0 ? (
				<div className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
					Tidak ada data tanggapan
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
										Jenis Permintaan
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Tanggal
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Komentar
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Pengguna
									</TableHead>
									<TableHead className="text-xs sm:text-sm">
										Jabatan
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
											{item.requestType}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{formatDate(item.date)}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{item.comment}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{item.user}
										</TableCell>
										<TableCell className="text-xs sm:text-sm">
											{item.userRole}
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
											Jenis:
										</span>
										<span>{item.requestType}</span>
									</div>

									<div className="mt-2">
										<span className="text-gray-500">
											Komentar:
										</span>
										<p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded">
											{item.comment}
										</p>
									</div>

									<div className="flex justify-between mt-2">
										<span className="text-gray-500">
											Pengguna:
										</span>
										<span>{item.user}</span>
									</div>

									<div className="flex justify-between">
										<span className="text-gray-500">
											Jabatan:
										</span>
										<span>{item.userRole}</span>
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
