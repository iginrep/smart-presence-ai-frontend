// Mengaktifkan mode client-side rendering (komponen tabel interaktif)
"use client"

// Import komponen UI dan utilitas
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

// Tipe data untuk satu record riwayat absensi
interface AttendanceRecord {
  id: string
  tanggal: string
  hari: string
  masuk: string | null
  keluar: string | null
  status: "hadir" | "terlambat" | "tidak-hadir" | "izin"
  keterangan?: string
}

// Data mock untuk menampilkan contoh riwayat absensi (sementara)
const mockData: AttendanceRecord[] = [
  { id: "1", tanggal: "15 Des 2025", hari: "Senin", masuk: "07:35", keluar: "16:30", status: "hadir" },
  {
    id: "2",
    tanggal: "14 Des 2025",
    hari: "Minggu",
    masuk: null,
    keluar: null,
    status: "tidak-hadir",
    keterangan: "Hari Libur",
  },
  {
    id: "3",
    tanggal: "13 Des 2025",
    hari: "Sabtu",
    masuk: null,
    keluar: null,
    status: "tidak-hadir",
    keterangan: "Hari Libur",
  },
  { id: "4", tanggal: "12 Des 2025", hari: "Jumat", masuk: "07:45", keluar: "16:15", status: "hadir" },
  { id: "5", tanggal: "11 Des 2025", hari: "Kamis", masuk: "08:15", keluar: "16:45", status: "terlambat" },
  { id: "6", tanggal: "10 Des 2025", hari: "Rabu", masuk: "07:30", keluar: "16:30", status: "hadir" },
  {
    id: "7",
    tanggal: "9 Des 2025",
    hari: "Selasa",
    masuk: null,
    keluar: null,
    status: "izin",
    keterangan: "Keperluan Keluarga",
  },
  { id: "8", tanggal: "8 Des 2025", hari: "Senin", masuk: "07:40", keluar: "16:20", status: "hadir" },
]

// Konfigurasi label, ikon, dan className untuk tiap status absensi
const statusConfig = {
  hadir: {
    label: "Hadir",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  terlambat: {
    label: "Terlambat",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  "tidak-hadir": {
    label: "Tidak Hadir",
    icon: XCircle,
    className: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
  izin: {
    label: "Izin",
    icon: FileText,
    className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
}

export function AttendanceHistoryTable() {
  return (
    // Card sebagai pembungkus tabel/daftar riwayat absensi
    <Card className="border-border shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Tabel untuk tampilan desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Hari
                </th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Masuk
                </th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Keluar
                </th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockData.map((record, index) => {
                // Ambil konfigurasi status untuk record saat ini
                const config = statusConfig[record.status]
                // Simpan komponen ikon agar mudah dirender di JSX
                const Icon = config.icon
                return (
                  <tr
                    key={record.id}
                    className={cn(
                      // Warna hover + zebra striping
                      "transition-colors duration-150 hover:bg-muted/30",
                      index % 2 === 0 ? "bg-card" : "bg-muted/10",
                    )}
                  >
                    <td className="py-4 px-5">
                      <span className="text-sm font-medium text-card-foreground">{record.tanggal}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm text-muted-foreground">{record.hari}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={cn(
                          // Jika nilai kosong, tampilkan dengan warna muted
                          "text-sm font-medium",
                          record.masuk ? "text-card-foreground" : "text-muted-foreground",
                        )}
                      >
                        {record.masuk || "-"}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={cn(
                          // Jika nilai kosong, tampilkan dengan warna muted
                          "text-sm font-medium",
                          record.keluar ? "text-card-foreground" : "text-muted-foreground",
                        )}
                      >
                        {record.keluar || "-"}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {/* Badge status dengan warna sesuai status */}
                      <Badge className={cn("font-medium gap-1.5 transition-colors", config.className)}>
                        <Icon className="h-3.5 w-3.5" />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm text-muted-foreground">{record.keterangan || "-"}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Kartu bertumpuk untuk tampilan mobile */}
        <div className="md:hidden divide-y divide-border">
          {mockData.map((record) => {
            // Ambil konfigurasi status untuk record saat ini
            const config = statusConfig[record.status]
            // Simpan komponen ikon agar mudah dirender di JSX
            const Icon = config.icon
            return (
              <div key={record.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{record.tanggal}</p>
                    <p className="text-xs text-muted-foreground">{record.hari}</p>
                  </div>
                  <Badge className={cn("font-medium gap-1.5", config.className)}>
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                </div>
                {/* Tampilkan jam masuk/keluar jika ada salah satunya */}
                {(record.masuk || record.keluar) && (
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Masuk:</span>
                      <span className="font-medium text-card-foreground">{record.masuk || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Keluar:</span>
                      <span className="font-medium text-card-foreground">{record.keluar || "-"}</span>
                    </div>
                  </div>
                )}
                {/* Tampilkan keterangan jika ada */}
                {record.keterangan && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">{record.keterangan}</p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
