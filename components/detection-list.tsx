"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, RefreshCw, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNameById } from "@/lib/user-mapping"

/**
 * Detected person record from the logging system
 */
export interface DetectedPerson {
  id: string
  user_id: string | null
  name: string
  detectedAt: Date
  confidence?: number
}

/**
 * Class session definition
 */
export interface ClassSession {
  id: string
  name: string
  startTime: string
  endTime: string
  label: string
}

/**
 * Pre-defined class sessions
 */
export const CLASS_SESSIONS: ClassSession[] = [
  {
    id: "cv",
    name: "Computer Vision",
    startTime: "08:40",
    endTime: "10:20",
    label: "Computer Vision (08:40 - 10:20)",
  },
  {
    id: "math",
    name: "Mathematics",
    startTime: "07:00",
    endTime: "08:40",
    label: "Math (07:00 - 08:40)",
  },
  {
    id: "ml",
    name: "Machine Learning",
    startTime: "10:30",
    endTime: "12:10",
    label: "Machine Learning (10:30 - 12:10)",
  },
  {
    id: "ds",
    name: "Data Structures",
    startTime: "13:00",
    endTime: "14:40",
    label: "Data Structures (13:00 - 14:40)",
  },
  {
    id: "algo",
    name: "Algorithms",
    startTime: "14:50",
    endTime: "16:30",
    label: "Algorithms (14:50 - 16:30)",
  },
]

/**
 * API base URL for detection history
 * TODO: Configure your backend API endpoint
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

/**
 * API response format for detection history
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
 * Fetch detected persons for a given session from the backend API
 */
async function fetchDetectedPersons(
  sessionId: string,
  session: ClassSession,
  date: Date = new Date()
): Promise<DetectedPerson[]> {
  const dateStr = date.toISOString().split('T')[0]
  const endpoint = `${API_BASE_URL}/api/detection-history`
  
  try {
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

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data: DetectionHistoryResponse = await response.json()
    
    return data.results.map((result, index) => ({
      id: `${sessionId}-${index}-${Date.now()}`,
      user_id: result.user_id,
      name: getNameById(result.user_id),
      detectedAt: new Date(result.detected_at),
      confidence: result.distance,
    }))
  } catch (error) {
    console.error('[DetectionList] API Error:', error)
    throw error
  }
}

interface DetectionListProps {
  selectedSession: ClassSession | null
  className?: string
}

/**
 * Detection List Component
 * Displays a simple list of detected persons for a given class session
 */
export function DetectionList({ selectedSession, className }: DetectionListProps) {
  const [detectedPersons, setDetectedPersons] = useState<DetectedPerson[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!selectedSession) {
      setDetectedPersons([])
      return
    }

    setIsLoading(true)
    try {
      const data = await fetchDetectedPersons(selectedSession.id, selectedSession)
      setDetectedPersons(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch detected persons:", error)
      // Keep existing data on error, just log it
    } finally {
      setIsLoading(false)
    }
  }, [selectedSession])

  // Fetch data when session changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefreshEnabled || !selectedSession) return

    const interval = setInterval(() => {
      fetchData()
    }, 5 * 60 * 1000) // 5 minutes

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
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {person.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {person.detectedAt.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
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

        {/* Auto-refresh indicator */}
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
