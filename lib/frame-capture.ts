/**
 * Utilitas Pengambilan Frame
 * SmartPresence AI - Sistem Pengenalan Wajah Enterprise
 *
 * Menangani pengambilan frame berbasis canvas dari elemen video,
 * resize proporsional, dan encoding JPEG Base64.
 */


// Import tipe konfigurasi kamera
import type { CameraConfig, DEFAULT_CAMERA_CONFIG } from '@/types/camera'


/**
 * Hasil dari operasi pengambilan frame
 */
export interface FrameCaptureResult {
  base64: string
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  timestamp: number
}


/**
 * Konfigurasi pengambilan frame
 */
export interface FrameCaptureConfig {
  /** Gunakan dimensi pasti, bukan scaling max dimension */
  useExactDimensions?: boolean
  /** Lebar pasti (jika useExactDimensions true) */
  exactWidth?: number
  /** Tinggi pasti (jika useExactDimensions true) */
  exactHeight?: number
  /** Dimensi maksimum untuk scaling proporsional */
  maxDimension: number
  /** Kualitas JPEG (0-1) */
  jpegQuality: number
}

/**
 * Hitung dimensi proporsional dengan menjaga rasio aspek
 * @param width Lebar asli
 * @param height Tinggi asli
 * @param maxDimension Dimensi maksimum yang diizinkan
 * @returns Dimensi hasil scaling
 */
export function calculateProportionalDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number; scale: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height, scale: 1 }
  }

  const scale = Math.min(maxDimension / width, maxDimension / height)
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale,
  }
}

/**
 * Mengambil satu frame dari elemen video
 * @param video HTMLVideoElement sumber
 * @param canvas HTMLCanvasElement untuk rendering
 * @param config Konfigurasi pengambilan
 * @returns FrameCaptureResult atau null jika gagal
 */
export function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  config: FrameCaptureConfig
): FrameCaptureResult | null {
  // Validasi video sudah siap
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    console.warn('[FrameCapture] Video not ready for capture')
    return null
  }

  const originalWidth = video.videoWidth
  const originalHeight = video.videoHeight

  // Validasi dimensi video
  if (originalWidth === 0 || originalHeight === 0) {
    console.warn('[FrameCapture] Invalid video dimensions')
    return null
  }

  // Tentukan dimensi output
  let width: number
  let height: number

  if (config.useExactDimensions && config.exactWidth && config.exactHeight) {
    // Gunakan dimensi pasti (misal 1280x740 untuk CCTV)
    width = config.exactWidth
    height = config.exactHeight
  } else {
    // Hitung dimensi proporsional
    const proportional = calculateProportionalDimensions(
      originalWidth,
      originalHeight,
      config.maxDimension
    )
    width = proportional.width
    height = proportional.height
  }

  // Set dimensi canvas
  canvas.width = width
  canvas.height = height

  // Ambil context 2D
  const ctx = canvas.getContext('2d', {
    alpha: false,
    willReadFrequently: false,
  })

  if (!ctx) {
    console.error('[FrameCapture] Failed to get canvas context')
    return null
  }

  // Gambar frame video ke canvas dengan scaling
  ctx.drawImage(video, 0, 0, width, height)

  // Konversi ke JPEG Base64
  const base64 = canvas.toDataURL('image/jpeg', config.jpegQuality)

  // Hapus prefix data URL agar payload lebih ringkas
  const base64Data = base64.replace(/^data:image\/jpeg;base64,/, '')

  return {
    base64: base64Data,
    width,
    height,
    originalWidth,
    originalHeight,
    timestamp: Date.now(),
  }
}

/**
 * Membuat elemen canvas tersembunyi untuk pengambilan frame
 * @returns HTMLCanvasElement
 */
export function createCaptureCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.style.display = 'none'
  return canvas
}

/**
 * Kelas manajer pengambilan frame untuk interval terkontrol
 */
export class FrameCaptureManager {
  private video: HTMLVideoElement | null = null
  private canvas: HTMLCanvasElement
  private config: FrameCaptureConfig
  private intervalId: number | null = null
  private isCapturing = false
  private onFrameCapture: ((frame: FrameCaptureResult) => void) | null = null
  private lastCaptureTime = 0


  constructor(config: FrameCaptureConfig) {
    this.config = config
    this.canvas = createCaptureCanvas()
  }


  /**
   * Inisialisasi manager dengan elemen video
   */
  setVideoElement(video: HTMLVideoElement): void {
    this.video = video
  }


  /**
   * Set callback pengambilan frame
   */
  setOnFrameCapture(callback: (frame: FrameCaptureResult) => void): void {
    this.onFrameCapture = callback
  }

  /**
   * Mulai pengambilan frame dengan interval tertentu
   * @param intervalMs Interval pengambilan dalam milidetik
   */
  start(intervalMs: number): void {
    if (this.intervalId !== null) {
      console.warn('[FrameCaptureManager] Already capturing, stopping first')
      this.stop()
    }

    if (!this.video) {
      console.error('[FrameCaptureManager] No video element set')
      return
    }

    this.isCapturing = true
    this.intervalId = window.setInterval(() => {
      this.captureIfReady()
    }, intervalMs)

    console.log(`[FrameCaptureManager] Started capturing every ${intervalMs}ms`)
  }

  /**
   * Ambil frame jika siap dan tidak sedang memproses
   */
  private captureIfReady(): void {
    if (!this.isCapturing || !this.video || !this.onFrameCapture) {
      return
    }

    const frame = captureFrame(this.video, this.canvas, this.config)
    if (frame) {
      this.lastCaptureTime = frame.timestamp
      this.onFrameCapture(frame)
    }
  }

  /**
   * Hentikan pengambilan frame
   */
  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isCapturing = false
    console.log('[FrameCaptureManager] Stopped capturing')
  }

  /**
   * Ambil timestamp pengambilan terakhir
   */
  getLastCaptureTime(): number {
    return this.lastCaptureTime
  }

  /**
   * Cek apakah sedang mengambil frame
   */
  getIsCapturing(): boolean {
    return this.isCapturing
  }

  /**
   * Bersihkan resource
   */
  dispose(): void {
    this.stop()
    this.video = null
    this.onFrameCapture = null
  }
}

/**
 * Hitung faktor skala antara frame hasil capture dan video yang ditampilkan
 * @param capturedWidth Lebar frame hasil capture/resize
 * @param capturedHeight Tinggi frame hasil capture/resize
 * @param displayWidth Lebar video yang ditampilkan
 * @param displayHeight Tinggi video yang ditampilkan
 * @returns Faktor skala x dan y
 */
export function calculateDisplayScale(
  capturedWidth: number,
  capturedHeight: number,
  displayWidth: number,
  displayHeight: number
): { scaleX: number; scaleY: number } {
  return {
    scaleX: displayWidth / capturedWidth,
    scaleY: displayHeight / capturedHeight,
  }
}
