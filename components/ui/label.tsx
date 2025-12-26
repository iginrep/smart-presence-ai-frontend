// Mengaktifkan mode client-side rendering (komponen ini memakai Radix UI client)
'use client'

// Import React untuk typing dan utilitas komponen
import * as React from 'react'
// Import komponen Label dari Radix UI
import * as LabelPrimitive from '@radix-ui/react-label'

// Utilitas untuk menggabungkan className (Tailwind) secara aman
import { cn } from '@/lib/utils'

// Komponen Label: wrapper untuk LabelPrimitive.Root dengan styling konsisten
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    // Render label dengan className default + className tambahan dari props
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

// Ekspor komponen Label
export { Label }
