
// Import utilitas penggabung className (clsx) dan merge Tailwind
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'


// Fungsi utilitas untuk menggabungkan className Tailwind dengan merge dan kondisi
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
