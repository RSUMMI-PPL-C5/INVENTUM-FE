"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sliders, Wrench, ClipboardCheck, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-control";
import Cookies from "js-cookie";
import { toast } from "sonner";

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
  sparepartName: string;
  replacementDate: string;
  actionPerformed: string;
  technician: string;
  createdBy: string;
  createdOn: string;
};

export default function MedicalEquipmentDetails() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;

  const [equipment, setEquipment] = useState<MedicalEquipment | null>(null);
  const [maintenanceHistories, setMaintenanceHistories] = useState<MaintenanceHistory[]>([]);
  const [calibrationHistories, setCalibrationHistories] = useState<CalibrationHistory[]>([]);
  const [sparepartHistories, setSparepartHistories] = useState<SparepartHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistories, setLoadingHistories] = useState(true);
  const [activeTab, setActiveTab] = useState<'maintenance' | 'kalibrasi' | 'ganti_suku_cadang'>('maintenance');
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<string>("");
  const itemsPerPage = 5;

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const [maintenanceRes, calibrationRes, sparepartRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/maintenance-history`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/calibration-history`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/parts-history`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      const maintenanceData = await maintenanceRes.json();
      const calibrationData = await calibrationRes.json();
      const sparepartData = await sparepartRes.json();

      setMaintenanceHistories(maintenanceData.data || []);
      setCalibrationHistories(calibrationData.data || []);
      setSparepartHistories(sparepartData.data || []);
    } catch {
      toast.error("Gagal memuat histori");
    } finally {
      setLoadingHistories(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    fetchEquipment();
    fetchHistories();
  }, [fetchEquipment, fetchHistories]);

  const handleGoBack = () => router.back();
  const handleAddCalibration = () => router.push(`/dashboard/medical-equipment/${equipmentId}/calibration`);
  const handleAddMaintenance = () => router.push(`/dashboard/medical-equipment/${equipmentId}/maintenance`);
  const handleAddSparePart = () => router.push(`/dashboard/medical-equipment/${equipmentId}/spare-part`);
  const handleAddMaintenanceRequest = () => router.push(`/dashboard/medical-equipment/${equipmentId}/maintenance-request`);
  const handleAddCalibrationRequest = () => router.push(`/dashboard/medical-equipment/${equipmentId}/calibration-request`);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  const formatPrice = (price: number | null) => {
    if (price == null) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price);
  };

  const paginatedData = activeTab === "maintenance"
    ? maintenanceHistories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : activeTab === "kalibrasi"
    ? calibrationHistories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sparepartHistories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tabs = ["maintenance", "kalibrasi", "ganti_suku_cadang"] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-blue-50 p-6 rounded-lg space-y-4">
          {loading ? (
            <div className="h-6 bg-muted animate-pulse w-1/2 rounded" />
          ) : equipment ? (
            <>
              <h1 className="text-header-h6 font-bold">{equipment.name}</h1>
              <p className="text-sm text-muted-foreground">{equipment.brandName ?? "-"}</p>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <DetailItem label="Kode Inventaris" value={equipment.inventorisId} />
                <DetailItem label="Model" value={equipment.modelName} />
                <DetailItem label="Status" value={equipment.status} />
                <DetailItem label="Tanggal Pembelian" value={formatDate(equipment.purchaseDate)} />
                <DetailItem label="Harga Pembelian" value={formatPrice(equipment.purchasePrice)} />
                <DetailItem label="Vendor" value={equipment.vendor} />
                <DetailItem label="Dibuat Pada" value={formatDate(equipment.createdOn)} />
                <DetailItem label="Diperbarui Pada" value={formatDate(equipment.modifiedOn)} />
              </div>

              <div className="flex flex-col gap-3 pt-6">
                {["Admin", "Fasum"].includes(userRole) && (
                  <>
                    <Button size="sm" className="gap-2 w-full" onClick={handleAddMaintenance}>
                      <Wrench className="h-4 w-4" /> Tambah Riwayat Maintenance
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
                      <ClipboardCheck className="h-4 w-4" /> Buat Permintaan Maintenance
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
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === tab ? 'border-b-2 border-primary-solid text-primary-solid' : 'text-muted-foreground hover:text-primary-solid/80'
                }`}
              >
                {tab === "maintenance" ? "Riwayat Maintenance" : tab === "kalibrasi" ? "Riwayat Kalibrasi" : "Riwayat Ganti Suku Cadang"}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Deskripsi</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistories ? (
                  <tr><td colSpan={5} className="py-4 text-center">Memuat...</td></tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4">{(item as MaintenanceHistory | CalibrationHistory | SparepartHistory).actionPerformed}</td>
                      <td className="py-3 px-4">
                        {formatDate((item as MaintenanceHistory | CalibrationHistory | SparepartHistory).createdOn)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="py-4 text-center">Tidak ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t p-4">
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(
                (activeTab === "maintenance"
                  ? maintenanceHistories.length
                  : activeTab === "kalibrasi"
                  ? calibrationHistories.length
                  : sparepartHistories.length
                ) / itemsPerPage
              ))}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value || "-"}</div>
    </div>
  );
}
