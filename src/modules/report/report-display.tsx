"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import DashboardCharts from "@/modules/report/dashboard-charts";
import MaintenanceCalibrationHistory from "@/modules/report/maintenance-calibration-history";
import MaintenanceCalibrationPlans from "@/modules/report/maintenance-calibration-plans";
import PartsReport from "@/modules/report/parts-report";
import CommentsReport from "@/modules/report/comments-report";

export default function ReportDisplay() {
	return (
		<div className="w-full max-w-none py-4 px-2 md:px-4">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<h1 className="text-3xl font-bold">Laporan</h1>
			</div>

			<div className="mb-8">
				<Card className="border-none shadow-none">
					<CardHeader className="px-0 pt-0">
						<CardTitle className="text-base sm:text-lg">
							Ringkasan
						</CardTitle>
						<CardDescription className="text-xs sm:text-sm">
							Laporan aktivitas pemeliharaan dan kalibrasi
						</CardDescription>
					</CardHeader>
				</Card>
				<DashboardCharts />
			</div>

			<Tabs defaultValue="hasil" className="w-full">
				<TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
					<TabsTrigger
						value="rencana"
						className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all"
					>
						Rencana
					</TabsTrigger>
					<TabsTrigger
						value="hasil"
						className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all"
					>
						Hasil
					</TabsTrigger>
					<TabsTrigger
						value="rekap-tanggapan"
						className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all"
					>
						Rekap Tanggapan
					</TabsTrigger>
				</TabsList>

				{/* Rencana Tab Content */}
				<TabsContent value="rencana">
					<Card>
						<CardHeader>
							<CardTitle className="text-base sm:text-lg">
								Rencana Maintenance & Kalibrasi
							</CardTitle>
							<CardDescription className="text-xs sm:text-sm">
								Daftar perencanaan maintenance dan kalibrasi
								peralatan medis
							</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<Tabs defaultValue="maintenance" className="w-full">
								<TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-lg">
									<TabsTrigger
										value="maintenance"
										className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
									>
										Rencana Maintenance
									</TabsTrigger>
									<TabsTrigger
										value="kalibrasi"
										className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
									>
										Rencana Kalibrasi
									</TabsTrigger>
								</TabsList>

								<TabsContent
									value="maintenance"
									className="p-6"
								>
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
							<CardTitle className="text-base sm:text-lg">
								Hasil Maintenance, Kalibrasi & Penggantian Parts
							</CardTitle>
							<CardDescription className="text-xs sm:text-sm">
								Laporan hasil pelaksanaan maintenance,
								kalibrasi, dan penggantian parts
							</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<Tabs defaultValue="maintenance" className="w-full">
								<TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-lg">
									<TabsTrigger
										value="maintenance"
										className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
									>
										Hasil Maintenance
									</TabsTrigger>
									<TabsTrigger
										value="kalibrasi"
										className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
									>
										Hasil Kalibrasi
									</TabsTrigger>
									<TabsTrigger
										value="parts"
										className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
									>
										Penggantian Parts
									</TabsTrigger>
								</TabsList>

								<TabsContent
									value="maintenance"
									className="p-6"
								>
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
							<CardTitle className="text-base sm:text-lg">
								Rekap Tanggapan
							</CardTitle>
							<CardDescription className="text-xs sm:text-sm">
								Rekap tanggapan dan komentar terkait permintaan
								maintenance dan kalibrasi
							</CardDescription>
						</CardHeader>
						<CardContent>
							<CommentsReport />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
