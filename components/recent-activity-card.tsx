import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, LogOut, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function RecentActivityCard() {
  const activities = [
    { type: "in", time: "07:45", date: "Kemarin", icon: CheckCircle2 },
    { type: "out", time: "16:30", date: "Kemarin", icon: LogOut },
  ]

  return (
    <Card className="h-full border-border shadow-sm card-hover">
      <CardContent className="p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aktivitas Terakhir</p>
          <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
            Lihat semua
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-3">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 group/item",
                index !== activities.length - 1 && "pb-3 border-b border-border",
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  activity.type === "in"
                    ? "bg-success/10 group-hover/item:bg-success/20"
                    : "bg-muted group-hover/item:bg-muted/80",
                )}
              >
                <activity.icon
                  className={cn("h-4 w-4", activity.type === "in" ? "text-success" : "text-muted-foreground")}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">
                  {activity.type === "in" ? "Masuk" : "Keluar"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.time} &middot; {activity.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
