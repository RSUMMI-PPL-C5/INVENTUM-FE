"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CartesianGrid, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import Cookies from "js-cookie"
import { toast } from "sonner"

// Tipe data untuk respons dari API
interface MonthlyRequestData {
  month: string
  MAINTENANCE: number
  CALIBRATION: number
}

// Tipe data untuk chart yang lebih ramah pengguna
interface FormattedChartData {
  month: string
  fullMonth: string
  maintenance: number
  calibration: number
}

// Nama bulan lengkap untuk tampilan yang lebih baik
const monthNames = {
  "01": "Januari",
  "02": "Februari",
  "03": "Maret",
  "04": "April",
  "05": "Mei",
  "06": "Juni",
  "07": "Juli",
  "08": "Agustus",
  "09": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Desember"
}

// Nama bulan pendek untuk XAxis
const shortMonthNames = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "Mei",
  "06": "Jun",
  "07": "Jul",
  "08": "Agu",
  "09": "Sep",
  "10": "Okt",
  "11": "Nov",
  "12": "Des"
}

// Fungsi untuk menampilkan konten chart berdasarkan state
const renderChartContent = (loading: boolean, monthlyData: FormattedChartData[]) => {
  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    );
  }
  
  if (monthlyData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Tidak ada data permintaan untuk ditampilkan
      </div>
    );
  }

  // Custom tooltip untuk bar chart yang menggunakan nama bulan lengkap
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      // Cari data full bulan berdasarkan label
      const currentData = monthlyData.find(data => data.month === label);
      
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{currentData?.fullMonth ?? label}</p>
          <p className="text-sm text-blue-600">
            Pemeliharaan: {payload[0].value}
          </p>
          <p className="text-sm text-purple-600">
            Kalibrasi: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={monthlyData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }} 
            height={40} 
            tickMargin={10} 
          />
          <YAxis />
          <Tooltip content={CustomTooltip} />
          <Legend />
          <Bar 
            dataKey="maintenance" 
            fill="#3b82f6" 
            name="Pemeliharaan" 
          />
          <Bar 
            dataKey="calibration" 
            fill="#8b5cf6" 
            name="Kalibrasi" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function DashboardCharts() {
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<FormattedChartData[]>([])

  useEffect(() => {
    fetchMonthlyRequestData()
  }, [])

  const fetchMonthlyRequestData = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/monthly-requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch monthly request data")
      }

      const responseData = await response.json()
      
      // Periksa apakah response adalah array atau object dengan properti data
      let data: MonthlyRequestData[] = [];
      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        data = responseData.data;
      }
      
      console.log("Monthly request data:", data)
      
      if (data.length === 0) {
        setMonthlyData([])
        return
      }
      
      // Format data untuk chart
      const formattedData = formatDataForChart(data)
      setMonthlyData(formattedData)
    } catch (error) {
      console.error("Error fetching monthly request data:", error)
      toast.error("Gagal memuat data permintaan bulanan")
      setMonthlyData([])
    } finally {
      setLoading(false)
    }
  }

  const formatDataForChart = (data: MonthlyRequestData[]): FormattedChartData[] => {
    if (!Array.isArray(data) || data.length === 0) {
      return []
    }
    
    try {
      // Buat object untuk menggabungkan data per bulan
      const monthlyAggregates: Record<string, { maintenance: number; calibration: number }> = {};
      
      // Agregasi data per bulan
      data.forEach(item => {
        if (!item.month) return;
        
        const parts = item.month.split('-');
        if (parts.length !== 2) return;
        
        const [year, month] = parts;
        // Gunakan format untuk pengurutan bulan: YYYY-MM
        const monthKey = `${year}-${month}`;
        
        if (!monthlyAggregates[monthKey]) {
          monthlyAggregates[monthKey] = {
            maintenance: 0,
            calibration: 0
          };
        }
        
        monthlyAggregates[monthKey].maintenance += item.MAINTENANCE || 0;
        monthlyAggregates[monthKey].calibration += item.CALIBRATION || 0;
      });
      
      // Konversi agregat menjadi array dan urutkan berdasarkan bulan
      const sortedMonths = Object.keys(monthlyAggregates).sort((a, b) => a.localeCompare(b));
      
      // Format data untuk chart
      return sortedMonths.map(monthKey => {
        const parts = monthKey.split('-');
        const [year, month] = parts;
        
        // Only month name for x-axis (without year)
        const shortMonthName = shortMonthNames[month as keyof typeof shortMonthNames] || month;
        
        // Full month with year for tooltip
        const fullMonthName = `${monthNames[month as keyof typeof monthNames] || month} ${year}`;
        
        return {
          month: shortMonthName,
          fullMonth: fullMonthName,
          maintenance: monthlyAggregates[monthKey].maintenance,
          calibration: monthlyAggregates[monthKey].calibration
        };
      });
    } catch (error) {
      console.error("Error formatting chart data:", error)
      return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Pemeliharaan</p>
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-bold">124</h2>
                <div className="flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  <span>+12.5%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Bulan ini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Kalibrasi</p>
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-bold">87</h2>
                <div className="flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  <span>+5.2%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Bulan ini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Penggantian Suku Cadang</p>
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-bold">36</h2>
                <div className="flex items-center text-sm text-red-600">
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  <span>-2.1%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Bulan ini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placeholder for future pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Permintaan</CardTitle>
            <CardDescription>Distribusi status permintaan pemeliharaan dan kalibrasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Data status permintaan akan ditampilkan di sini
            </div>
          </CardContent>
        </Card>

        {/* Monthly Requests Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Permintaan Bulanan</CardTitle>
            <CardDescription>Jumlah permintaan pemeliharaan dan kalibrasi per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            {renderChartContent(loading, monthlyData)}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}