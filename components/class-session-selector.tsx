"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, Clock, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { CLASS_SESSIONS, type ClassSession } from "@/components/detection-list"

interface ClassSessionSelectorProps {
  selectedSession: ClassSession | null
  onSessionChange: (session: ClassSession | null) => void
  className?: string
}

/**
 * Class Session Selector Component
 * Dropdown to select class sessions for filtering detection history
 */
export function ClassSessionSelector({
  selectedSession,
  onSessionChange,
  className,
}: ClassSessionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate] = useState(new Date())

  const handleSelectSession = (session: ClassSession) => {
    onSessionChange(session)
    setIsOpen(false)
  }

  return (
    <Card className={cn("border-border shadow-sm mb-6", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Date Display */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedDate.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Session Selector Dropdown */}
          <div className="relative flex-1 lg:max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sesi Kelas</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "w-full justify-between bg-card hover:bg-accent text-left",
                !selectedSession && "text-muted-foreground"
              )}
            >
              <span className="truncate">
                {selectedSession?.label || "Pilih sesi kelas..."}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 ml-2 transition-transform shrink-0",
                  isOpen && "rotate-180"
                )}
              />
            </Button>

            {/* Dropdown Menu */}
            {isOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOpen(false)}
                />
                {/* Menu */}
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {CLASS_SESSIONS.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-muted transition-colors",
                          "flex items-center justify-between gap-2",
                          selectedSession?.id === session.id && "bg-primary/5"
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {session.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.startTime} - {session.endTime}
                          </p>
                        </div>
                        {selectedSession?.id === session.id && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Session Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {CLASS_SESSIONS.slice(0, 3).map((session) => (
              <Button
                key={session.id}
                variant="outline"
                size="sm"
                onClick={() =>
                  onSessionChange(
                    selectedSession?.id === session.id ? null : session
                  )
                }
                className={cn(
                  "transition-all duration-200",
                  selectedSession?.id === session.id
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    : "bg-card hover:bg-accent"
                )}
              >
                {session.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
