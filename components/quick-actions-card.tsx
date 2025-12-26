
// Mengaktifkan mode client-side rendering (dibutuhkan untuk interaksi UI)
"use client"


// Import komponen Link, Card, Button, ikon, dan utilitas className
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, History, FileText, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
export function QuickActionsCard() {
  return (
    // Card utama untuk aksi cepat pada dashboard
    <Card className="h-full border-border shadow-sm overflow-hidden">
      <CardContent className="p-5 sm:p-6 h-full flex flex-col">
        {/* Judul section */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Aksi Cepat</p>

        <div className="flex-1 flex flex-col gap-4">
          {/* Aksi utama - Ambil Absensi */}
          <Link href="/absensi" className="block group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/90 p-6 text-primary-foreground transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/25 group-hover:-translate-y-0.5">
              {/* Dekorasi latar belakang */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  {/* Ikon kamera */}
                  <div className="h-14 w-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <Camera className="h-7 w-7" />
                  </div>
                  {/* Badge AI aktif */}
                  <div className="flex items-center gap-1 text-xs font-medium bg-primary-foreground/20 rounded-full px-2.5 py-1">
                    <Sparkles className="h-3 w-3" />
                    Berbasis AI
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-1">Ambil Absensi</h3>
                <p className="text-sm text-primary-foreground/80 mb-4">
                  Verifikasi wajah dengan teknologi AI untuk absensi cepat dan akurat
                </p>
                <div className="flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all duration-300">
                  Mulai Sekarang
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Aksi sekunder */}
          <div className="grid grid-cols-2 gap-3">
            {/* Daftar tombol aksi sekunder: Riwayat & Laporan */}
            {[
              { icon: History, label: "Riwayat", sublabel: "Lihat catatan", href: "/riwayat" },
              { icon: FileText, label: "Laporan", sublabel: "Unduh data", href: "#" },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-4 flex-col gap-1.5 bg-card hover:bg-accent",
                    "border-border hover:border-primary/30 hover:shadow-sm",
                    "transition-all duration-200 group/btn",
                  )}
                >
                  {/* Ikon aksi */}
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover/btn:bg-primary/10 transition-colors">
                    <action.icon className="h-5 w-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.sublabel}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
