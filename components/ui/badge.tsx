// Import React untuk typing dan utilitas komponen
import * as React from 'react'
// Slot dari Radix UI untuk mendukung pola "asChild" (meneruskan props ke child)
import { Slot } from '@radix-ui/react-slot'
// cva untuk membuat varian className berbasis props, beserta tipe VariantProps
import { cva, type VariantProps } from 'class-variance-authority'

// Utilitas untuk menggabungkan className (Tailwind) secara aman
import { cn } from '@/lib/utils'

// Definisi varian styling untuk komponen Badge
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    // Daftar varian yang dapat dipilih melalui props `variant`
    variants: {
      variant: {
        // Tampilan default
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        // Tampilan sekunder
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        // Tampilan destruktif (aksi berbahaya/peringatan)
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        // Tampilan outline
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    // Nilai default untuk varian
    defaultVariants: {
      variant: 'default',
    },
  },
)

// Komponen Badge: label kecil untuk status/kategori
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  // Jika `asChild` true, render Slot agar bisa membungkus elemen child
  // Jika false, render elemen `span` biasa
  const Comp = asChild ? Slot : 'span'

  return (
    // Render elemen dengan className gabungan dari varian dan className tambahan
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// Ekspor komponen dan variannya agar bisa dipakai ulang
export { Badge, badgeVariants }
