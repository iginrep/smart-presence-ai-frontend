
/**
 * Tipe data untuk informasi pengguna/dosen/pegawai
 * nip: Nomor Induk Pegawai
 * nama: Nama lengkap
 * jabatan: Jabatan atau posisi
 * fakultas: Nama fakultas
 * foto: URL foto profil
 */
export interface User {
  nip: string         // Nomor Induk Pegawai
  nama: string        // Nama lengkap
  jabatan: string     // Jabatan atau posisi
  fakultas: string    // Nama fakultas
  foto: string        // URL foto profil
}
