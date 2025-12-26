
// Mengaktifkan mode client-side rendering (dibutuhkan untuk pengaturan tema dinamis)
'use client'


// Import React dan ThemeProvider dari next-themes
import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

// Komponen pembungkus ThemeProvider untuk pengaturan tema aplikasi
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Meneruskan props dan children ke NextThemesProvider
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
