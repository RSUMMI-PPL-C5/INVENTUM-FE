"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface PlansProps {
  type: "MAINTENANCE" | "CALIBRATION"
}

export default function MaintenanceCalibrationPlans({ type }: Readonly<PlansProps>) {
  
  // TODO: Fix this to use the correct type
  interface PlanItem {
    id: string
    equipment: string
    plannedDate: string
    status: string
    location: string
    priority: string
  }

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PlanItem[]>([])

  useEffect(() => {
    // Dummy data untuk placeholder
    setTimeout(() => {
      setData([
        //Empty data for now
      ])
      setLoading(false)
    }, 1000)
  }, [type])

  if (loading) {
    return <div className="py-8 text-center">Memuat data...</div>
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Rencana {type === "MAINTENANCE" ? "Pemeliharaan" : "Kalibrasi"}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Peralatan</TableHead>
            <TableHead>Tanggal Rencana</TableHead>
            <TableHead>Lokasi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.equipment}</TableCell>
              <TableCell>{item.plannedDate}</TableCell>
              <TableCell>{item.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}