/* eslint-disable */
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
import RequestFilterModal, {
  type RequestFilters as Filters,
} from "@/components/general/request-filter-modal";
import { toast } from "sonner";
import Cookies from "js-cookie";

type MaintenanceRequest = {
  id: string;
  userId: string;
  medicalEquipment: string;
  complaint: string | null; 
  submissionDate: string;
  status: string;
  createdOn: string | null;
  modifiedOn: string;
};

export default function MaintenanceRequestDisplay() {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
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

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const queryParams = buildQueryParams(filters);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/request/maintenance`;

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
        throw new Error("Failed to fetch maintenance requests");
      }

      const data = await response.json();
      setMaintenanceRequests(data.data);
    } catch (err) {
      console.error("Error fetching maintenance requests:", err);
      toast.error("Gagal memuat permintaan pemeliharaan");
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

  const handleDelete = async (requestId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus permintaan pemeliharaan ini?")) {
      return;
    }

    try {
      const token = Cookies.get("token");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/request/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus permintaan pemeliharaan");
      }

      fetchMaintenanceRequests();
      toast.info("Permintaan pemeliharaan berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus permintaan pemeliharaan");
    }
  };

  useEffect(() => {
    fetchMaintenanceRequests();
  }, [search, filters]);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const success = searchParams.get("success");

    if (success === "create") {
      setTimeout(() => toast.info("Permintaan pemeliharaan berhasil dibuat"), 100);
    }
    if (success === "delete") {
      setTimeout(() => toast.info("Permintaan pemeliharaan berhasil dihapus"), 100);
    }
    hasRun.current = true;
  }, [searchParams]);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "on progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigateToRequestEdit = (requestId: string) => {
    router.push(`/dashboard/requests/all/${requestId}/edit`);
  };

  const navigateToRequestDetail = (requestId: string) => {
    router.push(`/dashboard/request/${requestId}`);
  };

  const navigateToRequestCreate = () => {
    router.push(`/dashboard/request/create`);
  };

  return (
    <div className="space-y-6 font-plus-jakarta-sans">
      <h1 className="text-header-h5 font-bold font-poppins">Permintaan Pemeliharaan</h1>

      {/* Header Section */}
      <div className="bg-primary-solid items-center p-2 flex gap-3 h-fit text-white rounded-lg overflow-hidden">
        <div className="flex items-center justify-center w-[264px] h-[224px] border border-primary-super-light rounded-lg">
          illustration
        </div>

        <div className="flex flex-col gap-6 py-6 px-6">
          <div className="space-y-2">
            <h2 className="text-header-h6 font-bold font-poppins">
              Permintaan Pemeliharaan
            </h2>
            <p className="text-s-medium">
              Kelola, pantau, dan atur semua permintaan pemeliharaan alat medis
              dalam sistem, termasuk penambahan, pembaruan, status, dan catatan.
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-fit"
            onClick={() => navigateToRequestCreate()}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Permintaan
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
            placeholder="Cari permintaan pemeliharaan..."
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
            Memuat Permintaan Pemeliharaan...
          </div>
        </div>
      )}

      {/* Maintenance Request Table */}
      {!loading && (
        <div className="border rounded-lg overflow-hidden">
          <Table data-testid="maintenance-requests-table">
            <TableHeader>
              <TableRow>
                <TableHead>Kode Inventaris</TableHead>
                <TableHead>Nama Alat</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceRequests.length > 0 ? (
                maintenanceRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigateToRequestDetail(request.id)
                    }
                    data-testid={`request-row-${request.id}`}
                  >
                    <TableCell>{request.medicalEquipment}</TableCell>
                    <TableCell>{request.medicalEquipment}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{request.complaint || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(request.status)}`}>
                        {request.status}
                      </span>
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
                            navigateToRequestEdit(
                              request.id
                            );
                          }}
                          data-testid={`edit-button-${request.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(request.id);
                          }}
                          data-testid={`delete-button-${request.id}`}
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
                    colSpan={5}
                    className="text-center"
                  >
                    {search
                      ? "Tidak ada permintaan pemeliharaan yang cocok dengan pencarian Anda"
                      : "Tidak ada permintaan pemeliharaan yang ditemukan"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <RequestFilterModal
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