import { Card, CardContent } from "@/components/ui/card"
import { CalendarCheck, TrendingUp } from "lucide-react"

export function StatsCard() {
  const percentage = 82

  return (
    <Card className="h-full border-border shadow-sm card-hover overflow-hidden">
      <CardContent className="p-5 h-full flex flex-col">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Kehadiran Bulan Ini</p>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-4xl font-bold text-card-foreground">18</span>
            <span className="text-lg text-muted-foreground">/ 22</span>
            <span className="text-sm text-muted-foreground ml-1">hari</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{percentage}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>4 hari tersisa</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
