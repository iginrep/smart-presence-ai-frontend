// Import tipe React dan tipe metadata dari Next.js
import type React from "react"
import type { Metadata, Viewport } from "next"
// Import font Inter dari Google Fonts
import { Inter } from "next/font/google"
// Import komponen Analytics dari Vercel
import { Analytics } from "@vercel/analytics/next"
// Import file CSS global
import "./globals.css"

// Inisialisasi font Inter dengan variabel CSS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Metadata untuk SEO dan informasi halaman
export const metadata: Metadata = {
  title: "SmartPresence AI - Sistem Absensi Berbasis AI",
  description: "Sistem absensi berbasis pengenalan wajah untuk institusi pendidikan",
  generator: "SmartPresence AI",
}

// Konfigurasi viewport untuk responsivitas dan tema
export const viewport: Viewport = {
  themeColor: "#4338ca",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Komponen root layout utama aplikasi
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      {/* Body utama aplikasi, menerapkan font dan antialiasing */}
      <body className={`${inter.className} font-sans antialiased`}>
        {/* Render seluruh konten aplikasi */}
        {children}
        {/* Komponen Analytics untuk pelacakan penggunaan */}
        <Analytics />
      </body>
    </html>
  )
}
