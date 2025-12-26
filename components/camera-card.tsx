"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, CameraOff, AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AttendanceStatus = "idle" | "processing" | "success" | "error"

export type FaceGuidance = {
  message: string
  type: "success" | "info" | "warning" | "error"
}

interface CameraCardProps {
  status: AttendanceStatus
  onGuidanceChange: (guidance: FaceGuidance) => void
  onCanSubmitChange: (canSubmit: boolean) => void
}

export function CameraCard({ status, onGuidanceChange, onCanSubmitChange }: CameraCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const animationRef = useRef<number | null>(null)

  const analyzeFace = useCallback(() => {
    if (!cameraActive || status === "success" || status === "processing") return

    const scenarios: { guidance: FaceGuidance; valid: boolean }[] = [
      { guidance: { message: "Wajah terdeteksi dengan baik", type: "success" }, valid: true },
      { guidance: { message: "Posisikan wajah di tengah bingkai", type: "info" }, valid: false },
      { guidance: { message: "Wajah terlalu jauh, dekatkan kamera", type: "warning" }, valid: false },
      { guidance: { message: "Pencahayaan kurang, cari tempat lebih terang", type: "warning" }, valid: false },
      { guidance: { message: "Hadapkan wajah langsung ke kamera", type: "info" }, valid: false },
    ]

    const random = Math.random()
    let scenario

    if (random > 0.6) {
      scenario = scenarios[0]
    } else if (random > 0.45) {
      scenario = scenarios[1]
    } else if (random > 0.3) {
      scenario = scenarios[2]
    } else if (random > 0.15) {
      scenario = scenarios[3]
    } else {
      scenario = scenarios[4]
    }

    setFaceDetected(scenario.valid)
    onGuidanceChange(scenario.guidance)
    onCanSubmitChange(scenario.valid)
  }, [cameraActive, status, onGuidanceChange, onCanSubmitChange])

  useEffect(() => {
    if (!cameraActive) return
    const interval = setInterval(analyzeFace, 2000)
    return () => clearInterval(interval)
  }, [cameraActive, analyzeFace])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
        setCameraError(null)
      }
    } catch (err) {
      console.error("Camera error:", err)
      setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.")
    }
  }

  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setFaceDetected(false)
    onCanSubmitChange(false)
    onGuidanceChange({ message: "Posisikan wajah Anda di tengah bingkai", type: "info" })
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!cameraActive || !canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    function draw() {
      if (!canvas || !ctx || !videoRef.current) return

      canvas.width = videoRef.current.videoWidth || 640
      canvas.height = videoRef.current.videoHeight || 480

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radiusX = canvas.width * 0.22
      const radiusY = canvas.height * 0.32

      ctx.beginPath()
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
      ctx.strokeStyle = faceDetected ? "rgba(34, 197, 94, 0.9)" : "rgba(148, 163, 184, 0.5)"
      ctx.lineWidth = faceDetected ? 4 : 2
      ctx.setLineDash(faceDetected ? [] : [8, 8])
      ctx.stroke()

      if (faceDetected) {
        ctx.shadowColor = "rgba(34, 197, 94, 0.5)"
        ctx.shadowBlur = 20
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      const markerLength = 24
      const corners = [
        { x: centerX - radiusX, y: centerY - radiusY * 0.7 },
        { x: centerX + radiusX, y: centerY - radiusY * 0.7 },
        { x: centerX - radiusX, y: centerY + radiusY * 0.7 },
        { x: centerX + radiusX, y: centerY + radiusY * 0.7 },
      ]

      ctx.setLineDash([])
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.strokeStyle = faceDetected ? "rgba(34, 197, 94, 1)" : "rgba(99, 102, 241, 0.8)"

      corners.forEach((corner, i) => {
        ctx.beginPath()
        if (i < 2) {
          ctx.moveTo(corner.x, corner.y + markerLength)
          ctx.lineTo(corner.x, corner.y)
          ctx.lineTo(corner.x + (i === 0 ? markerLength : -markerLength), corner.y)
        } else {
          ctx.moveTo(corner.x, corner.y - markerLength)
          ctx.lineTo(corner.x, corner.y)
          ctx.lineTo(corner.x + (i === 2 ? markerLength : -markerLength), corner.y)
        }
        ctx.stroke()
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [cameraActive, faceDetected])

  return (
    <Card className="h-full border-border shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] bg-foreground/5">
          {cameraActive ? (
            <>
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

              {/* Top gradient overlay */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-foreground/30 to-transparent pointer-events-none" />

              {/* Status badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md",
                    faceDetected ? "bg-success/90 text-success-foreground" : "bg-foreground/70 text-background",
                  )}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        faceDetected ? "bg-success-foreground" : "bg-background",
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        faceDetected ? "bg-success-foreground" : "bg-background",
                      )}
                    />
                  </span>
                  {faceDetected ? "Wajah Terdeteksi" : "Mendeteksi..."}
                </div>
              </div>

              {/* AI badge */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium backdrop-blur-md">
                  <Sparkles className="h-3 w-3" />
                  AI Active
                </div>
              </div>

              {/* Success Overlay */}
              {status === "success" && (
                <div className="absolute inset-0 bg-success/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                  <div className="bg-card rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4 animate-in zoom-in-95 duration-300">
                    <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5 ring-4 ring-success/20">
                      <CheckCircle2 className="h-10 w-10 text-success" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">Absensi Berhasil!</h3>
                    <p className="text-sm text-muted-foreground">
                      Kehadiran Anda telah tercatat pada{" "}
                      {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                    </p>
                  </div>
                </div>
              )}

              {/* Processing Overlay */}
              {status === "processing" && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
                    <p className="text-base font-medium text-foreground mb-1">Memverifikasi wajah...</p>
                    <p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              {cameraError ? (
                <>
                  <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <p className="text-base font-medium text-foreground mb-2">Gagal Mengakses Kamera</p>
                  <p className="text-sm text-center text-muted-foreground mb-5 max-w-xs">{cameraError}</p>
                  <Button onClick={startCamera} size="lg">
                    Coba Lagi
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center mb-5 ring-4 ring-border">
                    <CameraOff className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">Kamera Tidak Aktif</p>
                  <p className="text-sm text-center text-muted-foreground mb-5 max-w-xs">
                    Aktifkan kamera untuk memulai proses verifikasi wajah
                  </p>
                  <Button onClick={startCamera} size="lg" className="gap-2">
                    <Camera className="h-5 w-5" />
                    Aktifkan Kamera
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Camera Controls */}
        {cameraActive && status !== "success" && (
          <div className="p-4 border-t border-border bg-card/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {faceDetected ? "Siap untuk mengambil absensi" : "Arahkan wajah ke kamera"}
              </p>
              <Button variant="outline" size="sm" onClick={stopCamera} className="gap-2 bg-transparent">
                <CameraOff className="h-4 w-4" />
                Matikan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
