"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function MedicalEquipmentDetails() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;

  const [equipment, setEquipment] = useState<MedicalEquipment | null>(null);
  const [maintenanceHistories, setMaintenanceHistories] = useState<MaintenanceHistory[]>([]);
  const [calibrationHistories, setCalibrationHistories] = useState<CalibrationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistories, setLoadingHistories] = useState(true);
  const [activeTab, setActiveTab] = useState<'maintenance' | 'kalibrasi' | 'ganti_suku_cadang'>('maintenance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get("accessToken");
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
      const [maintenanceRes, calibrationRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/maintenance-history`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}/calibration-history`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      const maintenanceData = await maintenanceRes.json();
      const calibrationData = await calibrationRes.json();
      setMaintenanceHistories(maintenanceData.data || []);
      setCalibrationHistories(calibrationData.data || []);
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
    : calibrationHistories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
        <span className="text-muted-foreground">{">"}</span>
        <span className="text-sm font-medium">{equipment?.name || "Loading..."}</span>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Detail */}
        <div className="col-span-1 bg-blue-50 p-6 rounded-lg space-y-4">
          {loading ? (
            <div className="h-6 bg-muted animate-pulse w-1/2 rounded" />
          ) : equipment ? (
            <>
              <h1 className="text-xl font-bold">{equipment.name}</h1>
              <p className="text-muted-foreground">{equipment.brandName ?? "-"}</p>

              {/* Detail Box */}
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

              {/* Action */}
              <div className="flex flex-col gap-2 pt-6">
                <Button size="sm" className="gap-1 w-full">
                  <PlusCircle className="h-4 w-4" /> Minta Maintenance
                </Button>
                <Button size="sm" variant="outline" className="gap-1 w-full">
                  <PlusCircle className="h-4 w-4" /> Minta Kalibrasi
                </Button>
              </div>

              {/* Info */}
              <div className="space-y-2 pt-4">
                <AlertBox type="warning" message="Terdapat permintaan maintenance dalam proses." />
                <AlertBox type="error" message="Terdapat permintaan kalibrasi belum diproses." />
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Alat tidak ditemukan.</p>
          )}
        </div>

        {/* Right: History */}
        <div className="col-span-2 bg-white border rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="flex border-b">
            {["maintenance", "kalibrasi", "ganti_suku_cadang"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab as any); setCurrentPage(1); }}
                className={`py-4 px-6 text-sm font-medium transition-colors ${activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-primary/80'}`}
              >
                {tab === "maintenance"
                  ? "Maintenance"
                  : tab === "kalibrasi"
                    ? "Kalibrasi"
                    : "Ganti Suku Cadang"}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Kode Inventaris</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Nama Alat</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Merek</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Model</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistories ? (
                  <tr><td colSpan={4} className="py-4 text-center">Loading...</td></tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 border-b">
                      <td className="py-3 px-4">{equipment?.inventorisId || "-"}</td>
                      <td className="py-3 px-4">{equipment?.name || "-"}</td>
                      <td className="py-3 px-4">{equipment?.brandName || "-"}</td>
                      <td className="py-3 px-4">{equipment?.modelName || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="text-amber-600 font-medium">Tidak ada data.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex justify-center">
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(
                (activeTab === 'maintenance' ? maintenanceHistories.length : calibrationHistories.length) / itemsPerPage
              ))}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}

function AlertBox({ type, message }: { type: 'warning' | 'error'; message: string }) {
  const color = type === "warning" ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-800";
  return (
    <div className={`flex items-center gap-2 p-3 rounded ${color}`}>
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  );
}