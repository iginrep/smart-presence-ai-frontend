import { LoginForm } from "@/components/login-form"
import { Fingerprint, Shield, Zap, Lock } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
              <Fingerprint className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-semibold text-primary-foreground">SmartPresence</span>
              <span className="block text-sm text-primary-foreground/70">AI System</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight text-balance">
                Sistem Absensi
                <br />
                <span className="text-primary-foreground/80">Berbasis AI</span>
              </h1>
              <p className="text-lg text-primary-foreground/70 max-w-md leading-relaxed">
                Verifikasi kehadiran dengan teknologi pengenalan wajah yang aman dan akurat untuk institusi pendidikan.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {[
                { icon: Shield, label: "Keamanan Tinggi" },
                { icon: Zap, label: "Proses Cepat" },
                { icon: Lock, label: "Data Terenkripsi" },
                { icon: Fingerprint, label: "Akurasi 99.9%" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm"
                >
                  <feature.icon className="h-5 w-5 text-primary-foreground/80" />
                  <span className="text-sm font-medium text-primary-foreground/90">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8 animate-in-fade">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
              <Fingerprint className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">SmartPresence AI</h1>
            <p className="text-sm text-muted-foreground">Sistem Absensi Berbasis Pengenalan Wajah</p>
          </div>

          {/* Login Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 card-hover">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-card-foreground">Selamat Datang</h2>
                <p className="text-sm text-muted-foreground">Masuk dengan kredensial institusi Anda</p>
              </div>
              <LoginForm />
            </div>
          </div>

          {/* Footer Info */}
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
    </div>
  )
}
