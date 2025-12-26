// Import React untuk typing dan utilitas komponen
import * as React from 'react'

// Utilitas untuk menggabungkan className (Tailwind) secara aman
import { cn } from '@/lib/utils'

// Komponen Input: wrapper input standar dengan styling konsisten
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    // Elemen input dengan className default + className tambahan dari props
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Style dasar input + style untuk file input + state disabled
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        // State fokus
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        // State error/invalid
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

// Ekspor komponen Input
export { Input }
