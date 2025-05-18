"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface HistoryProps {
  type: "MAINTENANCE" | "CALIBRATION"
}

 // TODO: Fix this to use the correct type
type HistoryItem = {
  id: string
  equipment: string
  date: string
  status: string
  technician: string
  notes: string
}

export default function MaintenanceCalibrationHistory({ type }: Readonly<HistoryProps>) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<HistoryItem[]>([])

  useEffect(() => {
    // Dummy data untuk placeholder
    setTimeout(() => {
      setData([
        // Empty data for now
      ])
      setLoading(false)
    }, 1000)
  }, [type])

  if (loading) {
    return <div className="py-8 text-center">Memuat data...</div>
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Hasil {type === "MAINTENANCE" ? "Pemeliharaan" : "Kalibrasi"}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Peralatan</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Teknisi</TableHead>
            <TableHead>Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.equipment}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.technician}</TableCell>
              <TableCell>{item.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}