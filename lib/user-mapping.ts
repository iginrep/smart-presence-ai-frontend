/**
 * Utilitas Mapping User
 * SmartPresence AI - Sistem Pengenalan Wajah
 *
 * Memetakan user ID dari API pengenalan wajah ke nama yang mudah dibaca manusia.
 * Ini implementasi placeholder - ganti dengan lookup API/database sebenarnya.
 */

/**
 * Database user dummy untuk pengembangan/pengujian
 * TODO: Ganti dengan API call ke backend user service
 */
const userDatabase: Record<string, string> = {
  '693ea35da92dbf184b9c7790': 'Ahmad Fauzi',
  '693ea35ca92dbf184b9c778a': 'Budi Santoso',
  '694a6018380de32ee408fedf': 'Citra Dewi',
  '694a601e380de32ee408fef5': 'Dimas Pratama',
  '694a6023380de32ee408ff07': 'Eka Putri',
  '694a6028380de32ee408ff10': 'Fajar Nugroho',
  '694a602d380de32ee408ff20': 'Gita Sari',
  '694a6032380de32ee408ff30': 'Hendra Wijaya',
}

/**
 * Ambil nama user berdasarkan ID
 * Mengembalikan nama yang mudah dibaca untuk user_id tertentu
 *
 * @param userId - ID user dari API pengenalan wajah
 * @returns Nama user atau 'Tidak Dikenal' jika tidak ditemukan
 */
export function getNameById(userId: string | null): string {
  if (!userId) {
    return 'Tidak Dikenal'
  }
  return userDatabase[userId] || `User ${userId.slice(-6)}`
}

/**
 * Ambil nama berdasarkan user_id atau visitor_id
 * - Jika user_id ada: panggil getUserName untuk mendapatkan nama
 * - Jika visitor_id ada: tampilkan "Tamu"
 * - Jika keduanya tidak ada: tampilkan "Tidak Dikenal"
 *
 * @param userId - ID user dari API (opsional)
 * @param visitorId - ID visitor dari API (opsional)
 * @returns Nama yang sesuai
 */
export function getDisplayName(
  userId?: string | null,
  visitorId?: string | null
): string {
  // Prioritas: user_id dulu, lalu visitor_id
  if (userId) {
    return getNameById(userId)
  }

  if (visitorId) {
    return 'Tamu'
  }

  return 'Tidak Dikenal'
}

/**
 * Fungsi dummy getUserName - alias untuk getNameById
 * Digunakan untuk mendapatkan nama user berdasarkan ID
 *
 * @param id - ID user
 * @returns Nama user
 */
export function getUserName(id: string): string {
  return getNameById(id)
}

/**
 * Ambil semua user yang dikenal
 * @returns Array objek user dengan id dan nama
 */
export function getAllUsers(): Array<{ id: string; name: string }> {
  return Object.entries(userDatabase).map(([id, name]) => ({
    id,
    name,
  }))
}

/**
 * Cek apakah user ID dikenal di database
 * @param userId - ID user yang dicek
 * @returns true jika user dikenal, false jika tidak
 */
export function isKnownUser(userId: string | null): boolean {
  if (!userId) return false
  return userId in userDatabase
}
