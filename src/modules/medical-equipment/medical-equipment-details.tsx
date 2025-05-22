"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
	ArrowLeft,
	Activity,
	Barcode,
	Building,
	Calendar,
	Clock,
	ClipboardCheck,
	DollarSign,
	FileCheck,
	Filter,
	Layers,
	MapPin,
	Package,
	Pencil,
	RefreshCw,
	Sliders,
	Stethoscope,
	Tag,
	Trash2,
	Wrench,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/general/delete-dialog";
import { PaginationControls } from "@/components/ui/pagination-control";
import PartsHistoryFilterModal, {
	type PartsHistoryFilters,
} from "@/components/general/parts-history-filter-modal";
import MaintenanceHistoryFilterModal, {
	type MaintenanceHistoryFilters,
} from "@/components/general/maintenance-history-filter-modal";
import CalibrationHistoryFilterModal, {
	type CalibrationHistoryFilters,
} from "@/components/general/calibration-history-filter-modal";
import HistoryFilterBadge from "@/components/general/history-filter-badge";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { format } from "date-fns";
import HistoryDetailModal from "@/components/general/history-detail-modal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CardContent, CardFooter, CardTitle } from "@/components/ui/card";

import { CardHeader } from "@/components/ui/card";

import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
	lastLocation: string | null;
	createdOn: string | null;
	modifiedOn: string;
};

type MaintenanceHistory = {
	id: string;
	medicalEquipmentId: string;
	actionPerformed: string;
	technician: string;
	result: string;
	maintenanceDate: string;
	createdBy: string;
	createdOn: string;
};

type CalibrationHistory = {
	id: string;
	medicalEquipmentId: string;
	actionPerformed: string;
	technician: string;
	result: string;
	calibrationDate: string;
	calibrationMethod: string;
	nextCalibrationDue?: string | null;
	createdBy: string;
	createdOn: string;
};

type SparepartHistory = {
	id: string;
	medicalEquipmentId: string;
	sparepartId: string;
	sparepartName: string;
	replacementDate: string;
	actionPerformed: string;
	technician: string;
	result: string;
	createdBy: string;
	createdOn: string;
};

type HistoryData = {
	actionPerformed: string | null;
	technician: string | null;
	result: string | null;
	maintenanceDate?: string | null;
	calibrationMethod?: string | null;
	calibrationDate?: string | null;
	nextCalibrationDue?: string | null;
	sparepartName?: string | null;
	sparepartId?: string | null;
	replacementDate?: string | null;
	createdBy: string | null;
	createdOn: string | null;
};

export default function MedicalEquipmentDetails() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const equipmentId = params.id as string;

	const [equipment, setEquipment] = useState<MedicalEquipment | null>(null);
	const [filteredMaintenanceHistories, setFilteredMaintenanceHistories] =
		useState<MaintenanceHistory[]>([]);
	const [filteredCalibrationHistories, setFilteredCalibrationHistories] =
		useState<CalibrationHistory[]>([]);
	const [filteredSparepartHistories, setFilteredSparepartHistories] =
		useState<SparepartHistory[]>([]);

	const [loading, setLoading] = useState(true);
	const [loadingHistories, setLoadingHistories] = useState(true);
	const [activeTab, setActiveTab] = useState<
		"maintenance" | "kalibrasi" | "ganti_suku_cadang"
	>("maintenance");
	const [currentPage, setCurrentPage] = useState(1);
	const [userRole, setUserRole] = useState<string>("");

	const [showMaintenanceFilterModal, setShowMaintenanceFilterModal] =
		useState(false);
	const [showCalibrationFilterModal, setShowCalibrationFilterModal] =
		useState(false);
	const [showPartsFilterModal, setShowPartsFilterModal] = useState(false);

	const itemsPerPage = 5;

	// Initialize filters from URL params
	const [partsFilters, setPartsFilters] = useState<PartsHistoryFilters>(
		() => {
			const initialFilters: PartsHistoryFilters = {
				search: searchParams.get("search") || "",
				sparepartId: searchParams.get("sparepartId") || "",
				result: searchParams.get("result") || "",
				replacementDateStart: searchParams.get("replacementDateStart")
					? new Date(
							searchParams.get("replacementDateStart") as string
					  )
					: null,
				replacementDateEnd: searchParams.get("replacementDateEnd")
					? new Date(searchParams.get("replacementDateEnd") as string)
					: null,
				createdOnStart: searchParams.get("createdOnStart")
					? new Date(searchParams.get("createdOnStart") as string)
					: null,
				createdOnEnd: searchParams.get("createdOnEnd")
					? new Date(searchParams.get("createdOnEnd") as string)
					: null,
			};
			return initialFilters;
		}
	);

	const [maintenanceFilters, setMaintenanceFilters] =
		useState<MaintenanceHistoryFilters>(() => {
			const initialFilters: MaintenanceHistoryFilters = {
				search: searchParams.get("search") || "",
				result: searchParams.get("result") || "",
				maintenanceDateStart: searchParams.get("maintenanceDateStart")
					? new Date(
							searchParams.get("maintenanceDateStart") as string
					  )
					: null,
				maintenanceDateEnd: searchParams.get("maintenanceDateEnd")
					? new Date(searchParams.get("maintenanceDateEnd") as string)
					: null,
				createdOnStart: searchParams.get("createdOnStart")
					? new Date(searchParams.get("createdOnStart") as string)
					: null,
				createdOnEnd: searchParams.get("createdOnEnd")
					? new Date(searchParams.get("createdOnEnd") as string)
					: null,
			};
			return initialFilters;
		});

	const [calibrationFilters, setCalibrationFilters] =
		useState<CalibrationHistoryFilters>(() => {
			const initialFilters: CalibrationHistoryFilters = {
				search: searchParams.get("search") || "",
				result: searchParams.get("result") || "",
				calibrationMethod: searchParams.get("calibrationMethod") || "",
				calibrationDateStart: searchParams.get("calibrationDateStart")
					? new Date(
							searchParams.get("calibrationDateStart") as string
					  )
					: null,
				calibrationDateEnd: searchParams.get("calibrationDateEnd")
					? new Date(searchParams.get("calibrationDateEnd") as string)
					: null,
				nextCalibrationDueBefore: searchParams.get(
					"nextCalibrationDueBefore"
				)
					? new Date(
							searchParams.get(
								"nextCalibrationDueBefore"
							) as string
					  )
					: null,
				createdOnStart: searchParams.get("createdOnStart")
					? new Date(searchParams.get("createdOnStart") as string)
					: null,
				createdOnEnd: searchParams.get("createdOnEnd")
					? new Date(searchParams.get("createdOnEnd") as string)
					: null,
			};
			return initialFilters;
		});

	const [selectedHistory, setSelectedHistory] = useState<HistoryData | null>(
		null
	);

	const [showHistoryDetailModal, setShowHistoryDetailModal] = useState(false);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Function to update URL with current filters
	const updateURLParams = (
		newParams: Record<string, string | null | undefined>
	) => {
		const params = new URLSearchParams(searchParams.toString());

		// Clear existing filter params to avoid duplicates
		[
			"search",
			"sparepartId",
			"result",
			"replacementDateStart",
			"replacementDateEnd",
			"maintenanceDateStart",
			"maintenanceDateEnd",
			"calibrationDateStart",
			"calibrationDateEnd",
			"calibrationMethod",
			"nextCalibrationDueBefore",
			"createdOnStart",
			"createdOnEnd",
		].forEach((param) => {
			params.delete(param);
		});

		// Add new params
		Object.entries(newParams).forEach(([key, value]) => {
			if (value === null || value === undefined || value === "") {
				return;
			}
			params.set(key, value);
		});

		// Update URL without refreshing page
		router.push(
			`/dashboard/medical-equipment/${equipmentId}?${params.toString()}`,
			{ scroll: false }
		);
	};

	const buildPartsQueryParams = (filters: PartsHistoryFilters): string => {
		const params = new URLSearchParams();

		if (filters.search) {
			params.append("search", filters.search);
		}

		if (filters.sparepartId) {
			params.append("sparepartId", filters.sparepartId);
		}

		if (filters.result) {
			params.append("result", filters.result);
		}

		if (filters.replacementDateStart) {
			params.append(
				"replacementDateStart",
				format(filters.replacementDateStart, "yyyy-MM-dd")
			);
		}

		if (filters.replacementDateEnd) {
			params.append(
				"replacementDateEnd",
				format(filters.replacementDateEnd, "yyyy-MM-dd")
			);
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

		return params.toString();
	};

	const buildMaintenanceQueryParams = (
		filters: MaintenanceHistoryFilters
	): string => {
		const params = new URLSearchParams();

		if (filters.search) {
			params.append("search", filters.search);
		}

		if (filters.result) {
			params.append("result", filters.result);
		}

		if (filters.maintenanceDateStart) {
			params.append(
				"maintenanceDateStart",
				format(filters.maintenanceDateStart, "yyyy-MM-dd")
			);
		}

		if (filters.maintenanceDateEnd) {
			params.append(
				"maintenanceDateEnd",
				format(filters.maintenanceDateEnd, "yyyy-MM-dd")
			);
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

		return params.toString();
	};

	const buildCalibrationQueryParams = (
		filters: CalibrationHistoryFilters
	): string => {
		const params = new URLSearchParams();

		if (filters.search) {
			params.append("search", filters.search);
		}

		if (filters.result) {
			params.append("result", filters.result);
		}

		if (filters.calibrationMethod) {
			params.append("calibrationMethod", filters.calibrationMethod);
		}

		if (filters.calibrationDateStart) {
			params.append(
				"calibrationDateStart",
				format(filters.calibrationDateStart, "yyyy-MM-dd")
			);
		}

		if (filters.calibrationDateEnd) {
			params.append(
				"calibrationDateEnd",
				format(filters.calibrationDateEnd, "yyyy-MM-dd")
			);
		}

		if (filters.nextCalibrationDueBefore) {
			params.append(
				"nextCalibrationDueBefore",
				format(filters.nextCalibrationDueBefore, "yyyy-MM-dd")
			);
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

		return params.toString();
	};

	const fetchEquipment = useCallback(async () => {
		try {
			setLoading(true);
			const token = Cookies.get("accessToken");
			const user = Cookies.get("user");

			if (user) {
				const userJSON = JSON.parse(user);
				setUserRole(userJSON.role);
			}

			if (!token) {
				console.error("No token found");
				setLoading(false);
				return;
			}

			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			const data = await res.json();
			setEquipment(data.data);
		} catch {
			toast.error("Gagal memuat alat medis");
		} finally {
			setLoading(false);
		}
	}, [equipmentId]);

	const fetchHistories = useCallback(async () => {
		try {
			setLoadingHistories(true);
			const token = Cookies.get("accessToken");

			const [maintenanceRes, calibrationRes, sparepartRes] =
				await Promise.all([
					fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/maintenance-history`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					),
					fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/calibration-history`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					),
					fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/parts-history`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					),
				]);

			const maintenanceData = await maintenanceRes.json();
			const calibrationData = await calibrationRes.json();
			const sparepartData = await sparepartRes.json();

			setFilteredMaintenanceHistories(maintenanceData.data || []);
			setFilteredCalibrationHistories(calibrationData.data || []);
			setFilteredSparepartHistories(sparepartData.data || []);
		} catch {
			toast.error("Gagal memuat histori");
		} finally {
			setLoadingHistories(false);
		}
	}, [equipmentId]);

	const fetchSparepartHistories = useCallback(async () => {
		try {
			setLoadingHistories(true);
			const token = Cookies.get("accessToken");
			const queryParams = buildPartsQueryParams(partsFilters);

			let url = `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/parts-history`;

			if (queryParams) {
				url += `?${queryParams}`;
			}

			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const result = await response.json();

			if (!response.ok) {
				toast.error(
					<>
						Error fetching spare part history:
						<br />
						{result.message}
					</>
				);
				return;
			}

			setFilteredSparepartHistories(result.data || []);
		} catch (error) {
			console.error("Error fetching spare part history:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Error fetching spare part history"
			);
		} finally {
			setLoadingHistories(false);
		}
	}, [equipmentId, partsFilters]);

	const fetchMaintenanceHistories = useCallback(async () => {
		try {
			setLoadingHistories(true);
			const token = Cookies.get("accessToken");
			const queryParams = buildMaintenanceQueryParams(maintenanceFilters);

			let url = `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/maintenance-history`;

			if (queryParams) {
				url += `?${queryParams}`;
			}

			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const result = await response.json();

			if (!response.ok) {
				toast.error(
					<>
						Error fetching maintenance history:
						<br />
						{result.message}
					</>
				);
				return;
			}

			setFilteredMaintenanceHistories(result.data || []);
		} catch (error) {
			console.error("Error fetching maintenance history:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Error fetching maintenance history"
			);
		} finally {
			setLoadingHistories(false);
		}
	}, [equipmentId, maintenanceFilters]);

	const fetchCalibrationHistories = useCallback(async () => {
		try {
			setLoadingHistories(true);
			const token = Cookies.get("accessToken");
			const queryParams = buildCalibrationQueryParams(calibrationFilters);

			let url = `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/calibration-history`;

			if (queryParams) {
				url += `?${queryParams}`;
			}

			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const result = await response.json();

			if (!response.ok) {
				toast.error(
					<>
						Error fetching calibration history:
						<br />
						{result.message}
					</>
				);
				return;
			}

			setFilteredCalibrationHistories(result.data || []);
		} catch (error) {
			console.error("Error fetching calibration history:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Error fetching calibration history"
			);
		} finally {
			setLoadingHistories(false);
		}
	}, [equipmentId, calibrationFilters]);

	useEffect(() => {
		fetchEquipment();
		fetchHistories();
	}, [fetchEquipment, fetchHistories]);

	useEffect(() => {
		if (activeTab === "ganti_suku_cadang") {
			fetchSparepartHistories();
		} else if (activeTab === "maintenance") {
			fetchMaintenanceHistories();
		} else if (activeTab === "kalibrasi") {
			fetchCalibrationHistories();
		}
	}, [
		activeTab,
		fetchSparepartHistories,
		fetchMaintenanceHistories,
		fetchCalibrationHistories,
		searchParams,
	]);

	const handleGoBack = () => router.push(`/dashboard/medical-equipment`);
	const handleAddCalibration = () =>
		router.push(`/dashboard/medical-equipment/${equipmentId}/calibration`);
	const handleAddMaintenance = () =>
		router.push(`/dashboard/medical-equipment/${equipmentId}/maintenance`);
	const handleAddSparePart = () =>
		router.push(`/dashboard/medical-equipment/${equipmentId}/spare-part`);
	const handleAddMaintenanceRequest = () =>
		router.push(
			`/dashboard/medical-equipment/${equipmentId}/maintenance-request`
		);
	const handleAddCalibrationRequest = () =>
		router.push(
			`/dashboard/medical-equipment/${equipmentId}/calibration-request`
		);

	const handlePartsFilterApply = (newFilters: PartsHistoryFilters) => {
		setPartsFilters(newFilters);
		setShowPartsFilterModal(false);

		updateURLParams({
			search: newFilters.search || null,
			sparepartId: newFilters.sparepartId || null,
			result: newFilters.result || null,
			replacementDateStart: newFilters.replacementDateStart
				? format(newFilters.replacementDateStart, "yyyy-MM-dd")
				: null,
			replacementDateEnd: newFilters.replacementDateEnd
				? format(newFilters.replacementDateEnd, "yyyy-MM-dd")
				: null,
			createdOnStart: newFilters.createdOnStart
				? format(newFilters.createdOnStart, "yyyy-MM-dd")
				: null,
			createdOnEnd: newFilters.createdOnEnd
				? format(newFilters.createdOnEnd, "yyyy-MM-dd")
				: null,
		});
	};

	const handleMaintenanceFilterApply = (
		newFilters: MaintenanceHistoryFilters
	) => {
		setMaintenanceFilters(newFilters);
		setShowMaintenanceFilterModal(false);

		updateURLParams({
			search: newFilters.search || null,
			result: newFilters.result || null,
			maintenanceDateStart: newFilters.maintenanceDateStart
				? format(newFilters.maintenanceDateStart, "yyyy-MM-dd")
				: null,
			maintenanceDateEnd: newFilters.maintenanceDateEnd
				? format(newFilters.maintenanceDateEnd, "yyyy-MM-dd")
				: null,
			createdOnStart: newFilters.createdOnStart
				? format(newFilters.createdOnStart, "yyyy-MM-dd")
				: null,
			createdOnEnd: newFilters.createdOnEnd
				? format(newFilters.createdOnEnd, "yyyy-MM-dd")
				: null,
		});
	};

	const handleCalibrationFilterApply = (
		newFilters: CalibrationHistoryFilters
	) => {
		setCalibrationFilters(newFilters);
		setShowCalibrationFilterModal(false);

		updateURLParams({
			search: newFilters.search || null,
			result: newFilters.result || null,
			calibrationMethod: newFilters.calibrationMethod || null,
			calibrationDateStart: newFilters.calibrationDateStart
				? format(newFilters.calibrationDateStart, "yyyy-MM-dd")
				: null,
			calibrationDateEnd: newFilters.calibrationDateEnd
				? format(newFilters.calibrationDateEnd, "yyyy-MM-dd")
				: null,
			nextCalibrationDueBefore: newFilters.nextCalibrationDueBefore
				? format(newFilters.nextCalibrationDueBefore, "yyyy-MM-dd")
				: null,
			createdOnStart: newFilters.createdOnStart
				? format(newFilters.createdOnStart, "yyyy-MM-dd")
				: null,
			createdOnEnd: newFilters.createdOnEnd
				? format(newFilters.createdOnEnd, "yyyy-MM-dd")
				: null,
		});
	};

	const handleRemoveFilter = (
		filterType: string,
		activeTabType: "maintenance" | "kalibrasi" | "ganti_suku_cadang"
	) => {
		if (activeTabType === "ganti_suku_cadang") {
			const newFilters = {
				...partsFilters,
				[filterType]: filterType.includes("Date") ? null : "",
			};
			setPartsFilters(newFilters);

			const params: Record<string, string | null> = {};
			params[filterType] = null;
			updateURLParams(params);
		} else if (activeTabType === "maintenance") {
			const newFilters = {
				...maintenanceFilters,
				[filterType]: filterType.includes("Date") ? null : "",
			};
			setMaintenanceFilters(newFilters);

			const params: Record<string, string | null> = {};
			params[filterType] = null;
			updateURLParams(params);
		} else if (activeTabType === "kalibrasi") {
			const newFilters = {
				...calibrationFilters,
				[filterType]: filterType.includes("Date") ? null : "",
			};
			setCalibrationFilters(newFilters);

			const params: Record<string, string | null> = {};
			params[filterType] = null;
			updateURLParams(params);
		}
	};

	const getResultClass = (result: string) => {
		switch (result.toLowerCase()) {
			case "success":
			return "bg-green-100 text-green-800";
			case "success with issues":
			return "bg-green-100 text-green-800"; // Sama dengan success
			case "partial":
			return "bg-yellow-100 text-yellow-800";
			case "failed":
			return "bg-red-100 text-red-800";
			case "failed with issues":
			return "bg-red-100 text-red-800"; // Sama dengan failed
			default:
			return "bg-gray-100 text-gray-800";
		}
	};

	// Perbarui fungsi getResultText untuk menerjemahkan ke Bahasa Indonesia
	const getResultText = (result: string) => {
		switch (result.toLowerCase()) {
			case "success":
			return "Berhasil";
			case "success with issues":
			return "Berhasil dengan Catatan";
			case "partial":
			return "Sebagian";
			case "failed":
			return "Gagal";
			case "failed with issues":
			return "Gagal dengan Catatan";
			default:
			return result;
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

	const handleHistoryRowClick = (
		item: MaintenanceHistory | CalibrationHistory | SparepartHistory
	) => {
		setSelectedHistory(item);
		setShowHistoryDetailModal(true);
	};

	const paginatedData =
		activeTab === "maintenance"
			? filteredMaintenanceHistories.slice(
					(currentPage - 1) * itemsPerPage,
					currentPage * itemsPerPage
			  )
			: activeTab === "kalibrasi"
			? filteredCalibrationHistories.slice(
					(currentPage - 1) * itemsPerPage,
					currentPage * itemsPerPage
			  )
			: filteredSparepartHistories.slice(
					(currentPage - 1) * itemsPerPage,
					currentPage * itemsPerPage
			  );

	const tabs = ["maintenance", "kalibrasi", "ganti_suku_cadang"] as const;

	// Function to handle equipment deletion
	const handleDeleteEquipment = async () => {
		try {
			setIsDeleting(true);
			const token = Cookies.get("accessToken");
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.ok) {
				toast.success("Alat medis berhasil dihapus");
				router.push("/dashboard/medical-equipment?success=delete");
			} else {
				const data = await response.json();
				toast.error(
					`Gagal menghapus: ${data.message || "Terjadi kesalahan"}`
				);
			}
		} catch (error) {
			console.error("Error deleting equipment:", error);
			toast.error("Gagal menghapus alat medis");
		} finally {
			setIsDeleting(false);
			// DeleteDialog will handle closing itself
		}
	};

	// Check if any filters are active
	const hasActiveFilters = (
		tab: "maintenance" | "kalibrasi" | "ganti_suku_cadang"
	) => {
		if (tab === "maintenance") {
			return (
				maintenanceFilters.search ||
				maintenanceFilters.result ||
				maintenanceFilters.maintenanceDateStart ||
				maintenanceFilters.maintenanceDateEnd ||
				maintenanceFilters.createdOnStart ||
				maintenanceFilters.createdOnEnd
			);
		} else if (tab === "kalibrasi") {
			return (
				calibrationFilters.search ||
				calibrationFilters.result ||
				calibrationFilters.calibrationMethod ||
				calibrationFilters.calibrationDateStart ||
				calibrationFilters.calibrationDateEnd ||
				calibrationFilters.nextCalibrationDueBefore ||
				calibrationFilters.createdOnStart ||
				calibrationFilters.createdOnEnd
			);
		} else {
			return (
				partsFilters.search ||
				partsFilters.sparepartId ||
				partsFilters.result ||
				partsFilters.replacementDateStart ||
				partsFilters.replacementDateEnd ||
				partsFilters.createdOnStart ||
				partsFilters.createdOnEnd
			);
		}
	};

	const clearAllFilters = () => {
		if (activeTab === "maintenance") {
			setMaintenanceFilters({
				search: "",
				result: "",
				maintenanceDateStart: null,
				maintenanceDateEnd: null,
				createdOnStart: null,
				createdOnEnd: null,
			});
		} else if (activeTab === "kalibrasi") {
			setCalibrationFilters({
				search: "",
				result: "",
				calibrationMethod: "",
				calibrationDateStart: null,
				calibrationDateEnd: null,
				nextCalibrationDueBefore: null,
				createdOnStart: null,
				createdOnEnd: null,
			});
		} else {
			setPartsFilters({
				search: "",
				sparepartId: "",
				result: "",
				replacementDateStart: null,
				replacementDateEnd: null,
				createdOnStart: null,
				createdOnEnd: null,
			});
		}

		// Clear URL params
		router.push(`/dashboard/medical-equipment/${equipmentId}`, {
			scroll: false,
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Button
					variant="outline"
					size="sm"
					onClick={handleGoBack}
					className="gap-2"
				>
					<ArrowLeft className="h-4 w-4" /> Kembali
				</Button>

                {/* Admin-only edit and delete buttons */}
                {["Admin"].includes(userRole) && (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() =>
                                router.push(
                                    `/dashboard/medical-equipment/${equipmentId}/edit`
                                )
                            }
                        >
                            <Pencil className="h-4 w-4" />{" "}
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                            onClick={() =>
                                setShowDeleteConfirmation(
                                    true
                                )
                            }
                        >
                            <Trash2 className="h-4 w-4" />{" "}
                            Hapus
                        </Button>
                    </div>
                )}

			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 md:space-y-0 space-y-4 md:space-x-4 space-x-0">
				{/* Equipment Details Card */}
				<div className="col-span-1">
					<Card className="h-full">
						<CardHeader className="pb-3 bg-blue-50">
							<CardTitle className="text-lg flex items-center gap-2">
								{loading ? (
									<div className="h-6 bg-muted animate-pulse w-1/2 rounded" />
								) : equipment ? (
									<>
										<Stethoscope className="h-5 w-5" />
										{equipment.name}
									</>
								) : (
									"Alat tidak ditemukan"
								)}
							</CardTitle>
                        </CardHeader>    

                        

						<CardContent className="pt-4">
							{loading ? (
								<div className="space-y-4">
									{Array.from({ length: 5 }).map((_, i) => (
										<div
											key={i}
											className="flex flex-col gap-1"
										>
											<div className="h-4 bg-muted animate-pulse w-1/4 rounded" />
											<div className="h-5 bg-muted animate-pulse w-3/4 rounded" />
										</div>
									))}
								</div>
							) : equipment ? (
								<div className="space-y-5">
									<div className="grid grid-cols-1 gap-4 text-sm">

                                        <Badge variant="outline" className="px-3 py-1 bg-white">
                                                ID: {equipment.id}
                                        </Badge>
                                        
										<DetailItem
											icon={
												<Tag className="h-4 w-4 text-muted-foreground" />
											}
											label="Brand"
											value={equipment.brandName}
										/>
										<DetailItem
											icon={
												<Layers className="h-4 w-4 text-muted-foreground" />
											}
											label="Model"
											value={equipment.modelName}
										/>
										<DetailItem
											icon={
												<Barcode className="h-4 w-4 text-muted-foreground" />
											}
											label="Kode Inventaris"
											value={equipment.inventorisId}
										/>
										<DetailItem
											icon={
												<MapPin className="h-4 w-4 text-muted-foreground" />
											}
											label="Lokasi terakhir"
											value={equipment.lastLocation}
										/>
										<DetailItem
											icon={
												<Activity className="h-4 w-4 text-muted-foreground" />
											}
											label="Status"
											value={
												<Badge variant="outline">
													{getStatusText(
														equipment.status
													)}
												</Badge>
											}
										/>
										<DetailItem
											icon={
												<Calendar className="h-4 w-4 text-muted-foreground" />
											}
											label="Tanggal Pembelian"
											value={
												equipment.purchaseDate
													? formatDate(
															equipment.purchaseDate
													  )
													: "-"
											}
										/>
										<DetailItem
											icon={
												<DollarSign className="h-4 w-4 text-muted-foreground" />
											}
											label="Harga Pembelian"
											value={
												equipment.purchasePrice
													? formatCurrency(
															equipment.purchasePrice
													  )
													: "-"
											}
										/>
										<DetailItem
											icon={
												<Building className="h-4 w-4 text-muted-foreground" />
											}
											label="Vendor"
											value={equipment.vendor}
										/>
									</div>

									<Separator />

									<div className="grid grid-cols-1 gap-4 text-sm">
										<DetailItem
											icon={
												<Clock className="h-4 w-4 text-muted-foreground" />
											}
											label="Dibuat Pada"
											value={
												equipment.createdOn
													? formatDate(
															equipment.createdOn
													  )
													: "-"
											}
										/>
										<DetailItem
											icon={
												<RefreshCw className="h-4 w-4 text-muted-foreground" />
											}
											label="Diperbarui Pada"
											value={formatDate(
												equipment.modifiedOn
											)}
										/>
									</div>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									Alat tidak ditemukan.
								</p>
							)}
						</CardContent>

						{equipment &&
							["Admin", "Fasum", "User"].includes(userRole) && (
								<CardFooter className="flex flex-col gap-3 pt-4 border-t">									

									{["Admin", "Fasum"].includes(userRole) && (
										<>
											<Button
												size="sm"
												className="gap-2 w-full"
												onClick={handleAddMaintenance}
											>
												<Wrench className="h-4 w-4" />{" "}
												Tambah Riwayat Pemeliharaan
											</Button>
											<Button
												size="sm"
												className="gap-2 w-full"
												onClick={handleAddCalibration}
											>
												<Sliders className="h-4 w-4" />{" "}
												Tambah Riwayat Kalibrasi
											</Button>
											<Button
												size="sm"
												className="gap-2 w-full"
												onClick={handleAddSparePart}
											>
												<Package className="h-4 w-4" />{" "}
												Tambah Pergantian Suku Cadang
											</Button>
										</>
									)}
									{["Admin", "User"].includes(userRole) && (
										<>
											<Button
												size="sm"
												variant="outline"
												className="gap-2 w-full"
												onClick={
													handleAddMaintenanceRequest
												}
											>
												<ClipboardCheck className="h-4 w-4" />{" "}
												Buat Permintaan Pemeliharaan
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="gap-2 w-full"
												onClick={
													handleAddCalibrationRequest
												}
											>
												<FileCheck className="h-4 w-4" />{" "}
												Buat Permintaan Kalibrasi
											</Button>
										</>
									)}
								</CardFooter>
							)}
					</Card>
				</div>

				{/* History Tabs Card */}
				<div className="col-span-2">
					<Card className="h-full flex flex-col">
						<div className="border-b">
							<div className="flex justify-around items-center">
								{tabs.map((tab) => (
									<button
										key={tab}
										onClick={() => {
											setActiveTab(tab);
											setCurrentPage(1);
										}}
										className={`py-4 px-6 text-sm font-medium transition-colors relative ${
											activeTab === tab
												? "text-primary-solid"
												: "text-muted-foreground hover:text-primary-solid/80"
										}`}
									>
										{tab === "maintenance"
											? "Riwayat Pemeliharaan"
											: tab === "kalibrasi"
											? "Riwayat Kalibrasi"
											: "Riwayat Ganti Suku Cadang"}
										{activeTab === tab && (
											<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-solid" />
										)}
									</button>
								))}
							</div>
						</div>

						{/* Search & Filter */}
						<div className="flex justify-between items-center p-4 border-b">
							<h3 className="text-sm font-medium">
								{activeTab === "maintenance"
									? "Riwayat Pemeliharaan"
									: activeTab === "kalibrasi"
									? "Riwayat Kalibrasi"
									: "Riwayat Ganti Suku Cadang"}
							</h3>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									if (activeTab === "maintenance") {
										setShowMaintenanceFilterModal(true);
									} else if (activeTab === "kalibrasi") {
										setShowCalibrationFilterModal(true);
									} else {
										setShowPartsFilterModal(true);
									}
								}}
								className="gap-2"
							>
								<Filter className="h-4 w-4" /> Filter
							</Button>
						</div>

						{/* Active Filters */}
						{hasActiveFilters(activeTab) && (
							<div className="p-4 border-b bg-muted/20">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Filter aktif
									</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={clearAllFilters}
										className="h-8 px-2 text-xs"
									>
										<X className="h-3 w-3 mr-1" /> Hapus
										semua
									</Button>
								</div>

								<div className="flex flex-wrap gap-2">
									{activeTab === "maintenance" && (
										<>
											{maintenanceFilters.search && (
												<HistoryFilterBadge
													label="Pencarian"
													value={
														maintenanceFilters.search
													}
													onRemove={() =>
														handleRemoveFilter(
															"search",
															"maintenance"
														)
													}
												/>
											)}
											{maintenanceFilters.result && (
												<HistoryFilterBadge
													label="Hasil"
													value={
														maintenanceFilters.result
													}
													onRemove={() =>
														handleRemoveFilter(
															"result",
															"maintenance"
														)
													}
												/>
											)}
											{maintenanceFilters.maintenanceDateStart && (
												<HistoryFilterBadge
													label="Tanggal Dari"
													value={
														maintenanceFilters.maintenanceDateStart
													}
													onRemove={() =>
														handleRemoveFilter(
															"maintenanceDateStart",
															"maintenance"
														)
													}
												/>
											)}
											{maintenanceFilters.maintenanceDateEnd && (
												<HistoryFilterBadge
													label="Tanggal Sampai"
													value={
														maintenanceFilters.maintenanceDateEnd
													}
													onRemove={() =>
														handleRemoveFilter(
															"maintenanceDateEnd",
															"maintenance"
														)
													}
												/>
											)}
											{maintenanceFilters.createdOnStart && (
												<HistoryFilterBadge
													label="Dibuat Dari"
													value={
														maintenanceFilters.createdOnStart
													}
													onRemove={() =>
														handleRemoveFilter(
															"createdOnStart",
															"maintenance"
														)
													}
												/>
											)}
											{maintenanceFilters.createdOnEnd && (
												<HistoryFilterBadge
													label="Dibuat Sampai"
													value={
														maintenanceFilters.createdOnEnd
													}
													onRemove={() =>
														handleRemoveFilter(
															"createdOnEnd",
															"maintenance"
														)
													}
												/>
											)}
										</>
									)}

									{activeTab === "kalibrasi" && (
										<>
											{calibrationFilters.search && (
												<HistoryFilterBadge
													label="Pencarian"
													value={
														calibrationFilters.search
													}
													onRemove={() =>
														handleRemoveFilter(
															"search",
															"kalibrasi"
														)
													}
												/>
											)}
											{calibrationFilters.result && (
												<HistoryFilterBadge
													label="Hasil"
													value={
														calibrationFilters.result
													}
													onRemove={() =>
														handleRemoveFilter(
															"result",
															"kalibrasi"
														)
													}
												/>
											)}
											{calibrationFilters.calibrationMethod && (
												<HistoryFilterBadge
													label="Metode"
													value={
														calibrationFilters.calibrationMethod
													}
													onRemove={() =>
														handleRemoveFilter(
															"calibrationMethod",
															"kalibrasi"
														)
													}
												/>
											)}
											{calibrationFilters.calibrationDateStart && (
												<HistoryFilterBadge
													label="Tanggal Dari"
													value={
														calibrationFilters.calibrationDateStart
													}
													onRemove={() =>
														handleRemoveFilter(
															"calibrationDateStart",
															"kalibrasi"
														)
													}
												/>
											)}
											{calibrationFilters.calibrationDateEnd && (
												<HistoryFilterBadge
													label="Tanggal Sampai"
													value={
														calibrationFilters.calibrationDateEnd
													}
													onRemove={() =>
														handleRemoveFilter(
															"calibrationDateEnd",
															"kalibrasi"
														)
													}
												/>
											)}
											{calibrationFilters.nextCalibrationDueBefore && (
												<HistoryFilterBadge
													label="Kalibrasi Berikutnya"
													value={
														calibrationFilters.nextCalibrationDueBefore
													}
													onRemove={() =>
														handleRemoveFilter(
															"nextCalibrationDueBefore",
															"kalibrasi"
														)
													}
												/>
											)}
											{calibrationFilters.createdOnStart && (
												<HistoryFilterBadge
													label="Dibuat Dari"
													value={
														calibrationFilters.createdOnStart
													}
													onRemove={() =>
														handleRemoveFilter(
															"createdOnStart",
															"kalibrasi"
														)
													}
												/>
											)}
											{calibrationFilters.createdOnEnd && (
												<HistoryFilterBadge
													label="Dibuat Sampai"
													value={
														calibrationFilters.createdOnEnd
													}
													onRemove={() =>
														handleRemoveFilter(
															"createdOnEnd",
															"kalibrasi"
														)
													}
												/>
											)}
										</>
									)}

									{activeTab === "ganti_suku_cadang" && (
										<>
											{partsFilters.search && (
												<HistoryFilterBadge
													label="Pencarian"
													value={partsFilters.search}
													onRemove={() =>
														handleRemoveFilter(
															"search",
															"ganti_suku_cadang"
														)
													}
												/>
											)}
											{partsFilters.sparepartId && (
												<HistoryFilterBadge
													label="ID Suku Cadang"
													value={
														partsFilters.sparepartId
													}
													onRemove={() =>
														handleRemoveFilter(
															"sparepartId",
															"ganti_suku_cadang"
														)
													}
												/>
											)}
											{partsFilters.result && (
												<HistoryFilterBadge
													label="Hasil"
													value={partsFilters.result}
													onRemove={() =>
														handleRemoveFilter(
															"result",
															"ganti_suku_cadang"
														)
													}
												/>
											)}
											{partsFilters.replacementDateStart && (
												<HistoryFilterBadge
													label="Tanggal Dari"
													value={
														partsFilters.replacementDateStart
													}
													onRemove={() =>
														handleRemoveFilter(
															"replacementDateStart",
															"ganti_suku_cadang"
														)
													}
												/>
											)}
											{partsFilters.replacementDateEnd && (
												<HistoryFilterBadge
													label="Tanggal Sampai"
													value={
														partsFilters.replacementDateEnd
													}
													onRemove={() =>
														handleRemoveFilter(
															"replacementDateEnd",
															"ganti_suku_cadang"
														)
													}
												/>
											)}
											{partsFilters.createdOnStart && (
												<HistoryFilterBadge
													label="Dibuat Dari"
													value={
														partsFilters.createdOnStart
													}
													onRemove={() =>
														handleRemoveFilter(
															"createdOnStart",
															"ganti_suku_cadang"
														)
													}
												/>
											)}
											{partsFilters.createdOnEnd && (
												<HistoryFilterBadge
													label="Dibuat Sampai"
													value={
														partsFilters.createdOnEnd
													}
													onRemove={() =>
														handleRemoveFilter(
															"createdOnEnd",
															"ganti_suku_cadang"
														)
													}
												/>
											)}
										</>
									)}
								</div>
							</div>
						)}

						{/* Table */}
						<div className="flex-1 overflow-auto">
							{loadingHistories ? (
								<div className="flex items-center justify-center h-64">
									<div className="flex flex-col items-center gap-2">
										<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
										<p className="text-sm text-muted-foreground">
											Memuat data...
										</p>
									</div>
								</div>
							) : paginatedData.length > 0 ? (
								<table className="w-full text-sm border-collapse">
									<thead className="sticky top-0 bg-white z-10">
										<tr>
											<th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">
												Deskripsi
											</th>
											<th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">
												Teknisi
											</th>
											<th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">
												Hasil
											</th>
											{activeTab === "kalibrasi" && (
												<th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">
													Metode
												</th>
											)}
											<th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">
												Tanggal
											</th>
										</tr>
									</thead>
									<tbody>
										{paginatedData.map((item, index) => (
											<tr
												key={index}
												onClick={() =>
													handleHistoryRowClick(item)
												}
												className="cursor-pointer hover:bg-muted/30 transition-colors border-b last:border-b-0"
											>
												<td className="py-3 px-4 max-w-[200px] truncate">
													{item.actionPerformed}
												</td>
												<td className="py-3 px-4">
													{item.technician}
												</td>
												<td className="py-3 px-4">
													<Badge
														className={getResultClass(
															item.result
														)}
													>
														{getResultText(
															item.result
														)}
													</Badge>
												</td>
												{activeTab === "kalibrasi" && (
													<td className="py-3 px-4">
														{
															(
																item as CalibrationHistory
															).calibrationMethod
														}
													</td>
												)}
												<td className="py-3 px-4 whitespace-nowrap">
													{formatDate(
														activeTab ===
															"ganti_suku_cadang"
															? (
																	item as SparepartHistory
															  ).replacementDate
															: activeTab ===
															  "maintenance"
															? (
																	item as MaintenanceHistory
															  ).maintenanceDate
															: (
																	item as CalibrationHistory
															  ).calibrationDate
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<div className="flex flex-col items-center justify-center h-64 text-center p-4">
									<div className="rounded-full bg-muted p-3 mb-3">
										{activeTab === "maintenance" ? (
											<Wrench className="h-6 w-6 text-muted-foreground" />
										) : activeTab === "kalibrasi" ? (
											<Sliders className="h-6 w-6 text-muted-foreground" />
										) : (
											<Package className="h-6 w-6 text-muted-foreground" />
										)}
									</div>
									<h3 className="text-lg font-medium mb-1">
										Tidak ada data
									</h3>
									<p className="text-sm text-muted-foreground">
										{activeTab === "maintenance"
											? "Belum ada riwayat pemeliharaan untuk alat ini"
											: activeTab === "kalibrasi"
											? "Belum ada riwayat kalibrasi untuk alat ini"
											: "Belum ada riwayat penggantian suku cadang untuk alat ini"}
									</p>
								</div>
							)}
						</div>

						{/* Pagination */}
						{paginatedData.length > 0 && (
							<div className="border-t p-4">
								<PaginationControls
									currentPage={currentPage}
									totalPages={Math.max(
										1,
										Math.ceil(
											(activeTab === "maintenance"
												? filteredMaintenanceHistories.length
												: activeTab === "kalibrasi"
												? filteredCalibrationHistories.length
												: filteredSparepartHistories.length) /
												itemsPerPage
										)
									)}
									onPageChange={setCurrentPage}
								/>
							</div>
						)}
					</Card>
				</div>
			</div>

			{/* Filter Modals */}
			{showMaintenanceFilterModal && (
				<MaintenanceHistoryFilterModal
					isOpen={showMaintenanceFilterModal}
					filters={maintenanceFilters}
					onConfirm={handleMaintenanceFilterApply}
					onCancel={() => setShowMaintenanceFilterModal(false)}
				/>
			)}

			{showCalibrationFilterModal && (
				<CalibrationHistoryFilterModal
					isOpen={showCalibrationFilterModal}
					filters={calibrationFilters}
					onConfirm={handleCalibrationFilterApply}
					onCancel={() => setShowCalibrationFilterModal(false)}
				/>
			)}

			{showPartsFilterModal && (
				<PartsHistoryFilterModal
					isOpen={showPartsFilterModal}
					filters={partsFilters}
					onConfirm={handlePartsFilterApply}
					onCancel={() => setShowPartsFilterModal(false)}
				/>
			)}

			{showHistoryDetailModal && (
				<HistoryDetailModal
					isOpen={showHistoryDetailModal}
					onClose={() => setShowHistoryDetailModal(false)}
					data={selectedHistory!}
					type={
						activeTab === "maintenance"
							? "maintenance"
							: activeTab === "kalibrasi"
							? "calibration"
							: "sparepart"
					}
				/>
			)}

			{/* Delete confirmation dialog */}
			<DeleteDialog
				open={showDeleteConfirmation}
				onOpenChange={setShowDeleteConfirmation}
				title="Konfirmasi Hapus"
				description={
					<>
						Apakah Anda yakin ingin menghapus alat medis ini?
						Tindakan ini tidak dapat dibatalkan dan akan menghapus
						semua riwayat terkait.
					</>
				}
				onConfirm={handleDeleteEquipment}
				isDeleting={isDeleting}
				deleteButtonText="Hapus"
				cancelButtonText="Batal"
			/>
		</div>
	);
}

interface DetailItemProps {
	icon?: React.ReactNode;
	label: string;
	value: React.ReactNode;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
	return (
		<div className="flex items-start gap-3">
			{icon && <div className="mt-0.5">{icon}</div>}
			<div className={icon ? "" : "w-full"}>
				<h3 className="text-sm font-medium text-muted-foreground mb-1">
					{label}
				</h3>
				<div className="font-medium">{value}</div>
			</div>
		</div>
	);
}
