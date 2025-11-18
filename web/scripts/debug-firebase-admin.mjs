#!/usr/bin/env node
import admin from 'firebase-admin'

// This script attempts to initialize the Firebase Admin SDK with environment
// variables and create a custom token to validate the credentials.
// Usage (fish):
//   env FIREBASE_PROJECT_ID=... FIREBASE_CLIENT_EMAIL=... \
//     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..." \
//     node web/scripts/debug-firebase-admin.mjs

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

console.log('Firebase debug:')
console.log('  FIREBASE_PROJECT_ID:', projectId ? projectId : '(missing)')
console.log('  FIREBASE_CLIENT_EMAIL:', clientEmail ? clientEmail : '(missing)')
console.log('  FIREBASE_PRIVATE_KEY present:', !!privateKey)

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  }

  const auth = admin.auth()

  ;(async () => {
    try {
      // Try to mint a custom token as a lightweight credential test
      const customToken = await auth.createCustomToken('debug-user')
      console.log('createCustomToken succeeded, token length:', customToken.length)
      process.exit(0)
    } catch (err) {
      console.error('createCustomToken failed:')
      console.error(err)
      process.exit(2)
    }
  })()
} catch (err) {
  console.error('Initialization failed:')
  console.error(err)
  process.exit(1)
}
