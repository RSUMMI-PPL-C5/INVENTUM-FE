"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

// TODO: Fix this to use the correct type
interface PartReportItem {
  id: string
  equipment: string
  partName: string
  quantity: number
  date: string
  technician: string
  cost: string
}

export default function PartsReport() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PartReportItem[]>([])

  useEffect(() => {
    // Dummy data untuk placeholder
    setTimeout(() => {
      setData([
        // Empty data for now
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return <div className="py-8 text-center">Memuat data...</div>
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Penggantian Suku Cadang</h2>
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
          {data.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.equipment}</TableCell>
              <TableCell>{item.partName}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.technician}</TableCell>
              <TableCell>{item.cost}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}