'use client'

/**
 * Komponen Dashboard Kamera
 * SmartPresence AI - Sistem Pengenalan Wajah Enterprise
 *
 * Komponen orkestrasi utama yang menggabungkan stream kamera,
 * capture frame, komunikasi API, dan tampilan status
 * dalam layout bento grid yang profesional.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
} from 'react'
// Komponen terkait kamera dan overlay
import { CameraStream, type CameraStreamRef } from '@/components/camera-stream'
import {
  BoundingBoxOverlay,
  NoDetectionOverlay,
} from '@/components/bounding-box-overlay'
// Kartu status sistem/koneksi/proses dan hasil pengenalan
import {
  SystemStatusCard,
  ConnectionStatusCard,
  RecognitionResultCard,
  ProcessingStatusCard,
} from '@/components/camera-status-cards'
// Komponen UI dasar
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// Utilitas capture frame
import {
  captureFrame,
  createCaptureCanvas,
  type FrameCaptureResult,
} from '@/lib/frame-capture'
// Klien API pengenalan wajah (dengan antrean request)
import {
  RequestQueueManager,
  createMockResponse,
  FaceRecognitionApiError,
} from '@/lib/face-recognition-api'
// Tipe-tipe domain kamera
import type {
  CameraState,
  ConnectionState,
  ProcessingState,
  SystemStatus,
  FaceDetection,
  RecognitionEvent,
  CameraConfig,
  DEFAULT_CAMERA_CONFIG,
} from '@/types/camera'
// Utilitas untuk menggabungkan className
import { cn } from '@/lib/utils'
import {
  Camera,
  Power,
  PowerOff,
  RefreshCw,
  Activity,
  Clock,
  Shield,
} from 'lucide-react'

/**
 * Props untuk dashboard kamera
 */
export interface CameraDashboardProps {
  /** Aktifkan mode demo dengan respons API palsu (mock) */
  demoMode?: boolean
  /** Override konfigurasi kamera */
  cameraConfig?: Partial<CameraConfig>
  /** Base URL API */
  apiBaseUrl?: string
  /** Interval capture dalam milidetik (default: 1000ms = 1 FPS) */
  captureIntervalMs?: number
  /** className tambahan */
  className?: string
}

/**
 * Komponen indikator live
 */
const LiveIndicator = memo(function LiveIndicator({
  isActive,
}: {
  isActive: boolean
}) {
  // Jika kamera tidak aktif, indikator tidak ditampilkan
  if (!isActive) return null

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-xs font-medium text-red-500 uppercase tracking-wide">
        Langsung
      </span>
    </div>
  )
})

/**
 * Komponen tampilan waktu (timestamp)
 */
const TimestampDisplay = memo(function TimestampDisplay() {
  const [time, setTime] = useState(new Date())

  // Update waktu setiap detik
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Clock className="h-3.5 w-3.5" />
      <span className="text-xs font-mono">
        {time.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </span>
    </div>
  )
})

/**
 * Komponen Dashboard Kamera
 *
 * Dashboard monitoring kamera siap produksi dengan:
 * - Capture frame berkelanjutan (mis. 1 FPS)
 * - Pengenalan wajah real-time via API
 * - Overlay bounding box
 * - Monitoring status sistem
 * - Layout bento grid profesional
 */
export const CameraDashboard = memo(function CameraDashboard({
  demoMode = false,
  cameraConfig,
  apiBaseUrl = '',
  captureIntervalMs = 1000,
  className,
}: CameraDashboardProps) {
  // Refs: menyimpan referensi elemen/objek yang tidak memicu re-render
  const cameraRef = useRef<CameraStreamRef>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const captureIntervalRef = useRef<number | null>(null)
  const requestQueueRef = useRef<RequestQueueManager | null>(null)
  const fpsTimestampsRef = useRef<number[]>([])

  // State: menyimpan status kamera, koneksi, proses, dan hasil deteksi
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected')
  const [processingState, setProcessingState] =
    useState<ProcessingState>('idle')
  const [detections, setDetections] = useState<FaceDetection[]>([])
  const [recentEvents, setRecentEvents] = useState<RecognitionEvent[]>([])
  const [frameCount, setFrameCount] = useState(0)
  const [fps, setFps] = useState(0)
  const [lastFrameTime, setLastFrameTime] = useState<Date | null>(null)
  const [lastResponseTime, setLastResponseTime] = useState<Date | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [frameWidth, setFrameWidth] = useState(0)
  const [frameHeight, setFrameHeight] = useState(0)
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  })

  // Status sistem yang di-memo untuk mencegah re-render yang tidak perlu
  const systemStatus: SystemStatus = useMemo(
    () => ({
      cameraState,
      connectionState,
      processingState,
      lastFrameTime,
      frameCount,
      fps,
      error: null,
    }),
    [cameraState, connectionState, processingState, lastFrameTime, frameCount, fps]
  )

  // Inisialisasi canvas capture dan request queue untuk komunikasi API
  useEffect(() => {
    canvasRef.current = createCaptureCanvas()
    requestQueueRef.current = new RequestQueueManager({
      baseUrl: apiBaseUrl,
      timeout: 10000,
    })

    // Handler ketika respons API berhasil diterima
    requestQueueRef.current.setOnResponse((response) => {
      setProcessingState('complete')
      setConnectionState('connected')
      setLastResponseTime(new Date())
      setDetections(response.detections)

      // Tambahkan hasil ke daftar event terbaru
      if (response.detections.length > 0) {
        const newEvents: RecognitionEvent[] = response.detections.map(
          (detection, index) => ({
            id: `${Date.now()}-${index}`,
            name: detection.name || 'Tidak Dikenal',
            timestamp: new Date(),
            confidence: detection.confidence,
          })
        )
        setRecentEvents((prev) => [...newEvents, ...prev].slice(0, 20))
      }

      // Simpan latency jika disediakan oleh backend
      if (response.processingTime) {
        setLatency(Math.round(response.processingTime))
      }
    })

    // Handler jika request API gagal
    requestQueueRef.current.setOnError((error) => {
      console.error('[CameraDashboard] API Error:', error.message)
      setProcessingState('error')
      setConnectionState(error.isNetworkError ? 'error' : 'disconnected')
    })

    return () => {
      // Bersihkan antrean request saat unmount / baseUrl berubah
      requestQueueRef.current?.clear()
    }
  }, [apiBaseUrl])

  // Hitung FPS berdasarkan timestamp capture dalam 1 detik terakhir
  const updateFps = useCallback(() => {
    const now = Date.now()
    const timestamps = fpsTimestampsRef.current
    timestamps.push(now)

    // Keep only timestamps from the last second
    const oneSecondAgo = now - 1000
    while (timestamps.length > 0 && timestamps[0] < oneSecondAgo) {
      timestamps.shift()
    }

    setFps(timestamps.length)
  }, [])

  // Proses capture frame: ambil gambar dari video, update metrik, lalu kirim ke API
  const handleFrameCapture = useCallback(() => {
    const video = cameraRef.current?.videoElement
    const canvas = canvasRef.current

    // Pastikan video/canvas tersedia dan kamera sedang aktif
    if (!video || !canvas || cameraState !== 'active') {
      return
    }

    setProcessingState('capturing')

    // Capture frame pada resolusi 1280x740 (untuk pemrosesan CCTV)
    const frame = captureFrame(video, canvas, {
      useExactDimensions: true,
      exactWidth: 1280,
      exactHeight: 740,
      maxDimension: 1280,
      jpegQuality: 0.85,
    })

    if (!frame) {
      setProcessingState('error')
      return
    }

    // Update informasi frame dan metrik
    setFrameWidth(frame.width)
    setFrameHeight(frame.height)
    setFrameCount((prev) => prev + 1)
    setLastFrameTime(new Date())
    updateFps()

    // Kirim untuk proses pengenalan
    setProcessingState('sending')
    setConnectionState('connecting')

    if (demoMode) {
      // Simulasikan respons API pada mode demo
      setTimeout(() => {
        const mockResponse = createMockResponse(true)

        setProcessingState('complete')
        setConnectionState('connected')
        setLastResponseTime(new Date())
        setDetections(mockResponse.detections)
        setLatency(Math.round(50 + Math.random() * 100))

        if (mockResponse.detections.length > 0) {
          const newEvents: RecognitionEvent[] = mockResponse.detections.map(
            (detection, index) => ({
              id: `${Date.now()}-${index}`,
              name: detection.name || 'Tidak Dikenal',
              timestamp: new Date(),
              confidence: detection.confidence,
            })
          )
          setRecentEvents((prev) => [...newEvents, ...prev].slice(0, 20))
        }
      }, 100 + Math.random() * 200)
    } else {
      // Enqueue request ke backend (antrian) untuk menghindari overload
      requestQueueRef.current?.enqueue(frame.base64)
    }
  }, [cameraState, demoMode, updateFps])

  // Mulai interval capture saat kamera aktif
  useEffect(() => {
    if (cameraState === 'active') {
      // Hapus interval sebelumnya (jika ada)
      if (captureIntervalRef.current) {
        window.clearInterval(captureIntervalRef.current)
      }

      // Mulai interval baru
      captureIntervalRef.current = window.setInterval(
        handleFrameCapture,
        captureIntervalMs
      )

      console.log(
        `[CameraDashboard] Started capture interval: ${captureIntervalMs}ms`
      )
    } else {
      // Hapus interval saat kamera tidak aktif
      if (captureIntervalRef.current) {
        window.clearInterval(captureIntervalRef.current)
        captureIntervalRef.current = null
      }
      setProcessingState('idle')
      setConnectionState('disconnected')
    }

    return () => {
      if (captureIntervalRef.current) {
        window.clearInterval(captureIntervalRef.current)
        captureIntervalRef.current = null
      }
    }
  }, [cameraState, captureIntervalMs, handleFrameCapture])

  // Update dimensi tampilan overlay mengikuti ukuran kontainer video
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDisplayDimensions({
          width: rect.width,
          height: rect.height,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    const observer = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateDimensions)
      observer.disconnect()
    }
  }, [])

  // Handler perubahan state kamera dari komponen CameraStream
  const handleCameraStateChange = useCallback((state: CameraState) => {
    setCameraState(state)
    if (state !== 'active') {
      setDetections([])
    }
  }, [])

  // Memulai kamera
  const handleStartCamera = useCallback(() => {
    cameraRef.current?.startCamera()
  }, [])

  // Menghentikan kamera dan reset metrik/hasil
  const handleStopCamera = useCallback(() => {
    cameraRef.current?.stopCamera()
    setDetections([])
    setFrameCount(0)
    setFps(0)
    setLastFrameTime(null)
    setLastResponseTime(null)
    fpsTimestampsRef.current = []
  }, [])

  return (
    <div className={cn('w-full h-full', className)}>
      {/* Header dashboard */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Monitor Kamera</h1>
              <p className="text-xs text-muted-foreground">
                Sistem Pengenalan Wajah Real-time
              </p>
            </div>
          </div>
          <LiveIndicator isActive={cameraState === 'active'} />
          {demoMode && (
            <Badge variant="outline" className="text-xs">
              Mode Demo
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <TimestampDisplay />
          <div className="flex items-center gap-2">
            {cameraState === 'active' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopCamera}
                className="gap-2"
              >
                <PowerOff className="h-4 w-4" />
                Matikan
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleStartCamera}
                className="gap-2"
              >
                <Power className="h-4 w-4" />
                Aktifkan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Layout bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100%-80px)]">
        {/* Feed kamera utama - kartu besar */}
        <Card className="lg:col-span-3 lg:row-span-2 overflow-hidden">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                Feed Kamera Utama
              </CardTitle>
            </div>
            <ProcessingStatusCard state={processingState} />
          </CardHeader>
          <CardContent className="p-0 relative flex-1">
            <div
              ref={containerRef}
              className="relative w-full aspect-video bg-muted overflow-hidden"
            >
              {/* Stream kamera */}
              <CameraStream
                ref={cameraRef}
                config={cameraConfig}
                autoStart={true}
                onStateChange={handleCameraStateChange}
                mirror={true}
                className="absolute inset-0"
              />

              {/* Overlay bounding box */}
              <BoundingBoxOverlay
                detections={detections}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                displayWidth={displayDimensions.width}
                displayHeight={displayDimensions.height}
                mirror={true}
                className="absolute inset-0"
              />

              {/* Overlay saat tidak ada deteksi */}
              <NoDetectionOverlay
                visible={
                  cameraState === 'active' &&
                  processingState === 'complete' &&
                  detections.length === 0
                }
              />

              {/* Overlay info kamera (resolusi & FPS) */}
              {cameraState === 'active' && (
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-black/50 text-white border-0 text-xs"
                  >
                    {frameWidth}×{frameHeight}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-black/50 text-white border-0 text-xs"
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    {fps} FPS
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kartu status sistem */}
        <SystemStatusCard status={systemStatus} className="lg:row-span-1" />

        {/* Kartu status koneksi */}
        <ConnectionStatusCard
          state={connectionState}
          lastPingTime={lastResponseTime}
          latency={latency}
          className="lg:row-span-1"
        />

        {/* Hasil pengenalan - full width di mobile, baris bawah di desktop */}
        <RecognitionResultCard
          recentEvents={recentEvents}
          currentDetectionCount={detections.length}
          className="lg:col-span-4"
        />
      </div>
    </div>
  )
})

CameraDashboard.displayName = 'CameraDashboard'
