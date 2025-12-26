/**
 * Ekspor Modul Kamera
 * SmartPresence AI - Sistem Pengenalan Wajah Enterprise
 *
 * File ekspor terpusat untuk semua komponen dan utilitas terkait kamera.
 */

// Komponen kamera (stream)
export { CameraStream } from './camera-stream'
export type { CameraStreamProps, CameraStreamRef } from './camera-stream'

// Komponen overlay (bounding box dan pesan tanpa deteksi)
export { BoundingBoxOverlay, NoDetectionOverlay } from './bounding-box-overlay'
export type { BoundingBoxOverlayProps } from './bounding-box-overlay'

// Komponen dashboard kamera (orkestrasi utama)
export { CameraDashboard } from './camera-dashboard'
export type { CameraDashboardProps } from './camera-dashboard'

// Kartu-kartu status untuk dashboard kamera
export {
  SystemStatusCard,
  ConnectionStatusCard,
  RecognitionResultCard,
  ProcessingStatusCard,
} from './camera-status-cards'
