'use client'

/**
 * Camera Dashboard Component
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Main orchestration component that combines camera stream,
 * frame capture, API communication, and status displays
 * in a professional bento grid layout.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
} from 'react'
import { CameraStream, type CameraStreamRef } from '@/components/camera-stream'
import {
  BoundingBoxOverlay,
  NoDetectionOverlay,
} from '@/components/bounding-box-overlay'
import {
  SystemStatusCard,
  ConnectionStatusCard,
  RecognitionResultCard,
  ProcessingStatusCard,
} from '@/components/camera-status-cards'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  captureFrame,
  createCaptureCanvas,
  type FrameCaptureResult,
} from '@/lib/frame-capture'
import {
  RequestQueueManager,
  createMockResponse,
  FaceRecognitionApiError,
} from '@/lib/face-recognition-api'
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
 * Camera dashboard props
 */
export interface CameraDashboardProps {
  /** Enable demo mode with mock API responses */
  demoMode?: boolean
  /** Camera configuration overrides */
  cameraConfig?: Partial<CameraConfig>
  /** API base URL */
  apiBaseUrl?: string
  /** Capture interval in milliseconds (default: 1000ms = 1 FPS) */
  captureIntervalMs?: number
  /** Additional className */
  className?: string
}

/**
 * Live indicator component
 */
const LiveIndicator = memo(function LiveIndicator({
  isActive,
}: {
  isActive: boolean
}) {
  if (!isActive) return null

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-xs font-medium text-red-500 uppercase tracking-wide">
        Live
      </span>
    </div>
  )
})

/**
 * Timestamp display component
 */
const TimestampDisplay = memo(function TimestampDisplay() {
  const [time, setTime] = useState(new Date())

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
 * Camera Dashboard Component
 *
 * Production-ready camera monitoring dashboard with:
 * - Continuous frame capture at 1 FPS
 * - Real-time face recognition via API
 * - Bounding box overlay
 * - System status monitoring
 * - Professional bento grid layout
 */
export const CameraDashboard = memo(function CameraDashboard({
  demoMode = false,
  cameraConfig,
  apiBaseUrl = '',
  captureIntervalMs = 1000,
  className,
}: CameraDashboardProps) {
  // Refs
  const cameraRef = useRef<CameraStreamRef>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const captureIntervalRef = useRef<number | null>(null)
  const requestQueueRef = useRef<RequestQueueManager | null>(null)
  const fpsTimestampsRef = useRef<number[]>([])

  // State
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

  // Memoized system status
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

  // Initialize canvas and request queue
  useEffect(() => {
    canvasRef.current = createCaptureCanvas()
    requestQueueRef.current = new RequestQueueManager({
      baseUrl: apiBaseUrl,
      timeout: 10000,
    })

    // Set up response handler
    requestQueueRef.current.setOnResponse((response) => {
      setProcessingState('complete')
      setConnectionState('connected')
      setLastResponseTime(new Date())
      setDetections(response.detections)

      // Add to recent events
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

      if (response.processingTime) {
        setLatency(Math.round(response.processingTime))
      }
    })

    // Set up error handler
    requestQueueRef.current.setOnError((error) => {
      console.error('[CameraDashboard] API Error:', error.message)
      setProcessingState('error')
      setConnectionState(error.isNetworkError ? 'error' : 'disconnected')
    })

    return () => {
      requestQueueRef.current?.clear()
    }
  }, [apiBaseUrl])

  // Calculate FPS
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

  // Handle frame capture
  const handleFrameCapture = useCallback(() => {
    const video = cameraRef.current?.videoElement
    const canvas = canvasRef.current

    if (!video || !canvas || cameraState !== 'active') {
      return
    }

    setProcessingState('capturing')

    // Capture frame at exact 1280x740 resolution for CCTV processing
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

    // Update frame info
    setFrameWidth(frame.width)
    setFrameHeight(frame.height)
    setFrameCount((prev) => prev + 1)
    setLastFrameTime(new Date())
    updateFps()

    // Send for recognition
    setProcessingState('sending')
    setConnectionState('connecting')

    if (demoMode) {
      // Simulate API response in demo mode
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
      requestQueueRef.current?.enqueue(frame.base64)
    }
  }, [cameraState, demoMode, updateFps])

  // Start capture interval when camera is active
  useEffect(() => {
    if (cameraState === 'active') {
      // Clear existing interval
      if (captureIntervalRef.current) {
        window.clearInterval(captureIntervalRef.current)
      }

      // Start new interval
      captureIntervalRef.current = window.setInterval(
        handleFrameCapture,
        captureIntervalMs
      )

      console.log(
        `[CameraDashboard] Started capture interval: ${captureIntervalMs}ms`
      )
    } else {
      // Clear interval when camera is not active
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

  // Update display dimensions
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

  // Handle camera state change
  const handleCameraStateChange = useCallback((state: CameraState) => {
    setCameraState(state)
    if (state !== 'active') {
      setDetections([])
    }
  }, [])

  // Start camera
  const handleStartCamera = useCallback(() => {
    cameraRef.current?.startCamera()
  }, [])

  // Stop camera
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
      {/* Dashboard Header */}
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

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100%-80px)]">
        {/* Main Camera Feed - Large Card */}
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
              {/* Camera Stream */}
              <CameraStream
                ref={cameraRef}
                config={cameraConfig}
                autoStart={true}
                onStateChange={handleCameraStateChange}
                mirror={true}
                className="absolute inset-0"
              />

              {/* Bounding Box Overlay */}
              <BoundingBoxOverlay
                detections={detections}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                displayWidth={displayDimensions.width}
                displayHeight={displayDimensions.height}
                mirror={true}
                className="absolute inset-0"
              />

              {/* No Detection Overlay */}
              <NoDetectionOverlay
                visible={
                  cameraState === 'active' &&
                  processingState === 'complete' &&
                  detections.length === 0
                }
              />

              {/* Camera Info Overlay */}
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

        {/* System Status Card */}
        <SystemStatusCard status={systemStatus} className="lg:row-span-1" />

        {/* Connection Status Card */}
        <ConnectionStatusCard
          state={connectionState}
          lastPingTime={lastResponseTime}
          latency={latency}
          className="lg:row-span-1"
        />

        {/* Recognition Results - Spans full width on mobile, bottom row on desktop */}
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
