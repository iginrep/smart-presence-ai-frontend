// Import fungsi redirect dari Next.js untuk navigasi
import { redirect } from "next/navigation"

// Komponen halaman utama (root), otomatis mengarahkan ke halaman login
export default function Home() {
  redirect("/login") // Redirect ke halaman login
}
