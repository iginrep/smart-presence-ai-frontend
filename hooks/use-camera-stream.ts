/**
 * Camera Stream Hook
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Custom hook for managing WebRTC camera stream with proper lifecycle handling.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import type {
  CameraState,
  CameraError,
  CameraConfig,
  DEFAULT_CAMERA_CONFIG,
} from '@/types/camera'

/**
 * Camera stream hook return type
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
 * Parse camera error to standardized format with Indonesian messages
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
 * Custom hook for managing camera stream
 */
export function useCameraStream(
  config: Partial<CameraConfig> = {}
): UseCameraStreamReturn {
  const {
    preferFrontCamera = true,
    idealWidth = 1280,
    idealHeight = 720,
  } = config

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [error, setError] = useState<CameraError | null>(null)
  const [isReady, setIsReady] = useState(false)

  /**
   * Stop all tracks and cleanup stream
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
   * Request camera access and initialize stream
   */
  const startCamera = useCallback(async () => {
    // Check for secure context
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

    // Check for mediaDevices support
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

    // Stop existing stream if any
    stopCamera()

    try {
      setCameraState('requesting')
      setError(null)

      // Build constraints with front camera preference
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

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Wait for video to be ready
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

        // Start playback
        await videoRef.current.play()
        
        // Log video track settings
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
        console.log('[CameraStream] Camera active and ready')
      }
    } catch (err) {
      console.error('[CameraStream] Failed to start camera:', err)
      const cameraError = parseCameraError(err)
      setError(cameraError)
      setCameraState(cameraError.type === 'permission' ? 'denied' : 'error')
      stopCamera()
    }
  }, [preferFrontCamera, idealWidth, idealHeight, stopCamera])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

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
