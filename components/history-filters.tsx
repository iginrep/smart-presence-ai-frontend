"use client"

// Import React hook untuk state, komponen UI, ikon, dan util className.
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, Filter, Download } from "lucide-react"
import { cn } from "@/lib/utils"

export function HistoryFilters() {
  // Bulan yang sedang dipilih untuk ditampilkan (saat ini masih statis).
  const [selectedMonth] = useState("Desember 2025")

  // Filter aktif untuk tombol quick filter.
  const [activeFilter, setActiveFilter] = useState("all")

  // Daftar opsi quick filter.
  const quickFilters = [
    { id: "all", label: "Semua" },
    { id: "week", label: "Minggu Ini" },
    { id: "month", label: "Bulan Ini" },
  ]

  return (
    // Card kontainer untuk kontrol filter riwayat.
    <Card className="border-border shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Pemilih bulan (UI saja) */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            {/* Tombol dropdown bulan (belum ada handler pemilihan bulan di versi ini) */}
            <Button variant="outline" size="sm" className="justify-between min-w-[180px] bg-card hover:bg-accent">
              {selectedMonth}
              <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
            </Button>
          </div>

          {/* Tombol filter cepat */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1.5">
              {/* Render tombol quick filter berdasarkan daftar `quickFilters` */}
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  // Set filter aktif saat tombol diklik.
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "transition-all duration-200",
                    activeFilter === filter.id
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                      : "bg-card hover:bg-accent",
                  )}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tombol ekspor (UI saja) */}
          <div className="lg:ml-auto">
            <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent">
              <Download className="h-4 w-4" />
              Ekspor Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
