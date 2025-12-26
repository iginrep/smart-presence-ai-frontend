"use client"

// Import React hooks, komponen UI, ikon, util className, dan pemetaan user.
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, RefreshCw, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNameById } from "@/lib/user-mapping"

/**
 * Record orang yang terdeteksi dari sistem logging.
 */
export interface DetectedPerson {
  id: string
  user_id: string | null
  name: string
  detectedAt: Date
  confidence?: number
}

/**
 * Definisi sesi kelas.
 */
export interface ClassSession {
  id: string
  name: string
  startTime: string
  endTime: string
  label: string
}

/**
 * Daftar sesi kelas yang sudah didefinisikan.
 */
export const CLASS_SESSIONS: ClassSession[] = [
  {
    id: "cv",
    name: "Visi Komputer",
    startTime: "08:40",
    endTime: "10:20",
    label: "Visi Komputer (08:40 - 10:20)",
  },
  {
    id: "math",
    name: "Matematika",
    startTime: "07:00",
    endTime: "08:40",
    label: "Matematika (07:00 - 08:40)",
  },
  {
    id: "ml",
    name: "Pembelajaran Mesin",
    startTime: "10:30",
    endTime: "12:10",
    label: "Pembelajaran Mesin (10:30 - 12:10)",
  },
  {
    id: "ds",
    name: "Struktur Data",
    startTime: "13:00",
    endTime: "14:40",
    label: "Struktur Data (13:00 - 14:40)",
  },
  {
    id: "algo",
    name: "Algoritma",
    startTime: "14:50",
    endTime: "16:30",
    label: "Algoritma (14:50 - 16:30)",
  },
]

/**
 * Base URL API untuk riwayat deteksi.
 * TODO: Sesuaikan endpoint backend Anda.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

/**
 * Format respons API untuk riwayat deteksi.
 */
interface DetectionHistoryResponse {
  status: string
  results: Array<{
    user_id: string | null
    distance: number
    detected_at: string
  }>
}

/**
 * Mengambil daftar orang terdeteksi untuk sesi tertentu dari backend API.
 */
async function fetchDetectedPersons(
  sessionId: string,
  session: ClassSession,
  date: Date = new Date()
): Promise<DetectedPerson[]> {
  // Format tanggal YYYY-MM-DD sesuai kebutuhan backend.
  const dateStr = date.toISOString().split('T')[0]
  // Endpoint POST untuk mengambil riwayat deteksi.
  const endpoint = `${API_BASE_URL}/api/detection-history`
  
  try {
    // Kirim parameter waktu sesi ke backend.
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: dateStr,
        start_time: session.startTime,
        end_time: session.endTime,
        session_id: sessionId,
      }),
    })

    // Jika respons bukan 2xx, anggap gagal dan lempar error.
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    // Parse JSON sesuai kontrak respons.
    const data: DetectionHistoryResponse = await response.json()
    
    // Ubah hasil API menjadi struktur `DetectedPerson` yang dipakai UI.
    return data.results.map((result, index) => ({
      id: `${sessionId}-${index}-${Date.now()}`,
      user_id: result.user_id,
      name: getNameById(result.user_id),
      detectedAt: new Date(result.detected_at),
      confidence: result.distance,
    }))
  } catch (error) {
    // Log error untuk debugging, lalu lempar lagi agar caller bisa menanganinya.
    console.error('[DetectionList] API Error:', error)
    throw error
  }
}

interface DetectionListProps {
  selectedSession: ClassSession | null
  className?: string
}

/**
 * Komponen Daftar Deteksi
 * Menampilkan daftar sederhana orang yang terdeteksi pada sesi kelas tertentu.
 */
export function DetectionList({ selectedSession, className }: DetectionListProps) {
  // State data hasil deteksi.
  const [detectedPersons, setDetectedPersons] = useState<DetectedPerson[]>([])
  // State loading untuk menonaktifkan tombol refresh dan menampilkan indikator.
  const [isLoading, setIsLoading] = useState(false)
  // Menyimpan waktu update terakhir.
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  // Toggle auto-refresh.
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  // Fungsi pengambil data (dipakai manual refresh dan auto-refresh).
  const fetchData = useCallback(async () => {
    // Jika belum ada sesi dipilih, kosongkan data dan hentikan.
    if (!selectedSession) {
      setDetectedPersons([])
      return
    }

    // Mulai loading.
    setIsLoading(true)
    try {
      // Ambil data dari backend untuk sesi terpilih.
      const data = await fetchDetectedPersons(selectedSession.id, selectedSession)
      setDetectedPersons(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch detected persons:", error)
      // Jika gagal, pertahankan data lama (hanya log error).
    } finally {
      // Akhiri loading apapun hasilnya.
      setIsLoading(false)
    }
  }, [selectedSession])

  // Ambil data setiap kali sesi berubah.
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh tiap 5 menit saat diaktifkan dan sesi sudah dipilih.
  useEffect(() => {
    if (!autoRefreshEnabled || !selectedSession) return

    const interval = setInterval(() => {
      fetchData()
    }, 5 * 60 * 1000) // 5 menit

    return () => clearInterval(interval)
  }, [autoRefreshEnabled, selectedSession, fetchData])

  return (
    <Card className={cn("border-border shadow-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Daftar Terdeteksi
            </CardTitle>
            {detectedPersons.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {detectedPersons.length} orang
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Update: {lastUpdated.toLocaleTimeString("id-ID")}
              </span>
            )}
            {/* Tombol refresh manual */}
            <button
              onClick={fetchData}
              disabled={isLoading}
              className={cn(
                "p-1.5 rounded-md hover:bg-muted transition-colors",
                isLoading && "animate-spin"
              )}
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Kondisi tampilan berdasarkan sesi terpilih + status loading + ketersediaan data */}
        {!selectedSession ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Pilih sesi kelas untuk melihat daftar</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </div>
        ) : detectedPersons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada yang terdeteksi</p>
          </div>
        ) : (
          // Daftar hasil deteksi.
          <div className="space-y-2">
            {detectedPersons.map((person, index) => (
              <div
                key={person.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  "bg-muted/30 hover:bg-muted/50 transition-colors",
                  "border border-border/50"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Nomor urut */}
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {person.name}
                    </p>
                    {/* Waktu deteksi */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {person.detectedAt.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                {/* Badge confidence (jika tersedia) */}
                {person.confidence && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      person.confidence > 0.9
                        ? "border-green-500/30 text-green-600"
                        : "border-yellow-500/30 text-yellow-600"
                    )}
                  >
                    {Math.round(person.confidence * 100)}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Indikator + kontrol auto-refresh */}
        {selectedSession && (
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Auto-refresh setiap 5 menit
            </span>
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={cn(
                "text-xs px-2 py-1 rounded",
                autoRefreshEnabled
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {autoRefreshEnabled ? "Aktif" : "Nonaktif"}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
