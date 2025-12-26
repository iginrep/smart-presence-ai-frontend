"use client"

// Import tipe React, state hook, komponen Next.js untuk navigasi, util className, ikon, dan Button.
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Fingerprint, LayoutDashboard, Camera, History, LogOut, Menu, X, Bell, ChevronRight, User, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

// Props untuk layout dashboard: konten halaman dan data user yang sedang login.
interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    nip: string
    nama: string
    jabatan: string
    fakultas: string
    foto: string
  }
}

// Daftar navigasi utama pada sidebar dan menu mobile.
const navigation = [
  { name: "Dasbor", href: "/dashboard", icon: LayoutDashboard },
  { name: "Monitor", href: "/monitor", icon: Monitor },
  { name: "Riwayat", href: "/riwayat", icon: History },
]

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  // Mendapatkan path aktif untuk menentukan menu mana yang sedang dipilih.
  const pathname = usePathname()
  // Router Next.js untuk navigasi programatik (mis. setelah logout).
  const router = useRouter()
  // State untuk membuka/menutup menu pada layar mobile.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Logout sederhana: hapus data user dari sessionStorage lalu arahkan ke halaman login.
  function handleLogout() {
    sessionStorage.removeItem("user")
    router.push("/login")
  }

  // Menentukan halaman saat ini berdasarkan path (dipakai bila ingin ditampilkan).
  const currentPage = navigation.find((item) => item.href === pathname)

  return (
    // Wrapper halaman dashboard.
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto border-r border-border bg-card px-5 py-6">
          {/* Bagian logo / branding */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-semibold text-foreground">SmartPresence</span>
              <span className="block text-xs text-muted-foreground">Sistem AI</span>
            </div>
          </div>

          {/* Navigasi */}
          <nav className="flex flex-1 flex-col">
            <div className="space-y-1">
              <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Menu</p>
              {navigation.map((item) => {
                // Tandai item aktif berdasarkan path.
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200",
                        !isActive && "group-hover:scale-110",
                      )}
                    />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
                  </Link>
                )
              })}
            </div>

            {/* Bagian user + tombol logout */}
            <div className="mt-auto space-y-3 pt-6 border-t border-border">
              <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 card-hover cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Nama dipotong sebelum koma agar ringkas */}
                  <p className="text-sm font-medium text-foreground truncate">{user.nama.split(",")[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.jabatan}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Header mobile */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex h-16 items-center gap-x-4 border-b border-border bg-card/95 backdrop-blur-lg px-4">
          <button
            type="button"
            className="p-2.5 -m-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            // Membuka menu mobile.
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Fingerprint className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">SmartPresence</span>
          </div>
          <div className="flex-1" />
          {/* Ikon notifikasi (indikator statis) */}
          <button className="p-2.5 -m-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </div>
      </div>

      {/* Overlay menu mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-200"
            // Klik area luar untuk menutup menu.
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-card p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                  <Fingerprint className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">SmartPresence AI</span>
              </div>
              <button
                type="button"
                className="p-2 -m-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                // Tombol tutup menu.
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigasi versi mobile */}
            <nav className="flex flex-col gap-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    // Tutup menu setelah user memilih navigasi.
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-x-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Ringkasan user + tombol logout di menu mobile */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.nama}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.jabatan}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Konten utama halaman */}
      <main className="lg:pl-72">{children}</main>
    </div>
  )
}
