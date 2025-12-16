'use client'

/**
 * Camera Status Cards
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Status cards for the camera dashboard bento grid layout.
 */

import { memo, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Camera,
  Wifi,
  WifiOff,
  Activity,
  Clock,
  User,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Gauge,
  Timer,
  Eye,
} from 'lucide-react'
import type {
  CameraState,
  ConnectionState,
  ProcessingState,
  RecognitionEvent,
  SystemStatus,
  CAMERA_STATE_MESSAGES,
  CONNECTION_STATE_MESSAGES,
  PROCESSING_STATE_MESSAGES,
} from '@/types/camera'

/**
 * Format timestamp to localized time string
 */
function formatTime(date: Date | null): string {
  if (!date) return '-'
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Belum ada'
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 5) return 'Baru saja'
  if (seconds < 60) return `${seconds} detik lalu`
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  
  const hours = Math.floor(minutes / 60)
  return `${hours} jam lalu`
}

// ============================================
// System Status Card
// ============================================

interface SystemStatusCardProps {
  status: SystemStatus
  className?: string
}

export const SystemStatusCard = memo(function SystemStatusCard({
  status,
  className,
}: SystemStatusCardProps) {
  const cameraStatusConfig = useMemo(() => {
    const configs: Record<
      CameraState,
      { color: string; icon: typeof Camera; label: string }
    > = {
      idle: {
        color: 'text-muted-foreground',
        icon: Camera,
        label: 'Tidak Aktif',
      },
      requesting: {
        color: 'text-warning',
        icon: Loader2,
        label: 'Meminta Izin',
      },
      initializing: {
        color: 'text-warning',
        icon: Loader2,
        label: 'Inisialisasi',
      },
      active: {
        color: 'text-success',
        icon: CheckCircle2,
        label: 'Aktif',
      },
      error: {
        color: 'text-destructive',
        icon: AlertCircle,
        label: 'Error',
      },
      denied: {
        color: 'text-destructive',
        icon: AlertCircle,
        label: 'Ditolak',
      },
    }
    return configs[status.cameraState]
  }, [status.cameraState])

  const Icon = cameraStatusConfig.icon

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Status Sistem</CardTitle>
          <Badge
            variant={
              status.cameraState === 'active' ? 'default' : 'secondary'
            }
            className="text-xs"
          >
            {cameraStatusConfig.label}
          </Badge>
        </div>
        <CardDescription>Informasi status kamera dan sistem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Status */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg bg-secondary',
              cameraStatusConfig.color
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                (status.cameraState === 'requesting' ||
                  status.cameraState === 'initializing') &&
                  'animate-spin'
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Kamera</p>
            <p className="text-xs text-muted-foreground truncate">
              {cameraStatusConfig.label}
            </p>
          </div>
        </div>

        {/* FPS Counter */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
            <Gauge className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Frame Rate</p>
            <p className="text-xs text-muted-foreground">
              {status.fps > 0 ? `${status.fps.toFixed(1)} FPS` : '-'}
            </p>
          </div>
        </div>

        {/* Frame Count */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Frame Diproses</p>
            <p className="text-xs text-muted-foreground">
              {status.frameCount.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Last Frame Time */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
            <Timer className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Frame Terakhir</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(status.lastFrameTime)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

SystemStatusCard.displayName = 'SystemStatusCard'

// ============================================
// Connection Status Card
// ============================================

interface ConnectionStatusCardProps {
  state: ConnectionState
  lastPingTime?: Date | null
  latency?: number | null
  className?: string
}

export const ConnectionStatusCard = memo(function ConnectionStatusCard({
  state,
  lastPingTime = null,
  latency = null,
  className,
}: ConnectionStatusCardProps) {
  const statusConfig = useMemo(() => {
    const configs: Record<
      ConnectionState,
      { color: string; bgColor: string; icon: typeof Wifi; label: string }
    > = {
      disconnected: {
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        icon: WifiOff,
        label: 'Tidak Terhubung',
      },
      connecting: {
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        icon: Loader2,
        label: 'Menghubungkan',
      },
      connected: {
        color: 'text-success',
        bgColor: 'bg-success/10',
        icon: Wifi,
        label: 'Terhubung',
      },
      error: {
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        icon: AlertCircle,
        label: 'Error',
      },
      reconnecting: {
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        icon: Loader2,
        label: 'Menghubungkan Ulang',
      },
    }
    return configs[state]
  }, [state])

  const Icon = statusConfig.icon

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Koneksi API</CardTitle>
          <div
            className={cn(
              'p-1.5 rounded-full',
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            <Icon
              className={cn(
                'h-3.5 w-3.5',
                (state === 'connecting' || state === 'reconnecting') &&
                  'animate-spin'
              )}
            />
          </div>
        </div>
        <CardDescription>Status koneksi ke server AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge
            variant={state === 'connected' ? 'default' : 'secondary'}
            className={cn(
              'text-xs',
              state === 'error' && 'bg-destructive/10 text-destructive border-destructive/20'
            )}
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Latency */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Latensi</span>
          <span className="text-sm font-medium">
            {latency !== null ? `${latency}ms` : '-'}
          </span>
        </div>

        {/* Last Response */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Respons Terakhir</span>
          <span className="text-sm font-medium">
            {formatRelativeTime(lastPingTime)}
          </span>
        </div>

        {/* Endpoint */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">Endpoint</p>
          <p className="text-xs font-mono mt-1 truncate">/api/face-recognition</p>
        </div>
      </CardContent>
    </Card>
  )
})

ConnectionStatusCard.displayName = 'ConnectionStatusCard'

// ============================================
// Recognition Result Card
// ============================================

interface RecognitionResultCardProps {
  recentEvents: RecognitionEvent[]
  currentDetectionCount: number
  className?: string
}

export const RecognitionResultCard = memo(function RecognitionResultCard({
  recentEvents,
  currentDetectionCount,
  className,
}: RecognitionResultCardProps) {
  const lastEvent = recentEvents[0] ?? null

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Hasil Pengenalan
          </CardTitle>
          {currentDetectionCount > 0 && (
            <Badge className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              {currentDetectionCount} wajah
            </Badge>
          )}
        </div>
        <CardDescription>Hasil pengenalan wajah terkini</CardDescription>
      </CardHeader>
      <CardContent>
        {lastEvent ? (
          <div className="space-y-4">
            {/* Last Detection */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{lastEvent.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(lastEvent.timestamp)}
                  {lastEvent.confidence && (
                    <span className="ml-2">
                      • {Math.round(lastEvent.confidence * 100)}%
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            {recentEvents.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Aktivitas Terkini
                </p>
                <div className="space-y-1">
                  {recentEvents.slice(1, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <span className="truncate flex-1">{event.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Belum ada pengenalan wajah
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Arahkan kamera ke wajah untuk memulai
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

RecognitionResultCard.displayName = 'RecognitionResultCard'

// ============================================
// Processing Status Card (Compact)
// ============================================

interface ProcessingStatusCardProps {
  state: ProcessingState
  className?: string
}

export const ProcessingStatusCard = memo(function ProcessingStatusCard({
  state,
  className,
}: ProcessingStatusCardProps) {
  const statusConfig = useMemo(() => {
    const configs: Record<
      ProcessingState,
      { color: string; label: string; animate: boolean }
    > = {
      idle: { color: 'text-muted-foreground', label: 'Menunggu', animate: false },
      capturing: { color: 'text-primary', label: 'Mengambil Frame', animate: true },
      sending: { color: 'text-warning', label: 'Mengirim', animate: true },
      processing: { color: 'text-primary', label: 'Memproses', animate: true },
      complete: { color: 'text-success', label: 'Selesai', animate: false },
      error: { color: 'text-destructive', label: 'Error', animate: false },
    }
    return configs[state]
  }, [state])

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50',
        className
      )}
    >
      {statusConfig.animate && (
        <Loader2 className={cn('h-3.5 w-3.5 animate-spin', statusConfig.color)} />
      )}
      <span className={cn('text-sm font-medium', statusConfig.color)}>
        {statusConfig.label}
      </span>
    </div>
  )
})

ProcessingStatusCard.displayName = 'ProcessingStatusCard'
