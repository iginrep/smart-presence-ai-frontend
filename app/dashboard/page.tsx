"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProfileCard } from "@/components/profile-card"
import { AttendanceStatusCard } from "@/components/attendance-status-card"
import { QuickActionsCard } from "@/components/quick-actions-card"
import { SystemInfoCard } from "@/components/system-info-card"
import { RecentActivityCard } from "@/components/recent-activity-card"
import { StatsCard } from "@/components/stats-card"

interface User {
  nip: string
  nama: string
  jabatan: string
  fakultas: string
  foto: string
}

export default function DashboardPage() {
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
          <p className="text-sm text-muted-foreground mb-1">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Selamat Datang, <span className="text-primary">{user.nama.split(" ")[1]}</span>
          </h1>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 stagger-children">
          {/* Profile Card */}
          <div className="md:col-span-2 lg:col-span-2">
            <ProfileCard user={user} />
          </div>

          {/* Today's Attendance Status */}
          <div className="md:col-span-1 lg:col-span-1">
            <AttendanceStatusCard />
          </div>

          {/* Stats Card */}
          <div className="md:col-span-1 lg:col-span-1">
            <StatsCard />
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2">
            <QuickActionsCard />
          </div>

          {/* System Info */}
          <div className="md:col-span-1 lg:col-span-1">
            <SystemInfoCard />
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-1 lg:col-span-1">
            <RecentActivityCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
