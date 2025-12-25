/**
 * Face Recognition API Client
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Handles API communication with the face recognition backend.
 */

import type { 
  FaceRecognitionResponse, 
  FaceDetection, 
  RawApiResponse, 
  ApiDetectionResult 
} from '@/types/camera'
import { getNameById } from '@/lib/user-mapping'

/**
 * API request configuration
 */
export interface ApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

/**
 * Default API configuration
 * TODO: Update baseUrl with your actual backend endpoint
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
}

/**
 * API error with additional context
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
 * Transform raw API response to internal format
 */
function transformApiResponse(raw: RawApiResponse): FaceRecognitionResponse {
  const detections: FaceDetection[] = raw.results.map((result: ApiDetectionResult) => ({
    user_id: result.user_id,
    name: getNameById(result.user_id),
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
 * Send frame for face recognition
 * @param frame Base64 encoded JPEG frame
 * @param config API configuration
 * @returns Face recognition response
 */
export async function sendFrameForRecognition(
  frame: string,
  config: Partial<ApiConfig> = {}
): Promise<FaceRecognitionResponse> {
  const { baseUrl, timeout } = { ...DEFAULT_API_CONFIG, ...config }
  const endpoint = `${baseUrl}/api/face-recognition`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ frame }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new FaceRecognitionApiError(
        `API request failed: ${response.statusText}`,
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
 * Request queue manager to prevent overlapping requests
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
   * Set response callback
   */
  setOnResponse(callback: (response: FaceRecognitionResponse) => void): void {
    this.onResponse = callback
  }

  /**
   * Set error callback
   */
  setOnError(callback: (error: FaceRecognitionApiError) => void): void {
    this.onError = callback
  }

  /**
   * Queue a frame for processing
   * If a request is in progress, the frame will be stored and sent after
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
   * Process a frame
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
   * Check if currently processing
   */
  getIsProcessing(): boolean {
    return this.isProcessing
  }

  /**
   * Clear pending frames
   */
  clear(): void {
    this.pendingFrame = null
  }
}

/**
 * Create a mock response for development/demo purposes
 */
export function createMockResponse(
  simulateDetection: boolean = true
): FaceRecognitionResponse {
  if (!simulateDetection || Math.random() > 0.7) {
    return { detections: [] }
  }

  // Mock user IDs matching our user-mapping database
  const mockUserIds = [
    '693ea35da92dbf184b9c7790',
    '693ea35ca92dbf184b9c778a',
    '694a6018380de32ee408fedf',
    '694a601e380de32ee408fef5',
    '694a6023380de32ee408ff07',
    null, // Unknown user
  ]

  const detectionCount = Math.random() > 0.5 ? 1 : Math.floor(Math.random() * 3) + 1

  const detections: FaceDetection[] = Array.from(
    { length: detectionCount },
    (_, index) => {
      const userId = mockUserIds[Math.floor(Math.random() * mockUserIds.length)]
      return {
        user_id: userId,
        name: getNameById(userId),
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
