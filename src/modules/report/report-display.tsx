"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardCharts from "@/modules/report/dashboard-charts"
import MaintenanceCalibrationHistory from "@/modules/report/maintenance-calibration-history"
import MaintenanceCalibrationPlans from "@/modules/report/maintenance-calibration-plans"
import PartsReport from "@/modules/report/parts-report"
import CommentsReport from "@/modules/report/comments-report"

export default function ReportDisplay() {
  return (
    <div className="w-full max-w-none py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Laporan</h1>
      </div>

      <div className="mb-8">
        <Card className="border-none shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg">Ringkasan</CardTitle>
            <CardDescription>Laporan aktivitas pemeliharaan dan kalibrasi</CardDescription>
          </CardHeader>
        </Card>
        <DashboardCharts />
      </div>

      <Tabs defaultValue="hasil" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rencana">Rencana</TabsTrigger>
          <TabsTrigger value="hasil">Hasil</TabsTrigger>
          <TabsTrigger value="rekap-tanggapan">Rekap Tanggapan</TabsTrigger>
        </TabsList>

        {/* Rencana Tab Content */}
        <TabsContent value="rencana">
          <Card>
            <CardHeader>
              <CardTitle>Rencana Maintenance & Kalibrasi</CardTitle>
              <CardDescription>Daftar perencanaan maintenance dan kalibrasi peralatan medis</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="maintenance" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="maintenance">Rencana Maintenance</TabsTrigger>
                  <TabsTrigger value="kalibrasi">Rencana Kalibrasi</TabsTrigger>
                </TabsList>

                <TabsContent value="maintenance" className="p-6">
                  <MaintenanceCalibrationPlans type="MAINTENANCE" />
                </TabsContent>

                <TabsContent value="kalibrasi" className="p-6">
                  <MaintenanceCalibrationPlans type="CALIBRATION" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hasil Tab Content */}
        <TabsContent value="hasil">
          <Card>
            <CardHeader>
              <CardTitle>Hasil Maintenance, Kalibrasi & Penggantian Parts</CardTitle>
              <CardDescription>Laporan hasil pelaksanaan maintenance, kalibrasi, dan penggantian parts</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="maintenance" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="maintenance">Hasil Maintenance</TabsTrigger>
                  <TabsTrigger value="kalibrasi">Hasil Kalibrasi</TabsTrigger>
                  <TabsTrigger value="parts">Penggantian Parts</TabsTrigger>
                </TabsList>

                <TabsContent value="maintenance" className="p-6">
                  <MaintenanceCalibrationHistory type="MAINTENANCE" />
                </TabsContent>

                <TabsContent value="kalibrasi" className="p-6">
                  <MaintenanceCalibrationHistory type="CALIBRATION" />
                </TabsContent>

                <TabsContent value="parts" className="p-6">
                  <PartsReport />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rekap Tanggapan Tab Content */}
        <TabsContent value="rekap-tanggapan">
          <Card>
            <CardHeader>
              <CardTitle>Rekap Tanggapan</CardTitle>
              <CardDescription>
                Rekap tanggapan dan komentar terkait permintaan maintenance dan kalibrasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommentsReport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}