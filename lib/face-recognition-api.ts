/**
 * Klien API Pengenalan Wajah
 * SmartPresence AI - Sistem Pengenalan Wajah Enterprise
 *
 * Mengelola komunikasi API dengan backend pengenalan wajah.
 */


// Import tipe respons pengenalan wajah dan utilitas mapping user
import type { 
  FaceRecognitionResponse, 
  FaceDetection, 
  RawApiResponse, 
  ApiDetectionResult 
} from '@/types/camera'
import { getDisplayName } from '@/lib/user-mapping'


/**
 * Konfigurasi request API
 */
export interface ApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  classId: string
}


/**
 * Konfigurasi default API
 * TODO: Perbarui baseUrl dengan endpoint backend Anda
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  classId: process.env.NEXT_PUBLIC_CLASS_ID || 'class_id_placeholder',
}


/**
 * Error API dengan konteks tambahan
 */
export class FaceRecognitionApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isTimeout: boolean = false,
    public isNetworkError: boolean = false
  ) {
    super(message)
    this.name = 'FaceRecognitionApiError'
  }
}

/**
 * Transformasi respons API mentah ke format internal
 * Mendukung user_id dan visitor_id untuk penamaan
 */
function transformApiResponse(raw: RawApiResponse): FaceRecognitionResponse {
  const detections: FaceDetection[] = raw.results.map((result: ApiDetectionResult) => ({
    user_id: result.user_id || null,
    visitor_id: result.visitor_id || null,
    name: getDisplayName(result.user_id, result.visitor_id),
    boundingBox: {
      x: result.bounding_box.x,
      y: result.bounding_box.y,
      width: result.bounding_box.width,
      height: result.bounding_box.height,
    },
    distance: result.distance,
    confidence: result.distance, // Using distance as confidence
  }))

  return {
    detections,
  }
}

/**
 * Mengirim frame untuk pengenalan wajah ke endpoint /face/uploadmany
 * @param frame Frame JPEG yang sudah di-encode Base64
 * @param config Konfigurasi API
 * @returns Respons pengenalan wajah
 */
export async function sendFrameForRecognition(
  frame: string,
  config: Partial<ApiConfig> = {}
): Promise<FaceRecognitionResponse> {
  const { baseUrl, timeout, classId } = { ...DEFAULT_API_CONFIG, ...config }
  const endpoint = `${baseUrl}/face/uploadmany`


  // AbortController untuk timeout request
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: frame,
        class_id: classId,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)


    if (!response.ok) {
      throw new FaceRecognitionApiError(
        `Permintaan API gagal: ${response.statusText}`,
        response.status
      )
    }

    const data: RawApiResponse = await response.json()
    return transformApiResponse(data)
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof FaceRecognitionApiError) {
      throw error
    }


    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new FaceRecognitionApiError(
          'Permintaan timeout',
          undefined,
          true
        )
      }

      if (
        error.message.includes('fetch') ||
        error.message.includes('network')
      ) {
        throw new FaceRecognitionApiError(
          'Koneksi jaringan terputus',
          undefined,
          false,
          true
        )
      }
    }

    throw new FaceRecognitionApiError(
      'Terjadi kesalahan tidak dikenal'
    )
  }
}

/**
 * Manajer antrian request untuk mencegah request bertumpuk
 */
export class RequestQueueManager {
  private isProcessing = false
  private pendingFrame: string | null = null
  private onResponse: ((response: FaceRecognitionResponse) => void) | null = null
  private onError: ((error: FaceRecognitionApiError) => void) | null = null
  private config: ApiConfig


  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_API_CONFIG, ...config }
  }


  /**
   * Set callback respons
   */
  setOnResponse(callback: (response: FaceRecognitionResponse) => void): void {
    this.onResponse = callback
  }


  /**
   * Set callback error
   */
  setOnError(callback: (error: FaceRecognitionApiError) => void): void {
    this.onError = callback
  }

  /**
   * Masukkan frame ke antrian untuk diproses
   * Jika ada request yang sedang berjalan, frame akan disimpan dan dikirim setelahnya
   */
  enqueue(frame: string): void {
    if (this.isProcessing) {
      // Store latest frame, discard older pending frames
      this.pendingFrame = frame
      return
    }

    this.processFrame(frame)
  }

  /**
   * Memproses satu frame
   */
  private async processFrame(frame: string): Promise<void> {
    this.isProcessing = true

    try {
      const response = await sendFrameForRecognition(frame, this.config)
      this.onResponse?.(response)
    } catch (error) {
      if (error instanceof FaceRecognitionApiError) {
        this.onError?.(error)
      } else {
        this.onError?.(new FaceRecognitionApiError('Unknown error'))
      }
    } finally {
      this.isProcessing = false

      // Process pending frame if any
      if (this.pendingFrame) {
        const nextFrame = this.pendingFrame
        this.pendingFrame = null
        this.processFrame(nextFrame)
      }
    }
  }


  /**
   * Cek apakah sedang memproses
   */
  getIsProcessing(): boolean {
    return this.isProcessing
  }


  /**
   * Hapus frame yang tertunda
   */
  clear(): void {
    this.pendingFrame = null
  }
}

/**
 * Membuat respons mock untuk keperluan pengembangan/demo
 * Mendukung user_id dan visitor_id
 */
export function createMockResponse(
  simulateDetection: boolean = true
): FaceRecognitionResponse {
  if (!simulateDetection || Math.random() > 0.7) {
    return { detections: [] }
  }

  // Mock data - bisa user_id atau visitor_id
  const mockData: Array<{ user_id: string | null; visitor_id: string | null }> = [
    { user_id: '693ea35da92dbf184b9c7790', visitor_id: null },
    { user_id: '693ea35ca92dbf184b9c778a', visitor_id: null },
    { user_id: '694a6018380de32ee408fedf', visitor_id: null },
    { user_id: '694a601e380de32ee408fef5', visitor_id: null },
    { user_id: '694a6023380de32ee408ff07', visitor_id: null },
    { user_id: null, visitor_id: 'visitor_001' }, // Visitor/Tamu
    { user_id: null, visitor_id: 'visitor_002' }, // Visitor/Tamu
    { user_id: null, visitor_id: null }, // Tidak dikenal
  ]

  const detectionCount = Math.random() > 0.5 ? 1 : Math.floor(Math.random() * 3) + 1

  const detections: FaceDetection[] = Array.from(
    { length: detectionCount },
    (_, index) => {
      const data = mockData[Math.floor(Math.random() * mockData.length)]
      return {
        user_id: data.user_id,
        visitor_id: data.visitor_id,
        name: getDisplayName(data.user_id, data.visitor_id),
        boundingBox: {
          x: 150 + index * 150 + Math.random() * 50,
          y: 100 + Math.random() * 50,
          width: 120 + Math.random() * 40,
          height: 150 + Math.random() * 50,
        },
        distance: 0.85 + Math.random() * 0.14,
        confidence: 0.85 + Math.random() * 0.14,
      }
    }
  )

  return {
    detections,
    processingTime: 50 + Math.random() * 100,
  }
}
