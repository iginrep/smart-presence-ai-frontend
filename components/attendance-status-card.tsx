"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function AttendanceStatusCard() {
  const hasCheckedIn = false
  const checkInTime = null

  return (
    <Card
      className={cn(
        "h-full border-border shadow-sm card-hover overflow-hidden",
        hasCheckedIn ? "ring-1 ring-success/20" : "ring-1 ring-warning/20",
      )}
    >
      <CardContent className="p-5 h-full flex flex-col">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Status Hari Ini</p>

        {hasCheckedIn ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <span className="text-lg font-semibold text-card-foreground block">Sudah Absen</span>
                <p className="text-sm text-muted-foreground">Masuk: {checkInTime}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center relative">
                <Clock className="h-5 w-5 text-warning" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-warning animate-pulse" />
              </div>
              <span className="text-lg font-semibold text-card-foreground">Belum Absen</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-warning/5 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 text-warning shrink-0" />
              <span>Silakan lakukan absensi segera</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
