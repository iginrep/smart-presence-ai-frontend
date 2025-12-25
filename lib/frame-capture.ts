/**
 * Frame Capture Utility
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Handles canvas-based frame capture from video element,
 * proportional resizing, and Base64 JPEG encoding.
 */

import type { CameraConfig, DEFAULT_CAMERA_CONFIG } from '@/types/camera'

/**
 * Result of a frame capture operation
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
 * Frame capture configuration
 */
export interface FrameCaptureConfig {
  /** Use exact dimensions instead of max dimension scaling */
  useExactDimensions?: boolean
  /** Exact width (when useExactDimensions is true) */
  exactWidth?: number
  /** Exact height (when useExactDimensions is true) */
  exactHeight?: number
  /** Max dimension for proportional scaling */
  maxDimension: number
  /** JPEG quality (0-1) */
  jpegQuality: number
}

/**
 * Calculate proportional dimensions maintaining aspect ratio
 * @param width Original width
 * @param height Original height
 * @param maxDimension Maximum allowed dimension
 * @returns Scaled dimensions
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
 * Captures a single frame from a video element
 * @param video HTMLVideoElement to capture from
 * @param canvas HTMLCanvasElement to use for rendering
 * @param config Capture configuration
 * @returns FrameCaptureResult or null if capture failed
 */
export function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  config: FrameCaptureConfig
): FrameCaptureResult | null {
  // Validate video is ready
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    console.warn('[FrameCapture] Video not ready for capture')
    return null
  }

  const originalWidth = video.videoWidth
  const originalHeight = video.videoHeight

  // Validate dimensions
  if (originalWidth === 0 || originalHeight === 0) {
    console.warn('[FrameCapture] Invalid video dimensions')
    return null
  }

  // Determine output dimensions
  let width: number
  let height: number

  if (config.useExactDimensions && config.exactWidth && config.exactHeight) {
    // Use exact dimensions (1280x740 for CCTV processing)
    width = config.exactWidth
    height = config.exactHeight
  } else {
    // Calculate proportional dimensions
    const proportional = calculateProportionalDimensions(
      originalWidth,
      originalHeight,
      config.maxDimension
    )
    width = proportional.width
    height = proportional.height
  }

  // Set canvas dimensions
  canvas.width = width
  canvas.height = height

  // Get 2D context
  const ctx = canvas.getContext('2d', {
    alpha: false,
    willReadFrequently: false,
  })

  if (!ctx) {
    console.error('[FrameCapture] Failed to get canvas context')
    return null
  }

  // Draw video frame to canvas with scaling
  ctx.drawImage(video, 0, 0, width, height)

  // Convert to Base64 JPEG
  const base64 = canvas.toDataURL('image/jpeg', config.jpegQuality)

  // Remove data URL prefix for cleaner payload
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
 * Creates a hidden canvas element for frame capture
 * @returns HTMLCanvasElement
 */
export function createCaptureCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.style.display = 'none'
  return canvas
}

/**
 * Frame capture manager class for controlled interval capture
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
   * Initialize the manager with a video element
   */
  setVideoElement(video: HTMLVideoElement): void {
    this.video = video
  }

  /**
   * Set the frame capture callback
   */
  setOnFrameCapture(callback: (frame: FrameCaptureResult) => void): void {
    this.onFrameCapture = callback
  }

  /**
   * Start capturing frames at the specified interval
   * @param intervalMs Capture interval in milliseconds
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
   * Capture a frame if ready and not already processing
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
   * Stop capturing frames
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
   * Get the last capture timestamp
   */
  getLastCaptureTime(): number {
    return this.lastCaptureTime
  }

  /**
   * Check if currently capturing
   */
  getIsCapturing(): boolean {
    return this.isCapturing
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop()
    this.video = null
    this.onFrameCapture = null
  }
}

/**
 * Calculate scale factor between captured frame and displayed video
 * @param capturedWidth Width of the captured/resized frame
 * @param capturedHeight Height of the captured/resized frame
 * @param displayWidth Displayed video width
 * @param displayHeight Displayed video height
 * @returns Scale factors for x and y
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
