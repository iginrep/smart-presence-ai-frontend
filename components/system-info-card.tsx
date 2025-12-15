import { Card, CardContent } from "@/components/ui/card"
import { Shield, Wifi, Server } from "lucide-react"
import { cn } from "@/lib/utils"

export function SystemInfoCard() {
  const statusItems = [
    { icon: Shield, label: "Keamanan", value: "Aman", sublabel: "Terenkripsi", color: "success" },
    { icon: Wifi, label: "Koneksi", value: "Online", sublabel: "Stabil", color: "success" },
    { icon: Server, label: "Server", value: "Aktif", sublabel: "Indonesia", color: "success" },
  ]

  return (
    <Card className="h-full border-border shadow-sm card-hover">
      <CardContent className="p-5 h-full flex flex-col">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Status Sistem</p>

        <div className="flex-1 flex flex-col justify-center space-y-3">
          {statusItems.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 group/item",
                index !== statusItems.length - 1 && "pb-3 border-b border-border",
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  item.color === "success" && "bg-success/10 group-hover/item:bg-success/20",
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-colors", item.color === "success" && "text-success")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-card-foreground">{item.value}</p>
                  <span className="relative flex h-2 w-2">
                    <span
                      className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        item.color === "success" && "bg-success",
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        item.color === "success" && "bg-success",
                      )}
                    />
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
