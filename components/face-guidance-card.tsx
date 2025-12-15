import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FaceGuidance } from "@/app/absensi/page"

interface FaceGuidanceCardProps {
  guidance: FaceGuidance
}

export function FaceGuidanceCard({ guidance }: FaceGuidanceCardProps) {
  const tips = [
    "Pastikan wajah terlihat jelas",
    "Hindari pencahayaan dari belakang",
    "Lepaskan kacamata hitam atau masker",
    "Posisikan wajah di tengah bingkai",
  ]

  const iconMap = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2,
    error: AlertCircle,
  }

  const styleMap = {
    info: {
      bg: "bg-primary/10",
      border: "border-primary/20",
      icon: "text-primary",
      text: "text-primary",
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/20",
      icon: "text-warning",
      text: "text-warning",
    },
    success: {
      bg: "bg-success/10",
      border: "border-success/20",
      icon: "text-success",
      text: "text-success",
    },
    error: {
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      icon: "text-destructive",
      text: "text-destructive",
    },
  }

  const Icon = iconMap[guidance.type]
  const styles = styleMap[guidance.type]

  return (
    <Card className="h-full border-border shadow-sm card-hover">
      <CardContent className="p-5 h-full flex flex-col">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Panduan Posisi</p>

        {/* Current Guidance */}
        <div
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border transition-all duration-300",
            styles.bg,
            styles.border,
          )}
        >
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", styles.bg)}>
            <Icon className={cn("h-4 w-4", styles.icon)} />
          </div>
          <div>
            <p className={cn("text-sm font-medium", styles.text)}>{guidance.message}</p>
          </div>
        </div>

        {/* Tips List */}
        <div className="mt-4 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tips</p>
          </div>
          <ul className="space-y-2.5">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground group/tip">
                <span className="h-5 w-5 rounded-md bg-muted flex items-center justify-center shrink-0 text-xs font-medium group-hover/tip:bg-primary/10 group-hover/tip:text-primary transition-colors">
                  {index + 1}
                </span>
                <span className="leading-5">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
