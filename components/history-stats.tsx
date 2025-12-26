// Import komponen Card untuk tampilan statistik, ikon, dan util className.
import { Card, CardContent } from "@/components/ui/card"
import { CalendarCheck, Clock, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function HistoryStats() {
  // Data statistik yang akan dirender sebagai kartu-kartu ringkas.
  // Catatan: data di sini bersifat statis (placeholder) sesuai desain UI.
  const stats = [
    {
      label: "Total Kehadiran",
      value: "18",
      subtext: "hari bulan ini",
      icon: CalendarCheck,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      trend: { value: "+2", positive: true },
    },
    {
      label: "Rata-rata Masuk",
      value: "07:42",
      subtext: "WIB",
      icon: Clock,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      trend: { value: "-5m", positive: true },
    },
    {
      label: "Keterlambatan",
      value: "2",
      subtext: "kali bulan ini",
      icon: AlertTriangle,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      trend: { value: "-1", positive: true },
    },
    {
      label: "Persentase",
      value: "82%",
      subtext: "kehadiran",
      icon: TrendingUp,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      trend: { value: "+5%", positive: true },
    },
  ]

  return (
    // Grid kartu statistik (2 kolom di mobile, 4 kolom di desktop).
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Render setiap statistik menjadi sebuah Card */}
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border shadow-sm card-hover group">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              {/* Ikon utama statistik */}
              <div
                className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110",
                  stat.iconBg,
                )}
              >
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              {/* Indikator tren (naik/turun) */}
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full",
                  stat.trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                )}
              >
                {stat.trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.trend.value}
              </div>
            </div>
            <div>
              {/* Label statistik */}
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1.5">
                {/* Nilai utama + subteks */}
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.subtext}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
