"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Sliders, Wrench, ClipboardCheck, FileCheck, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/ui/pagination-control"
import PartsHistoryFilterModal, { type PartsHistoryFilters } from "@/components/general/parts-history-filter-modal"
import MaintenanceHistoryFilterModal, {
  type MaintenanceHistoryFilters,
} from "@/components/general/maintenance-history-filter-modal"
import CalibrationHistoryFilterModal, {
  type CalibrationHistoryFilters,
} from "@/components/general/calibration-history-filter-modal"
import HistoryFilterBadge from "@/components/general/history-filter-badge"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { format } from "date-fns"
import HistoryDetailModal from "@/components/general/history-detail-modal"
import { formatDate, formatCurrency } from "@/lib/utils"

type MedicalEquipment = {
  id: string
  inventorisId: string
  name: string
  brandName: string | null
  modelName: string | null
  purchaseDate: string | null
  purchasePrice: number | null
  status: string
  vendor: string | null
  lastLocation: string | null
  createdOn: string | null
  modifiedOn: string
}

type MaintenanceHistory = {
  id: string
  medicalEquipmentId: string
  actionPerformed: string
  technician: string
  result: string
  maintenanceDate: string
  createdBy: string
  createdOn: string
}

type CalibrationHistory = {
  id: string
  medicalEquipmentId: string
  actionPerformed: string
  technician: string
  result: string
  calibrationDate: string
  calibrationMethod: string
  nextCalibrationDue?: string | null
  createdBy: string
  createdOn: string
}

type SparepartHistory = {
  id: string
  medicalEquipmentId: string
  sparepartId: string
  sparepartName: string
  replacementDate: string
  actionPerformed: string
  technician: string
  result: string
  createdBy: string
  createdOn: string
}

type HistoryData = {
    actionPerformed: string | null
    technician: string | null
    result: string | null
    maintenanceDate?: string | null
    calibrationMethod?: string | null
    calibrationDate?: string | null
    nextCalibrationDue?: string | null
    sparepartName?: string | null
    sparepartId?: string | null
    replacementDate?: string | null
    createdBy: string | null
    createdOn: string | null
  }

export default function MedicalEquipmentDetails() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const equipmentId = params.id as string

  const [equipment, setEquipment] = useState<MedicalEquipment | null>(null)
  const [filteredMaintenanceHistories, setFilteredMaintenanceHistories] = useState<MaintenanceHistory[]>([])
  const [filteredCalibrationHistories, setFilteredCalibrationHistories] = useState<CalibrationHistory[]>([])
  const [filteredSparepartHistories, setFilteredSparepartHistories] = useState<SparepartHistory[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingHistories, setLoadingHistories] = useState(true)
  const [activeTab, setActiveTab] = useState<"maintenance" | "kalibrasi" | "ganti_suku_cadang">("maintenance")
  const [currentPage, setCurrentPage] = useState(1)
  const [userRole, setUserRole] = useState<string>("")

  const [showMaintenanceFilterModal, setShowMaintenanceFilterModal] = useState(false)
  const [showCalibrationFilterModal, setShowCalibrationFilterModal] = useState(false)
  const [showPartsFilterModal, setShowPartsFilterModal] = useState(false)

  const itemsPerPage = 5

  // Initialize filters from URL params
  const [partsFilters, setPartsFilters] = useState<PartsHistoryFilters>(() => {
    const initialFilters: PartsHistoryFilters = {
      search: searchParams.get("search") || "",
      sparepartId: searchParams.get("sparepartId") || "",
      result: searchParams.get("result") || "",
      replacementDateStart: searchParams.get("replacementDateStart")
        ? new Date(searchParams.get("replacementDateStart") as string)
        : null,
      replacementDateEnd: searchParams.get("replacementDateEnd")
        ? new Date(searchParams.get("replacementDateEnd") as string)
        : null,
      createdOnStart: searchParams.get("createdOnStart")
        ? new Date(searchParams.get("createdOnStart") as string)
        : null,
      createdOnEnd: searchParams.get("createdOnEnd") ? new Date(searchParams.get("createdOnEnd") as string) : null,
    }
    return initialFilters
  })

  const [maintenanceFilters, setMaintenanceFilters] = useState<MaintenanceHistoryFilters>(() => {
    const initialFilters: MaintenanceHistoryFilters = {
      search: searchParams.get("search") || "",
      result: searchParams.get("result") || "",
      maintenanceDateStart: searchParams.get("maintenanceDateStart")
        ? new Date(searchParams.get("maintenanceDateStart") as string)
        : null,
      maintenanceDateEnd: searchParams.get("maintenanceDateEnd")
        ? new Date(searchParams.get("maintenanceDateEnd") as string)
        : null,
      createdOnStart: searchParams.get("createdOnStart")
        ? new Date(searchParams.get("createdOnStart") as string)
        : null,
      createdOnEnd: searchParams.get("createdOnEnd") ? new Date(searchParams.get("createdOnEnd") as string) : null,
    }
    return initialFilters
  })

  const [calibrationFilters, setCalibrationFilters] = useState<CalibrationHistoryFilters>(() => {
    const initialFilters: CalibrationHistoryFilters = {
      search: searchParams.get("search") || "",
      result: searchParams.get("result") || "",
      calibrationMethod: searchParams.get("calibrationMethod") || "",
      calibrationDateStart: searchParams.get("calibrationDateStart")
        ? new Date(searchParams.get("calibrationDateStart") as string)
        : null,
      calibrationDateEnd: searchParams.get("calibrationDateEnd")
        ? new Date(searchParams.get("calibrationDateEnd") as string)
        : null,
      nextCalibrationDueBefore: searchParams.get("nextCalibrationDueBefore")
        ? new Date(searchParams.get("nextCalibrationDueBefore") as string)
        : null,
      createdOnStart: searchParams.get("createdOnStart")
        ? new Date(searchParams.get("createdOnStart") as string)
        : null,
      createdOnEnd: searchParams.get("createdOnEnd") ? new Date(searchParams.get("createdOnEnd") as string) : null,
    }
    return initialFilters
  })

  const [selectedHistory, setSelectedHistory] = useState< HistoryData| null
    >(null);

  const [showHistoryDetailModal, setShowHistoryDetailModal] = useState(false)

  // Function to update URL with current filters
  const updateURLParams = (newParams: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Clear existing filter params to avoid duplicates
    ;[
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
      params.delete(param)
    })

    // Add new params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return
      }
      params.set(key, value)
    })

    // Update URL without refreshing page
    router.push(`/dashboard/medical-equipment/${equipmentId}?${params.toString()}`, { scroll: false })
  }

  const buildPartsQueryParams = (filters: PartsHistoryFilters): string => {
    const params = new URLSearchParams()

    if (filters.search) {
      params.append("search", filters.search)
    }

    if (filters.sparepartId) {
      params.append("sparepartId", filters.sparepartId)
    }

    if (filters.result) {
      params.append("result", filters.result)
    }

    if (filters.replacementDateStart) {
      params.append("replacementDateStart", format(filters.replacementDateStart, "yyyy-MM-dd"))
    }

    if (filters.replacementDateEnd) {
      params.append("replacementDateEnd", format(filters.replacementDateEnd, "yyyy-MM-dd"))
    }

    if (filters.createdOnStart) {
      params.append("createdOnStart", format(filters.createdOnStart, "yyyy-MM-dd"))
    }

    if (filters.createdOnEnd) {
      params.append("createdOnEnd", format(filters.createdOnEnd, "yyyy-MM-dd"))
    }

    return params.toString()
  }

  const buildMaintenanceQueryParams = (filters: MaintenanceHistoryFilters): string => {
    const params = new URLSearchParams()

    if (filters.search) {
      params.append("search", filters.search)
    }

    if (filters.result) {
      params.append("result", filters.result)
    }

    if (filters.maintenanceDateStart) {
      params.append("maintenanceDateStart", format(filters.maintenanceDateStart, "yyyy-MM-dd"))
    }

    if (filters.maintenanceDateEnd) {
      params.append("maintenanceDateEnd", format(filters.maintenanceDateEnd, "yyyy-MM-dd"))
    }

    if (filters.createdOnStart) {
      params.append("createdOnStart", format(filters.createdOnStart, "yyyy-MM-dd"))
    }

    if (filters.createdOnEnd) {
      params.append("createdOnEnd", format(filters.createdOnEnd, "yyyy-MM-dd"))
    }

    return params.toString()
  }

  const buildCalibrationQueryParams = (filters: CalibrationHistoryFilters): string => {
    const params = new URLSearchParams()

    if (filters.search) {
      params.append("search", filters.search)
    }

    if (filters.result) {
      params.append("result", filters.result)
    }

    if (filters.calibrationMethod) {
      params.append("calibrationMethod", filters.calibrationMethod)
    }

    if (filters.calibrationDateStart) {
      params.append("calibrationDateStart", format(filters.calibrationDateStart, "yyyy-MM-dd"))
    }

    if (filters.calibrationDateEnd) {
      params.append("calibrationDateEnd", format(filters.calibrationDateEnd, "yyyy-MM-dd"))
    }

    if (filters.nextCalibrationDueBefore) {
      params.append("nextCalibrationDueBefore", format(filters.nextCalibrationDueBefore, "yyyy-MM-dd"))
    }

    if (filters.createdOnStart) {
      params.append("createdOnStart", format(filters.createdOnStart, "yyyy-MM-dd"))
    }

    if (filters.createdOnEnd) {
      params.append("createdOnEnd", format(filters.createdOnEnd, "yyyy-MM-dd"))
    }

    return params.toString()
  }

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true)
      const token = Cookies.get("accessToken")
      const user = Cookies.get("user")

      if (user) {
        const userJSON = JSON.parse(user)
        setUserRole(userJSON.role)
      }

      if (!token) {
        console.error("No token found")
        setLoading(false)
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setEquipment(data.data)
    } catch {
      toast.error("Gagal memuat alat medis")
    } finally {
      setLoading(false)
    }
  }, [equipmentId])

  const fetchHistories = useCallback(async () => {
    try {
      setLoadingHistories(true)
      const token = Cookies.get("accessToken")

      const [maintenanceRes, calibrationRes, sparepartRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/maintenance-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/calibration-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/parts-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const maintenanceData = await maintenanceRes.json()
      const calibrationData = await calibrationRes.json()
      const sparepartData = await sparepartRes.json()

      setFilteredMaintenanceHistories(maintenanceData.data || [])
      setFilteredCalibrationHistories(calibrationData.data || [])
      setFilteredSparepartHistories(sparepartData.data || [])
    } catch {
      toast.error("Gagal memuat histori")
    } finally {
      setLoadingHistories(false)
    }
  }, [equipmentId])

  const fetchSparepartHistories = useCallback(async () => {
    try {
      setLoadingHistories(true)
      const token = Cookies.get("accessToken")
      const queryParams = buildPartsQueryParams(partsFilters)

      let url = `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/parts-history`

      if (queryParams) {
        url += `?${queryParams}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(
          <>
            Error fetching spare part history:
            <br />
            {result.message}
          </>,
        )
        return
      }

      setFilteredSparepartHistories(result.data || [])
    } catch (error) {
      console.error("Error fetching spare part history:", error)
      toast.error(error instanceof Error ? error.message : "Error fetching spare part history")
    } finally {
      setLoadingHistories(false)
    }
  }, [equipmentId, partsFilters])

  const fetchMaintenanceHistories = useCallback(async () => {
    try {
      setLoadingHistories(true)
      const token = Cookies.get("accessToken")
      const queryParams = buildMaintenanceQueryParams(maintenanceFilters)

      let url = `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/maintenance-history`

      if (queryParams) {
        url += `?${queryParams}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(
          <>
            Error fetching maintenance history:
            <br />
            {result.message}
          </>,
        )
        return
      }

      setFilteredMaintenanceHistories(result.data || [])
    } catch (error) {
      console.error("Error fetching maintenance history:", error)
      toast.error(error instanceof Error ? error.message : "Error fetching maintenance history")
    } finally {
      setLoadingHistories(false)
    }
  }, [equipmentId, maintenanceFilters])

  const fetchCalibrationHistories = useCallback(async () => {
    try {
      setLoadingHistories(true)
      const token = Cookies.get("accessToken")
      const queryParams = buildCalibrationQueryParams(calibrationFilters)

      let url = `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/calibration-history`

      if (queryParams) {
        url += `?${queryParams}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(
          <>
            Error fetching calibration history:
            <br />
            {result.message}
          </>,
        )
        return
      }

      setFilteredCalibrationHistories(result.data || [])
    } catch (error) {
      console.error("Error fetching calibration history:", error)
      toast.error(error instanceof Error ? error.message : "Error fetching calibration history")
    } finally {
      setLoadingHistories(false)
    }
  }, [equipmentId, calibrationFilters])

  useEffect(() => {
    fetchEquipment()
    fetchHistories()
  }, [fetchEquipment, fetchHistories])

  useEffect(() => {
    if (activeTab === "ganti_suku_cadang") {
      fetchSparepartHistories()
    } else if (activeTab === "maintenance") {
      fetchMaintenanceHistories()
    } else if (activeTab === "kalibrasi") {
      fetchCalibrationHistories()
    }
  }, [activeTab, fetchSparepartHistories, fetchMaintenanceHistories, fetchCalibrationHistories, searchParams])

  const handleGoBack = () => router.push(`/dashboard/medical-equipment`)
  const handleAddCalibration = () => router.push(`/dashboard/medical-equipment/${equipmentId}/calibration`)
  const handleAddMaintenance = () => router.push(`/dashboard/medical-equipment/${equipmentId}/maintenance`)
  const handleAddSparePart = () => router.push(`/dashboard/medical-equipment/${equipmentId}/spare-part`)
  const handleAddMaintenanceRequest = () =>
    router.push(`/dashboard/medical-equipment/${equipmentId}/maintenance-request`)
  const handleAddCalibrationRequest = () =>
    router.push(`/dashboard/medical-equipment/${equipmentId}/calibration-request`)

  const handlePartsFilterApply = (newFilters: PartsHistoryFilters) => {
    setPartsFilters(newFilters)
    setShowPartsFilterModal(false)

    updateURLParams({
      search: newFilters.search || null,
      sparepartId: newFilters.sparepartId || null,
      result: newFilters.result || null,
      replacementDateStart: newFilters.replacementDateStart
        ? format(newFilters.replacementDateStart, "yyyy-MM-dd")
        : null,
      replacementDateEnd: newFilters.replacementDateEnd ? format(newFilters.replacementDateEnd, "yyyy-MM-dd") : null,
      createdOnStart: newFilters.createdOnStart ? format(newFilters.createdOnStart, "yyyy-MM-dd") : null,
      createdOnEnd: newFilters.createdOnEnd ? format(newFilters.createdOnEnd, "yyyy-MM-dd") : null,
    })
  }

  const handleMaintenanceFilterApply = (newFilters: MaintenanceHistoryFilters) => {
    setMaintenanceFilters(newFilters)
    setShowMaintenanceFilterModal(false)

    updateURLParams({
      search: newFilters.search || null,
      result: newFilters.result || null,
      maintenanceDateStart: newFilters.maintenanceDateStart
        ? format(newFilters.maintenanceDateStart, "yyyy-MM-dd")
        : null,
      maintenanceDateEnd: newFilters.maintenanceDateEnd ? format(newFilters.maintenanceDateEnd, "yyyy-MM-dd") : null,
      createdOnStart: newFilters.createdOnStart ? format(newFilters.createdOnStart, "yyyy-MM-dd") : null,
      createdOnEnd: newFilters.createdOnEnd ? format(newFilters.createdOnEnd, "yyyy-MM-dd") : null,
    })
  }

  const handleCalibrationFilterApply = (newFilters: CalibrationHistoryFilters) => {
    setCalibrationFilters(newFilters)
    setShowCalibrationFilterModal(false)

    updateURLParams({
      search: newFilters.search || null,
      result: newFilters.result || null,
      calibrationMethod: newFilters.calibrationMethod || null,
      calibrationDateStart: newFilters.calibrationDateStart
        ? format(newFilters.calibrationDateStart, "yyyy-MM-dd")
        : null,
      calibrationDateEnd: newFilters.calibrationDateEnd ? format(newFilters.calibrationDateEnd, "yyyy-MM-dd") : null,
      nextCalibrationDueBefore: newFilters.nextCalibrationDueBefore
        ? format(newFilters.nextCalibrationDueBefore, "yyyy-MM-dd")
        : null,
      createdOnStart: newFilters.createdOnStart ? format(newFilters.createdOnStart, "yyyy-MM-dd") : null,
      createdOnEnd: newFilters.createdOnEnd ? format(newFilters.createdOnEnd, "yyyy-MM-dd") : null,
    })
  }

  const handleRemoveFilter = (filterType: string, activeTabType: "maintenance" | "kalibrasi" | "ganti_suku_cadang") => {
    if (activeTabType === "ganti_suku_cadang") {
      const newFilters = { ...partsFilters, [filterType]: filterType.includes("Date") ? null : "" }
      setPartsFilters(newFilters)

      const params: Record<string, string | null> = {}
      params[filterType] = null
      updateURLParams(params)
    } else if (activeTabType === "maintenance") {
      const newFilters = { ...maintenanceFilters, [filterType]: filterType.includes("Date") ? null : "" }
      setMaintenanceFilters(newFilters)

      const params: Record<string, string | null> = {}
      params[filterType] = null
      updateURLParams(params)
    } else if (activeTabType === "kalibrasi") {
      const newFilters = { ...calibrationFilters, [filterType]: filterType.includes("Date") ? null : "" }
      setCalibrationFilters(newFilters)

      const params: Record<string, string | null> = {}
      params[filterType] = null
      updateURLParams(params)
    }
  }

  const getResultClass = (result: string) => {
    switch (result.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800"
      case "partial":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Translate agar konsisten
  const getResultText = (result: string) => {
    switch (result.toLowerCase()) {
      case "success":
        return "Berhasil"
      case "partial":
        return "Sebagian"
      case "failed":
        return "Gagal"
      default:
        return result
    }
  }

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
	}

const handleHistoryRowClick = (
  item: MaintenanceHistory | CalibrationHistory | SparepartHistory
) => {
  setSelectedHistory(item);
  setShowHistoryDetailModal(true);
};

  const paginatedData =
    activeTab === "maintenance"
      ? filteredMaintenanceHistories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      : activeTab === "kalibrasi"
        ? filteredCalibrationHistories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : filteredSparepartHistories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const tabs = ["maintenance", "kalibrasi", "ganti_suku_cadang"] as const

  // Check if any filters are active
  const hasActiveFilters = (tab: "maintenance" | "kalibrasi" | "ganti_suku_cadang") => {
    if (tab === "maintenance") {
      return (
        maintenanceFilters.search ||
        maintenanceFilters.result ||
        maintenanceFilters.maintenanceDateStart ||
        maintenanceFilters.maintenanceDateEnd ||
        maintenanceFilters.createdOnStart ||
        maintenanceFilters.createdOnEnd
      )
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
      )
    } else {
      return (
        partsFilters.search ||
        partsFilters.sparepartId ||
        partsFilters.result ||
        partsFilters.replacementDateStart ||
        partsFilters.replacementDateEnd ||
        partsFilters.createdOnStart ||
        partsFilters.createdOnEnd
      )
    }
  }

  const clearAllFilters = () => {
    if (activeTab === "maintenance") {
      setMaintenanceFilters({
        search: "",
        result: "",
        maintenanceDateStart: null,
        maintenanceDateEnd: null,
        createdOnStart: null,
        createdOnEnd: null,
      })
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
      })
    } else {
      setPartsFilters({
        search: "",
        sparepartId: "",
        result: "",
        replacementDateStart: null,
        replacementDateEnd: null,
        createdOnStart: null,
        createdOnEnd: null,
      })
    }

    // Clear URL params
    router.push(`/dashboard/medical-equipment/${equipmentId}`, { scroll: false })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 space-y-4 md:gap-6">
        <div className="col-span-1 bg-blue-50 p-6 rounded-lg">
          {loading ? (
            <div className="h-6 bg-muted animate-pulse w-1/2 rounded" />
          ) : equipment ? (
            <>
              <h1 className="text-header-h6 font-bold">{equipment.name}</h1>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <DetailItem label="Brand" value={equipment.brandName} />
                <DetailItem label="Model" value={equipment.modelName} />
                <DetailItem label="Kode Inventaris" value={equipment.inventorisId} />
                <DetailItem label="Lokasi terakhir" value={equipment.lastLocation} />
                <DetailItem label="Status" value={getStatusText(equipment.status)} />
                <DetailItem label="Tanggal Pembelian" value={equipment.purchaseDate ? formatDate(equipment.purchaseDate) : '-'} />
                <DetailItem label="Harga Pembelian" value={equipment.purchasePrice ? formatCurrency(equipment.purchasePrice) : '-'} />
                <DetailItem label="Vendor" value={equipment.vendor} />
                <DetailItem label="Dibuat Pada" value={equipment.createdOn ? formatDate(equipment.createdOn) : '-'} />
                <DetailItem label="Diperbarui Pada" value={formatDate(equipment.modifiedOn)} />
              </div>

              <div className="flex flex-col gap-3 pt-6">
                {["Admin", "Fasum"].includes(userRole) && (
                  <>
                    <Button size="sm" className="gap-2 w-full" onClick={handleAddMaintenance}>
                      <Wrench className="h-4 w-4" /> Tambah Riwayat Pemeliharaan
                    </Button>
                    <Button size="sm" className="gap-2 w-full" onClick={handleAddCalibration}>
                      <Sliders className="h-4 w-4" /> Tambah Riwayat Kalibrasi
                    </Button>
                    <Button size="sm" className="gap-2 w-full" onClick={handleAddSparePart}>
                      <Wrench className="h-4 w-4" /> Tambah Pergantian Suku Cadang
                    </Button>
                  </>
                )}
                {["Admin", "User"].includes(userRole) && (
                  <>
                    <Button size="sm" className="gap-2 w-full" onClick={handleAddMaintenanceRequest}>
                      <ClipboardCheck className="h-4 w-4" /> Buat Permintaan Pemeliharaan
                    </Button>
                    <Button size="sm" className="gap-2 w-full" onClick={handleAddCalibrationRequest}>
                      <FileCheck className="h-4 w-4" /> Buat Permintaan Kalibrasi
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Alat tidak ditemukan.</p>
          )}
        </div>

        <div className="col-span-2 bg-white border rounded-lg shadow-sm">
          <div className="flex border-b justify-center">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setCurrentPage(1)
                }}
                className={`py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-primary-solid text-primary-solid"
                    : "text-muted-foreground hover:text-primary-solid/80"
                }`}
              >
                {tab === "maintenance"
                  ? "Riwayat Pemeliharaan"
                  : tab === "kalibrasi"
                    ? "Riwayat Kalibrasi"
                    : "Riwayat Ganti Suku Cadang"}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex justify-end sm:flex-row gap-4 p-4 border-b">
            <Button
              variant="outline"
              onClick={() => {
                if (activeTab === "maintenance") {
                  setShowMaintenanceFilterModal(true)
                } else if (activeTab === "kalibrasi") {
                  setShowCalibrationFilterModal(true)
                } else {
                  setShowPartsFilterModal(true)
                }
              }}
              className="w-full sm:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters(activeTab) && (
            <div className="p-4 border-b flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground mr-2">Filter aktif:</span>

              {activeTab === "maintenance" && (
                <>
                  {maintenanceFilters.search && (
                    <HistoryFilterBadge
                      label="Pencarian"
                      value={maintenanceFilters.search}
                      onRemove={() => handleRemoveFilter("search", "maintenance")}
                    />
                  )}
                  {maintenanceFilters.result && (
                    <HistoryFilterBadge
                      label="Hasil"
                      value={maintenanceFilters.result}
                      onRemove={() => handleRemoveFilter("result", "maintenance")}
                    />
                  )}
                  {maintenanceFilters.maintenanceDateStart && (
                    <HistoryFilterBadge
                      label="Tanggal Maintenance Dari"
                      value={maintenanceFilters.maintenanceDateStart}
                      onRemove={() => handleRemoveFilter("maintenanceDateStart", "maintenance")}
                    />
                  )}
                  {maintenanceFilters.maintenanceDateEnd && (
                    <HistoryFilterBadge
                      label="Tanggal Maintenance Sampai"
                      value={maintenanceFilters.maintenanceDateEnd}
                      onRemove={() => handleRemoveFilter("maintenanceDateEnd", "maintenance")}
                    />
                  )}
                  {maintenanceFilters.createdOnStart && (
                    <HistoryFilterBadge
                      label="Tanggal Dibuat Dari"
                      value={maintenanceFilters.createdOnStart}
                      onRemove={() => handleRemoveFilter("createdOnStart", "maintenance")}
                    />
                  )}
                  {maintenanceFilters.createdOnEnd && (
                    <HistoryFilterBadge
                      label="Tanggal Dibuat Sampai"
                      value={maintenanceFilters.createdOnEnd}
                      onRemove={() => handleRemoveFilter("createdOnEnd", "maintenance")}
                    />
                  )}
                </>
              )}

              {activeTab === "kalibrasi" && (
                <>
                  {calibrationFilters.search && (
                    <HistoryFilterBadge
                      label="Pencarian"
                      value={calibrationFilters.search}
                      onRemove={() => handleRemoveFilter("search", "kalibrasi")}
                    />
                  )}
                  {calibrationFilters.result && (
                    <HistoryFilterBadge
                      label="Hasil"
                      value={calibrationFilters.result}
                      onRemove={() => handleRemoveFilter("result", "kalibrasi")}
                    />
                  )}
                  {calibrationFilters.calibrationMethod && (
                    <HistoryFilterBadge
                      label="Metode Kalibrasi"
                      value={calibrationFilters.calibrationMethod}
                      onRemove={() => handleRemoveFilter("calibrationMethod", "kalibrasi")}
                    />
                  )}
                  {calibrationFilters.calibrationDateStart && (
                    <HistoryFilterBadge
                      label="Tanggal Kalibrasi Dari"
                      value={calibrationFilters.calibrationDateStart}
                      onRemove={() => handleRemoveFilter("calibrationDateStart", "kalibrasi")}
                    />
                  )}
                  {calibrationFilters.calibrationDateEnd && (
                    <HistoryFilterBadge
                      label="Tanggal Kalibrasi Sampai"
                      value={calibrationFilters.calibrationDateEnd}
                      onRemove={() => handleRemoveFilter("calibrationDateEnd", "kalibrasi")}
                    />
                  )}
                  {calibrationFilters.nextCalibrationDueBefore && (
                    <HistoryFilterBadge
                      label="Kalibrasi Berikutnya Sebelum"
                      value={calibrationFilters.nextCalibrationDueBefore}
                      onRemove={() => handleRemoveFilter("nextCalibrationDueBefore", "kalibrasi")}
                    />
                  )}
                  {calibrationFilters.createdOnStart && (
                    <HistoryFilterBadge
                      label="Tanggal Dibuat Dari"
                      value={calibrationFilters.createdOnStart}
                      onRemove={() => handleRemoveFilter("createdOnStart", "kalibrasi")}
                    />
                  )}
                  {calibrationFilters.createdOnEnd && (
                    <HistoryFilterBadge
                      label="Tanggal Dibuat Sampai"
                      value={calibrationFilters.createdOnEnd}
                      onRemove={() => handleRemoveFilter("createdOnEnd", "kalibrasi")}
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
                      onRemove={() => handleRemoveFilter("search", "ganti_suku_cadang")}
                    />
                  )}
                  {partsFilters.sparepartId && (
                    <HistoryFilterBadge
                      label="ID Suku Cadang"
                      value={partsFilters.sparepartId}
                      onRemove={() => handleRemoveFilter("sparepartId", "ganti_suku_cadang")}
                    />
                  )}
                  {partsFilters.result && (
                    <HistoryFilterBadge
                      label="Hasil"
                      value={partsFilters.result}
                      onRemove={() => handleRemoveFilter("result", "ganti_suku_cadang")}
                    />
                  )}
                  {partsFilters.replacementDateStart && (
                    <HistoryFilterBadge
                      label="Tanggal Penggantian Dari"
                      value={partsFilters.replacementDateStart}
                      onRemove={() => handleRemoveFilter("replacementDateStart", "ganti_suku_cadang")}
                    />
                  )}
                  {partsFilters.replacementDateEnd && (
                    <HistoryFilterBadge
                      label="Tanggal Penggantian Sampai"
                      value={partsFilters.replacementDateEnd}
                      onRemove={() => handleRemoveFilter("replacementDateEnd", "ganti_suku_cadang")}
                    />
                  )}
                  {partsFilters.createdOnStart && (
                    <HistoryFilterBadge
                      label="Tanggal Dibuat Dari"
                      value={partsFilters.createdOnStart}
                      onRemove={() => handleRemoveFilter("createdOnStart", "ganti_suku_cadang")}
                    />
                  )}
                  {partsFilters.createdOnEnd && (
                    <HistoryFilterBadge
                      label="Tanggal Dibuat Sampai"
                      value={partsFilters.createdOnEnd}
                      onRemove={() => handleRemoveFilter("createdOnEnd", "ganti_suku_cadang")}
                    />
                  )}
                </>
              )}

              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="ml-auto">
                <X className="h-3 w-3 mr-1" /> Hapus semua filter
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Deskripsi</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Teknisi</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Hasil</th>
                  {activeTab === "kalibrasi" && (
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Metode</th>
                  )}
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistories ? (
                  <tr>
                    <td colSpan={activeTab === "kalibrasi" ? 5 : 4} className="py-4 text-center">
                      Memuat...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      onClick={() => handleHistoryRowClick(item)}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">{item.actionPerformed}</td>
                      <td className="py-3 px-4">{item.technician}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultClass(item.result)}`}>
                          {getResultText(item.result)}
                        </span>
                      </td>
                      {activeTab === "kalibrasi" && (
                        <td className="py-3 px-4">{(item as CalibrationHistory).calibrationMethod}</td>
                      )}
                      <td className="py-3 px-4">
                        {formatDate(
                          activeTab === "ganti_suku_cadang"
                            ? (item as SparepartHistory).replacementDate
                            : activeTab === "maintenance"
                              ? (item as MaintenanceHistory).maintenanceDate
                              : (item as CalibrationHistory).calibrationDate,
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === "kalibrasi" ? 5 : 4} className="py-4 text-center">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
                      : filteredSparepartHistories.length) / itemsPerPage,
                ),
              )}
              onPageChange={setCurrentPage}
            />
          </div>
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
            data={selectedHistory!} // Tipe sudah diperbaiki
            type={
            activeTab === "maintenance"
                ? "maintenance"
                : activeTab === "kalibrasi"
                ? "calibration"
                : "sparepart"
            }
        />
        )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? "-"}</div>
    </div>
  )
}
