'use client'

/**
 * Bounding Box Overlay Component
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Renders scaled bounding boxes on top of the video feed
 * with name labels and subtle, professional styling.
 */

import { memo, useMemo } from 'react'
import type { FaceDetection, BoundingBox } from '@/types/camera'
import { cn } from '@/lib/utils'

/**
 * Bounding box overlay props
 */
export interface BoundingBoxOverlayProps {
  /** Array of face detections with bounding boxes */
  detections: FaceDetection[]
  /** Width of the captured frame (before display scaling) */
  frameWidth: number
  /** Height of the captured frame (before display scaling) */
  frameHeight: number
  /** Actual displayed width of the video container */
  displayWidth: number
  /** Actual displayed height of the video container */
  displayHeight: number
  /** Mirror the overlay (for front camera) */
  mirror?: boolean
  /** Additional className */
  className?: string
}

/**
 * Single bounding box component
 */
interface SingleBoundingBoxProps {
  detection: FaceDetection
  scaleX: number
  scaleY: number
  mirror: boolean
  displayWidth: number
}

const SingleBoundingBox = memo(function SingleBoundingBox({
  detection,
  scaleX,
  scaleY,
  mirror,
  displayWidth,
}: SingleBoundingBoxProps) {
  const { name, user_id, boundingBox, confidence } = detection
  const { x, y, width, height } = boundingBox
  
  // Display name or fallback
  const displayName = name || (user_id ? `User ${user_id.slice(-6)}` : 'Tidak Dikenal')

  // Calculate scaled position and size
  const scaledX = x * scaleX
  const scaledY = y * scaleY
  const scaledWidth = width * scaleX
  const scaledHeight = height * scaleY

  // Mirror the x position if needed (for front camera mirror effect)
  const finalX = mirror ? displayWidth - scaledX - scaledWidth : scaledX

  // Confidence display (if available)
  const confidenceText = confidence
    ? `${Math.round(confidence * 100)}%`
    : null

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${finalX}px`,
        top: `${scaledY}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
      }}
    >
      {/* Bounding box border */}
      <div
        className={cn(
          'absolute inset-0',
          'border-2 border-primary/60',
          'rounded-md',
          'shadow-sm'
        )}
      />

      {/* Corner accents for professional look */}
      <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl-md" />
      <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-primary rounded-tr-md" />
      <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-primary rounded-bl-md" />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-primary rounded-br-md" />

      {/* Name label */}
      <div
        className={cn(
          'absolute -top-8 left-0',
          'px-2 py-1',
          user_id ? 'bg-primary/90 text-primary-foreground' : 'bg-muted/90 text-muted-foreground',
          'text-xs font-medium',
          'rounded-md',
          'shadow-sm',
          'whitespace-nowrap',
          'max-w-[200px] truncate'
        )}
      >
        <span>{displayName}</span>
        {confidenceText && (
          <span className="ml-1.5 opacity-80">{confidenceText}</span>
        )}
      </div>
    </div>
  )
})

/**
 * Bounding Box Overlay Component
 *
 * Renders an absolutely positioned overlay with scaled bounding boxes
 * for each detected face. Handles coordinate transformation from
 * captured frame dimensions to display dimensions.
 */
export const BoundingBoxOverlay = memo(function BoundingBoxOverlay({
  detections,
  frameWidth,
  frameHeight,
  displayWidth,
  displayHeight,
  mirror = true,
  className,
}: BoundingBoxOverlayProps) {
  // Calculate scale factors
  const scaleFactors = useMemo(() => {
    if (frameWidth === 0 || frameHeight === 0) {
      return { scaleX: 1, scaleY: 1 }
    }
    return {
      scaleX: displayWidth / frameWidth,
      scaleY: displayHeight / frameHeight,
    }
  }, [frameWidth, frameHeight, displayWidth, displayHeight])

  // Don't render if no detections or invalid dimensions
  if (
    detections.length === 0 ||
    displayWidth === 0 ||
    displayHeight === 0
  ) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden',
        className
      )}
      style={{
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
      }}
    >
      {detections.map((detection, index) => (
        <SingleBoundingBox
          key={`${detection.user_id || 'unknown'}-${index}`}
          detection={detection}
          scaleX={scaleFactors.scaleX}
          scaleY={scaleFactors.scaleY}
          mirror={mirror}
          displayWidth={displayWidth}
        />
      ))}
    </div>
  )
})

BoundingBoxOverlay.displayName = 'BoundingBoxOverlay'

/**
 * No detection overlay - shown when camera is active but no faces detected
 */
export const NoDetectionOverlay = memo(function NoDetectionOverlay({
  visible,
  className,
}: {
  visible: boolean
  className?: string
}) {
  if (!visible) return null

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-end justify-center pb-6 pointer-events-none',
        className
      )}
    >
      <div className="px-4 py-2 bg-muted/80 backdrop-blur-sm rounded-full">
        <span className="text-sm text-muted-foreground">
          Tidak ada wajah terdeteksi
        </span>
      </div>
    </div>
  )
})

NoDetectionOverlay.displayName = 'NoDetectionOverlay'
