"use client"

// Import tipe React, hook state, router Next.js, komponen UI, ikon, dan util className.
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginForm() {
  // Router untuk navigasi setelah login.
  const router = useRouter()

  // State untuk menampilkan status loading saat submit.
  const [isLoading, setIsLoading] = useState(false)

  // State nilai input NIP/NIK.
  const [nip, setNip] = useState("")

  // State nilai input password.
  const [password, setPassword] = useState("")

  // Toggle untuk menampilkan/menyembunyikan password.
  const [showPassword, setShowPassword] = useState(false)

  // Menyimpan field yang sedang fokus untuk styling label.
  const [focused, setFocused] = useState<string | null>(null)

  // Handler submit form login.
  async function handleSubmit(e: React.FormEvent) {
    // Mencegah refresh halaman.
    e.preventDefault()
    setIsLoading(true)

    // Simulasi proses login (delay) — placeholder.
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simpan data user ke sessionStorage (mock) agar halaman lain dapat membaca session.
    sessionStorage.setItem(
      "user",
      JSON.stringify({
        nip,
        nama: "Yaya Wihardi, M.Kom.",
        jabatan: "Dosen",
        fakultas: "Fakultas Pendidikan Matematika dan Ilmu Pengetahuan Alam",
        foto: "/professional-indonesian-man-professor.jpg",
      }),
    )

    // Arahkan ke dashboard setelah login.
    router.push("/dashboard")
  }

  return (
    // Form login (menggunakan onSubmit agar tombol enter juga bekerja).
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Field NIP/NIK */}
      <div className="space-y-2">
        <Label
          htmlFor="nip"
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            focused === "nip" ? "text-primary" : "text-foreground",
          )}
        >
          NIP / NIK
        </Label>
        <div className="relative">
          <Input
            id="nip"
            type="text"
            placeholder="Masukkan NIP atau NIK"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            // Simpan state fokus untuk mengubah warna label.
            onFocus={() => setFocused("nip")}
            onBlur={() => setFocused(null)}
            required
            className="h-12 bg-background transition-all duration-200 focus:bg-card"
          />
        </div>
      </div>

      {/* Field kata sandi */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            focused === "password" ? "text-primary" : "text-foreground",
          )}
        >
          Kata Sandi
        </Label>
        <div className="relative">
          <Input
            id="password"
            // Ubah tipe input berdasarkan toggle `showPassword`.
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // Simpan state fokus untuk mengubah warna label.
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            required
            className="h-12 bg-background pr-12 transition-all duration-200 focus:bg-card"
          />
          {/* Tombol untuk menampilkan/menyembunyikan password */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Tombol submit */}
      <Button
        type="submit"
        className="w-full h-12 font-medium group transition-all duration-300"
        // Nonaktifkan tombol saat loading atau input masih kosong.
        disabled={isLoading || !nip || !password}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            Masuk
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </Button>

      {/* Tombol lupa kata sandi (UI saja) */}
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-primary hover:after:w-full after:transition-all after:duration-300"
        >
          Lupa kata sandi?
        </button>
      </div>
    </form>
  )
}
