"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ClassSessionSelector } from "@/components/class-session-selector"
import { DetectionList, type ClassSession } from "@/components/detection-list"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, Activity } from "lucide-react"

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
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null)

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Riwayat Deteksi</h1>
          <p className="text-muted-foreground mt-1">Log deteksi wajah berdasarkan sesi kelas</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

        {/* Class Session Selector */}
        <ClassSessionSelector
          selectedSession={selectedSession}
          onSessionChange={setSelectedSession}
        />

        {/* Detection List */}
        <DetectionList selectedSession={selectedSession} />
      </div>
    </DashboardLayout>
  )
}
