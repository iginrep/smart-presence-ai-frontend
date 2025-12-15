"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [nip, setNip] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

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

    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* NIP Field */}
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
            onFocus={() => setFocused("nip")}
            onBlur={() => setFocused(null)}
            required
            className="h-12 bg-background transition-all duration-200 focus:bg-card"
          />
        </div>
      </div>

      {/* Password Field */}
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
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            required
            className="h-12 bg-background pr-12 transition-all duration-200 focus:bg-card"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 font-medium group transition-all duration-300"
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

      {/* Forgot Password */}
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
