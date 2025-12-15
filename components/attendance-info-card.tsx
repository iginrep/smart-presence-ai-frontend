import { Card, CardContent } from "@/components/ui/card"
import { Shield, Clock, MapPin, Fingerprint } from "lucide-react"

export function AttendanceInfoCard() {
  const infoItems = [
    {
      icon: Clock,
      label: "Waktu Saat Ini",
      value: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: MapPin,
      label: "Lokasi",
      value: "Kampus Utama",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      icon: Fingerprint,
      label: "Metode",
      value: "Face Recognition",
      iconBg: "bg-chart-5/10",
      iconColor: "text-chart-5",
    },
    {
      icon: Shield,
      label: "Keamanan",
      value: "End-to-End Encrypted",
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
    },
  ]

  return (
    <Card className="border-border shadow-sm card-hover">
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 group/info">
              <div
                className={`h-11 w-11 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover/info:scale-110`}
              >
                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
