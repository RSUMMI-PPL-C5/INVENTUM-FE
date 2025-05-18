"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CartesianGrid, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Hook untuk mengukur ukuran layar secara responsif
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // Hanya jalankan di browser
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
      handleResize(); // Set ukuran awal
      
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return windowSize;
};

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

// Tipe data untuk status permintaan
interface RequestStatusData {
  status: string
  count: number
  percentage: number
}

// Tipe data untuk respons status permintaan dari API
interface RequestStatusResponse {
  MAINTENANCE: RequestStatusData[]
  CALIBRATION: RequestStatusData[]
  total: {
    success: number
    warning: number
    failed: number
    total: number
  }
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
  const { width } = useWindowSize();
  
  // Menentukan konfigurasi responsif berdasarkan lebar layar
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  if (loading) {
    return (
      <div className="h-[250px] sm:h-[300px] md:h-[350px] flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    );
  }
  
  if (monthlyData.length === 0) {
    return (
      <div className="h-[250px] sm:h-[300px] md:h-[350px] flex items-center justify-center text-muted-foreground">
        Tidak ada data permintaan untuk ditampilkan
      </div>
    );
  }

  // Custom tooltip yang responsif
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const currentData = monthlyData.find(data => data.month === label);
      
      return (
        <div className="bg-white p-2 sm:p-3 border rounded shadow-sm">
          <p className="font-medium text-xs sm:text-sm">{currentData?.fullMonth ?? label}</p>
          <p className={`text-xs sm:text-sm text-blue-600 ${isMobile ? 'mt-0.5' : 'mt-1'}`}>
            Pemeliharaan: {payload[0].value}
          </p>
          <p className={`text-xs sm:text-sm text-purple-600 ${isMobile ? 'mt-0.5' : 'mt-1'}`}>
            Kalibrasi: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Konfigurasikan margin berdasarkan ukuran layar
  const chartMargin = isMobile 
    ? { top: 5, right: 10, left: 5, bottom: 40 }
    : isTablet
      ? { top: 5, right: 20, left: 15, bottom: 30 }
      : { top: 5, right: 30, left: 20, bottom: 25 };

  // Konfigurasi interval label berdasarkan jumlah data dan lebar layar
  // Untuk menghindari tumpang tindih pada layar kecil
  const labelInterval = isMobile
    ? Math.max(1, Math.floor(monthlyData.length / 4))
    : isTablet
      ? Math.max(0, Math.floor(monthlyData.length / 6))
      : 0;
      
  return (
    <div className="h-[250px] sm:h-[300px] md:h-[350px] flex justify-center">
      <ResponsiveContainer width="95%" height="100%"> 
        <BarChart
          data={monthlyData}
          margin={{ top: 5, right: 20, left: 20, bottom: 25 }} 
          barGap={isMobile ? 3 : 8}
          barSize={isMobile ? 15 : isTablet ? 25 : 35}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={!isMobile} />
          <XAxis 
            dataKey="month" 
            tick={{ 
              fontSize: isMobile ? 9 : isTablet ? 10 : 12,
              fill: "#64748b"
            }} 
            height={isMobile ? 50 : 40} 
            tickMargin={5}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            interval={labelInterval}
          />
          <YAxis 
            width={isMobile ? 25 : isTablet ? 35 : 40}
            tick={{ fontSize: isMobile ? 9 : isTablet ? 10 : 12 }}
            tickFormatter={(value) => (value === 0 ? "0" : value.toString())}
          />
          <Tooltip 
            content={CustomTooltip}
            wrapperStyle={{ zIndex: 1000 }}
          />
          <Legend 
            verticalAlign={isMobile ? "bottom" : "bottom"}
            height={isMobile ? 36 : 40}
            iconSize={isMobile ? 10 : 12}
            wrapperStyle={{ 
              fontSize: isMobile ? '11px' : isTablet ? '12px' : '14px',
              paddingTop: isMobile ? '5px' : '0px',
              fontWeight: 500 
            }}
          />
          <Bar 
            dataKey="maintenance" 
            fill="#3b82f6" 
            name="Pemeliharaan"
            radius={[3, 3, 0, 0]}
            // Animasi yang lebih cepat untuk perangkat mobile
            animationDuration={isMobile ? 500 : 1000}
          />
          <Bar 
            dataKey="calibration" 
            fill="#8b5cf6" 
            name="Kalibrasi"
            radius={[3, 3, 0, 0]} 
            // Animasi yang lebih cepat untuk perangkat mobile
            animationDuration={isMobile ? 500 : 1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Custom active shape for pie charts
const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props
  const RADIAN = Math.PI / 180
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? "start" : "end"

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={12} fontWeight="bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>{`${value} (${(percent * 100).toFixed(0)}%)`}</text>
    </g>
  )
}

export default function DashboardCharts() {
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<FormattedChartData[]>([])
  const [statusLoading, setStatusLoading] = useState(true)
  const [maintenanceStatusData, setMaintenanceStatusData] = useState<any[]>([])
  const [calibrationStatusData, setCalibrationStatusData] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    fetchMonthlyRequestData()
    fetchRequestStatusData()
  }, [])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

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

  const fetchRequestStatusData = async () => {
    try {
      setStatusLoading(true)
      const token = Cookies.get("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/request-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch request status data")
      }

      const responseData = await response.json()
      
      if (!responseData.success || !responseData.data) {
        throw new Error("Invalid response format")
      }
      
      const statusData: RequestStatusResponse = responseData.data
      
      // Format maintenance data for pie chart
      const maintenanceFormatted = statusData.MAINTENANCE.map(item => ({
        name: item.status === "Partial" ? "Warning" : item.status,
        value: item.count,
        percentage: item.percentage,
        color: getStatusColor(item.status)
      }))
      
      // Format calibration data for pie chart
      const calibrationFormatted = statusData.CALIBRATION.map(item => ({
        name: item.status === "Partial" ? "Warning" : item.status,
        value: item.count,
        percentage: item.percentage,
        color: getStatusColor(item.status)
      }))
      
      setMaintenanceStatusData(maintenanceFormatted)
      setCalibrationStatusData(calibrationFormatted)
    } catch (error) {
      console.error("Error fetching request status data:", error)
      toast.error("Gagal memuat data status permintaan")
      // Set default empty data
      setMaintenanceStatusData([])
      setCalibrationStatusData([])
    } finally {
      setStatusLoading(false)
    }
  }
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Success":
        return "#22c55e" // green-500
      case "Partial":
        return "#f59e0b" // amber-500
      case "Failed":
        return "#ef4444" // red-500
      default:
        return "#8884d8" // default color
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

  // Status request card content
  const renderStatusRequestCard = () => {
    if (statusLoading) {
      return (
        <div className="h-[250px] sm:h-[300px] md:h-[350px] flex items-center justify-center">
          <p>Memuat data...</p>
        </div>
      )
    }

    return (
      <Tabs defaultValue="maintenance">
        <TabsList className="mb-4">
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="calibration">Kalibrasi</TabsTrigger>
        </TabsList>
        <TabsContent value="maintenance" className="h-[250px] sm:h-[300px]">
          {maintenanceStatusData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Tidak ada data status permintaan untuk ditampilkan
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={maintenanceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {maintenanceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </TabsContent>
        <TabsContent value="calibration" className="h-[250px] sm:h-[300px]">
          {calibrationStatusData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Tidak ada data status permintaan untuk ditampilkan
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={calibrationStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {calibrationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Pemeliharaan</p>
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold">124</h2>
                <div className="flex items-center text-xs sm:text-sm text-green-600">
                  <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>+12.5%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Bulan ini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Kalibrasi</p>
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold">87</h2>
                <div className="flex items-center text-xs sm:text-sm text-green-600">
                  <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>+5.2%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Bulan ini</p>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 md:col-span-1">
          <CardContent className="pt-4 sm:pt-6">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Penggantian Suku Cadang</p>
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold">36</h2>
                <div className="flex items-center text-xs sm:text-sm text-red-600">
                  <ArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>-2.1%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Bulan ini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Status Request Pie Chart */}
        <Card>
          <CardHeader className="pb-0 sm:pb-2">
            <CardTitle className="text-base sm:text-lg">Status Permintaan</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Distribusi status permintaan pemeliharaan dan kalibrasi</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStatusRequestCard()}
          </CardContent>
        </Card>

        {/* Monthly Requests Bar Chart */}
        <Card>
          <CardHeader className="pb-0 sm:pb-1">
            <CardTitle className="text-base sm:text-lg">Permintaan Bulanan</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Jumlah permintaan pemeliharaan dan kalibrasi per bulan</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-0 pt-7 pb-0">
            {renderChartContent(loading, monthlyData)}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}