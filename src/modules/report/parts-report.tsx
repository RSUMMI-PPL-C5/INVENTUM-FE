"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { formatDate, formatCurrency } from "@/lib/utils"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface PartReportItem {
  id: string
  equipment: string
  partName: string
  quantity: number
  date: string
  technician: string
  cost: number
}

export default function PartsReport() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PartReportItem[]>([])
  const [search, setSearch] = useState("")
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1), // Jan 1st of current year
    to: new Date()
  })

  useEffect(() => {
    fetchPartsData()
  }, [search, date])

  const fetchPartsData = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("accessToken")
      
      // Format date params
      const startDate = date?.from ? date.from.toISOString().split('T')[0] : '2023-01-01'
      const endDate = date?.to ? date.to.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      
      // Updated to use the correct endpoint for parts data
      const url = `${process.env.NEXT_PUBLIC_API_URL}/report/results?` +
        `type=PARTS&search=${search}&startDate=${startDate}&endDate=${endDate}&page=1&limit=100`;
      
      console.log("Fetching parts data from:", url);
      
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
          toast.error(`Gagal memuat data penggantian suku cadang (${statusCode})`);
        }
        
        setData([]);
        return; // Exit the function early to avoid the throw
      }

      const result = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        // Add proper type annotation for the item parameter
        const formattedData = result.data.map((item: any) => ({
          id: item.id,
          equipment: item.medicalEquipment?.name || 'Unknown',
          partName: item.sparepart?.partsName || 'Unknown Part',
          quantity: 1, // Default to 1 if not specified
          date: item.replacementDate || item.date || '',
          technician: item.technician || 'Unknown',
          cost: item.sparepart?.price || 0
        }));
        setData(formattedData)
      } else {
        console.warn("API returned success=false or non-array data:", result);
        setData([])
      }
    } catch (error) {
      console.error("Error fetching parts data:", error)
      toast.error("Kesalahan jaringan saat memuat data penggantian suku cadang")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-medium">Penggantian Suku Cadang</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari peralatan atau parts..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <DateRangePicker 
            date={date}
            onDateChange={setDate}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="py-8 text-center">Memuat data...</div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Tidak ada data penggantian suku cadang
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peralatan</TableHead>
              <TableHead>Nama Suku Cadang</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Teknisi</TableHead>
              <TableHead>Biaya</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.equipment}</TableCell>
                <TableCell>{item.partName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{item.technician}</TableCell>
                <TableCell>{formatCurrency(item.cost)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}