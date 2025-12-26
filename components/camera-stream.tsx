'use client'

/**
 * Komponen Stream Kamera
 * SmartPresence AI - Sistem Pengenalan Wajah Enterprise
 *
 * Merender elemen video untuk menampilkan stream kamera dan menangani
 * seluruh siklus hidup kamera (start/stop, state, dan error).
 */

// Import React utilities untuk forwardRef + lifecycle, hook kamera, tipe, util className, dan ikon.
import { forwardRef, useImperativeHandle, useEffect, memo } from 'react'
import { useCameraStream } from '@/hooks/use-camera-stream'
import type { CameraConfig, CameraState, CameraError } from '@/types/camera'
import { cn } from '@/lib/utils'
import { Camera, CameraOff, AlertCircle, Loader2 } from 'lucide-react'

/**
 * Props untuk komponen stream kamera.
 */
export interface CameraStreamProps {
  /** Konfigurasi kamera (opsional; dipasangkan ke hook `useCameraStream`). */
  config?: Partial<CameraConfig>
  /** Jika `true`, kamera otomatis dimulai saat komponen di-mount. */
  autoStart?: boolean
  /** Callback ketika state kamera berubah. */
  onStateChange?: (state: CameraState) => void
  /** Callback ketika terjadi error. */
  onError?: (error: CameraError) => void
  /** Callback ketika kamera siap digunakan (stream sudah siap). */
  onReady?: () => void
  /** `className` tambahan untuk kontainer luar. */
  className?: string
  /** Membalik video secara horizontal (umumnya untuk kamera depan). */
  mirror?: boolean
}

/**
 * Handle ref untuk kontrol eksternal (parent bisa start/stop kamera).
 */
export interface CameraStreamRef {
  // Referensi elemen video yang sedang dipakai untuk stream.
  videoElement: HTMLVideoElement | null
  // Memulai kamera (async karena meminta izin dan membuka stream).
  startCamera: () => Promise<void>
  // Menghentikan kamera dan melepas stream.
  stopCamera: () => void
  // Menandakan stream kamera sudah siap.
  isReady: boolean
  // State kamera saat ini.
  cameraState: CameraState
}

/**
 * Komponen indikator state kamera.
 * Ditampilkan sebagai overlay ketika kamera belum aktif / sedang meminta izin / error.
 */
const CameraStateIndicator = memo(function CameraStateIndicator({
  state,
  error,
}: {
  state: CameraState
  error: CameraError | null
}) {
  // Konfigurasi UI per state: ikon, teks, background, dan apakah ikon perlu animasi.
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
  // Ambil ikon yang sesuai dari konfigurasi.
  const Icon = config.icon

  // Jika state sudah aktif, overlay tidak perlu ditampilkan.
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
 * Komponen Stream Kamera
 *
 * Menyediakan elemen `<video>` untuk stream kamera, serta state management
 * dan callback untuk integrasi dengan parent.
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
    // Inisialisasi pengelolaan kamera melalui hook terpusat.
    const {
      videoRef,
      cameraState,
      error,
      startCamera,
      stopCamera,
      isReady,
    } = useCameraStream(config)

    // Mengekspos method dan state melalui `ref` agar parent dapat mengontrol kamera.
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

    // Otomatis memulai kamera saat komponen di-mount (jika `autoStart` aktif),
    // serta memastikan kamera berhenti saat unmount.
    useEffect(() => {
      if (autoStart) {
        startCamera()
      }

      return () => {
        stopCamera()
      }
    }, [autoStart, startCamera, stopCamera])

    // Mengabarkan perubahan state kamera ke parent.
    useEffect(() => {
      onStateChange?.(cameraState)
    }, [cameraState, onStateChange])

    // Mengabarkan error kamera ke parent ketika error tersedia.
    useEffect(() => {
      if (error) {
        onError?.(error)
      }
    }, [error, onError])

    // Mengabarkan kondisi "siap" ke parent saat stream sudah ready.
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
          {/* Elemen video untuk menampilkan stream kamera */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            'w-full h-full object-cover',
              // Jika `mirror` aktif, tampilkan video mirrored (umumnya untuk kamera depan).
            mirror && 'scale-x-[-1]',
              // Sembunyikan video saat kamera belum aktif agar overlay terlihat jelas.
            cameraState !== 'active' && 'opacity-0'
          )}
        />

          {/* Overlay status kamera (idle/requesting/initializing/error/denied) */}
        <CameraStateIndicator state={cameraState} error={error} />
      </div>
    )
  })
)

CameraStream.displayName = 'CameraStream'
