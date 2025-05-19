"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface PlansProps {
  type: "MAINTENANCE" | "CALIBRATION"
}

interface PlanItem {
  id: string
  medicalEquipment: string
  createdOn: string
  status: string
  user: {
    fullname: string
    divisiId: number
  }
}

export default function MaintenanceCalibrationPlans({ type }: Readonly<PlansProps>) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PlanItem[]>([])
  const [search, setSearch] = useState("")
  
  useEffect(() => {
    fetchPlans()
  }, [type, search])
  
  const fetchPlans = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("accessToken")
      
      const url = `${process.env.NEXT_PUBLIC_API_URL}/report/plans?type=${type}&search=${search}`;
      
      console.log(`Fetching ${type} plans data from:`, url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        // Get more details about the error
        const statusCode = response.status;
        const statusText = response.statusText;
        
        console.error(`API Error (${statusCode}): ${statusText}`);
        
        // Show a more specific error message based on the status code
        if (statusCode === 401 || statusCode === 403) {
          toast.error("Akses ditolak. Silakan login kembali.");
        } else if (statusCode === 404) {
          toast.error("API endpoint tidak ditemukan. Hubungi administrator.");
        } else if (statusCode >= 500) {
          toast.error("Server sedang bermasalah. Coba lagi nanti.");
        } else {
          toast.error(`Gagal memuat data rencana ${type === "MAINTENANCE" ? "pemeliharaan" : "kalibrasi"} (${statusCode})`);
        }
        
        setData([]);
        return; // Exit the function early to avoid the throw
      }

      const result = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        setData(result.data)
      } else {
        console.warn("API returned success=false or non-array data:", result);
        setData([])
        toast.error("Format data tidak sesuai");
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
      toast.error("Kesalahan jaringan saat memuat data rencana")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Rencana {type === "MAINTENANCE" ? "Pemeliharaan" : "Kalibrasi"}</h2>
        
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari peralatan..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="py-8 text-center">Memuat data...</div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Tidak ada data rencana {type === "MAINTENANCE" ? "pemeliharaan" : "kalibrasi"}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peralatan</TableHead>
              <TableHead>Tanggal Rencana</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.medicalEquipment}</TableCell>
                <TableCell>{formatDate(item.createdOn)}</TableCell>
                <TableCell>Divisi {item.user?.divisiId || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "Completed" ? "default" : 
                      item.status === "Pending" ? "secondary" : 
                      item.status === "Rejected" ? "destructive" : 
                      "outline"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}