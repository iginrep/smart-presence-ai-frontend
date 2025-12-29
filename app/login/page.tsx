// Import komponen form login dan ikon yang digunakan
import { LoginForm } from "@/components/login-form"
import { Fingerprint } from "lucide-react"

export default function LoginPage() {
  return (
    // Kontainer utama halaman login
    <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8 animate-in-fade">
          {/* Logo dan judul untuk tampilan mobile */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
              <Fingerprint className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">SmartPresence AI</h1>
            <p className="text-sm text-muted-foreground">Sistem Absensi Berbasis Pengenalan Wajah</p>
          </div>

          {/* Kartu form login */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 card-hover">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-card-foreground">Selamat Datang</h2>
                <p className="text-sm text-muted-foreground">Masuk dengan kredensial institusi Anda</p>
              </div>
              <LoginForm />
            </div>
          </div>

          {/* Informasi footer login */}
          <div className="text-center space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dengan masuk, Anda menyetujui penggunaan data biometrik
              <br />
              sesuai kebijakan privasi institusi.
            </p>
            <p className="text-xs text-muted-foreground/70">&copy; 2025 SmartPresence AI. Hak Cipta Dilindungi.</p>
          </div>
        </div>
    </div>
  )
}
