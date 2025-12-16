'use client'

/**
 * Camera Stream Component
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Renders the video element with camera stream and handles
 * all camera lifecycle management.
 */

import { forwardRef, useImperativeHandle, useEffect, memo } from 'react'
import { useCameraStream } from '@/hooks/use-camera-stream'
import type { CameraConfig, CameraState, CameraError } from '@/types/camera'
import { cn } from '@/lib/utils'
import { Camera, CameraOff, AlertCircle, Loader2 } from 'lucide-react'

/**
 * Camera stream component props
 */
export interface CameraStreamProps {
  /** Camera configuration */
  config?: Partial<CameraConfig>
  /** Auto-start camera on mount */
  autoStart?: boolean
  /** Callback when camera state changes */
  onStateChange?: (state: CameraState) => void
  /** Callback when error occurs */
  onError?: (error: CameraError) => void
  /** Callback when camera is ready */
  onReady?: () => void
  /** Additional className for container */
  className?: string
  /** Mirror the video (for front camera) */
  mirror?: boolean
}

/**
 * Ref handle for external control
 */
export interface CameraStreamRef {
  videoElement: HTMLVideoElement | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  isReady: boolean
  cameraState: CameraState
}

/**
 * Camera state indicator component
 */
const CameraStateIndicator = memo(function CameraStateIndicator({
  state,
  error,
}: {
  state: CameraState
  error: CameraError | null
}) {
  const stateConfig: Record<
    CameraState,
    {
      icon: typeof Camera
      text: string
      bgClass: string
      animate?: boolean
    }
  > = {
    idle: {
      icon: Camera,
      text: 'Kamera belum aktif',
      bgClass: 'bg-muted',
    },
    requesting: {
      icon: Loader2,
      text: 'Meminta izin kamera...',
      bgClass: 'bg-muted',
      animate: true,
    },
    initializing: {
      icon: Loader2,
      text: 'Menginisialisasi kamera...',
      bgClass: 'bg-muted',
      animate: true,
    },
    active: {
      icon: Camera,
      text: 'Kamera aktif',
      bgClass: 'bg-transparent',
    },
    error: {
      icon: AlertCircle,
      text: error?.message || 'Terjadi kesalahan',
      bgClass: 'bg-destructive/10',
    },
    denied: {
      icon: CameraOff,
      text: error?.message || 'Izin kamera ditolak',
      bgClass: 'bg-destructive/10',
    },
  }

  const config = stateConfig[state]
  const Icon = config.icon

  if (state === 'active') return null

  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-4 p-6',
        config.bgClass
      )}
    >
      <div
        className={cn(
          'rounded-full p-4',
          state === 'error' || state === 'denied'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-secondary text-muted-foreground'
        )}
      >
        <Icon
          className={cn('h-10 w-10', config.animate && 'animate-spin')}
        />
      </div>
      <p
        className={cn(
          'text-center text-sm font-medium max-w-xs',
          state === 'error' || state === 'denied'
            ? 'text-destructive'
            : 'text-muted-foreground'
        )}
      >
        {config.text}
      </p>
    </div>
  )
})

/**
 * Camera Stream Component
 *
 * Renders a video element with camera stream and provides
 * comprehensive state management and callbacks.
 */
export const CameraStream = memo(
  forwardRef<CameraStreamRef, CameraStreamProps>(function CameraStream(
    {
      config,
      autoStart = true,
      onStateChange,
      onError,
      onReady,
      className,
      mirror = true,
    },
    ref
  ) {
    const {
      videoRef,
      cameraState,
      error,
      startCamera,
      stopCamera,
      isReady,
    } = useCameraStream(config)

    // Expose ref methods
    useImperativeHandle(
      ref,
      () => ({
        videoElement: videoRef.current,
        startCamera,
        stopCamera,
        isReady,
        cameraState,
      }),
      [startCamera, stopCamera, isReady, cameraState]
    )

    // Auto-start camera on mount
    useEffect(() => {
      if (autoStart) {
        startCamera()
      }

      return () => {
        stopCamera()
      }
    }, [autoStart, startCamera, stopCamera])

    // State change callback
    useEffect(() => {
      onStateChange?.(cameraState)
    }, [cameraState, onStateChange])

    // Error callback
    useEffect(() => {
      if (error) {
        onError?.(error)
      }
    }, [error, onError])

    // Ready callback
    useEffect(() => {
      if (isReady) {
        onReady?.()
      }
    }, [isReady, onReady])

    return (
      <div
        className={cn(
          'relative w-full h-full bg-muted overflow-hidden',
          className
        )}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            'w-full h-full object-cover',
            mirror && 'scale-x-[-1]',
            cameraState !== 'active' && 'opacity-0'
          )}
        />

        {/* State overlay */}
        <CameraStateIndicator state={cameraState} error={error} />
      </div>
    )
  })
)

CameraStream.displayName = 'CameraStream'
