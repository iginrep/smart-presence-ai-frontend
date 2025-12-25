'use client'

/**
 * Camera Monitoring Page
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Live camera monitoring dashboard for real-time face recognition attendance.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { CameraDashboard } from '@/components/camera-dashboard'
import type { User } from '@/types/user'

export default function MonitorPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  if (!user) {
    return null
  }

  // TODO: Configure your backend API base URL here
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-2rem)]">
        <CameraDashboard
          demoMode={false}
          apiBaseUrl={API_BASE_URL}
          captureIntervalMs={2000}
          cameraConfig={{
            preferFrontCamera: false,
            idealWidth: 1280,
            idealHeight: 740,
          }}
        />
      </div>
    </DashboardLayout>
  )
}
