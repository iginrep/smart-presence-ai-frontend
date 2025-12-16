/**
 * Face Recognition API Route
 * SmartPresence AI - Enterprise Face Recognition System
 *
 * Handles POST requests with base64 encoded frames for face recognition.
 * In production, this would forward to the AI backend service.
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Face detection result structure
 */
interface FaceDetection {
  name: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence?: number
}

/**
 * API Response structure
 */
interface FaceRecognitionResponse {
  detections: FaceDetection[]
  processingTime?: number
  frameId?: string
}

/**
 * Mock names for demo/development purposes
 */
const MOCK_NAMES = [
  'Ahmad Fauzi',
  'Siti Nurhaliza',
  'Budi Santoso',
  'Dewi Lestari',
  'Eko Prasetyo',
  'Fitri Handayani',
  'Gunawan Wibowo',
  'Hana Pertiwi',
]

/**
 * Generate mock detection response
 * In production, replace this with actual AI backend call
 */
function generateMockResponse(): FaceRecognitionResponse {
  const startTime = performance.now()

  // Simulate varying detection results
  const shouldDetect = Math.random() > 0.3
  
  if (!shouldDetect) {
    return {
      detections: [],
      processingTime: Math.round(performance.now() - startTime + Math.random() * 50),
      frameId: `frame_${Date.now()}`,
    }
  }

  const detectionCount = Math.random() > 0.7 ? 2 : 1
  
  const detections: FaceDetection[] = Array.from(
    { length: detectionCount },
    (_, index) => ({
      name: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
      boundingBox: {
        x: 150 + index * 150 + Math.random() * 50,
        y: 80 + Math.random() * 40,
        width: 140 + Math.random() * 30,
        height: 180 + Math.random() * 40,
      },
      confidence: 0.82 + Math.random() * 0.17,
    })
  )

  return {
    detections,
    processingTime: Math.round(performance.now() - startTime + Math.random() * 80 + 20),
    frameId: `frame_${Date.now()}`,
  }
}

/**
 * POST handler for face recognition
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.frame || typeof body.frame !== 'string') {
      return NextResponse.json(
        { error: 'Field "frame" harus berupa string base64' },
        { status: 400 }
      )
    }

    // Validate base64 format (basic check)
    if (body.frame.length < 100) {
      return NextResponse.json(
        { error: 'Data frame tidak valid' },
        { status: 400 }
      )
    }

    // In production, forward to actual AI backend:
    // const aiResponse = await fetch(process.env.AI_BACKEND_URL + '/recognize', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ frame: body.frame }),
    // })
    // const result = await aiResponse.json()

    // For now, return mock response
    const response = generateMockResponse()

    return NextResponse.json(response)
  } catch (error) {
    console.error('[FaceRecognition API] Error:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Format JSON tidak valid' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
