'use client'

/**
 * Komponen Overlay Bounding Box
 * SmartPresence AI - Sistem Pengenalan Wajah Enterprise
 *
 * Merender bounding box yang sudah diskalakan di atas video,
 * lengkap dengan label nama dan styling yang halus dan profesional.
 */

import { memo, useMemo } from 'react'
import type { FaceDetection, BoundingBox } from '@/types/camera'
import { cn } from '@/lib/utils'

/**
 * Props untuk overlay bounding box
 */
export interface BoundingBoxOverlayProps {
  /** Array deteksi wajah beserta bounding box */
  detections: FaceDetection[]
  /** Lebar frame hasil capture (sebelum diskalakan ke tampilan) */
  frameWidth: number
  /** Tinggi frame hasil capture (sebelum diskalakan ke tampilan) */
  frameHeight: number
  /** Lebar aktual tampilan kontainer video */
  displayWidth: number
  /** Tinggi aktual tampilan kontainer video */
  displayHeight: number
  /** Mirror overlay (untuk efek kamera depan) */
  mirror?: boolean
  /** className tambahan */
  className?: string
}

/**
 * Komponen bounding box tunggal
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
  const { name, user_id, visitor_id, boundingBox, confidence } = detection
  const { x, y, width, height } = boundingBox
  
  // Tentukan nama yang ditampilkan berdasarkan logika:
  // - Jika ada user_id: gunakan name (yang sudah di-resolve dari getUserName)
  // - Jika ada visitor_id: tampilkan "Tamu"
  // - Jika keduanya tidak ada: tampilkan "Tidak Dikenal"
  const displayName = name || (visitor_id ? 'Tamu' : (user_id ? `User ${user_id.slice(-6)}` : 'Tidak Dikenal'))
  
  // Tentukan apakah ini user yang dikenal, tamu, atau tidak dikenal
  const isKnownUser = !!user_id
  const isVisitor = !!visitor_id && !user_id

  // Hitung posisi dan ukuran setelah diskalakan ke ukuran tampilan
  const scaledX = x * scaleX
  const scaledY = y * scaleY
  const scaledWidth = width * scaleX
  const scaledHeight = height * scaleY

  // Mirror posisi X jika diperlukan (efek mirror kamera depan)
  const finalX = mirror ? displayWidth - scaledX - scaledWidth : scaledX

  // Teks confidence (jika tersedia)
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
      {/* Border bounding box - warna berbeda berdasarkan tipe */}
      <div
        className={cn(
          'absolute inset-0',
          'border-2 rounded-md shadow-sm',
          isKnownUser ? 'border-primary/60' : isVisitor ? 'border-amber-500/60' : 'border-muted-foreground/60'
        )}
      />

      {/* Aksen sudut untuk tampilan lebih profesional */}
      <div className={cn(
        'absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 rounded-tl-md',
        isKnownUser ? 'border-primary' : isVisitor ? 'border-amber-500' : 'border-muted-foreground'
      )} />
      <div className={cn(
        'absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 rounded-tr-md',
        isKnownUser ? 'border-primary' : isVisitor ? 'border-amber-500' : 'border-muted-foreground'
      )} />
      <div className={cn(
        'absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 rounded-bl-md',
        isKnownUser ? 'border-primary' : isVisitor ? 'border-amber-500' : 'border-muted-foreground'
      )} />
      <div className={cn(
        'absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 rounded-br-md',
        isKnownUser ? 'border-primary' : isVisitor ? 'border-amber-500' : 'border-muted-foreground'
      )} />

      {/* Label nama - warna berbeda: hijau untuk user, kuning untuk tamu, abu untuk tidak dikenal */}
      <div
        className={cn(
          'absolute -top-8 left-0',
          'px-2 py-1',
          'text-xs font-medium',
          'rounded-md',
          'shadow-sm',
          'whitespace-nowrap',
          'max-w-[200px] truncate',
          isKnownUser 
            ? 'bg-primary/90 text-primary-foreground' 
            : isVisitor 
              ? 'bg-amber-500/90 text-white' 
              : 'bg-muted/90 text-muted-foreground'
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
 * Komponen Overlay Bounding Box
 *
 * Merender overlay (posisi absolute) dengan bounding box yang sudah diskalakan
 * untuk setiap wajah yang terdeteksi. Meng-handle transformasi koordinat dari
 * dimensi frame capture ke dimensi tampilan.
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
  // Hitung faktor skala untuk mengonversi koordinat frame -> koordinat tampilan
  const scaleFactors = useMemo(() => {
    if (frameWidth === 0 || frameHeight === 0) {
      return { scaleX: 1, scaleY: 1 }
    }
    return {
      scaleX: displayWidth / frameWidth,
      scaleY: displayHeight / frameHeight,
    }
  }, [frameWidth, frameHeight, displayWidth, displayHeight])

  // Jangan render jika tidak ada deteksi atau dimensi tampilan tidak valid
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
      {/* Render bounding box untuk setiap deteksi */}
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
 * Overlay tanpa deteksi - ditampilkan saat kamera aktif tapi tidak ada wajah terdeteksi
 */
export const NoDetectionOverlay = memo(function NoDetectionOverlay({
  visible,
  className,
}: {
  visible: boolean
  className?: string
}) {
  // Jika tidak visible, jangan render overlay
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
