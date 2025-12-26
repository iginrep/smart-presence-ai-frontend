
// Mengaktifkan mode client-side rendering untuk komponen ini
"use client"  

// Import React hooks dan komponen yang dibutuhkan
import { useEffect, useState } from "react" // React hooks untuk efek samping dan state
import { useRouter } from "next/navigation" // Hook navigasi Next.js untuk pengalihan halaman
import { DashboardLayout } from "@/components/dashboard-layout" // Layout dashboard untuk membungkus halaman
import { ProfileCard } from "@/components/profile-card" // Kartu profil user
import { AttendanceStatusCard } from "@/components/attendance-status-card"  // Kartu status kehadiran
import { QuickActionsCard } from "@/components/quick-actions-card"  // Kartu aksi cepat
import { SystemInfoCard } from "@/components/system-info-card"  // Kartu informasi sistem
import { RecentActivityCard } from "@/components/recent-activity-card"  // Kartu aktivitas terbaru
import { StatsCard } from "@/components/stats-card" // Kartu statistik

// Tipe data untuk user
interface User {
  nip: string
  nama: string
  jabatan: string
  fakultas: string
  foto: string
}

// Komponen utama halaman dashboard
export default function DashboardPage() {
  const router = useRouter() // Hook untuk navigasi
  const [user, setUser] = useState<User | null>(null) // State untuk data user

  // Ambil data user dari sessionStorage saat komponen mount
  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      // Jika tidak ada user, redirect ke halaman login
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData)) // Set data user ke state
  }, [router])

  // Jika user belum tersedia, jangan render apapun
  if (!user) {
    return null
  }

  // Render layout dashboard
  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header halaman dashboard */}
        <div className="mb-6 lg:mb-8 animate-in-fade">
          <p className="text-sm text-muted-foreground mb-1">
            {/* Tanggal hari ini dalam format lokal Indonesia */}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {/* Sapaan selamat datang dengan nama user */}
            Selamat Datang, <span className="text-primary">{user.nama.split(" ")[1]}</span>
          </h1>
        </div>

        {/* Layout grid utama dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 stagger-children">
          {/* Kartu profil user */}
          <div className="md:col-span-2 lg:col-span-2">
            <ProfileCard user={user} />
          </div>

          {/* Status kehadiran hari ini */}
          <div className="md:col-span-1 lg:col-span-1">
            <AttendanceStatusCard />
          </div>

          {/* Statistik */}
          <div className="md:col-span-1 lg:col-span-1">
            <StatsCard />
          </div>

          {/* Aksi cepat */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2">
            <QuickActionsCard />
          </div>

          {/* Informasi sistem */}
          <div className="md:col-span-1 lg:col-span-1">
            <SystemInfoCard />
          </div>

          {/* Aktivitas terbaru */}
          <div className="md:col-span-1 lg:col-span-1">
            <RecentActivityCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
