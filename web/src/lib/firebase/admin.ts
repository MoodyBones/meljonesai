import admin from 'firebase-admin'

function initializeAdminIfNeeded() {
  if (admin.apps.length > 0) {
    return admin
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })

  return admin
}

function getAdminAuth() {
  return initializeAdminIfNeeded().auth()
}

export async function verifyIdToken(idToken: string) {
  return getAdminAuth().verifyIdToken(idToken)
}

// Create a session cookie (server-side) from an ID token. ExpiresIn is in milliseconds.
export async function createSessionCookie(idToken: string, expiresIn: number) {
  return getAdminAuth().createSessionCookie(idToken, {expiresIn})
}

// Verify a Firebase session cookie. Pass "true" to check if cookie is revoked.
export async function verifySessionCookie(sessionCookie: string) {
  return getAdminAuth().verifySessionCookie(sessionCookie, true)
}

export default admin
