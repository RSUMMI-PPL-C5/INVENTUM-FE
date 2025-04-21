"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
  createdOn: string | null
  modifiedOn: string
}

type MaintenanceRecord = {
  id: string
  date: string
  technician: string
  result: string
  inventoryId: string
}

export default function MedicalEquipmentDetails() {
  const router = useRouter()
  const params = useParams()
  const equipmentId = params.id as string

  const [equipment, setEquipment] = useState<MedicalEquipment | null>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("maintenance")
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10

  const fetchEquipment = useCallback(async () => {
    if (!equipmentId) return

    setLoading(true)

    try {
      const token = Cookies.get("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        toast.error("Alat medis tidak ditemukan")
        throw new Error("Alat medis tidak ditemukan")
      }

      const data = await response.json()
      setEquipment(data)

      // Dummy data
      setMaintenanceRecords([
        { id: "1", date: "2023-04-15T09:30:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "2", date: "2023-03-10T14:45:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "3", date: "2023-02-22T11:15:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "4", date: "2023-01-05T10:00:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "5", date: "2022-12-18T13:30:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "6", date: "2022-11-30T15:45:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "7", date: "2022-10-12T09:00:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "8", date: "2022-09-25T14:15:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "9", date: "2022-08-07T11:30:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "10", date: "2022-07-19T10:45:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "11", date: "2022-06-02T16:00:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
        { id: "12", date: "2022-05-14T08:30:00", technician: "Teknisi", result: "Siemens", inventoryId: "INV-2325" },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }, [equipmentId])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  const handleGoBack = () => {
    router.push("/dashboard/medical-equipment")
  }

  const handleEdit = () => {
    router.push(`/dashboard/medical-equipment/${equipmentId}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus alat medis ini?")) {
      return
    }

    try {
      const token = Cookies.get("token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Gagal menghapus alat medis")
      }

      router.push("/dashboard/medical-equipment?success=delete")
    } catch {
      toast.error("Gagal menghapus alat medis")
    }
  }

  const handleMaintenanceRequest = () => {
    toast.success("Permintaan maintenance dibuat")
  }

  const handleCalibrationRequest = () => {
    toast.success("Permintaan kalibrasi dibuat")
  }

  const handleSparepartRequest = () => {
    toast.success("Permintaan ganti suku cadang dibuat")
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tidak ada"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error(error)
    }
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return "Tidak ada"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
      case "inactive":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6" data-testid="loading-state">
        <Button variant="outline" onClick={handleGoBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        <div className="border rounded-lg p-6 shadow-sm">
          <div className="h-8 w-1/3 bg-muted animate-pulse rounded mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-5 w-40 bg-muted animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !equipment) {
    return (
      <div className="p-6 space-y-4" data-testid="error-state">
        <Button variant="outline" onClick={handleGoBack} data-testid="back-button">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    )
  }

  // Success state with equipment details
  return (
    <div className="space-y-6" data-testid="equipment-detail">
      {/* Back button */}
      <Button variant="outline" onClick={handleGoBack} data-testid="back-button">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      {/* Equipment details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Equipment Info */}
        <div className="border rounded-lg p-6 shadow-sm bg-blue-900 text-white">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-header-h6 font-bold" data-testid="equipment-name">
              {equipment.name}
            </h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="bg-white text-blue-900" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="bg-white text-blue-900" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <p className="text-sm font-medium">Siemens</p>
              <p className="text-sm">XR-2000</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-300">Key: Value</p>
                <p className="text-sm text-blue-300">Key: Value</p>
              </div>
              <div>
                <p className="text-sm text-blue-300">Key: Value</p>
                <p className="text-sm text-blue-300">Key: Value</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <Button
              className="bg-white text-blue-900 hover:bg-blue-100 w-full flex items-center justify-center gap-2"
              onClick={handleMaintenanceRequest}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Maintenance
            </Button>

            <Button
              className="bg-white text-blue-900 hover:bg-blue-100 w-full flex items-center justify-center gap-2"
              onClick={handleCalibrationRequest}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="22" y1="12" x2="18" y2="12" />
                <line x1="6" y1="12" x2="2" y2="12" />
                <line x1="12" y1="6" x2="12" y2="2" />
                <line x1="12" y1="22" x2="12" y2="18" />
              </svg>
              Kalibrasi
            </Button>

            <Button
              className="bg-white text-blue-900 hover:bg-blue-100 w-full flex items-center justify-center gap-2"
              onClick={handleSparepartRequest}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
              Ganti Suku Cadang
            </Button>
          </div>
        </div>

        {/* Right Column - Maintenance History */}
        <div className="border rounded-lg shadow-sm">
          <div className="w-full">
            <div className="px-4 pt-4">
              {/* Custom tab navigation */}
              <div className="flex border-b mb-4">
                <button
                  onClick={() => setActiveTab("maintenance")}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === "maintenance" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                >
                  Maintenance
                </button>
                <button
                  onClick={() => setActiveTab("calibration")}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === "calibration" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                >
                  Kalibrasi
                </button>
                <button
                  onClick={() => setActiveTab("sparepart")}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === "sparepart" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                >
                  Ganti Suku Cadang
                </button>
              </div>

              <Input
                placeholder="Cari riwayat maintenance..."
                className="mb-4"
              />
            </div>

            {activeTab === "maintenance" && (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Teknisi</TableHead>
                        <TableHead>Hasil</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceRecords
                        .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{record.technician}</TableCell>
                            <TableCell>{record.result}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <span className="text-lg">...</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Custom pagination */}
                <div className="p-4 flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Previous</span>
                  </Button>

                  {[1, 2, 3, 4].map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8"
                    >
                      {page}
                    </Button>
                  ))}

                  <span className="mx-1">...</span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage * recordsPerPage >= maintenanceRecords.length}
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                    <span className="sr-only">Next</span>
                  </Button>
                </div>
              </>
            )}

            {activeTab === "calibration" && (
              <div className="p-6 text-center text-muted-foreground">
                Tidak ada riwayat kalibrasi
              </div>
            )}

            {activeTab === "sparepart" && (
              <div className="p-6 text-center text-muted-foreground">
                Tidak ada riwayat penggantian suku cadang
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-header-h6 font-bold mb-6">Detail Alat Medis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Nomor Inventaris</h3>
            <p className="text-sm" data-testid="equipment-inventoris-id">
              {equipment.inventorisId}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <p data-testid="equipment-status">
              <span className={getStatusClass(equipment.status)}>
                {equipment.status}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Merk</h3>
            <p className="text-sm" data-testid="equipment-brand">
              {equipment.brandName ?? "Tidak ada"}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Model</h3>
            <p className="text-sm" data-testid="equipment-model">
              {equipment.modelName ?? "Tidak ada"}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Harga</h3>
            <p className="text-sm" data-testid="equipment-price">
              {formatPrice(equipment.purchasePrice)}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Vendor</h3>
            <p className="text-sm" data-testid="equipment-vendor">
              {equipment.vendor ?? "Tidak ada"}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Tanggal Pembelian</h3>
            <p className="text-sm" data-testid="equipment-purchase-date">
              {formatDate(equipment.purchaseDate)}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Dibuat Pada</h3>
            <p className="text-sm" data-testid="equipment-created">
              {formatDate(equipment.createdOn)}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Dimodifikasi Pada</h3>
            <p className="text-sm" data-testid="equipment-modified">
              {formatDate(equipment.modifiedOn)}
            </p>
          </div>
        </div>

        <div className="flex space-x-4 bg-orange-100 text-orange-800 p-4 rounded-lg mt-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="font-medium">Terdapat permintaan maintenance yang sedang dalam proses.</p>
          </div>
        </div>

        <div className="flex space-x-4 bg-red-100 text-red-800 p-4 rounded-lg mt-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="font-medium">Terdapat permintaan kalibrasi yang belum diproses.</p>
          </div>
        </div>
      </div>
    </div>
  )
}