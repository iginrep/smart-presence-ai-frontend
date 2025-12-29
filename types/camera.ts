
/**
 * Definisi Tipe untuk Dashboard Kamera
 * SmartPresence AI - Sistem Pengenalan Wajah Enterprise
 */

/**
 * Koordinat bounding box untuk wajah yang terdeteksi
 * Koordinat relatif terhadap dimensi frame asli
 */
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Hasil deteksi satu wajah dari backend AI
 */
export interface FaceDetection {
  user_id: string | null
  visitor_id?: string | null
  name?: string
  boundingBox: BoundingBox
  distance?: number
  confidence?: number
  timestamp?: string
}

/**
 * Hasil mentah API dari backend untuk endpoint /face/uploadmany
 */
export interface ApiDetectionResult {
  user_id?: string | null
  visitor_id?: string | null
  distance: number
  bounding_box: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Struktur respons API mentah dari endpoint /face/uploadmany
 */
export interface RawApiResponse {
  status: string
  results: ApiDetectionResult[]
}

/**
 * Struktur respons API dari endpoint pengenalan wajah
 */
export interface FaceRecognitionResponse {
  detections: FaceDetection[]
  processingTime?: number
  frameId?: string
}

/**
 * Status inisialisasi kamera
 */
export type CameraState =
  | 'idle'         // Kamera belum aktif
  | 'requesting'   // Meminta izin kamera
  | 'initializing' // Proses inisialisasi kamera
  | 'active'       // Kamera aktif
  | 'error'        // Terjadi error pada kamera
  | 'denied'       // Izin kamera ditolak

/**
 * Status koneksi API
 */
export type ConnectionState =
  | 'disconnected'   // Tidak terhubung
  | 'connecting'     // Sedang menghubungkan
  | 'connected'      // Terhubung
  | 'error'          // Koneksi error
  | 'reconnecting'   // Mencoba menghubungkan ulang

/**
 * Status pengambilan dan pemrosesan frame
 */
export type ProcessingState =
  | 'idle'        // Menunggu
  | 'capturing'   // Mengambil frame
  | 'sending'     // Mengirim frame ke server
  | 'processing'  // Memproses pengenalan wajah
  | 'complete'    // Proses selesai
  | 'error'       // Gagal memproses

/**
 * Tipe error kamera beserta pesan dalam Bahasa Indonesia
 */
export interface CameraError {
  type: 'permission' | 'not_found' | 'not_readable' | 'overconstrained' | 'unknown'
  message: string
  originalError?: Error
}

/**
 * Informasi status sistem
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
 * Event pengenalan wajah untuk pencatatan aktivitas
 */
export interface RecognitionEvent {
  id: string
  name: string
  timestamp: Date
  confidence?: number
}

/**
 * Opsi konfigurasi kamera
 */
export interface CameraConfig {
  /** Target frame per detik untuk pengambilan gambar */
  targetFps: number
  /** Dimensi maksimum untuk resize frame */
  maxDimension: number
  /** Kualitas JPEG untuk encoding frame (0-1) */
  jpegQuality: number
  /** Preferensi kamera depan */
  preferFrontCamera: boolean
  /** Lebar video ideal */
  idealWidth: number
  /** Tinggi video ideal */
  idealHeight: number
}

/**
 * Konfigurasi default kamera
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
 * Pesan status kamera dalam Bahasa Indonesia
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
 * Pesan status koneksi dalam Bahasa Indonesia
 */
export const CONNECTION_STATE_MESSAGES: Record<ConnectionState, string> = {
  disconnected: 'Tidak terhubung',
  connecting: 'Menghubungkan...',
  connected: 'Terhubung ke server',
  error: 'Koneksi terputus',
  reconnecting: 'Mencoba menghubungkan kembali...',
}

/**
 * Pesan status pemrosesan dalam Bahasa Indonesia
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
 * Pesan error kamera dalam Bahasa Indonesia
 */
export const CAMERA_ERROR_MESSAGES: Record<CameraError['type'], string> = {
  permission: 'Izin akses kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser.',
  not_found: 'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera yang terhubung.',
  not_readable: 'Kamera tidak dapat diakses. Mungkin sedang digunakan aplikasi lain.',
  overconstrained: 'Konfigurasi kamera tidak didukung oleh perangkat.',
  unknown: 'Terjadi kesalahan tidak dikenal pada kamera.',
}
