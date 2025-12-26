
// Mengaktifkan mode client-side rendering
"use client"

// Import React hooks dan komponen yang dibutuhkan
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ClassSessionSelector } from "@/components/class-session-selector"
import { DetectionList, type ClassSession } from "@/components/detection-list"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, Activity } from "lucide-react"

// Tipe data untuk user
interface User {
  nip: string
  nama: string
  jabatan: string
  fakultas: string
  foto: string
}

// Komponen utama halaman riwayat deteksi
export default function RiwayatPage() {
  const router = useRouter() // Hook untuk navigasi
  const [user, setUser] = useState<User | null>(null) // State untuk data user
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null) // State untuk sesi kelas yang dipilih

  // Ambil data user dari sessionStorage saat komponen mount
  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      // Jika user belum login, redirect ke halaman login
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData)) // Set data user ke state
  }, [router])

  // Jika user belum tersedia, jangan render apapun
  if (!user) {
    return null
  }

  // Render layout dashboard riwayat deteksi
  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header halaman riwayat */}
        <div className="mb-6 lg:mb-8 animate-in-fade">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Dasbor</span>
            <span>/</span>
            <span className="text-foreground">Riwayat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Riwayat Deteksi</h1>
          <p className="text-muted-foreground mt-1">Log deteksi wajah berdasarkan sesi kelas</p>
        </div>

        {/* Statistik ringkas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Total deteksi hari ini */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Hari Ini</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
            </CardContent>
          </Card>
          {/* Jumlah sesi aktif */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sesi Aktif</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </CardContent>
          </Card>
          {/* Waktu update terakhir */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Update Terakhir</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selector sesi kelas */}
        <ClassSessionSelector
          selectedSession={selectedSession}
          onSessionChange={setSelectedSession}
        />

        {/* Daftar deteksi wajah */}
        <DetectionList selectedSession={selectedSession} />
      </div>
    </DashboardLayout>
  )
}
