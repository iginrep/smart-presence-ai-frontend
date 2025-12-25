/**
 * User Mapping Utility
 * SmartPresence AI - Face Recognition System
 *
 * Maps user IDs from face recognition API to human-readable names.
 * This is a placeholder implementation - replace with actual API/database lookup.
 */

/**
 * Dummy user database for development/testing
 * TODO: Replace with actual API call to backend user service
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
 * Get user name by ID
 * Returns a human-readable name for a given user_id
 * 
 * @param userId - The user ID from face recognition API
 * @returns The user's name or 'Unknown' if not found
 */
export function getNameById(userId: string | null): string {
  if (!userId) {
    return 'Tidak Dikenal'
  }
  return userDatabase[userId] || `User ${userId.slice(-6)}`
}

/**
 * Get all known users
 * @returns Array of user objects with id and name
 */
export function getAllUsers(): Array<{ id: string; name: string }> {
  return Object.entries(userDatabase).map(([id, name]) => ({
    id,
    name,
  }))
}

/**
 * Check if a user ID is known in the database
 * @param userId - The user ID to check
 * @returns true if user is known, false otherwise
 */
export function isKnownUser(userId: string | null): boolean {
  if (!userId) return false
  return userId in userDatabase
}
