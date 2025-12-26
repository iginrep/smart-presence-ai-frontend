// File ini untuk menangani permintaan API pengenalan wajah

import { NextRequest, NextResponse } from 'next/server' // Import modul Next.js untuk API routes

/**
 * Face detection result structure
 */
// Struktur hasil deteksi wajah
interface FaceDetection {
  name: string  // Nama yang dikenali dari hasil deteksi wajah
  boundingBox: {
    x: number  // Koordinat X dari kotak pembatas wajah
    y: number  // Koordinat Y dari kotak pembatas wajah
    width: number  // Lebar kotak pembatas wajah
    height: number  // Tinggi kotak pembatas wajah
  }
  confidence?: number // Tingkat kepercayaan pengenalan (opsional)
}

/**
 * API Response structure
 */
// Struktur respons API pengenalan wajah
interface FaceRecognitionResponse {
  detections: FaceDetection[] // Daftar deteksi wajah
  processingTime?: number // Waktu pemrosesan dalam milidetik (opsional)
  frameId?: string  // ID unik untuk frame yang diproses (opsional)
}

/**
 * Mock nama untuk deteksi wajah
 */
// Daftar nama palsu untuk simulasi deteksi wajah
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
 *
 */
// Fungsi untuk menghasilkan respons deteksi wajah palsu (mock)
function generateMockResponse(): FaceRecognitionResponse {  
  const startTime = performance.now() // Catat waktu mulai pemrosesan

  // Simulasikan beberapa kasus di mana tidak ada wajah yang terdeteksi (30% tidak deteksi)
  const shouldDetect = Math.random() > 0.3  // 70% kemungkinan mendeteksi wajah
  
  // Jika tidak mendeteksi wajah, kembalikan respons kosong
  if (!shouldDetect) {
    return {  
      detections: [], // Tidak ada deteksi wajah
      processingTime: Math.round(performance.now() - startTime + Math.random() * 50), // Waktu proses acak
      frameId: `frame_${Date.now()}`, // ID frame unik
    }
  }

  // Tentukan jumlah wajah yang dideteksi (30% kemungkinan 2 wajah, sisanya 1)
  const detectionCount = Math.random() > 0.7 ? 2 : 1  

  // Buat array deteksi wajah palsu
  const detections: FaceDetection[] = Array.from( 
    { length: detectionCount },
    (_, index) => ({
      name: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)], // Pilih nama acak
      boundingBox: {
        x: 150 + index * 150 + Math.random() * 50, // Koordinat X acak
        y: 80 + Math.random() * 40, // Koordinat Y acak
        width: 140 + Math.random() * 30, // Lebar acak
        height: 180 + Math.random() * 40, // Tinggi acak
      },
      confidence: 0.82 + Math.random() * 0.17, // Nilai kepercayaan acak
    })
  )

  // Kembalikan respons dengan deteksi palsu
  return {
    detections,
    processingTime: Math.round(performance.now() - startTime + Math.random() * 80 + 20), // Waktu proses acak
    frameId: `frame_${Date.now()}`,
  }
}

/**
 * Handler untuk permintaan POST pengenalan wajah
 * Menerima frame gambar (base64) dan mengembalikan hasil deteksi wajah (mock)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() // Ambil body request dalam format JSON
    
    // Validasi apakah field 'frame' ada dan bertipe string
    if (!body.frame || typeof body.frame !== 'string') {
      return NextResponse.json(
        { error: 'Field "frame" harus berupa string base64' },
        { status: 400 }
      )
    }

    // Validasi sederhana panjang data base64
    if (body.frame.length < 100) {
      return NextResponse.json(
        { error: 'Data frame tidak valid' },
        { status: 400 }
      )
    }

    // Di produksi, request akan diteruskan ke backend AI sebenarnya
    // const aiResponse = await fetch(process.env.AI_BACKEND_URL + '/recognize', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ frame: body.frame }),
    // })
    // const result = await aiResponse.json()

    // Untuk saat ini, kembalikan respons mock
    const response = generateMockResponse()

    return NextResponse.json(response) // Kirim respons ke client
  } catch (error) {
    console.error('[FaceRecognition API] Error:', error) // Log error ke konsol
    
    // Tangani error JSON tidak valid
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Format JSON tidak valid' },
        { status: 400 }
      )
    }

    // Tangani error server lainnya
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}

/**
 * Handler untuk permintaan OPTIONS (CORS preflight)
 * Mengizinkan metode POST dan header tertentu
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Izinkan semua origin
      'Access-Control-Allow-Methods': 'POST, OPTIONS', // Izinkan metode POST dan OPTIONS
      'Access-Control-Allow-Headers': 'Content-Type', // Izinkan header Content-Type
    },
  })
}
