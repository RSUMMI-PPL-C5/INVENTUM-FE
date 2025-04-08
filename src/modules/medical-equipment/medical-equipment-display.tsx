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
import MedicalEquipmentFilterModal, {
  type MedicalEquipmentFilters as Filters,
} from "@/components/general/medicalequipment-filter-modal";
import { toast } from "sonner";
import Cookies from "js-cookie";

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


export default function MedicalEquipmentPage() {
  const [medicalEquipments, setMedicalEquipments] = useState<MedicalEquipment[]>([]);
  const [search, setSearch] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: [],
    createdOnStart: null,
    createdOnEnd: null,
    modifiedOnStart: null,
    modifiedOnEnd: null,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = new URLSearchParams();
  const searchParams = useSearchParams();

  const fetchMedicalEquipments = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const queryParams = buildQueryParams(filters);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment`;

      if (queryParams || search) {
        const searchParam = search ? `search=${search}` : "";
        url += `?${[queryParams, searchParam].filter(Boolean).join("&")}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const res = await response.json();
        console.log(res);
        throw new Error("Failed to fetch medical equipments");
      }

      const data = await response.json();
      setMedicalEquipments(data);
    } catch (err) {
      console.error("Error fetching medical equipments:", err);
    } finally {
      setLoading(false);
    }
  };

  const buildQueryParams = (filters: Filters): string => {
    filters.status.forEach((status) => {
        params.append("status", status);
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

  const handleDelete = async (equipmentId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus alat medis ini?")) {
      return;
    }

    try {
      const token = Cookies.get("token");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus alat medis");
      }

      fetchMedicalEquipments();
      toast.info("Alat medis berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus alat medis");
    }
  };

  useEffect(() => {
    fetchMedicalEquipments();
  }, [search, filters]);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const success = searchParams.get("success");

    if (success === "create") {
      setTimeout(() => toast.info("Alat medis berhasil dibuat"), 100);
    }
    if (success === "delete") {
      setTimeout(() => toast.info("Alat medis berhasil dihapus"), 100);
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

  const formatPrice = (price: number | null) => {
    if (price === null) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigateToEquipmentEdit = (equipmentId: string) => {
    router.push(`/dashboard/medical-equipment/${equipmentId}/edit`);
  };

  const navigateToEquipmentDetail = (equipmentId: string) => {
    router.push(`/dashboard/medical-equipment/${equipmentId}`);
  };

  const navigateToEquipmentCreate = () => {
    router.push(`/dashboard/medical-equipment/create`);
  };

  return (
    <div className="space-y-6 font-plus-jakarta-sans">
      <h1 className="text-header-h5 font-bold font-poppins">Alat Medis</h1>

      {/* Header Section */}
      <div className="bg-primary-solid items-center p-2 flex gap-3 h-fit text-white rounded-lg overflow-hidden">
        <div className="flex items-center justify-center w-[264px] h-[224px] border border-primary-super-light rounded-lg">
          illustration
        </div>

        <div className="flex flex-col gap-6 py-6 px-6">
          <div className="space-y-2">
            <h2 className="text-header-h6 font-bold font-poppins">
              Alat Medis
            </h2>
            <p className="text-s-medium">
              Kelola, pantau, dan atur semua alat medis dalam
              sistem, termasuk penambahan, pembaruan, penghapusan,
              serta pengelolaan status alat medis.
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-fit"
            onClick={() => navigateToEquipmentCreate()}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Alat Medis
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
            placeholder="Cari alat medis ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10"
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
            Memuat Alat Medis...
          </div>
        </div>
      )}

      {/* Medical Equipment Table */}
      {!loading && (
        <div className="border rounded-lg overflow-hidden">
          <Table data-testid="medical-equipments-table">
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Inventaris</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Tanggal Pembelian</TableHead>
                <TableHead className="text-center">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicalEquipments.length > 0 ? (
                medicalEquipments.map((equipment) => (
                  <TableRow
                    key={equipment.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigateToEquipmentDetail(equipment.id)
                    }
                    data-testid={`equipment-row-${equipment.id}`}
                  >
                    <TableCell>{equipment.inventorisId}</TableCell>
                    <TableCell>{equipment.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(equipment.status)}`}>
                        {equipment.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatPrice(equipment.purchasePrice)}</TableCell>
                    <TableCell>
                      {formatDate(equipment.purchaseDate)}
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
                            navigateToEquipmentEdit(
                              equipment.id
                            );
                          }}
                          data-testid={`edit-button-${equipment.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(equipment.id);
                          }}
                          data-testid={`delete-button-${equipment.id}`}
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
                    colSpan={6}
                    className="text-center"
                  >
                    {search
                      ? "Tidak ada alat medis yang cocok dengan pencarian Anda"
                      : "Tidak ada alat medis yang ditemukan"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <MedicalEquipmentFilterModal
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