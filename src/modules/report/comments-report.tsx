"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function CommentsReport() {
  const [loading, setLoading] = useState(true)
  type CommentData = {
    id: string
    equipment: string
    requestType: string
    date: string
    comment: string
    user: string
    userRole: string
  }
  const [data, setData] = useState<CommentData[]>([])

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
      <h2 className="text-lg font-medium mb-4">Rekap Tanggapan dan Komentar</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Peralatan</TableHead>
            <TableHead>Jenis Permintaan</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Komentar</TableHead>
            <TableHead>Pengguna</TableHead>
            <TableHead>Jabatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.equipment}</TableCell>
              <TableCell>{item.requestType}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.comment}</TableCell>
              <TableCell>{item.user}</TableCell>
              <TableCell>{item.userRole}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}