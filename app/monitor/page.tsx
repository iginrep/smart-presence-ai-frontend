
// Mengaktifkan mode client-side rendering
'use client'


/**
 * Halaman Monitoring Kamera
 * SmartPresence AI - Sistem Pengenalan Wajah Enterprise
 *
 * Dashboard monitoring kamera secara real-time untuk absensi berbasis pengenalan wajah.
 */

// Import React hooks dan komponen yang dibutuhkan
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { CameraDashboard } from '@/components/camera-dashboard'
import type { User } from '@/types/user'

// Komponen utama halaman monitoring kamera
export default function MonitorPage() {
  const router = useRouter() // Hook untuk navigasi
  const [user, setUser] = useState<User | null>(null) // State untuk data user

  // Ambil data user dari sessionStorage saat komponen mount
  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (!userData) {
      // Jika user belum login, redirect ke halaman login
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData)) // Set data user ke state
  }, [router])

  // Jika user belum tersedia, jangan render apapun
  if (!user) {
    return null
  }

  // Konfigurasi base URL API backend (bisa diubah sesuai kebutuhan)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  // Render layout dashboard dengan komponen CameraDashboard
  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-2rem)]">
        <CameraDashboard
          demoMode={false} // Nonaktifkan mode demo
          apiBaseUrl={API_BASE_URL} // URL backend API
          captureIntervalMs={2000} // Interval pengambilan gambar (ms)
          cameraConfig={{
            preferFrontCamera: false, // Tidak memaksa kamera depan
            idealWidth: 1280, // Resolusi lebar ideal
            idealHeight: 740, // Resolusi tinggi ideal
          }}
        />
      </div>
    </DashboardLayout>
  )
}
