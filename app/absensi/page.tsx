"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CameraCard } from "@/components/camera-card"
import { FaceGuidanceCard } from "@/components/face-guidance-card"
import { AttendanceProcessCard } from "@/components/attendance-process-card"
import { AttendanceInfoCard } from "@/components/attendance-info-card"

interface User {
  nip: string
  nama: string
  jabatan: string
  fakultas: string
  foto: string
}

export type AttendanceStatus = "idle" | "detecting" | "validating" | "processing" | "success" | "failed"

export type FaceGuidance = {
  message: string
  type: "info" | "warning" | "success" | "error"
}

export default function AbsensiPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AttendanceStatus>("idle")
  const [guidance, setGuidance] = useState<FaceGuidance>({
    message: "Posisikan wajah Anda di tengah bingkai",
    type: "info",
  })
  const [canSubmit, setCanSubmit] = useState(false)

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleGuidanceChange = (newGuidance: FaceGuidance) => {
    setGuidance(newGuidance)
  }

  const handleCanSubmitChange = (canSubmit: boolean) => {
    setCanSubmit(canSubmit)
  }

  const handleSubmit = async () => {
    setStatus("processing")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setStatus("success")
  }

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
            <span className="text-foreground">Absensi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Absensi Wajah</h1>
          <p className="text-muted-foreground mt-1">Verifikasi identitas melalui pengenalan wajah AI</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 stagger-children">
          {/* Camera Card - Dominant */}
          <div className="lg:col-span-2 lg:row-span-2">
            <CameraCard
              status={status}
              onGuidanceChange={handleGuidanceChange}
              onCanSubmitChange={handleCanSubmitChange}
            />
          </div>

          {/* Face Guidance Card */}
          <div className="lg:col-span-1">
            <FaceGuidanceCard guidance={guidance} />
          </div>

          {/* Attendance Process Card */}
          <div className="lg:col-span-1">
            <AttendanceProcessCard status={status} canSubmit={canSubmit} onSubmit={handleSubmit} />
          </div>

          {/* Info Card */}
          <div className="lg:col-span-3">
            <AttendanceInfoCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
