/**
 * Camera Module Exports
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Central export file for all camera-related components and utilities.
 */

// Components
export { CameraStream } from './camera-stream'
export type { CameraStreamProps, CameraStreamRef } from './camera-stream'

export { BoundingBoxOverlay, NoDetectionOverlay } from './bounding-box-overlay'
export type { BoundingBoxOverlayProps } from './bounding-box-overlay'

export { CameraDashboard } from './camera-dashboard'
export type { CameraDashboardProps } from './camera-dashboard'

export {
  SystemStatusCard,
  ConnectionStatusCard,
  RecognitionResultCard,
  ProcessingStatusCard,
} from './camera-status-cards'
