// Import komponen UI Card, Badge, ikon, dan tipe User.
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Briefcase, Award as IdCard, CheckCircle2, Sparkles } from "lucide-react"
import type { User as UserProfile } from "@/types/user"

// Props untuk komponen kartu profil.
interface UserProps {
  user: UserProfile
}

export function ProfileCard({ user }: UserProps) {
  return (
    // Card profil user (ringkas) yang ditampilkan pada dashboard.
    <Card className="h-full border-border shadow-sm card-hover overflow-hidden group">
      {/* Gradasi dekoratif di bagian atas */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Ikon/avatar dengan ring status */}
          <div className="relative">
            <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all duration-300">
              <IdCard className="h-9 w-9 sm:h-10 sm:w-10 text-primary" />
            </div>
            {/* Indikator online (status aktif) */}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-card flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-success-foreground" />
            </div>
          </div>

          {/* Informasi profil */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-card-foreground">{user.nama}</h2>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {/* Badge status verifikasi */}
                <Badge
                  variant="secondary"
                  className="font-normal bg-success/10 text-success border-success/20 hover:bg-success/20"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Terverifikasi
                </Badge>
              </div>
            </div>

            {/* Detail singkat: NIP/NIK, jabatan, dan fakultas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 text-sm group/item">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors">
                  <IdCard className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                </div>
                {/* Fallback NIP jika data tidak tersedia */}
                <span className="text-muted-foreground truncate">{user.nip || "198507152010121003"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm group/item">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors">
                  <Briefcase className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                </div>
                <span className="text-muted-foreground truncate">{user.jabatan}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm sm:col-span-2 group/item">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors">
                  <Building2 className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                </div>
                <span className="text-muted-foreground truncate">{user.fakultas}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
