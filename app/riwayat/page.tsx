"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AttendanceHistoryTable } from "@/components/attendance-history-table"
import { HistoryFilters } from "@/components/history-filters"
import { HistoryStats } from "@/components/history-stats"

interface User {
  nip: string
  nama: string
  jabatan: string
  fakultas: string
  foto: string
}

export default function RiwayatPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8 animate-in-fade">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Dasbor</span>
            <span>/</span>
            <span className="text-foreground">Riwayat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Riwayat Absensi</h1>
          <p className="text-muted-foreground mt-1">Catatan kehadiran dan aktivitas absensi Anda</p>
        </div>

        {/* Stats Cards */}
        <div className="stagger-children">
          <HistoryStats />
        </div>

        {/* Filters */}
        <HistoryFilters />

        {/* History Table */}
        <AttendanceHistoryTable />
      </div>
    </DashboardLayout>
  )
}
