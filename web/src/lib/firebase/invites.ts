import admin from 'firebase-admin'

const MAX_BETA_USERS = 10
const MAX_DAILY_REGENERATIONS = 5

function getDatabase() {
  // Ensure Firebase Admin is initialized before accessing database
  if (admin.apps.length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    })
  }
  
  return admin.database()
}

// Invite Code Types
interface InviteCode {
  active: boolean
  maxUses: number
  currentUses: number
  createdAt: string
}

// Beta User Types
interface BetaUser {
  email: string
  inviteCode: string
  joinedAt: string
}

// Rate Limit Types
interface RateLimitStatus {
  used: number
  remaining: number
  limit: number
}

/**
 * Validate an invite code - check if it's active and not exhausted
 */
export async function validateInviteCode(code: string): Promise<{
  valid: boolean
  error?: string
}> {
  try {
    const db = getDatabase()
    const snapshot = await db.ref(`inviteCodes/${code}`).once('value')
    const data = snapshot.val() as InviteCode | null

    if (!data) {
      return { valid: false, error: 'Invalid invite code' }
    }

    if (!data.active) {
      return { valid: false, error: 'Invite code is no longer active' }
    }

    if (data.currentUses >= data.maxUses) {
      return { valid: false, error: 'Invite code has reached its usage limit' }
    }

    return { valid: true }
  } catch (error) {
    console.error('Error validating invite code:', error)
    return { valid: false, error: 'Failed to validate invite code' }
  }
}

/**
 * Get the count of registered beta users
 */
export async function getBetaUserCount(): Promise<number> {
  try {
    const db = getDatabase()
    const snapshot = await db.ref('betaUsers').once('value')
    const data = snapshot.val()
    return data ? Object.keys(data).length : 0
  } catch (error) {
    console.error('Error getting beta user count:', error)
    return 0
  }
}

/**
 * Check if a user is already registered as a beta user
 */
export async function isUserBetaRegistered(userId: string): Promise<boolean> {
  try {
    const db = getDatabase()
    const snapshot = await db.ref(`betaUsers/${userId}`).once('value')
    return snapshot.exists()
  } catch (error) {
    console.error('Error checking beta registration:', error)
    return false
  }
}

/**
 * Register a user as a beta user
 * Returns success status and any error message
 * Uses a transaction to atomically check and increment invite code usage
 */
export async function registerBetaUser(
  userId: string,
  email: string,
  inviteCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDatabase()

    // Check if user is already registered
    const alreadyRegistered = await isUserBetaRegistered(userId)
    if (alreadyRegistered) {
      return { success: true } // Already registered, not an error
    }

    // Check beta user cap
    const currentCount = await getBetaUserCount()
    if (currentCount >= MAX_BETA_USERS) {
      return { success: false, error: 'Beta is currently full. Please try again later.' }
    }

    // Atomically validate and increment invite code usage
    const inviteRef = db.ref(`inviteCodes/${inviteCode}`)
    const inviteTxnResult = await inviteRef.transaction((currentInvite: InviteCode | null) => {
      if (!currentInvite || !currentInvite.active) {
        // Abort transaction: invalid or inactive invite
        return
      }

      const { maxUses, currentUses } = currentInvite
      const uses = typeof currentUses === 'number' ? currentUses : 0

      if (uses >= maxUses) {
        // Abort transaction: invite has reached max uses
        return
      }

      return {
        ...currentInvite,
        currentUses: uses + 1,
      }
    })

    if (!inviteTxnResult.committed || !inviteTxnResult.snapshot.exists()) {
      return { success: false, error: 'Invalid or expired invite code.' }
    }

    // Register user after successful invite usage increment
    const betaUser: BetaUser = {
      email,
      inviteCode,
      joinedAt: new Date().toISOString(),
    }

    await db.ref(`betaUsers/${userId}`).set(betaUser)

    return { success: true }
  } catch (error) {
    console.error('Error registering beta user:', error)
    return { success: false, error: 'Failed to register. Please try again.' }
  }
}

/**
 * Get today's date as YYYY-MM-DD string
 */
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check if user can regenerate (under daily limit)
 * Throws error if database operation fails
 */
export async function canRegenerate(userId: string): Promise<boolean> {
  const status = await getRateLimitStatus(userId)
  return status.remaining > 0
}

/**
 * Increment the user's daily regeneration counter
 * Returns the new count or null if limit exceeded
 */
export async function incrementRegeneration(userId: string): Promise<{
  success: boolean
  count?: number
  error?: string
}> {
  try {
    const db = getDatabase()
    const todayKey = getTodayKey()
    const path = `rateLimits/${userId}/regenerations/${todayKey}`

    // Check current count first
    const snapshot = await db.ref(path).once('value')
    const currentCount = snapshot.val() || 0

    if (currentCount >= MAX_DAILY_REGENERATIONS) {
      return {
        success: false,
        count: currentCount,
        error: 'Daily regeneration limit reached. Try again tomorrow.',
      }
    }

    // Increment counter
    const result = await db.ref(path).transaction((count) => {
      const current = count || 0
      if (current >= MAX_DAILY_REGENERATIONS) {
        return // Abort transaction
      }
      return current + 1
    })

    if (result.committed) {
      return { success: true, count: result.snapshot.val() }
    } else {
      return {
        success: false,
        count: MAX_DAILY_REGENERATIONS,
        error: 'Daily regeneration limit reached. Try again tomorrow.',
      }
    }
  } catch (error) {
    console.error('Error incrementing regeneration:', error)
    return { success: false, error: 'Failed to track regeneration. Please try again.' }
  }
}

/**
 * Get the user's rate limit status for today
 */
export async function getRateLimitStatus(userId: string): Promise<RateLimitStatus> {
  try {
    const db = getDatabase()
    const todayKey = getTodayKey()
    const path = `rateLimits/${userId}/regenerations/${todayKey}`

    const snapshot = await db.ref(path).once('value')
    const used = snapshot.val() || 0

    return {
      used,
      remaining: Math.max(0, MAX_DAILY_REGENERATIONS - used),
      limit: MAX_DAILY_REGENERATIONS,
    }
  } catch (error) {
    console.error('Error getting rate limit status:', error)
    return { used: 0, remaining: MAX_DAILY_REGENERATIONS, limit: MAX_DAILY_REGENERATIONS }
  }
}

/**
 * Get beta stats for display
 */
export async function getBetaStats(): Promise<{
  betaUsers: { current: number; max: number }
}> {
  const current = await getBetaUserCount()
  return {
    betaUsers: { current, max: MAX_BETA_USERS },
  }
}
