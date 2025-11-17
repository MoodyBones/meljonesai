#!/usr/bin/env node
import admin from 'firebase-admin'

function exitWith(msg, code = 1) {
  console.error(msg)
  process.exit(code)
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  exitWith('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY')
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
}

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
if (!apiKey) exitWith('Missing NEXT_PUBLIC_FIREBASE_API_KEY')

async function main() {
  try {
    const uid = 'playwright-ci-user'
    const customToken = await admin.auth().createCustomToken(uid)

    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token: customToken, returnSecureToken: true}),
      }
    )

    const data = await resp.json()
    if (!data.idToken) {
      exitWith(`Failed to obtain idToken from REST API: ${JSON.stringify(data)}`)
    }

    // Print the ID token to stdout so CI can capture it
    console.log(data.idToken)
  } catch (err) {
    exitWith(`Error creating ID token: ${err}`)
  }
}

main()
