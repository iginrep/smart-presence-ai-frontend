"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Camera, ScanFace, ShieldCheck, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AttendanceStatus } from "@/app/absensi/page"

interface AttendanceProcessCardProps {
  status: AttendanceStatus
  canSubmit: boolean
  onSubmit: () => void
}

export function AttendanceProcessCard({ status, canSubmit, onSubmit }: AttendanceProcessCardProps) {
  const steps = [
    { id: "detecting", label: "Deteksi Wajah", icon: ScanFace },
    { id: "validating", label: "Validasi Posisi", icon: ShieldCheck },
    { id: "processing", label: "Proses Absensi", icon: Clock },
  ]

  const getStepStatus = (stepId: string) => {
    const statusOrder = ["idle", "detecting", "validating", "processing", "success", "failed"]
    const currentIndex = statusOrder.indexOf(status)
    const stepIndex = statusOrder.indexOf(stepId)

    if (status === "success") return "complete"
    if (status === "failed") return stepIndex <= currentIndex ? "failed" : "pending"
    if (stepIndex < currentIndex) return "complete"
    if (stepIndex === currentIndex) return "current"
    return "pending"
  }

  return (
    <Card className="h-full border-border shadow-sm card-hover">
      <CardContent className="p-5 h-full flex flex-col">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Status Verifikasi</p>

        {/* Steps */}
        <div className="space-y-2 mb-4">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(step.id)
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200",
                  stepStatus === "current" && "bg-primary/5",
                  stepStatus === "complete" && "bg-success/5",
                )}
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                    stepStatus === "complete" && "bg-success/10",
                    stepStatus === "current" && "bg-primary/10",
                    stepStatus === "pending" && "bg-muted",
                    stepStatus === "failed" && "bg-destructive/10",
                  )}
                >
                  {stepStatus === "complete" ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : stepStatus === "current" ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  ) : stepStatus === "failed" ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <step.icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm transition-colors duration-200",
                    stepStatus === "complete" && "text-success font-medium",
                    stepStatus === "current" && "text-foreground font-medium",
                    stepStatus === "pending" && "text-muted-foreground",
                    stepStatus === "failed" && "text-destructive font-medium",
                  )}
                >
                  {step.label}
                </span>
                {stepStatus === "complete" && <CheckCircle2 className="h-4 w-4 text-success ml-auto" />}
              </div>
            )
          })}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {status === "success" ? (
            <div className="p-4 rounded-xl bg-success/10 text-center border border-success/20">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm font-semibold text-success">Verifikasi Berhasil</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            </div>
          ) : status === "failed" ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-destructive/10 text-center border border-destructive/20">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm font-semibold text-destructive">Verifikasi Gagal</p>
                <p className="text-xs text-muted-foreground mt-1">Silakan coba lagi</p>
              </div>
              <Button onClick={onSubmit} className="w-full">
                Coba Lagi
              </Button>
            </div>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || status === "processing"}
              className="w-full h-12 gap-2 text-base"
              size="lg"
            >
              {status === "processing" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  Ambil Absensi
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
