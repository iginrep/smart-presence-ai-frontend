// Import React untuk typing dan utilitas komponen
import * as React from 'react'
// Slot dari Radix UI untuk mendukung pola "asChild" (meneruskan props ke child)
import { Slot } from '@radix-ui/react-slot'
// cva untuk membuat varian className berbasis props, beserta tipe VariantProps
import { cva, type VariantProps } from 'class-variance-authority'

// Utilitas untuk menggabungkan className (Tailwind) secara aman
import { cn } from '@/lib/utils'

// Definisi varian styling untuk komponen Button
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    // Daftar varian yang bisa dipilih melalui props `variant` dan `size`
    variants: {
      variant: {
        // Tampilan default
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        // Tampilan destruktif (aksi berbahaya/peringatan)
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        // Tampilan outline
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        // Tampilan sekunder
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        // Tampilan ghost (minimal)
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        // Tampilan seperti tautan
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        // Ukuran default
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        // Ukuran kecil
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        // Ukuran besar
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        // Tombol ikon (kotak)
        icon: 'size-9',
        // Tombol ikon kecil
        'icon-sm': 'size-8',
        // Tombol ikon besar
        'icon-lg': 'size-10',
      },
    },
    // Nilai default untuk varian
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

// Komponen Button: tombol dengan varian gaya dan ukuran
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  // Jika `asChild` true, render Slot agar bisa membungkus elemen child
  // Jika false, render elemen `button` biasa
  const Comp = asChild ? Slot : 'button'

  return (
    // Render elemen dengan className gabungan dari varian dan className tambahan
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// Ekspor komponen dan variannya agar bisa dipakai ulang
export { Button, buttonVariants }
