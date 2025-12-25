/**
 * Camera Dashboard Type Definitions
 * SmartPresence AI - Enterprise Face Recognition System
 */

/**
 * Bounding box coordinates for detected faces
 * Coordinates are relative to the original frame dimensions
 */
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Single face detection result from the AI backend
 */
export interface FaceDetection {
  user_id: string | null
  name?: string
  boundingBox: BoundingBox
  distance?: number
  confidence?: number
  timestamp?: string
}

/**
 * Raw API result from backend
 */
export interface ApiDetectionResult {
  user_id: string | null
  distance: number
  bounding_box: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Raw API response structure from face recognition endpoint
 */
export interface RawApiResponse {
  status: string
  results: ApiDetectionResult[]
}

/**
 * API response structure from face recognition endpoint
 */
export interface FaceRecognitionResponse {
  detections: FaceDetection[]
  processingTime?: number
  frameId?: string
}

/**
 * Camera initialization states
 */
export type CameraState =
  | 'idle'
  | 'requesting'
  | 'initializing'
  | 'active'
  | 'error'
  | 'denied'

/**
 * API connection states
 */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'reconnecting'

/**
 * Frame capture and processing states
 */
export type ProcessingState =
  | 'idle'
  | 'capturing'
  | 'sending'
  | 'processing'
  | 'complete'
  | 'error'

/**
 * Camera error types with Indonesian messages
 */
export interface CameraError {
  type: 'permission' | 'not_found' | 'not_readable' | 'overconstrained' | 'unknown'
  message: string
  originalError?: Error
}

/**
 * System status information
 */
export interface SystemStatus {
  cameraState: CameraState
  connectionState: ConnectionState
  processingState: ProcessingState
  lastFrameTime: Date | null
  frameCount: number
  fps: number
  error: CameraError | null
}

/**
 * Recognition event for activity logging
 */
export interface RecognitionEvent {
  id: string
  name: string
  timestamp: Date
  confidence?: number
}

/**
 * Camera configuration options
 */
export interface CameraConfig {
  /** Target frames per second for capture */
  targetFps: number
  /** Maximum dimension for frame resize */
  maxDimension: number
  /** JPEG quality for frame encoding (0-1) */
  jpegQuality: number
  /** Prefer front camera */
  preferFrontCamera: boolean
  /** Ideal video width */
  idealWidth: number
  /** Ideal video height */
  idealHeight: number
}

/**
 * Default camera configuration
 */
export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  targetFps: 1,
  maxDimension: 800,
  jpegQuality: 0.85,
  preferFrontCamera: true,
  idealWidth: 1280,
  idealHeight: 720,
}

/**
 * Indonesian messages for camera states
 */
export const CAMERA_STATE_MESSAGES: Record<CameraState, string> = {
  idle: 'Kamera belum aktif',
  requesting: 'Meminta izin kamera...',
  initializing: 'Menginisialisasi kamera...',
  active: 'Kamera aktif',
  error: 'Terjadi kesalahan pada kamera',
  denied: 'Izin kamera ditolak',
}

/**
 * Indonesian messages for connection states
 */
export const CONNECTION_STATE_MESSAGES: Record<ConnectionState, string> = {
  disconnected: 'Tidak terhubung',
  connecting: 'Menghubungkan...',
  connected: 'Terhubung ke server',
  error: 'Koneksi terputus',
  reconnecting: 'Mencoba menghubungkan kembali...',
}

/**
 * Indonesian messages for processing states
 */
export const PROCESSING_STATE_MESSAGES: Record<ProcessingState, string> = {
  idle: 'Menunggu',
  capturing: 'Mengambil frame...',
  sending: 'Mengirim ke server...',
  processing: 'Memproses pengenalan wajah...',
  complete: 'Selesai',
  error: 'Gagal memproses',
}

/**
 * Indonesian error messages for camera errors
 */
export const CAMERA_ERROR_MESSAGES: Record<CameraError['type'], string> = {
  permission: 'Izin akses kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser.',
  not_found: 'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera yang terhubung.',
  not_readable: 'Kamera tidak dapat diakses. Mungkin sedang digunakan aplikasi lain.',
  overconstrained: 'Konfigurasi kamera tidak didukung oleh perangkat.',
  unknown: 'Terjadi kesalahan tidak dikenal pada kamera.',
}
