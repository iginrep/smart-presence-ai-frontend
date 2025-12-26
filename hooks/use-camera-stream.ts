/**
 * Hook Stream Kamera
 * SmartPresence AI - Sistem Pengenalan Wajah Enterprise
 *
 * Custom hook untuk mengelola stream kamera WebRTC dengan penanganan siklus hidup yang benar.
 */


// Import React hooks dan tipe kamera
import { useEffect, useRef, useCallback, useState } from 'react'
import type {
  CameraState,
  CameraError,
  CameraConfig,
  DEFAULT_CAMERA_CONFIG,
} from '@/types/camera'


/**
 * Tipe hasil return dari hook stream kamera
 */
export interface UseCameraStreamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
  cameraState: CameraState
  error: CameraError | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  isReady: boolean
}

/**
 * Parsing error kamera ke format standar dengan pesan Bahasa Indonesia
 */
function parseCameraError(err: unknown): CameraError {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return {
          type: 'permission',
          message:
            'Izin akses kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser.',
          originalError: err,
        }
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return {
          type: 'not_found',
          message:
            'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera yang terhubung.',
          originalError: err,
        }
      case 'NotReadableError':
      case 'TrackStartError':
        return {
          type: 'not_readable',
          message:
            'Kamera tidak dapat diakses. Mungkin sedang digunakan aplikasi lain.',
          originalError: err,
        }
      case 'OverconstrainedError':
        return {
          type: 'overconstrained',
          message: 'Konfigurasi kamera tidak didukung oleh perangkat.',
          originalError: err,
        }
      default:
        return {
          type: 'unknown',
          message: `Terjadi kesalahan: ${err.message}`,
          originalError: err,
        }
    }
  }

  return {
    type: 'unknown',
    message: 'Terjadi kesalahan tidak dikenal pada kamera.',
    originalError: err instanceof Error ? err : undefined,
  }
}

/**
 * Custom hook untuk mengelola stream kamera
 */
export function useCameraStream(
  config: Partial<CameraConfig> = {}
): UseCameraStreamReturn {

  // Destrukturisasi konfigurasi kamera (default: kamera depan, resolusi 1280x720)
  const {
    preferFrontCamera = true,
    idealWidth = 1280,
    idealHeight = 720,
  } = config


  // Referensi elemen video dan stream kamera
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  // State status kamera, error, dan siap/tidak
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [error, setError] = useState<CameraError | null>(null)
  const [isReady, setIsReady] = useState(false)

  /**
   * Menghentikan semua track dan membersihkan stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log(`[CameraStream] Stopped track: ${track.kind}`)
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsReady(false)
    setCameraState('idle')
    console.log('[CameraStream] Camera stopped')
  }, [])

  /**
   * Meminta akses kamera dan inisialisasi stream
   */
  const startCamera = useCallback(async () => {
    // Cek apakah context sudah aman (HTTPS/localhost)
    if (!window.isSecureContext) {
      const securityError: CameraError = {
        type: 'permission',
        message:
          'Kamera hanya dapat diakses dari koneksi aman (HTTPS atau localhost).',
      }
      setError(securityError)
      setCameraState('error')
      return
    }

    // Cek dukungan mediaDevices
    if (!navigator.mediaDevices?.getUserMedia) {
      const supportError: CameraError = {
        type: 'unknown',
        message:
          'Browser tidak mendukung akses kamera. Silakan gunakan browser modern.',
      }
      setError(supportError)
      setCameraState('error')
      return
    }

    // Hentikan stream lama jika ada
    stopCamera()

    try {
      setCameraState('requesting')
      setError(null)

      // Bangun constraints dengan preferensi kamera depan
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: preferFrontCamera ? 'user' : 'environment',
          width: { ideal: idealWidth },
          height: { ideal: idealHeight },
        },
        audio: false,
      }

      console.log('[CameraStream] Requesting camera with constraints:', constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      setCameraState('initializing')

      // Pasang stream ke elemen video
      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Tunggu video siap
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!
          
          const handleLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('error', handleError)
            resolve()
          }

          const handleError = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('error', handleError)
            reject(new Error('Failed to load video metadata'))
          }

          video.addEventListener('loadedmetadata', handleLoadedMetadata)
          video.addEventListener('error', handleError)
        })

        // Mulai playback video
        await videoRef.current.play()
        
        // Log pengaturan track video
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          const settings = videoTrack.getSettings()
          console.log('[CameraStream] Video track settings:', {
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            facingMode: settings.facingMode,
          })
        }

        setIsReady(true)
        setCameraState('active')
        console.log('[CameraStream] Kamera aktif dan siap')
      }
    } catch (err) {
      console.error('[CameraStream] Gagal memulai kamera:', err)
      const cameraError = parseCameraError(err)
      setError(cameraError)
      setCameraState(cameraError.type === 'permission' ? 'denied' : 'error')
      stopCamera()
    }
  }, [preferFrontCamera, idealWidth, idealHeight, stopCamera])

  /**
   * Cleanup saat komponen unmount
   */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  // Return API hook ke komponen pemakai
  return {
    videoRef,
    stream: streamRef.current,
    cameraState,
    error,
    startCamera,
    stopCamera,
    isReady,
  }
}
