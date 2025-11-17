import admin from 'firebase-admin'

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
}

export const adminAuth = admin.auth()

export async function verifyIdToken(idToken: string) {
  return adminAuth.verifyIdToken(idToken)
}

// Create a session cookie (server-side) from an ID token. ExpiresIn is in milliseconds.
export async function createSessionCookie(idToken: string, expiresIn: number) {
  return adminAuth.createSessionCookie(idToken, {expiresIn})
}

// Verify a Firebase session cookie. Pass "true" to check if cookie is revoked.
export async function verifySessionCookie(sessionCookie: string) {
  return adminAuth.verifySessionCookie(sessionCookie, true)
}

export default admin
